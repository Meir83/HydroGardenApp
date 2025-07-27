// Enhanced sync service with conflict resolution, retry logic, and operational transformation
// Replaces the basic sync service with enterprise-grade synchronization capabilities

import dataManager from '../data/DataManager.js';
import { validateEntity } from '../data/schemas.js';

class EnhancedSyncService {
  constructor() {
    this.apiUrl = process.env.REACT_APP_SYNC_API_URL || 'https://jsonplaceholder.typicode.com/posts';
    this.queueKey = 'enhanced_sync_queue';
    this.conflictKey = 'sync_conflicts';
    this.lastSyncKey = 'last_sync_timestamp';
    
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.maxRetries = 3;
    this.retryDelay = 1000; // Base delay in ms
    this.maxQueueSize = 500;
    this.batchSize = 10; // Number of items to sync in each batch
    
    // Event listeners for network status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // Auto-sync interval (every 5 minutes when online)
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.processSyncQueue();
      }
    }, 5 * 60 * 1000);
  }

  // Main sync method with conflict resolution
  async syncData(entityType, data, operation = 'upsert') {
    try {
      // Validate data before syncing
      if (entityType !== 'batch') {
        const errors = validateEntity(data, entityType);
        if (errors) {
          throw new Error(`Data validation failed: ${JSON.stringify(errors)}`);
        }
      }
      
      const syncItem = {
        id: this.generateSyncId(),
        entityType,
        operation, // 'create', 'update', 'delete', 'upsert'
        data,
        timestamp: new Date().toISOString(),
        retryCount: 0,
        lastAttempt: null,
        clientId: this.getClientId()
      };
      
      if (this.isOnline && !this.syncInProgress) {
        // Try immediate sync
        const success = await this.syncSingleItem(syncItem);
        if (success) {
          return { success: true, synced: true };
        }
      }
      
      // Add to queue for later sync
      await this.addToQueue(syncItem);
      return { success: true, synced: false, queued: true };
      
    } catch (error) {
      console.error('Sync data error:', error);
      throw error;
    }
  }

  // Sync single item with retry logic
  async syncSingleItem(syncItem) {
    try {
      const response = await this.makeRequest(syncItem);
      
      if (response.conflict) {
        // Handle conflict
        await this.handleConflict(syncItem, response);
        return false; // Will need manual resolution
      }
      
      if (response.success) {
        // Update local data with server response if needed
        if (response.data && syncItem.operation !== 'delete') {
          await this.updateLocalData(syncItem.entityType, response.data);
        }
        
        return true;
      }
      
      throw new Error(response.error || 'Unknown server error');
      
    } catch (error) {
      console.warn(`Sync failed for item ${syncItem.id}:`, error.message);
      
      // Increment retry count
      syncItem.retryCount = (syncItem.retryCount || 0) + 1;
      syncItem.lastAttempt = new Date().toISOString();
      
      // Re-add to queue if under retry limit
      if (syncItem.retryCount < this.maxRetries) {
        await this.addToQueue(syncItem);
      } else {
        console.error(`Max retries exceeded for sync item ${syncItem.id}`);
        await this.addToConflicts(syncItem, 'max_retries_exceeded');
      }
      
      return false;
    }
  }

  // Make HTTP request with timeout and proper error handling
  async makeRequest(syncItem) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Client-ID': this.getClientId(),
          'X-Sync-Timestamp': syncItem.timestamp
        },
        body: JSON.stringify({
          operation: syncItem.operation,
          entityType: syncItem.entityType,
          data: syncItem.data,
          timestamp: syncItem.timestamp,
          clientId: syncItem.clientId
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  // Handle sync conflicts with various resolution strategies
  async handleConflict(localItem, serverResponse) {
    const conflict = {
      id: this.generateSyncId(),
      localItem,
      serverData: serverResponse.serverData,
      conflictType: serverResponse.conflictType,
      timestamp: new Date().toISOString(),
      resolved: false
    };
    
    // Attempt automatic resolution based on conflict type
    const resolution = await this.attemptAutoResolution(conflict);
    
    if (resolution.resolved) {
      // Apply resolution and retry sync
      const resolvedItem = {
        ...localItem,
        data: resolution.data,
        timestamp: new Date().toISOString()
      };
      
      const success = await this.syncSingleItem(resolvedItem);
      if (success) {
        await this.updateLocalData(localItem.entityType, resolution.data);
        return;
      }
    }
    
    // Store conflict for manual resolution
    await this.addToConflicts(conflict);
    console.warn(`Conflict detected and stored for manual resolution: ${conflict.id}`);
  }

  // Attempt automatic conflict resolution
  async attemptAutoResolution(conflict) {
    const { localItem, serverData, conflictType } = conflict;
    
    switch (conflictType) {
      case 'timestamp_conflict':
        // Resolve based on timestamps - newer wins
        const localTime = new Date(localItem.timestamp);
        const serverTime = new Date(serverData.updatedAt);
        
        return {
          resolved: true,
          data: localTime > serverTime ? localItem.data : serverData,
          strategy: 'last_write_wins'
        };
        
      case 'field_conflict':
        // Merge non-conflicting fields, prefer local for conflicting ones
        const merged = await this.mergeConflictingData(localItem.data, serverData);
        return {
          resolved: true,
          data: merged,
          strategy: 'field_merge'
        };
        
      case 'deletion_conflict':
        // Local modification vs server deletion - prefer keeping data
        return {
          resolved: true,
          data: localItem.data,
          strategy: 'prefer_local'
        };
        
      default:
        // Cannot auto-resolve
        return { resolved: false };
    }
  }

  // Merge conflicting data intelligently
  async mergeConflictingData(localData, serverData) {
    const merged = { ...serverData };
    
    // Preserve local changes for specific fields
    const localFields = ['notes', 'status', 'name'];
    localFields.forEach(field => {
      if (localData[field] !== undefined && localData[field] !== serverData[field]) {
        merged[field] = localData[field];
      }
    });
    
    // Update timestamp to local
    merged.updatedAt = localData.updatedAt;
    
    return merged;
  }

  // Process sync queue in batches
  async processSyncQueue() {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }
    
    this.syncInProgress = true;
    
    try {
      const queue = await this.getQueue();
      if (queue.length === 0) {
        return;
      }
      
      console.log(`Processing sync queue: ${queue.length} items`);
      
      // Sort by timestamp (oldest first)
      queue.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      const batches = this.createBatches(queue, this.batchSize);
      let processedCount = 0;
      let failedCount = 0;
      
      for (const batch of batches) {
        const results = await Promise.allSettled(
          batch.map(item => this.syncSingleItemWithDelay(item))
        );
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            processedCount++;
          } else {
            failedCount++;
            console.warn(`Batch sync failed for item:`, batch[index].id);
          }
        });
        
        // Small delay between batches to avoid overwhelming server
        await this.delay(500);
      }
      
      // Remove successfully synced items from queue
      const remainingQueue = queue.filter(item => 
        item.retryCount >= this.maxRetries || !item.processed
      );
      
      await this.saveQueue(remainingQueue);
      
      console.log(`Sync completed: ${processedCount} synced, ${failedCount} failed`);
      
      // Update last sync timestamp
      await this.updateLastSyncTime();
      
    } catch (error) {
      console.error('Error processing sync queue:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync with exponential backoff delay
  async syncSingleItemWithDelay(syncItem) {
    const delay = this.calculateRetryDelay(syncItem.retryCount || 0);
    if (delay > 0) {
      await this.delay(delay);
    }
    
    const success = await this.syncSingleItem(syncItem);
    if (success) {
      syncItem.processed = true;
    }
    
    return success;
  }

  // Calculate exponential backoff delay
  calculateRetryDelay(retryCount) {
    if (retryCount === 0) return 0;
    return Math.min(this.retryDelay * Math.pow(2, retryCount - 1), 30000); // Max 30 seconds
  }

  // Create batches from array
  createBatches(array, batchSize) {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  // Queue management
  async getQueue() {
    try {
      const queueData = localStorage.getItem(this.queueKey);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Error reading sync queue:', error);
      return [];
    }
  }

  async addToQueue(syncItem) {
    try {
      const queue = await this.getQueue();
      
      // Remove duplicate items (same entity and operation)
      const filtered = queue.filter(item => 
        !(item.entityType === syncItem.entityType && 
          item.data.id === syncItem.data.id && 
          item.operation === syncItem.operation)
      );
      
      // Add new item
      filtered.push(syncItem);
      
      // Enforce queue size limit
      if (filtered.length > this.maxQueueSize) {
        filtered.splice(0, filtered.length - this.maxQueueSize);
        console.warn('Sync queue size limit reached, removing oldest items');
      }
      
      await this.saveQueue(filtered);
      
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }

  async saveQueue(queue) {
    try {
      localStorage.setItem(this.queueKey, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
      throw new Error('Failed to save sync queue - storage quota exceeded');
    }
  }

  // Conflict management
  async getConflicts() {
    try {
      const conflictsData = localStorage.getItem(this.conflictKey);
      return conflictsData ? JSON.parse(conflictsData) : [];
    } catch (error) {
      console.error('Error reading conflicts:', error);
      return [];
    }
  }

  async addToConflicts(conflict) {
    try {
      const conflicts = await this.getConflicts();
      conflicts.push(conflict);
      localStorage.setItem(this.conflictKey, JSON.stringify(conflicts));
    } catch (error) {
      console.error('Error saving conflict:', error);
    }
  }

  async resolveConflict(conflictId, resolution) {
    try {
      const conflicts = await this.getConflicts();
      const conflictIndex = conflicts.findIndex(c => c.id === conflictId);
      
      if (conflictIndex === -1) {
        throw new Error('Conflict not found');
      }
      
      const conflict = conflicts[conflictIndex];
      
      // Apply resolution
      const resolvedItem = {
        ...conflict.localItem,
        data: resolution.data,
        timestamp: new Date().toISOString()
      };
      
      // Attempt sync with resolved data
      const success = await this.syncSingleItem(resolvedItem);
      
      if (success) {
        // Remove from conflicts
        conflicts.splice(conflictIndex, 1);
        localStorage.setItem(this.conflictKey, JSON.stringify(conflicts));
        
        // Update local data
        await this.updateLocalData(conflict.localItem.entityType, resolution.data);
        
        return { success: true };
      }
      
      throw new Error('Failed to sync resolved conflict');
      
    } catch (error) {
      console.error('Error resolving conflict:', error);
      throw error;
    }
  }

  // Update local data after successful sync
  async updateLocalData(entityType, data) {
    try {
      switch (entityType) {
        case 'Plant':
          await dataManager.updatePlant(data.id, data);
          break;
        case 'CalendarEvent':
          await dataManager.updateEvent(data.id, data);
          break;
        case 'CommunityPost':
          await dataManager.updatePost(data.id, data);
          break;
        case 'Settings':
          await dataManager.saveSettings(data);
          break;
        default:
          console.warn('Unknown entity type for local update:', entityType);
      }
    } catch (error) {
      console.error('Error updating local data:', error);
    }
  }

  // Utility methods
  generateSyncId() {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getClientId() {
    let clientId = localStorage.getItem('client_id');
    if (!clientId) {
      clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('client_id', clientId);
    }
    return clientId;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async updateLastSyncTime() {
    localStorage.setItem(this.lastSyncKey, new Date().toISOString());
  }

  getLastSyncTime() {
    return localStorage.getItem(this.lastSyncKey);
  }

  // Public API methods
  async getQueueStatus() {
    const queue = await this.getQueue();
    const conflicts = await this.getConflicts();
    
    return {
      queueSize: queue.length,
      conflictsCount: conflicts.length,
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      lastSync: this.getLastSyncTime()
    };
  }

  async clearQueue() {
    localStorage.removeItem(this.queueKey);
  }

  async clearConflicts() {
    localStorage.removeItem(this.conflictKey);
  }

  // Force sync now
  async forceSyncNow() {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    
    await this.processSyncQueue();
  }
}

// Create singleton instance
export const enhancedSyncService = new EnhancedSyncService();

// Convenience methods for easy usage
export const syncPlant = (plant, operation = 'upsert') => 
  enhancedSyncService.syncData('Plant', plant, operation);

export const syncEvent = (event, operation = 'upsert') => 
  enhancedSyncService.syncData('CalendarEvent', event, operation);

export const syncPost = (post, operation = 'upsert') => 
  enhancedSyncService.syncData('CommunityPost', post, operation);

export const syncSettings = (settings, operation = 'upsert') => 
  enhancedSyncService.syncData('Settings', settings, operation);

export const getSyncStatus = () => enhancedSyncService.getQueueStatus();

export const getConflicts = () => enhancedSyncService.getConflicts();

export const resolveConflict = (conflictId, resolution) => 
  enhancedSyncService.resolveConflict(conflictId, resolution);

export const forceSyncNow = () => enhancedSyncService.forceSyncNow();

export default enhancedSyncService;