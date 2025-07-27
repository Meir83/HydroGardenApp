import { gapi } from 'gapi-script';

// Use environment variables for security
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
];
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

// Validate environment variables
function validateConfig() {
  if (!CLIENT_ID || !API_KEY) {
    throw new Error('Google API configuration missing. Please check your environment variables.');
  }
  if (CLIENT_ID === 'YOUR_CLIENT_ID.apps.googleusercontent.com' || API_KEY === 'YOUR_API_KEY_HERE') {
    throw new Error('Please replace placeholder values with actual Google API credentials.');
  }
}

export function initGoogleApi() {
  return new Promise((resolve, reject) => {
    try {
      validateConfig();
      
      gapi.load('client:auth2', () => {
        gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        }).then(() => resolve())
          .catch(error => reject(new Error(`Failed to initialize Google API: ${error.message}`)));
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function signInGoogle() {
  return gapi.auth2.getAuthInstance().signIn();
}

export function signOutGoogle() {
  return gapi.auth2.getAuthInstance().signOut();
}

export function isSignedIn() {
  return gapi.auth2.getAuthInstance().isSignedIn.get();
}

export async function addEventToGoogleCalendar(event) {
  // Input validation
  if (!event || typeof event !== 'object') {
    throw new Error('Invalid event object provided');
  }
  
  if (!event.action || typeof event.action !== 'string' || event.action.trim().length === 0) {
    throw new Error('Event action is required and must be a non-empty string');
  }
  
  if (!event.date || !isValidDate(event.date)) {
    throw new Error('Valid event date is required (YYYY-MM-DD format)');
  }
  
  // Check if user is signed in
  if (!isSignedIn()) {
    throw new Error('User must be signed in to add calendar events');
  }
  
  try {
    const eventObj = {
      summary: sanitizeString(event.action),
      start: { date: event.date },
      end: { date: event.date },
      description: `HydroGarden event: ${sanitizeString(event.action)}`,
    };
    
    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: eventObj,
    });
    
    return response;
  } catch (error) {
    throw new Error(`Failed to add event to Google Calendar: ${error.message}`);
  }
}

// Helper function to validate date format
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Helper function to sanitize string inputs
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, ''); // Basic XSS prevention
} 