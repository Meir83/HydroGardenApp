// Unified data management layer with IndexedDB primary storage and localStorage fallback
// Provides high-level API for all data operations with caching and validation

import indexedDBManager from './IndexedDBManager.js';
import { createEntity, updateEntity, validateEntity } from './schemas.js';

class DataManager {
  constructor() {
    this.initialized = false;
    this.useIndexedDB = false;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.eventListeners = new Map();
    
    // Storage keys for localStorage fallback
    this.storageKeys = {
      plants: 'hydro_plants',
      events: 'hydro_events', 
      posts: 'hydro_posts',
      settings: 'hydro_settings'
    };
  }

  // Initialize the data manager
  async init() {
    try {
      await indexedDBManager.init();
      await indexedDBManager.migrateData();
      this.useIndexedDB = true;
      console.log('DataManager initialized with IndexedDB');
    } catch (error) {
      console.warn('IndexedDB initialization failed, falling back to localStorage:', error);
      this.useIndexedDB = false;
      this.migrateFromLocalStorage();
    }
    
    this.initialized = true;
    this.emit('initialized');
  }

  // Event system for data changes
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  emit(event, data = null) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
  }

  // Cache management
  getCacheKey(storeName, id = 'all') {
    return `${storeName}_${id}`;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // Check if cache expired
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Plants management
  async getPlants(useCache = true) {
    const cacheKey = this.getCacheKey('plants');
    
    if (useCache) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }
    
    let plants;
    if (this.useIndexedDB) {
      plants = await indexedDBManager.findAll('plants', {
        sort: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      });
    } else {
      plants = this.getFromLocalStorage('plants') || [];
    }
    
    this.setCache(cacheKey, plants);
    return plants;
  }

  async getPlant(id) {
    const cacheKey = this.getCacheKey('plants', id);
    const cached = this.getCache(cacheKey);
    if (cached) return cached;
    
    let plant;
    if (this.useIndexedDB) {
      plant = await indexedDBManager.read('plants', id);
    } else {
      const plants = await this.getPlants(false);
      plant = plants.find(p => p.id === id) || null;
    }
    
    if (plant) {
      this.setCache(cacheKey, plant);
    }
    
    return plant;
  }

  async createPlant(plantData) {
    const plant = createEntity('Plant', plantData);
    
    if (this.useIndexedDB) {
      await indexedDBManager.create('plants', plant, 'Plant');
    } else {
      const plants = await this.getPlants(false);
      plants.unshift(plant);
      this.saveToLocalStorage('plants', plants);
    }
    
    this.clearCache('plants');
    this.emit('plantCreated', plant);
    return plant;
  }

  async updatePlant(id, updates) {
    const existing = await this.getPlant(id);
    if (!existing) {
      throw new Error(`Plant with id ${id} not found`);
    }
    
    const updatedPlant = updateEntity(existing, updates, 'Plant');
    
    if (this.useIndexedDB) {
      await indexedDBManager.update('plants', updatedPlant, 'Plant');
    } else {
      const plants = await this.getPlants(false);
      const index = plants.findIndex(p => p.id === id);
      if (index >= 0) {
        plants[index] = updatedPlant;
        this.saveToLocalStorage('plants', plants);
      }
    }
    
    this.clearCache('plants');
    this.emit('plantUpdated', updatedPlant);
    return updatedPlant;
  }

  async deletePlant(id) {
    if (this.useIndexedDB) {
      await indexedDBManager.delete('plants', id);
    } else {
      const plants = await this.getPlants(false);
      const filtered = plants.filter(p => p.id !== id);
      this.saveToLocalStorage('plants', filtered);
    }
    
    this.clearCache('plants');
    this.emit('plantDeleted', { id });
    return true;
  }

  // Events management
  async getEvents(useCache = true, filters = {}) {
    const cacheKey = this.getCacheKey('events', JSON.stringify(filters));
    
    if (useCache && Object.keys(filters).length === 0) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }
    
    let events;
    if (this.useIndexedDB) {
      events = await indexedDBManager.advancedQuery('events', filters, {
        sort: (a, b) => new Date(a.date) - new Date(b.date)
      });
    } else {
      events = this.getFromLocalStorage('events') || [];
      
      // Apply filters for localStorage
      if (Object.keys(filters).length > 0) {
        events = events.filter(event => {
          return Object.keys(filters).every(key => {
            return event[key] === filters[key];
          });
        });
      }
      
      events.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    if (Object.keys(filters).length === 0) {
      this.setCache(cacheKey, events);
    }
    
    return events;
  }

  async getEventsByDateRange(startDate, endDate) {
    return this.getEvents(false, {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });
  }

  async getEventsByPlant(plantId) {
    return this.getEvents(false, { plantId });
  }

  async createEvent(eventData) {
    const event = createEntity('CalendarEvent', eventData);
    
    if (this.useIndexedDB) {
      await indexedDBManager.create('events', event, 'CalendarEvent');
    } else {
      const events = await this.getEvents(false);
      events.push(event);
      this.saveToLocalStorage('events', events);
    }
    
    this.clearCache('events');
    this.emit('eventCreated', event);
    return event;
  }

  async updateEvent(id, updates) {
    let existing;
    if (this.useIndexedDB) {
      existing = await indexedDBManager.read('events', id);
    } else {
      const events = await this.getEvents(false);
      existing = events.find(e => e.id === id);
    }
    
    if (!existing) {
      throw new Error(`Event with id ${id} not found`);
    }
    
    const updatedEvent = updateEntity(existing, updates, 'CalendarEvent');
    
    if (this.useIndexedDB) {
      await indexedDBManager.update('events', updatedEvent, 'CalendarEvent');
    } else {
      const events = await this.getEvents(false);
      const index = events.findIndex(e => e.id === id);
      if (index >= 0) {
        events[index] = updatedEvent;
        this.saveToLocalStorage('events', events);
      }
    }
    
    this.clearCache('events');
    this.emit('eventUpdated', updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id) {
    if (this.useIndexedDB) {
      await indexedDBManager.delete('events', id);
    } else {
      const events = await this.getEvents(false);
      const filtered = events.filter(e => e.id !== id);
      this.saveToLocalStorage('events', filtered);
    }
    
    this.clearCache('events');
    this.emit('eventDeleted', { id });
    return true;
  }

  // Posts management
  async getPosts(useCache = true) {
    const cacheKey = this.getCacheKey('posts');
    
    if (useCache) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }
    
    let posts;
    if (this.useIndexedDB) {
      posts = await indexedDBManager.findAll('posts', {
        sort: (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      });
    } else {
      posts = this.getFromLocalStorage('posts') || [];
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    this.setCache(cacheKey, posts);
    return posts;
  }

  async createPost(postData) {
    const post = createEntity('CommunityPost', postData);
    
    if (this.useIndexedDB) {
      await indexedDBManager.create('posts', post, 'CommunityPost');
    } else {
      const posts = await this.getPosts(false);
      posts.unshift(post);
      this.saveToLocalStorage('posts', posts);
    }
    
    this.clearCache('posts');
    this.emit('postCreated', post);
    return post;
  }

  async updatePost(id, updates) {
    let existing;
    if (this.useIndexedDB) {
      existing = await indexedDBManager.read('posts', id);
    } else {
      const posts = await this.getPosts(false);
      existing = posts.find(p => p.id === id);
    }
    
    if (!existing) {
      throw new Error(`Post with id ${id} not found`);
    }
    
    const updatedPost = updateEntity(existing, updates, 'CommunityPost');
    
    if (this.useIndexedDB) {
      await indexedDBManager.update('posts', updatedPost, 'CommunityPost');
    } else {
      const posts = await this.getPosts(false);
      const index = posts.findIndex(p => p.id === id);
      if (index >= 0) {
        posts[index] = updatedPost;
        this.saveToLocalStorage('posts', posts);
      }
    }
    
    this.clearCache('posts');
    this.emit('postUpdated', updatedPost);
    return updatedPost;
  }

  async deletePost(id) {
    if (this.useIndexedDB) {
      await indexedDBManager.delete('posts', id);
    } else {
      const posts = await this.getPosts(false);
      const filtered = posts.filter(p => p.id !== id);
      this.saveToLocalStorage('posts', filtered);
    }
    
    this.clearCache('posts');
    this.emit('postDeleted', { id });
    return true;
  }

  // Settings management
  async getSettings() {
    const cacheKey = this.getCacheKey('settings');
    const cached = this.getCache(cacheKey);
    if (cached) return cached;
    
    let settings;
    if (this.useIndexedDB) {
      settings = await indexedDBManager.read('settings', 'settings_user');
    } else {
      settings = this.getFromLocalStorage('settings');
    }
    
    // Create default settings if none exist
    if (!settings) {
      settings = createEntity('Settings');
      await this.saveSettings(settings);
    }
    
    this.setCache(cacheKey, settings);
    return settings;
  }

  async saveSettings(settings) {
    // Ensure ID is correct
    settings.id = 'settings_user';
    
    const errors = validateEntity(settings, 'Settings');
    if (errors) {
      throw new Error(`Settings validation failed: ${JSON.stringify(errors)}`);
    }
    
    if (this.useIndexedDB) {
      const existing = await indexedDBManager.read('settings', 'settings_user');
      if (existing) {
        await indexedDBManager.update('settings', settings, 'Settings');
      } else {
        await indexedDBManager.create('settings', settings, 'Settings');
      }
    } else {
      this.saveToLocalStorage('settings', settings);
    }
    
    this.clearCache('settings');
    this.emit('settingsUpdated', settings);
    return settings;
  }

  // Search functionality
  async search(query, options = {}) {
    const results = {
      plants: [],
      events: [],
      posts: []
    };
    
    const searchLower = query.toLowerCase();
    
    if (!options.types || options.types.includes('plants')) {
      const plants = await this.getPlants();
      results.plants = plants.filter(plant => 
        plant.name.toLowerCase().includes(searchLower) ||
        (plant.notes && plant.notes.toLowerCase().includes(searchLower)) ||
        plant.status.toLowerCase().includes(searchLower)
      );
    }
    
    if (!options.types || options.types.includes('events')) {
      const events = await this.getEvents();
      results.events = events.filter(event =>
        event.action.toLowerCase().includes(searchLower) ||
        (event.notes && event.notes.toLowerCase().includes(searchLower))
      );
    }
    
    if (!options.types || options.types.includes('posts')) {
      const posts = await this.getPosts();
      results.posts = posts.filter(post =>
        post.text.toLowerCase().includes(searchLower) ||
        post.user.toLowerCase().includes(searchLower)
      );
    }
    
    return results;
  }

  // Analytics and insights
  async getAnalytics() {
    const [plants, events, posts] = await Promise.all([
      this.getPlants(),
      this.getEvents(),
      this.getPosts()
    ]);
    
    const analytics = {
      plants: {
        total: plants.length,
        healthy: plants.filter(p => p.status === 'בריא').length,
        needsWater: plants.filter(p => p.status === 'דורש השקיה').length,
        needsFertilizer: plants.filter(p => p.status === 'דורש דישון').length,
        byType: this.groupBy(plants, 'plantType')
      },
      events: {
        total: events.length,
        completed: events.filter(e => e.completed).length,
        pending: events.filter(e => !e.completed).length,
        byAction: this.groupBy(events, 'action'),
        thisWeek: this.getEventsThisWeek(events).length,
        overdue: this.getOverdueEvents(events).length
      },
      posts: {
        total: posts.length,
        thisMonth: posts.filter(p => 
          new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
        topUsers: this.getTopUsers(posts)
      },
      growth: this.calculateGrowthTrends(plants, events)
    };
    
    return analytics;
  }

  // Helper methods for analytics
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'אחר';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  getEventsThisWeek(events) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= weekStart && eventDate < weekEnd;
    });
  }

  getOverdueEvents(events) {
    const today = new Date().toISOString().slice(0, 10);
    return events.filter(event => 
      !event.completed && event.date < today
    );
  }

  getTopUsers(posts) {
    const userCounts = this.groupBy(posts, 'user');
    return Object.entries(userCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([user, count]) => ({ user, count }));
  }

  calculateGrowthTrends(plants, events) {
    const trends = {
      plantsGrowth: [],
      activityGrowth: []
    };
    
    // Calculate monthly growth
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const plantsThisMonth = plants.filter(p => {
        const createdDate = new Date(p.createdAt);
        return createdDate >= monthStart && createdDate <= monthEnd;
      }).length;
      
      const eventsThisMonth = events.filter(e => {
        const createdDate = new Date(e.createdAt);
        return createdDate >= monthStart && createdDate <= monthEnd;
      }).length;
      
      trends.plantsGrowth.push({
        month: monthStart.toLocaleDateString('he-IL', { month: 'short', year: 'numeric' }),
        value: plantsThisMonth
      });
      
      trends.activityGrowth.push({
        month: monthStart.toLocaleDateString('he-IL', { month: 'short', year: 'numeric' }),
        value: eventsThisMonth
      });
    }
    
    return trends;
  }

  // Export/Import functionality
  async exportData() {
    if (this.useIndexedDB) {
      return await indexedDBManager.exportData();
    } else {
      return {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        data: {
          plants: await this.getPlants(false),
          events: await this.getEvents(false),
          posts: await this.getPosts(false),
          settings: await this.getSettings()
        }
      };
    }
  }

  async importData(data, options = { overwrite: false }) {
    if (this.useIndexedDB) {
      return await indexedDBManager.importData(data, options);
    } else {
      const results = { imported: 0, skipped: 0, errors: [] };
      
      for (const [storeName, items] of Object.entries(data.data)) {
        if (storeName === 'settings') {
          try {
            await this.saveSettings(items);
            results.imported++;
          } catch (error) {
            results.errors.push({ item: 'settings', error: error.message });
          }
        } else {
          const existing = await this.getFromLocalStorage(storeName) || [];
          const newItems = Array.isArray(items) ? items : [items];
          
          for (const item of newItems) {
            try {
              const existingIndex = existing.findIndex(e => e.id === item.id);
              
              if (existingIndex >= 0 && !options.overwrite) {
                results.skipped++;
                continue;
              }
              
              if (existingIndex >= 0) {
                existing[existingIndex] = item;
              } else {
                existing.push(item);
              }
              
              results.imported++;
            } catch (error) {
              results.errors.push({ item: item.id, error: error.message });
            }
          }
          
          this.saveToLocalStorage(storeName, existing);
        }
      }
      
      this.clearCache();
      return results;
    }
  }

  // LocalStorage utilities
  getFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(this.storageKeys[key]);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Failed to read from localStorage (${key}):`, error);
      return null;
    }
  }

  saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(this.storageKeys[key], JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save to localStorage (${key}):`, error);
      throw new Error('Storage quota exceeded');
    }
  }

  // Migration from old localStorage format
  migrateFromLocalStorage() {
    try {
      // Migrate plants
      const oldPlants = localStorage.getItem('plants');
      if (oldPlants) {
        const plants = JSON.parse(oldPlants).map(plant => 
          createEntity('Plant', plant)
        );
        this.saveToLocalStorage('plants', plants);
        localStorage.removeItem('plants');
      }
      
      // Migrate events
      const oldEvents = localStorage.getItem('events');
      if (oldEvents) {
        const events = JSON.parse(oldEvents).map(event =>
          createEntity('CalendarEvent', event)
        );
        this.saveToLocalStorage('events', events);
        localStorage.removeItem('events');
      }
      
      // Migrate posts
      const oldPosts = localStorage.getItem('posts');
      if (oldPosts) {
        const posts = JSON.parse(oldPosts).map(post =>
          createEntity('CommunityPost', post)
        );
        this.saveToLocalStorage('posts', posts);
        localStorage.removeItem('posts');
      }
      
      // Migrate settings
      const oldSettings = localStorage.getItem('settings');
      if (oldSettings) {
        const settings = createEntity('Settings', JSON.parse(oldSettings));
        this.saveToLocalStorage('settings', settings);
        localStorage.removeItem('settings');
      }
      
      console.log('Successfully migrated data from old localStorage format');
    } catch (error) {
      console.error('Failed to migrate localStorage data:', error);
    }
  }

  // Get audit trail (only available with IndexedDB)
  async getAuditTrail(entityId, options = {}) {
    if (!this.useIndexedDB) {
      throw new Error('Audit trail requires IndexedDB storage');
    }
    
    return await indexedDBManager.getAuditTrail(entityId, options);
  }

  // Get storage statistics
  async getStorageStats() {
    if (this.useIndexedDB) {
      return await indexedDBManager.getStatistics();
    } else {
      const stats = {
        totalRecords: 0,
        storeSizes: {},
        storage: 'localStorage',
        lastUpdated: new Date().toISOString()
      };
      
      for (const [key, storageKey] of Object.entries(this.storageKeys)) {
        const data = this.getFromLocalStorage(key);
        const size = Array.isArray(data) ? data.length : (data ? 1 : 0);
        stats.storeSizes[key] = size;
        stats.totalRecords += size;
      }
      
      return stats;
    }
  }

  // Cleanup and maintenance
  async cleanup() {
    this.clearCache();
    
    if (this.useIndexedDB) {
      // Cleanup old audit logs (keep last 90 days)
      await indexedDBManager.cleanupOldAuditLogs(90);
    }
  }
}

// Create singleton instance
export const dataManager = new DataManager();

// Auto-initialize
dataManager.init().catch(error => {
  console.error('DataManager initialization failed:', error);
});

export default dataManager;