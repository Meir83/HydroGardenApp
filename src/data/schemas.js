// Schema definitions for HydroGarden app data models
// Provides validation, relationships, and migration support

export const SCHEMA_VERSION = '1.0.0';

// Base schema validation utilities
export const validateField = (value, schema) => {
  const errors = [];
  
  // Required validation
  if (schema.required && (value === undefined || value === null || value === '')) {
    errors.push(`Field is required`);
    return errors;
  }
  
  // Skip further validation if value is empty and not required
  if (!schema.required && (value === undefined || value === null || value === '')) {
    return errors;
  }
  
  // Type validation
  if (schema.type === 'string' && typeof value !== 'string') {
    errors.push(`Expected string, got ${typeof value}`);
  } else if (schema.type === 'number' && (typeof value !== 'number' || isNaN(value))) {
    errors.push(`Expected number, got ${typeof value}`);
  } else if (schema.type === 'boolean' && typeof value !== 'boolean') {
    errors.push(`Expected boolean, got ${typeof value}`);
  } else if (schema.type === 'array' && !Array.isArray(value)) {
    errors.push(`Expected array, got ${typeof value}`);
  } else if (schema.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
    errors.push(`Expected object, got ${typeof value}`);
  }
  
  // String validations
  if (schema.type === 'string' && typeof value === 'string') {
    if (schema.minLength && value.length < schema.minLength) {
      errors.push(`Minimum length is ${schema.minLength}, got ${value.length}`);
    }
    if (schema.maxLength && value.length > schema.maxLength) {
      errors.push(`Maximum length is ${schema.maxLength}, got ${value.length}`);
    }
    if (schema.pattern && !schema.pattern.test(value)) {
      errors.push(`Value does not match required pattern`);
    }
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(`Value must be one of: ${schema.enum.join(', ')}`);
    }
  }
  
  // Number validations
  if (schema.type === 'number' && typeof value === 'number' && !isNaN(value)) {
    if (schema.min !== undefined && value < schema.min) {
      errors.push(`Minimum value is ${schema.min}, got ${value}`);
    }
    if (schema.max !== undefined && value > schema.max) {
      errors.push(`Maximum value is ${schema.max}, got ${value}`);
    }
  }
  
  // Array validations
  if (schema.type === 'array' && Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) {
      errors.push(`Minimum items is ${schema.minItems}, got ${value.length}`);
    }
    if (schema.maxItems && value.length > schema.maxItems) {
      errors.push(`Maximum items is ${schema.maxItems}, got ${value.length}`);
    }
  }
  
  return errors;
};

// Schema validation function
export const validateSchema = (data, schema) => {
  const errors = {};
  
  // Check for required fields and validate existing fields
  Object.keys(schema.properties).forEach(field => {
    const fieldSchema = schema.properties[field];
    const value = data[field];
    const fieldErrors = validateField(value, fieldSchema);
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });
  
  // Check for unknown fields
  Object.keys(data).forEach(field => {
    if (!schema.properties[field] && !schema.allowAdditionalProperties) {
      if (!errors._unknown) errors._unknown = [];
      errors._unknown.push(`Unknown field: ${field}`);
    }
  });
  
  return Object.keys(errors).length === 0 ? null : errors;
};

// Plant schema definition
export const PlantSchema = {
  name: 'Plant',
  version: '1.0.0',
  properties: {
    id: {
      type: 'string',
      required: true,
      pattern: /^plant_[a-zA-Z0-9_-]+$/
    },
    name: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100
    },
    status: {
      type: 'string',
      required: true,
      enum: ['בריא', 'דורש השקיה', 'דורש דישון', 'חולה', 'חדש', 'ארכיון']
    },
    image: {
      type: 'string',
      required: false,
      maxLength: 10 // For emoji or short icon
    },
    plantType: {
      type: 'string',
      required: false,
      enum: ['עגבנייה', 'בזיליקום', 'חסה', 'נענע', 'פלפל', 'מלפפון', 'אחר']
    },
    plantedDate: {
      type: 'string',
      required: false,
      pattern: /^\d{4}-\d{2}-\d{2}$/
    },
    location: {
      type: 'string',
      required: false,
      maxLength: 50
    },
    notes: {
      type: 'string',
      required: false,
      maxLength: 500
    },
    careSchedule: {
      type: 'object',
      required: false,
      properties: {
        watering: { type: 'number', min: 1, max: 30 }, // days interval
        fertilizing: { type: 'number', min: 1, max: 90 }, // days interval
        pruning: { type: 'number', min: 1, max: 180 } // days interval
      }
    },
    measurements: {
      type: 'array',
      required: false,
      maxItems: 1000
    },
    createdAt: {
      type: 'string',
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    },
    updatedAt: {
      type: 'string',
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    }
  },
  allowAdditionalProperties: false
};

// Calendar Event schema definition
export const CalendarEventSchema = {
  name: 'CalendarEvent',
  version: '1.0.0',
  properties: {
    id: {
      type: 'string',
      required: true,
      pattern: /^event_[a-zA-Z0-9_-]+$/
    },
    date: {
      type: 'string',
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}$/
    },
    action: {
      type: 'string',
      required: true,
      enum: ['השקיה', 'גיזום', 'דישון', 'בדיקת pH', 'החלפת מים', 'בדיקה כללית']
    },
    icon: {
      type: 'string',
      required: false,
      maxLength: 10
    },
    plantId: {
      type: 'string',
      required: false,
      pattern: /^plant_[a-zA-Z0-9_-]+$/
    },
    completed: {
      type: 'boolean',
      required: false
    },
    completedAt: {
      type: 'string',
      required: false,
      pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    },
    notes: {
      type: 'string',
      required: false,
      maxLength: 300
    },
    reminder: {
      type: 'boolean',
      required: false
    },
    recurring: {
      type: 'object',
      required: false,
      properties: {
        enabled: { type: 'boolean', required: true },
        interval: { type: 'number', min: 1, max: 365 },
        unit: { type: 'string', enum: ['days', 'weeks', 'months'] }
      }
    },
    createdAt: {
      type: 'string',
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    },
    updatedAt: {
      type: 'string',
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    }
  },
  allowAdditionalProperties: false
};

// Community Post schema definition
export const CommunityPostSchema = {
  name: 'CommunityPost',
  version: '1.0.0',
  properties: {
    id: {
      type: 'string',
      required: true,
      pattern: /^post_[a-zA-Z0-9_-]+$/
    },
    user: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 50
    },
    text: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 1000
    },
    image: {
      type: 'string',
      required: false,
      maxLength: 10 // For emoji
    },
    imageUrl: {
      type: 'string',
      required: false,
      maxLength: 500
    },
    tags: {
      type: 'array',
      required: false,
      maxItems: 10
    },
    likes: {
      type: 'number',
      required: false,
      min: 0
    },
    comments: {
      type: 'array',
      required: false,
      maxItems: 100
    },
    plantId: {
      type: 'string',
      required: false,
      pattern: /^plant_[a-zA-Z0-9_-]+$/
    },
    createdAt: {
      type: 'string',
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    },
    updatedAt: {
      type: 'string',
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    }
  },
  allowAdditionalProperties: false
};

// Settings schema definition
export const SettingsSchema = {
  name: 'Settings',
  version: '1.0.0',
  properties: {
    id: {
      type: 'string',
      required: true,
      pattern: /^settings_user$/
    },
    name: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100
    },
    notif: {
      type: 'string',
      required: true,
      enum: ['הכל', 'רק השקיה', 'רק דישון', 'ללא התראות']
    },
    lang: {
      type: 'string',
      required: true,
      enum: ['עברית', 'English']
    },
    units: {
      type: 'string',
      required: true,
      enum: ['מטרי (מ"ל, ס"מ)', 'אמריקאי (Oz, Inch)']
    },
    theme: {
      type: 'string',
      required: false,
      enum: ['light', 'dark', 'auto']
    },
    notifications: {
      type: 'object',
      required: false,
      properties: {
        watering: { type: 'boolean' },
        fertilizing: { type: 'boolean' },
        pruning: { type: 'boolean' },
        daily: { type: 'boolean' }
      }
    },
    privacy: {
      type: 'object',
      required: false,
      properties: {
        shareData: { type: 'boolean' },
        showInCommunity: { type: 'boolean' },
        allowAnalytics: { type: 'boolean' }
      }
    },
    createdAt: {
      type: 'string',
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    },
    updatedAt: {
      type: 'string',
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    }
  },
  allowAdditionalProperties: false
};

// Schema registry for easy access
export const SCHEMAS = {
  Plant: PlantSchema,
  CalendarEvent: CalendarEventSchema,
  CommunityPost: CommunityPostSchema,
  Settings: SettingsSchema
};

// Schema migration definitions
export const MIGRATIONS = {
  '0.1.0': {
    '1.0.0': {
      description: 'Initial migration to structured schemas',
      migrate: (data, entityType) => {
        const now = new Date().toISOString();
        
        // Add required fields for all entities
        const migrated = {
          ...data,
          createdAt: data.createdAt || now,
          updatedAt: now
        };
        
        // Entity-specific migrations
        if (entityType === 'Plant') {
          migrated.id = migrated.id || `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          migrated.status = migrated.status || 'חדש';
        } else if (entityType === 'CalendarEvent') {
          migrated.id = migrated.id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          migrated.completed = migrated.completed || false;
        } else if (entityType === 'CommunityPost') {
          migrated.id = migrated.id || `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          migrated.likes = migrated.likes || 0;
          migrated.comments = migrated.comments || [];
        } else if (entityType === 'Settings') {
          migrated.id = 'settings_user';
          migrated.theme = migrated.theme || 'light';
          migrated.notifications = migrated.notifications || {
            watering: true,
            fertilizing: true,
            pruning: true,
            daily: false
          };
          migrated.privacy = migrated.privacy || {
            shareData: false,
            showInCommunity: true,
            allowAnalytics: true
          };
        }
        
        return migrated;
      }
    }
  }
};

// Helper function to generate unique IDs
export const generateId = (prefix) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random}`;
};

// Helper function to get current timestamp
export const getCurrentTimestamp = () => new Date().toISOString();

// Validate entity against its schema
export const validateEntity = (entity, entityType) => {
  const schema = SCHEMAS[entityType];
  if (!schema) {
    throw new Error(`Unknown entity type: ${entityType}`);
  }
  
  return validateSchema(entity, schema);
};

// Create a new entity with default values
export const createEntity = (entityType, data = {}) => {
  const now = getCurrentTimestamp();
  const baseEntity = {
    createdAt: now,
    updatedAt: now
  };
  
  let entity;
  switch (entityType) {
    case 'Plant':
      entity = {
        ...baseEntity,
        id: generateId('plant'),
        name: '',
        status: 'חדש',
        image: '🌱',
        ...data
      };
      break;
    case 'CalendarEvent':
      entity = {
        ...baseEntity,
        id: generateId('event'),
        date: new Date().toISOString().slice(0, 10),
        action: 'השקיה',
        icon: '💧',
        completed: false,
        ...data
      };
      break;
    case 'CommunityPost':
      entity = {
        ...baseEntity,
        id: generateId('post'),
        user: 'אתה',
        text: '',
        image: '',
        likes: 0,
        comments: [],
        ...data
      };
      break;
    case 'Settings':
      entity = {
        ...baseEntity,
        id: 'settings_user',
        name: 'משתמש',
        notif: 'הכל',
        lang: 'עברית',
        units: 'מטרי (מ"ל, ס"מ)',
        theme: 'light',
        notifications: {
          watering: true,
          fertilizing: true,
          pruning: true,
          daily: false
        },
        privacy: {
          shareData: false,
          showInCommunity: true,
          allowAnalytics: true
        },
        ...data
      };
      break;
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
  
  // Validate the created entity
  const errors = validateEntity(entity, entityType);
  if (errors) {
    throw new Error(`Entity validation failed: ${JSON.stringify(errors)}`);
  }
  
  return entity;
};

// Update entity with validation
export const updateEntity = (entity, updates, entityType) => {
  const updatedEntity = {
    ...entity,
    ...updates,
    updatedAt: getCurrentTimestamp()
  };
  
  // Validate the updated entity
  const errors = validateEntity(updatedEntity, entityType);
  if (errors) {
    throw new Error(`Entity validation failed: ${JSON.stringify(errors)}`);
  }
  
  return updatedEntity;
};