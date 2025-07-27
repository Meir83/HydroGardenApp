/**
 * Utility functions for input validation and sanitization
 */

// Sanitize text input to prevent XSS attacks
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>"/]/g, '') // Remove potentially dangerous characters
    .slice(0, 1000); // Limit length to prevent abuse
}

// Validate and sanitize plant name
export function validatePlantName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Plant name is required and must be a string');
  }
  
  const sanitized = sanitizeText(name);
  
  if (sanitized.length === 0) {
    throw new Error('Plant name cannot be empty');
  }
  
  if (sanitized.length < 2) {
    throw new Error('Plant name must be at least 2 characters long');
  }
  
  if (sanitized.length > 50) {
    throw new Error('Plant name cannot exceed 50 characters');
  }
  
  // Check for valid characters (letters, numbers, spaces, Hebrew)
  const validPattern = /^[\u0590-\u05FFa-zA-Z0-9\s]+$/;
  if (!validPattern.test(sanitized)) {
    throw new Error('Plant name contains invalid characters');
  }
  
  return sanitized;
}

// Validate and sanitize post content
export function validatePostContent(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('Post content is required and must be a string');
  }
  
  const sanitized = sanitizeText(content);
  
  if (sanitized.length === 0) {
    throw new Error('Post content cannot be empty');
  }
  
  if (sanitized.length > 500) {
    throw new Error('Post content cannot exceed 500 characters');
  }
  
  return sanitized;
}

// Validate calendar event action
export function validateEventAction(action) {
  if (!action || typeof action !== 'string') {
    throw new Error('Event action is required and must be a string');
  }
  
  const sanitized = sanitizeText(action);
  
  if (sanitized.length === 0) {
    throw new Error('Event action cannot be empty');
  }
  
  // Predefined allowed actions for security
  const allowedActions = ['השקיה', 'גיזום', 'דישון', 'צמיחה', 'קטיף'];
  
  if (!allowedActions.includes(sanitized)) {
    throw new Error('Invalid event action. Please select from allowed actions.');
  }
  
  return sanitized;
}

// Validate date format (YYYY-MM-DD)
export function validateDate(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    throw new Error('Date is required and must be a string');
  }
  
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  // Check if date is not too far in the past or future
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  
  if (date < oneYearAgo || date > oneYearFromNow) {
    throw new Error('Date must be within one year from today');
  }
  
  return dateString;
}

// Validate localStorage data
export function validateLocalStorageData(data, type) {
  if (!data) return [];
  
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    
    if (!Array.isArray(parsed)) {
      console.warn(`Invalid ${type} data format, resetting to empty array`);
      return [];
    }
    
    // Validate each item based on type
    return parsed.filter(item => {
      try {
        switch (type) {
          case 'plants':
            return item.name && typeof item.name === 'string' && item.status;
          case 'events':
            return item.action && item.date && validateDate(item.date);
          case 'posts':
            return item.text && typeof item.text === 'string' && item.user;
          default:
            return true;
        }
      } catch {
        return false; // Remove invalid items
      }
    });
  } catch (error) {
    console.warn(`Failed to parse ${type} data:`, error.message);
    return [];
  }
}