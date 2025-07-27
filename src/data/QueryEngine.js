// Advanced query engine with filtering, sorting, pagination, and search capabilities
// Provides high-performance data querying for the HydroGarden app

import dataManager from './DataManager.js';

class QueryEngine {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.indexCache = new Map();
  }

  // Cache management
  getCacheKey(collection, query, options) {
    return `${collection}_${JSON.stringify(query)}_${JSON.stringify(options)}`;
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

  // Main query method
  async query(collection, queryOptions = {}) {
    const {
      filter = {},
      sort = null,
      limit = null,
      offset = 0,
      search = null,
      searchFields = [],
      facets = [],
      aggregate = null,
      useCache = true
    } = queryOptions;

    // Check cache first
    const cacheKey = this.getCacheKey(collection, queryOptions);
    if (useCache) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    // Get data from appropriate source
    let data = await this.getData(collection);
    
    // Apply filters
    if (Object.keys(filter).length > 0) {
      data = this.applyFilters(data, filter);
    }
    
    // Apply search
    if (search && searchFields.length > 0) {
      data = this.applySearch(data, search, searchFields);
    }
    
    // Store total count before pagination
    const totalCount = data.length;
    
    // Apply sorting
    if (sort) {
      data = this.applySort(data, sort);
    }
    
    // Apply pagination
    if (limit !== null || offset > 0) {
      data = this.applyPagination(data, offset, limit);
    }
    
    // Build result object
    const result = {
      data,
      totalCount,
      hasMore: limit ? (offset + limit) < totalCount : false,
      page: limit ? Math.floor(offset / limit) + 1 : 1,
      totalPages: limit ? Math.ceil(totalCount / limit) : 1
    };
    
    // Add facets if requested
    if (facets.length > 0) {
      result.facets = await this.calculateFacets(collection, facets, filter);
    }
    
    // Add aggregations if requested
    if (aggregate) {
      result.aggregations = this.calculateAggregations(data, aggregate);
    }
    
    // Cache result
    if (useCache) {
      this.setCache(cacheKey, result);
    }
    
    return result;
  }

  // Specialized query methods for each collection

  // Plants queries
  async queryPlants(options = {}) {
    return this.query('plants', {
      searchFields: ['name', 'notes', 'plantType', 'location'],
      ...options
    });
  }

  async getPlantsByStatus(status, options = {}) {
    return this.queryPlants({
      filter: { status },
      ...options
    });
  }

  async getPlantsByType(plantType, options = {}) {
    return this.queryPlants({
      filter: { plantType },
      ...options
    });
  }

  async getHealthyPlants(options = {}) {
    return this.getPlantsByStatus('בריא', options);
  }

  async getPlantsNeedingCare(options = {}) {
    return this.queryPlants({
      filter: {
        status: { $in: ['דורש השקיה', 'דורש דישון', 'חולה'] }
      },
      ...options
    });
  }

  async getPlantsByAge(minDays = 0, maxDays = null, options = {}) {
    const plants = await this.getData('plants');
    const now = new Date();
    
    const filtered = plants.filter(plant => {
      if (!plant.plantedDate) return false;
      
      const plantedDate = new Date(plant.plantedDate);
      const ageDays = Math.floor((now - plantedDate) / (1000 * 60 * 60 * 24));
      
      if (ageDays < minDays) return false;
      if (maxDays !== null && ageDays > maxDays) return false;
      
      return true;
    });
    
    return this.processQueryResult(filtered, options);
  }

  // Events queries
  async queryEvents(options = {}) {
    return this.query('events', {
      searchFields: ['action', 'notes'],
      sort: { field: 'date', direction: 'asc' },
      ...options
    });
  }

  async getEventsByDate(date, options = {}) {
    return this.queryEvents({
      filter: { date },
      ...options
    });
  }

  async getEventsByDateRange(startDate, endDate, options = {}) {
    return this.queryEvents({
      filter: {
        date: { $gte: startDate, $lte: endDate }
      },
      ...options
    });
  }

  async getEventsByAction(action, options = {}) {
    return this.queryEvents({
      filter: { action },
      ...options
    });
  }

  async getCompletedEvents(options = {}) {
    return this.queryEvents({
      filter: { completed: true },
      ...options
    });
  }

  async getPendingEvents(options = {}) {
    return this.queryEvents({
      filter: { completed: false },
      ...options
    });
  }

  async getOverdueEvents(options = {}) {
    const today = new Date().toISOString().slice(0, 10);
    return this.queryEvents({
      filter: {
        completed: false,
        date: { $lt: today }
      },
      ...options
    });
  }

  async getUpcomingEvents(days = 7, options = {}) {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    
    return this.queryEvents({
      filter: {
        completed: false,
        date: {
          $gte: today.toISOString().slice(0, 10),
          $lte: futureDate.toISOString().slice(0, 10)
        }
      },
      ...options
    });
  }

  async getEventsByPlant(plantId, options = {}) {
    return this.queryEvents({
      filter: { plantId },
      ...options
    });
  }

  // Posts queries
  async queryPosts(options = {}) {
    return this.query('posts', {
      searchFields: ['text', 'user'],
      sort: { field: 'createdAt', direction: 'desc' },
      ...options
    });
  }

  async getPostsByUser(user, options = {}) {
    return this.queryPosts({
      filter: { user },
      ...options
    });
  }

  async getPostsByPlant(plantId, options = {}) {
    return this.queryPosts({
      filter: { plantId },
      ...options
    });
  }

  async getRecentPosts(days = 30, options = {}) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return this.queryPosts({
      filter: {
        createdAt: { $gte: cutoffDate.toISOString() }
      },
      ...options
    });
  }

  async getPopularPosts(options = {}) {
    return this.queryPosts({
      sort: { field: 'likes', direction: 'desc' },
      ...options
    });
  }

  // Advanced search capabilities
  async fullTextSearch(searchTerm, collections = ['plants', 'events', 'posts'], options = {}) {
    const results = {};
    
    const searchPromises = collections.map(async collection => {
      let searchFields;
      switch (collection) {
        case 'plants':
          searchFields = ['name', 'notes', 'plantType', 'location'];
          break;
        case 'events':
          searchFields = ['action', 'notes'];
          break;
        case 'posts':
          searchFields = ['text', 'user'];
          break;
        default:
          searchFields = [];
      }
      
      const result = await this.query(collection, {
        search: searchTerm,
        searchFields,
        limit: options.limit || 20,
        ...options
      });
      
      return { collection, result };
    });
    
    const searchResults = await Promise.all(searchPromises);
    
    searchResults.forEach(({ collection, result }) => {
      results[collection] = result;
    });
    
    // Calculate overall relevance scores
    results.overall = this.combineSearchResults(searchResults, searchTerm);
    
    return results;
  }

  // Faceted search
  async facetedSearch(collection, facetFields, options = {}) {
    const data = await this.getData(collection);
    const facets = {};
    
    facetFields.forEach(field => {
      facets[field] = this.calculateFieldFacets(data, field);
    });
    
    return {
      facets,
      totalCount: data.length
    };
  }

  // Analytics queries
  async getAnalyticsData(collection, groupBy, options = {}) {
    const data = await this.getData(collection);
    
    const grouped = this.groupDataBy(data, groupBy);
    const analytics = {};
    
    Object.keys(grouped).forEach(key => {
      analytics[key] = {
        count: grouped[key].length,
        items: options.includeItems ? grouped[key] : undefined
      };
    });
    
    return analytics;
  }

  async getTrendData(collection, dateField, period = 'month', options = {}) {
    const data = await this.getData(collection);
    const trends = {};
    
    data.forEach(item => {
      const date = new Date(item[dateField]);
      let periodKey;
      
      switch (period) {
        case 'day':
          periodKey = date.toISOString().slice(0, 10);
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().slice(0, 10);
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        case 'year':
          periodKey = date.getFullYear().toString();
          break;
        default:
          periodKey = date.toISOString().slice(0, 10);
      }
      
      trends[periodKey] = (trends[periodKey] || 0) + 1;
    });
    
    return trends;
  }

  // Helper methods

  async getData(collection) {
    switch (collection) {
      case 'plants':
        return await dataManager.getPlants(false);
      case 'events':
        return await dataManager.getEvents(false);
      case 'posts':
        return await dataManager.getPosts(false);
      default:
        throw new Error(`Unknown collection: ${collection}`);
    }
  }

  applyFilters(data, filters) {
    return data.filter(item => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key];
        const itemValue = this.getNestedValue(item, key);
        
        return this.matchesFilter(itemValue, filterValue);
      });
    });
  }

  matchesFilter(value, filter) {
    if (typeof filter === 'object' && filter !== null && !Array.isArray(filter)) {
      // Complex filter operations
      if (filter.$eq !== undefined) return value === filter.$eq;
      if (filter.$ne !== undefined) return value !== filter.$ne;
      if (filter.$gt !== undefined) return value > filter.$gt;
      if (filter.$gte !== undefined) return value >= filter.$gte;
      if (filter.$lt !== undefined) return value < filter.$lt;
      if (filter.$lte !== undefined) return value <= filter.$lte;
      if (filter.$in !== undefined) return filter.$in.includes(value);
      if (filter.$nin !== undefined) return !filter.$nin.includes(value);
      if (filter.$regex !== undefined) {
        const regex = new RegExp(filter.$regex, filter.$options || 'i');
        return regex.test(value);
      }
      if (filter.$exists !== undefined) {
        return filter.$exists ? value !== undefined : value === undefined;
      }
      
      return false;
    }
    
    // Simple equality check
    return value === filter;
  }

  applySearch(data, searchTerm, searchFields) {
    const searchLower = searchTerm.toLowerCase();
    
    return data.filter(item => {
      return searchFields.some(field => {
        const fieldValue = this.getNestedValue(item, field);
        return fieldValue && fieldValue.toString().toLowerCase().includes(searchLower);
      });
    });
  }

  applySort(data, sortOptions) {
    if (Array.isArray(sortOptions)) {
      // Multiple sort criteria
      return data.sort((a, b) => {
        for (const sort of sortOptions) {
          const result = this.compareSortValues(a, b, sort);
          if (result !== 0) return result;
        }
        return 0;
      });
    } else {
      // Single sort criterion
      return data.sort((a, b) => this.compareSortValues(a, b, sortOptions));
    }
  }

  compareSortValues(a, b, sort) {
    const { field, direction = 'asc' } = sort;
    const aValue = this.getNestedValue(a, field);
    const bValue = this.getNestedValue(b, field);
    
    let comparison = 0;
    
    if (aValue < bValue) comparison = -1;
    else if (aValue > bValue) comparison = 1;
    
    return direction === 'desc' ? -comparison : comparison;
  }

  applyPagination(data, offset, limit) {
    const start = offset || 0;
    const end = limit ? start + limit : data.length;
    return data.slice(start, end);
  }

  async calculateFacets(collection, facetFields, existingFilters = {}) {
    const data = await this.getData(collection);
    const facets = {};
    
    facetFields.forEach(field => {
      facets[field] = this.calculateFieldFacets(data, field, existingFilters);
    });
    
    return facets;
  }

  calculateFieldFacets(data, field, existingFilters = {}) {
    const facetCounts = {};
    
    data.forEach(item => {
      // Skip if item doesn't match other filters
      const matchesOtherFilters = Object.keys(existingFilters)
        .filter(key => key !== field)
        .every(key => this.matchesFilter(this.getNestedValue(item, key), existingFilters[key]));
      
      if (!matchesOtherFilters) return;
      
      const value = this.getNestedValue(item, field);
      const key = value || 'לא מוגדר';
      facetCounts[key] = (facetCounts[key] || 0) + 1;
    });
    
    return Object.entries(facetCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([value, count]) => ({ value, count }));
  }

  calculateAggregations(data, aggregations) {
    const results = {};
    
    Object.keys(aggregations).forEach(aggName => {
      const aggConfig = aggregations[aggName];
      results[aggName] = this.performAggregation(data, aggConfig);
    });
    
    return results;
  }

  performAggregation(data, config) {
    const { type, field } = config;
    const values = data.map(item => this.getNestedValue(item, field)).filter(v => v != null);
    
    switch (type) {
      case 'count':
        return values.length;
      case 'sum':
        return values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      case 'avg':
        return values.length ? values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0) / values.length : 0;
      case 'min':
        return Math.min(...values.map(v => parseFloat(v) || 0));
      case 'max':
        return Math.max(...values.map(v => parseFloat(v) || 0));
      case 'distinct':
        return [...new Set(values)].length;
      default:
        return null;
    }
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  groupDataBy(data, groupField) {
    return data.reduce((groups, item) => {
      const key = this.getNestedValue(item, groupField) || 'לא מוגדר';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});
  }

  combineSearchResults(searchResults, searchTerm) {
    const combined = [];
    
    searchResults.forEach(({ collection, result }) => {
      result.data.forEach(item => {
        const relevance = this.calculateRelevance(item, searchTerm, collection);
        combined.push({
          item,
          collection,
          relevance
        });
      });
    });
    
    return combined.sort((a, b) => b.relevance - a.relevance);
  }

  calculateRelevance(item, searchTerm, collection) {
    let score = 0;
    const searchLower = searchTerm.toLowerCase();
    
    // Score based on exact matches, partial matches, etc.
    Object.values(item).forEach(value => {
      if (typeof value === 'string') {
        const valueLower = value.toLowerCase();
        if (valueLower === searchLower) score += 100;
        else if (valueLower.includes(searchLower)) score += 50;
        else if (valueLower.startsWith(searchLower)) score += 75;
      }
    });
    
    // Boost certain collections
    if (collection === 'plants') score *= 1.2;
    
    return score;
  }

  processQueryResult(data, options = {}) {
    const {
      sort = null,
      limit = null,
      offset = 0,
      search = null,
      searchFields = []
    } = options;

    let processedData = [...data];

    // Apply search
    if (search && searchFields.length > 0) {
      processedData = this.applySearch(processedData, search, searchFields);
    }

    const totalCount = processedData.length;

    // Apply sorting
    if (sort) {
      processedData = this.applySort(processedData, sort);
    }

    // Apply pagination
    if (limit !== null || offset > 0) {
      processedData = this.applyPagination(processedData, offset, limit);
    }

    return {
      data: processedData,
      totalCount,
      hasMore: limit ? (offset + limit) < totalCount : false,
      page: limit ? Math.floor(offset / limit) + 1 : 1,
      totalPages: limit ? Math.ceil(totalCount / limit) : 1
    };
  }

  // Performance optimization methods
  async createIndex(collection, fields) {
    const indexKey = `${collection}_${fields.join('_')}`;
    
    if (this.indexCache.has(indexKey)) {
      return this.indexCache.get(indexKey);
    }
    
    const data = await this.getData(collection);
    const index = new Map();
    
    data.forEach((item, idx) => {
      const key = fields.map(field => this.getNestedValue(item, field)).join('|');
      if (!index.has(key)) {
        index.set(key, []);
      }
      index.get(key).push({ item, index: idx });
    });
    
    this.indexCache.set(indexKey, index);
    return index;
  }

  // Batch operations
  async batchQuery(queries) {
    const results = await Promise.all(
      queries.map(query => this.query(query.collection, query.options))
    );
    
    return queries.reduce((acc, query, index) => {
      acc[query.name || index] = results[index];
      return acc;
    }, {});
  }
}

// Create singleton instance
export const queryEngine = new QueryEngine();

export default queryEngine;