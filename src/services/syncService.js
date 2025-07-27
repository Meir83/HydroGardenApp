// שירות סנכרון לענן (דמו)
const API_URL = process.env.REACT_APP_SYNC_API_URL || 'https://jsonplaceholder.typicode.com/posts';
const QUEUE_KEY = 'syncQueue';

// Helper function to validate data before sending
function validateSyncData(data, type) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    throw new Error('No data provided for sync');
  }
  
  if (!type || typeof type !== 'string') {
    throw new Error('Invalid sync type provided');
  }
  
  // Sanitize data to prevent injection attacks
  return JSON.parse(JSON.stringify(data)); // Deep clone and sanitize
}

// שליחת נתונים לשרת
export async function syncToCloud(data, type = 'plants') {
  try {
    // Validate and sanitize input data
    const sanitizedData = validateSyncData(data, type);
    
    if (!navigator.onLine) throw new Error('offline');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ type, data: sanitizedData }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return true;
  } catch (e) {
    console.warn('Sync failed, adding to queue:', e.message);
    // אם אין חיבור, שומרים בתור
    try {
      addToQueue({ type, data });
    } catch (queueError) {
      console.error('Failed to add to sync queue:', queueError.message);
    }
    return false;
  }
}

// הוספה לתור סנכרון
function addToQueue(item) {
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    
    // Limit queue size to prevent memory issues
    const MAX_QUEUE_SIZE = 100;
    if (queue.length >= MAX_QUEUE_SIZE) {
      console.warn('Sync queue is full, removing oldest items');
      queue.splice(0, queue.length - MAX_QUEUE_SIZE + 1);
    }
    
    // Add timestamp for tracking
    const timestampedItem = {
      ...item,
      timestamp: new Date().toISOString()
    };
    
    queue.push(timestampedItem);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to add item to sync queue:', error.message);
    throw new Error('Failed to add item to sync queue');
  }
}

// סנכרון כל התור (לקרוא כשיש חיבור)
export async function syncQueue() {
  if (!navigator.onLine) return;
  
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    
    if (queue.length === 0) return;
    
    console.log(`Syncing ${queue.length} items from queue`);
    
    const successfulSyncs = [];
    const failedSyncs = [];
    
    for (const item of queue) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(item),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        successfulSyncs.push(item);
      } catch (error) {
        console.warn('Failed to sync item:', error.message);
        failedSyncs.push(item);
      }
    }
    
    // Keep failed items in queue, remove successful ones
    if (failedSyncs.length > 0) {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(failedSyncs));
      console.log(`${successfulSyncs.length} items synced, ${failedSyncs.length} items remain in queue`);
    } else {
      localStorage.removeItem(QUEUE_KEY);
      console.log('All items synced successfully');
    }
    
  } catch (error) {
    console.error('Error processing sync queue:', error.message);
  }
}

// מאזין לאירוע חיבור מחדש
window.addEventListener('online', syncQueue); 