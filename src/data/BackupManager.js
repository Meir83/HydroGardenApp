// Comprehensive backup and recovery system for HydroGarden app
// Provides automated backups, versioning, and data recovery capabilities

import dataManager from './DataManager.js';
import { SCHEMA_VERSION } from './schemas.js';

class BackupManager {
  constructor() {
    this.backupKey = 'hydro_backups';
    this.maxBackups = 10;
    this.autoBackupInterval = 24 * 60 * 60 * 1000; // 24 hours
    this.compressionEnabled = true;
    
    // Start auto-backup timer
    this.startAutoBackup();
  }

  // Create a comprehensive backup
  async createBackup(options = {}) {
    try {
      const {
        includeAuditTrail = false,
        includeAnalytics = false,
        description = '',
        manual = false
      } = options;
      
      // Get all data
      const [plants, events, posts, settings] = await Promise.all([
        dataManager.getPlants(false),
        dataManager.getEvents(false),
        dataManager.getPosts(false),
        dataManager.getSettings()
      ]);
      
      // Create backup object
      const backup = {
        id: this.generateBackupId(),
        version: SCHEMA_VERSION,
        createdAt: new Date().toISOString(),
        description: description || (manual ? 'ידני' : 'אוטומטי'),
        type: manual ? 'manual' : 'automatic',
        size: 0,
        checksum: '',
        data: {
          plants,
          events,
          posts,
          settings
        },
        metadata: {
          totalPlants: plants.length,
          totalEvents: events.length,
          totalPosts: posts.length,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        }
      };
      
      // Add optional data
      if (includeAuditTrail && dataManager.useIndexedDB) {
        try {
          const auditTrail = await this.getAuditTrailData();
          backup.data.auditTrail = auditTrail;
          backup.metadata.totalAuditEntries = auditTrail.length;
        } catch (error) {
          console.warn('Failed to include audit trail in backup:', error);
        }
      }
      
      if (includeAnalytics) {
        try {
          const analytics = await this.getAnalyticsSnapshot();
          backup.data.analytics = analytics;
        } catch (error) {
          console.warn('Failed to include analytics in backup:', error);
        }
      }
      
      // Calculate size and checksum
      const dataString = JSON.stringify(backup.data);
      backup.size = dataString.length;
      backup.checksum = await this.calculateChecksum(dataString);
      
      // Compress if enabled
      if (this.compressionEnabled) {
        backup.data = this.compressData(backup.data);
        backup.compressed = true;
      }
      
      // Save backup
      await this.saveBackup(backup);
      
      // Clean up old backups
      await this.cleanupOldBackups();
      
      console.log(`Backup created successfully: ${backup.id}`);
      return backup;
      
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error(`Backup creation failed: ${error.message}`);
    }
  }

  // Restore from backup
  async restoreFromBackup(backupId, options = {}) {
    try {
      const {
        includeSettings = true,
        includeAuditTrail = false,
        overwriteExisting = false,
        dryRun = false
      } = options;
      
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }
      
      // Verify backup integrity
      const isValid = await this.verifyBackup(backup);
      if (!isValid) {
        throw new Error('Backup verification failed - data may be corrupted');
      }
      
      // Decompress if needed
      let data = backup.data;
      if (backup.compressed) {
        data = this.decompressData(data);
      }
      
      if (dryRun) {
        return {
          valid: true,
          summary: {
            plants: data.plants?.length || 0,
            events: data.events?.length || 0,
            posts: data.posts?.length || 0,
            settings: data.settings ? 1 : 0
          }
        };
      }
      
      // Create recovery backup before restore
      const recoveryBackup = await this.createBackup({
        description: `Pre-restore backup before restoring ${backupId}`,
        manual: true
      });
      
      const results = {
        restored: 0,
        skipped: 0,
        errors: [],
        recoveryBackupId: recoveryBackup.id
      };
      
      try {
        // Restore plants
        if (data.plants) {
          const plantResults = await this.restoreEntities('plants', data.plants, overwriteExisting);
          results.restored += plantResults.restored;
          results.skipped += plantResults.skipped;
          results.errors.push(...plantResults.errors);
        }
        
        // Restore events
        if (data.events) {
          const eventResults = await this.restoreEntities('events', data.events, overwriteExisting);
          results.restored += eventResults.restored;
          results.skipped += eventResults.skipped;
          results.errors.push(...eventResults.errors);
        }
        
        // Restore posts
        if (data.posts) {
          const postResults = await this.restoreEntities('posts', data.posts, overwriteExisting);
          results.restored += postResults.restored;
          results.skipped += postResults.skipped;
          results.errors.push(...postResults.errors);
        }
        
        // Restore settings
        if (data.settings && includeSettings) {
          try {
            await dataManager.saveSettings(data.settings);
            results.restored += 1;
          } catch (error) {
            results.errors.push({ entity: 'settings', error: error.message });
          }
        }
        
        console.log(`Restore completed: ${results.restored} items restored, ${results.skipped} skipped, ${results.errors.length} errors`);
        return results;
        
      } catch (error) {
        // If restore fails, we still have the recovery backup
        console.error('Restore failed, recovery backup available:', recoveryBackup.id);
        throw error;
      }
      
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw new Error(`Restore failed: ${error.message}`);
    }
  }

  // Export backup to file
  async exportBackup(backupId, format = 'json') {
    try {
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }
      
      let content;
      let filename;
      let mimeType;
      
      switch (format.toLowerCase()) {
        case 'json':
          content = JSON.stringify(backup, null, 2);
          filename = `hydrogarden-backup-${backup.id}.json`;
          mimeType = 'application/json';
          break;
          
        case 'csv':
          content = await this.convertToCSV(backup);
          filename = `hydrogarden-backup-${backup.id}.csv`;
          mimeType = 'text/csv';
          break;
          
        default:
          throw new Error('Unsupported export format');
      }
      
      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      return { success: true, filename };
      
    } catch (error) {
      console.error('Failed to export backup:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  // Import backup from file
  async importBackup(file, options = {}) {
    try {
      const content = await this.readFile(file);
      let backup;
      
      if (file.name.endsWith('.json')) {
        backup = JSON.parse(content);
      } else {
        throw new Error('Unsupported file format');
      }
      
      // Validate backup format
      if (!backup.id || !backup.data || !backup.version) {
        throw new Error('Invalid backup format');
      }
      
      // Verify backup integrity
      const isValid = await this.verifyBackup(backup);
      if (!isValid) {
        throw new Error('Backup verification failed');
      }
      
      // Save imported backup
      backup.imported = true;
      backup.importedAt = new Date().toISOString();
      await this.saveBackup(backup);
      
      return { success: true, backupId: backup.id };
      
    } catch (error) {
      console.error('Failed to import backup:', error);
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  // Get all backups
  async getBackups() {
    try {
      const backupsData = localStorage.getItem(this.backupKey);
      return backupsData ? JSON.parse(backupsData) : [];
    } catch (error) {
      console.error('Failed to get backups:', error);
      return [];
    }
  }

  // Get specific backup
  async getBackup(backupId) {
    const backups = await this.getBackups();
    return backups.find(b => b.id === backupId);
  }

  // Delete backup
  async deleteBackup(backupId) {
    try {
      const backups = await this.getBackups();
      const filtered = backups.filter(b => b.id !== backupId);
      localStorage.setItem(this.backupKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return false;
    }
  }

  // Verify backup integrity
  async verifyBackup(backup) {
    try {
      if (!backup.checksum) return false;
      
      let data = backup.data;
      if (backup.compressed) {
        data = this.decompressData(data);
      }
      
      const dataString = JSON.stringify(data);
      const calculatedChecksum = await this.calculateChecksum(dataString);
      
      return calculatedChecksum === backup.checksum;
    } catch (error) {
      console.error('Backup verification failed:', error);
      return false;
    }
  }

  // Auto-backup functionality
  startAutoBackup() {
    // Check if auto-backup is due on startup
    this.checkAutoBackup();
    
    // Set up interval for auto-backup
    setInterval(() => {
      this.checkAutoBackup();
    }, 60 * 60 * 1000); // Check every hour
  }

  async checkAutoBackup() {
    try {
      const lastBackup = await this.getLastBackup();
      const now = Date.now();
      
      if (!lastBackup || (now - new Date(lastBackup.createdAt).getTime() > this.autoBackupInterval)) {
        console.log('Creating automatic backup...');
        await this.createBackup({
          description: 'Automatic backup',
          manual: false
        });
      }
    } catch (error) {
      console.error('Auto-backup failed:', error);
    }
  }

  async getLastBackup() {
    const backups = await this.getBackups();
    return backups.reduce((latest, backup) => {
      return new Date(backup.createdAt) > new Date(latest?.createdAt || 0) ? backup : latest;
    }, null);
  }

  // Helper methods

  generateBackupId() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substr(2, 6);
    return `backup_${timestamp}_${random}`;
  }

  async calculateChecksum(data) {
    // Simple checksum calculation (in production, use crypto.subtle)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  compressData(data) {
    // Simple compression simulation
    const json = JSON.stringify(data);
    return {
      _compressed: true,
      data: btoa(json), // Base64 encoding as compression simulation
      originalSize: json.length,
      compressedSize: btoa(json).length
    };
  }

  decompressData(compressedData) {
    if (!compressedData._compressed) return compressedData;
    
    try {
      const json = atob(compressedData.data);
      return JSON.parse(json);
    } catch (error) {
      throw new Error('Failed to decompress backup data');
    }
  }

  async saveBackup(backup) {
    const backups = await this.getBackups();
    backups.push(backup);
    
    // Sort by creation date (newest first)
    backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    localStorage.setItem(this.backupKey, JSON.stringify(backups));
  }

  async cleanupOldBackups() {
    const backups = await this.getBackups();
    
    if (backups.length > this.maxBackups) {
      // Keep only the most recent backups, but preserve manual backups
      const automaticBackups = backups.filter(b => b.type === 'automatic');
      const manualBackups = backups.filter(b => b.type === 'manual');
      
      // Keep all manual backups, limit automatic ones
      const toKeep = manualBackups.concat(
        automaticBackups.slice(0, Math.max(1, this.maxBackups - manualBackups.length))
      );
      
      localStorage.setItem(this.backupKey, JSON.stringify(toKeep));
    }
  }

  async restoreEntities(type, entities, overwriteExisting) {
    const results = { restored: 0, skipped: 0, errors: [] };
    
    for (const entity of entities) {
      try {
        let existing = null;
        
        // Check if entity exists
        switch (type) {
          case 'plants':
            existing = await dataManager.getPlant(entity.id);
            break;
          case 'events':
            existing = await dataManager.getEvent?.(entity.id);
            break;
          case 'posts':
            existing = await dataManager.getPost?.(entity.id);
            break;
        }
        
        if (existing && !overwriteExisting) {
          results.skipped++;
          continue;
        }
        
        // Restore entity
        switch (type) {
          case 'plants':
            if (existing) {
              await dataManager.updatePlant(entity.id, entity);
            } else {
              await dataManager.createPlant(entity);
            }
            break;
          case 'events':
            if (existing) {
              await dataManager.updateEvent(entity.id, entity);
            } else {
              await dataManager.createEvent(entity);
            }
            break;
          case 'posts':
            if (existing) {
              await dataManager.updatePost(entity.id, entity);
            } else {
              await dataManager.createPost(entity);
            }
            break;
        }
        
        results.restored++;
        
      } catch (error) {
        results.errors.push({
          entity: entity.id,
          type,
          error: error.message
        });
      }
    }
    
    return results;
  }

  async convertToCSV(backup) {
    let csv = '';
    
    // Decompress if needed
    let data = backup.data;
    if (backup.compressed) {
      data = this.decompressData(data);
    }
    
    // Convert plants to CSV
    if (data.plants && data.plants.length > 0) {
      csv += 'Plants\n';
      csv += 'ID,Name,Status,Type,Planted Date,Created At\n';
      
      data.plants.forEach(plant => {
        csv += `"${plant.id}","${plant.name}","${plant.status}","${plant.plantType || ''}","${plant.plantedDate || ''}","${plant.createdAt}"\n`;
      });
      
      csv += '\n';
    }
    
    // Convert events to CSV
    if (data.events && data.events.length > 0) {
      csv += 'Events\n';
      csv += 'ID,Date,Action,Plant ID,Completed,Created At\n';
      
      data.events.forEach(event => {
        csv += `"${event.id}","${event.date}","${event.action}","${event.plantId || ''}","${event.completed || false}","${event.createdAt}"\n`;
      });
      
      csv += '\n';
    }
    
    return csv;
  }

  async readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async getAuditTrailData() {
    // Get audit trail data if available
    try {
      const allAuditEntries = [];
      // Get audit entries for all entity types
      // This would need to be implemented based on the audit trail structure
      return allAuditEntries;
    } catch (error) {
      console.warn('Failed to get audit trail data:', error);
      return [];
    }
  }

  async getAnalyticsSnapshot() {
    // Get analytics data snapshot
    try {
      // This would get analytics data if available
      return {
        snapshot: true,
        generatedAt: new Date().toISOString(),
        summary: 'Analytics snapshot would go here'
      };
    } catch (error) {
      console.warn('Failed to get analytics snapshot:', error);
      return null;
    }
  }

  // Get backup statistics
  async getBackupStatistics() {
    const backups = await this.getBackups();
    
    if (backups.length === 0) {
      return {
        totalBackups: 0,
        totalSize: 0,
        lastBackup: null,
        automaticBackups: 0,
        manualBackups: 0
      };
    }
    
    const totalSize = backups.reduce((sum, backup) => sum + (backup.size || 0), 0);
    const lastBackup = backups.reduce((latest, backup) => 
      new Date(backup.createdAt) > new Date(latest.createdAt) ? backup : latest
    );
    
    return {
      totalBackups: backups.length,
      totalSize,
      lastBackup: lastBackup.createdAt,
      automaticBackups: backups.filter(b => b.type === 'automatic').length,
      manualBackups: backups.filter(b => b.type === 'manual').length,
      averageSize: Math.round(totalSize / backups.length),
      oldestBackup: backups.reduce((oldest, backup) => 
        new Date(backup.createdAt) < new Date(oldest.createdAt) ? backup : oldest
      ).createdAt
    };
  }
}

// Create singleton instance
export const backupManager = new BackupManager();

export default backupManager;