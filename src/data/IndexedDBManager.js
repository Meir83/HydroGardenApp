// IndexedDB manager with compression, indexing, and advanced query capabilities
// Replaces localStorage with scalable, high-performance storage

import { validateEntity, SCHEMAS, MIGRATIONS, SCHEMA_VERSION } from './schemas.js';

class IndexedDBManager {
  constructor() {
    this.dbName = 'HydroGardenDB';
    this.dbVersion = 1;
    this.db = null;
    this.compression = {
      enabled: true,
      threshold: 1000 // Compress data larger than 1KB
    };
    
    // Store schemas
    this.stores = {
      plants: {
        keyPath: 'id',
        indexes: [
          { name: 'name', field: 'name', unique: false },
          { name: 'status', field: 'status', unique: false },
          { name: 'plantType', field: 'plantType', unique: false },
          { name: 'createdAt', field: 'createdAt', unique: false },
          { name: 'updatedAt', field: 'updatedAt', unique: false }
        ]
      },
      events: {
        keyPath: 'id',
        indexes: [
          { name: 'date', field: 'date', unique: false },
          { name: 'action', field: 'action', unique: false },
          { name: 'plantId', field: 'plantId', unique: false },
          { name: 'completed', field: 'completed', unique: false },
          { name: 'createdAt', field: 'createdAt', unique: false }
        ]
      },
      posts: {
        keyPath: 'id',
        indexes: [
          { name: 'user', field: 'user', unique: false },
          { name: 'plantId', field: 'plantId', unique: false },
          { name: 'createdAt', field: 'createdAt', unique: false },
          { name: 'likes', field: 'likes', unique: false }
        ]
      },
      settings: {
        keyPath: 'id',
        indexes: []
      },
      metadata: {
        keyPath: 'key',
        indexes: []
      },
      auditLog: {
        keyPath: 'id',
        indexes: [
          { name: 'entityType', field: 'entityType', unique: false },
          { name: 'entityId', field: 'entityId', unique: false },
          { name: 'action', field: 'action', unique: false },
          { name: 'timestamp', field: 'timestamp', unique: false }
        ]
      }
    };
  }

  // Initialize IndexedDB connection
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        Object.keys(this.stores).forEach(storeName => {
          const storeConfig = this.stores[storeName];
          
          // Create store if it doesn't exist
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: storeConfig.keyPath });
            
            // Create indexes
            storeConfig.indexes.forEach(index => {
              store.createIndex(index.name, index.field, { unique: index.unique });
            });
          }
        });
        
        // Initialize metadata
        const metadataStore = event.target.transaction.objectStore('metadata');
        metadataStore.put({ key: 'schema_version', value: SCHEMA_VERSION });
        metadataStore.put({ key: 'created_at', value: new Date().toISOString() });
      };
    });
  }

  // Compression utilities
  compress(data) {
    if (!this.compression.enabled) return data;
    
    const str = JSON.stringify(data);
    if (str.length < this.compression.threshold) return data;
    
    try {
      // Simple LZ compression simulation (in production, use actual compression library)
      const compressed = this.simpleCompress(str);
      return {
        _compressed: true,
        data: compressed,
        originalSize: str.length,
        compressedSize: compressed.length
      };
    } catch (error) {
      console.warn('Compression failed, storing uncompressed:', error);
      return data;
    }
  }

  decompress(data) {
    if (!data || !data._compressed) return data;
    
    try {
      const decompressed = this.simpleDecompress(data.data);
      return JSON.parse(decompressed);
    } catch (error) {
      console.error('Decompression failed:', error);
      throw new Error('Data corruption detected');
    }
  }

  // Simple compression simulation (replace with real compression in production)
  simpleCompress(str) {
    // Basic run-length encoding simulation
    return str.replace(/(.)\1+/g, (match, char) => {
      return char + match.length;
    });
  }

  simpleDecompress(str) {
    // Reverse the simple compression
    return str.replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.slice(1));
      return char.repeat(count);
    });
  }

  // Generic CRUD operations
  async create(storeName, entity, entityType) {
    if (!this.db) throw new Error('Database not initialized');
    
    // Validate entity
    if (entityType) {
      const errors = validateEntity(entity, entityType);
      if (errors) {
        throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
      }
    }
    
    // Compress data
    const compressedEntity = this.compress(entity);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName, 'auditLog'], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(compressedEntity);
      
      request.onsuccess = () => {
        // Log audit trail
        this.logAuditTrail(storeName, entity.id, 'CREATE', entity);
        resolve(entity);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to create entity: ${request.error.message}`));
      };
    });
  }

  async read(storeName, id) {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(this.decompress(result));
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to read entity: ${request.error.message}`));
      };
    });
  }

  async update(storeName, entity, entityType) {
    if (!this.db) throw new Error('Database not initialized');
    
    // Validate entity
    if (entityType) {
      const errors = validateEntity(entity, entityType);
      if (errors) {
        throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
      }
    }
    
    // Get original entity for audit trail
    const original = await this.read(storeName, entity.id);
    
    // Compress data
    const compressedEntity = this.compress(entity);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName, 'auditLog'], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(compressedEntity);
      
      request.onsuccess = () => {
        // Log audit trail
        this.logAuditTrail(storeName, entity.id, 'UPDATE', entity, original);
        resolve(entity);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to update entity: ${request.error.message}`));
      };
    });
  }

  async delete(storeName, id) {
    if (!this.db) throw new Error('Database not initialized');
    
    // Get entity for audit trail before deletion
    const entity = await this.read(storeName, id);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName, 'auditLog'], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        // Log audit trail
        if (entity) {
          this.logAuditTrail(storeName, id, 'DELETE', null, entity);
        }
        resolve(true);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to delete entity: ${request.error.message}`));
      };
    });
  }

  // Query operations with indexing
  async findAll(storeName, options = {}) {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        let results = request.result.map(item => this.decompress(item));
        
        // Apply filtering
        if (options.filter) {
          results = results.filter(options.filter);
        }
        
        // Apply sorting
        if (options.sort) {
          results.sort(options.sort);
        }
        
        // Apply pagination
        if (options.limit || options.offset) {
          const offset = options.offset || 0;
          const limit = options.limit || results.length;
          results = results.slice(offset, offset + limit);
        }
        
        resolve(results);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to query store: ${request.error.message}`));
      };
    });
  }

  async findByIndex(storeName, indexName, value, options = {}) {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      
      const keyRange = options.range || IDBKeyRange.only(value);
      const request = index.getAll(keyRange);
      
      request.onsuccess = () => {
        let results = request.result.map(item => this.decompress(item));
        
        // Apply additional filtering
        if (options.filter) {
          results = results.filter(options.filter);
        }
        
        // Apply sorting
        if (options.sort) {
          results.sort(options.sort);
        }
        
        // Apply pagination
        if (options.limit || options.offset) {
          const offset = options.offset || 0;
          const limit = options.limit || results.length;
          results = results.slice(offset, offset + limit);
        }
        
        resolve(results);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to query index: ${request.error.message}`));
      };
    });
  }

  // Advanced query with multiple filters
  async advancedQuery(storeName, conditions = {}, options = {}) {
    const allData = await this.findAll(storeName);
    
    let results = allData;
    
    // Apply conditions
    if (Object.keys(conditions).length > 0) {
      results = results.filter(item => {
        return Object.keys(conditions).every(key => {
          const condition = conditions[key];
          const value = item[key];
          
          if (typeof condition === 'object' && condition !== null) {
            // Range queries
            if (condition.$gte !== undefined && value < condition.$gte) return false;
            if (condition.$lte !== undefined && value > condition.$lte) return false;
            if (condition.$gt !== undefined && value <= condition.$gt) return false;
            if (condition.$lt !== undefined && value >= condition.$lt) return false;
            if (condition.$in && !condition.$in.includes(value)) return false;
            if (condition.$nin && condition.$nin.includes(value)) return false;
            if (condition.$regex && !condition.$regex.test(value)) return false;
          } else {
            // Exact match
            if (value !== condition) return false;
          }
          
          return true;
        });
      });
    }
    
    // Apply text search
    if (options.search && options.searchFields) {
      const searchLower = options.search.toLowerCase();
      results = results.filter(item => {
        return options.searchFields.some(field => {
          const fieldValue = item[field];
          return fieldValue && fieldValue.toString().toLowerCase().includes(searchLower);
        });
      });
    }
    
    // Apply sorting
    if (options.sort) {
      results.sort(options.sort);
    }
    
    // Apply pagination
    if (options.limit || options.offset) {
      const offset = options.offset || 0;
      const limit = options.limit || results.length;
      results = results.slice(offset, offset + limit);
    }
    
    return results;
  }

  // Audit trail logging
  async logAuditTrail(entityType, entityId, action, newData = null, oldData = null) {
    const auditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entityType,
      entityId,
      action,
      newData: newData ? this.compress(newData) : null,
      oldData: oldData ? this.compress(oldData) : null,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    try {
      const transaction = this.db.transaction(['auditLog'], 'readwrite');
      const store = transaction.objectStore('auditLog');
      store.add(auditEntry);
    } catch (error) {
      console.error('Failed to log audit trail:', error);
    }
  }

  // Get audit trail for an entity
  async getAuditTrail(entityId, options = {}) {
    return this.findByIndex('auditLog', 'entityId', entityId, {
      sort: (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      ...options
    });
  }

  // Migration support
  async migrateData() {
    try {
      const metadata = await this.read('metadata', 'schema_version');
      const currentVersion = metadata ? metadata.value : '0.1.0';
      
      if (currentVersion === SCHEMA_VERSION) {
        return; // No migration needed
      }
      
      console.log(`Migrating data from version ${currentVersion} to ${SCHEMA_VERSION}`);
      
      // Apply migrations
      for (const [fromVersion, migrations] of Object.entries(MIGRATIONS)) {
        if (fromVersion === currentVersion) {
          for (const [toVersion, migration] of Object.entries(migrations)) {
            if (toVersion === SCHEMA_VERSION) {
              await this.applyMigration(migration);
            }
          }
        }
      }
      
      // Update schema version
      await this.update('metadata', { key: 'schema_version', value: SCHEMA_VERSION });
      
      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  async applyMigration(migration) {
    console.log(`Applying migration: ${migration.description}`);
    
    // Migrate each store
    for (const storeName of ['plants', 'events', 'posts', 'settings']) {
      const allData = await this.findAll(storeName);
      const entityType = this.getEntityType(storeName);
      
      for (const item of allData) {
        try {
          const migratedItem = migration.migrate(item, entityType);
          await this.update(storeName, migratedItem, entityType);
        } catch (error) {
          console.error(`Failed to migrate item in ${storeName}:`, error);
        }
      }
    }
  }

  getEntityType(storeName) {
    const mapping = {
      plants: 'Plant',
      events: 'CalendarEvent',
      posts: 'CommunityPost',
      settings: 'Settings'
    };
    return mapping[storeName];
  }

  // Database maintenance
  async cleanupOldAuditLogs(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffISO = cutoffDate.toISOString();
    
    const oldLogs = await this.advancedQuery('auditLog', {
      timestamp: { $lt: cutoffISO }
    });
    
    for (const log of oldLogs) {
      await this.delete('auditLog', log.id);
    }
    
    return oldLogs.length;
  }

  // Get database statistics
  async getStatistics() {
    const stats = {
      totalRecords: 0,
      storeSizes: {},
      compressionStats: {
        totalOriginalSize: 0,
        totalCompressedSize: 0,
        compressionRatio: 0
      },
      lastUpdated: new Date().toISOString()
    };
    
    for (const storeName of Object.keys(this.stores)) {
      if (storeName === 'metadata' || storeName === 'auditLog') continue;
      
      const allData = await this.findAll(storeName);
      stats.storeSizes[storeName] = allData.length;
      stats.totalRecords += allData.length;
      
      // Calculate compression stats
      allData.forEach(item => {
        if (item._compressed) {
          stats.compressionStats.totalOriginalSize += item.originalSize;
          stats.compressionStats.totalCompressedSize += item.compressedSize;
        }
      });
    }
    
    if (stats.compressionStats.totalOriginalSize > 0) {
      stats.compressionStats.compressionRatio = 
        stats.compressionStats.totalCompressedSize / stats.compressionStats.totalOriginalSize;
    }
    
    return stats;
  }

  // Export all data
  async exportData() {
    const exportData = {
      version: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data: {}
    };
    
    for (const storeName of ['plants', 'events', 'posts', 'settings']) {
      exportData.data[storeName] = await this.findAll(storeName);
    }
    
    return exportData;
  }

  // Import data
  async importData(importData, options = { overwrite: false }) {
    if (!importData.data) {
      throw new Error('Invalid import data format');
    }
    
    const results = {
      imported: 0,
      skipped: 0,
      errors: []
    };
    
    for (const [storeName, items] of Object.entries(importData.data)) {
      const entityType = this.getEntityType(storeName);
      
      for (const item of items) {
        try {
          const existing = await this.read(storeName, item.id);
          
          if (existing && !options.overwrite) {
            results.skipped++;
            continue;
          }
          
          if (existing) {
            await this.update(storeName, item, entityType);
          } else {
            await this.create(storeName, item, entityType);
          }
          
          results.imported++;
        } catch (error) {
          results.errors.push({
            item: item.id,
            error: error.message
          });
        }
      }
    }
    
    return results;
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Create singleton instance
export const indexedDBManager = new IndexedDBManager();

// Initialize on import
indexedDBManager.init().catch(error => {
  console.error('Failed to initialize IndexedDB:', error);
  // Fallback to localStorage will be handled by DataManager
});

export default indexedDBManager;