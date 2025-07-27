import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import InputForm from '../components/InputForm';
import ErrorBoundary from '../components/ErrorBoundary';
import { validateEventAction, validateLocalStorageData } from '../utils/validation';

const initialEvents = [
  { date: '2024-06-01', action: 'השקיה', icon: '💧' },
  { date: '2024-06-02', action: 'גיזום', icon: '✂️' },
  { date: '2024-06-03', action: 'דישון', icon: '🌱' },
  { date: '2024-06-04', action: 'השקיה', icon: '💧' },
];

const icons = {
  'השקיה': '💧',
  'גיזום': '✂️',
  'דישון': '🌱',
};

const STORAGE_KEY = 'events';
const ARCHIVE_KEY = 'eventsArchive';

const Calendar = memo(() => {
  const [events, setEvents] = useState([]);
  const [archive, setArchive] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [showArchive, setShowArchive] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const validatedEvents = validateLocalStorageData(saved, 'events');
        setEvents(validatedEvents.length > 0 ? validatedEvents : initialEvents);
      } else {
        setEvents(initialEvents);
      }
      
      const savedArchive = localStorage.getItem(ARCHIVE_KEY);
      if (savedArchive) {
        const validatedArchive = validateLocalStorageData(savedArchive, 'events');
        setArchive(validatedArchive);
      }
    } catch (error) {
      console.error('Error loading calendar data:', error.message);
      setEvents(initialEvents);
      setArchive([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
  }, [archive]);

  const handleAddEvent = useCallback(() => {
    if (!selectedDate) {
      alert('יש לבחור תאריך לפני הוספת אירוע');
      return;
    }
    setShowAddForm(true);
  }, [selectedDate]);

  const handleSubmitEvent = useCallback((action) => {
    try {
      if (!selectedDate) {
        throw new Error('יש לבחור תאריך');
      }

      const dateStr = selectedDate.toISOString().slice(0, 10);
      const newEvent = { 
        date: dateStr, 
        action, 
        icon: icons[action] || '🗓️',
        id: Date.now().toString() // Add unique ID
      };
      
      setEvents(prevEvents => [...prevEvents, newEvent]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding event:', error.message);
      alert('שגיאה בהוספת האירוע: ' + error.message);
    }
  }, [selectedDate]);

  const handleDeleteEvent = useCallback(idx => {
    const toArchive = events[idx];
    setArchive(prevArchive => [toArchive, ...prevArchive]);
    setEvents(prevEvents => prevEvents.filter((_, i) => i !== idx));
  }, [events]);

  const handleRestoreEvent = useCallback(idx => {
    const toRestore = archive[idx];
    setEvents(prevEvents => [...prevEvents, toRestore]);
    setArchive(prevArchive => prevArchive.filter((_, i) => i !== idx));
  }, [archive]);

  // Memoized filtered events for performance
  const filteredEvents = useMemo(() => {
    return filterDate
      ? events.filter(e => e.date === filterDate.toISOString().slice(0, 10))
      : events;
  }, [events, filterDate]);

  return (
    <ErrorBoundary>
      <div style={{ direction: 'rtl', fontFamily: 'Arial', maxWidth: 400, margin: 'auto', padding: 20 }}>
        <h2>לוח זמנים</h2>
      <div style={{ marginBottom: 12 }}>
        <label style={{ marginLeft: 8 }}>בחר תאריך להוספת אירוע:</label>
        <DatePicker
          selected={selectedDate}
          onChange={date => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="בחר תאריך"
          isClearable
          popperPlacement="bottom-end"
          style={{ width: 160, paddingRight: 24 }}
        />
        <button onClick={handleAddEvent} style={{ marginLeft: 8, padding: 8, borderRadius: 6, border: 'none', background: '#1976d2', color: '#fff', fontWeight: 'bold' }}>
          + הוסף אירוע
        </button>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ marginLeft: 8 }}>סנן לפי תאריך:</label>
        <DatePicker
          selected={filterDate}
          onChange={date => setFilterDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="הצג הכל"
          isClearable
          popperPlacement="bottom-end"
          style={{ width: 160, paddingRight: 24 }}
        />
      </div>
      <button onClick={() => setShowArchive(!showArchive)} style={{ marginBottom: 12, padding: 8, borderRadius: 6, border: 'none', background: showArchive ? '#ffd54f' : '#bdbdbd', color: '#333', fontWeight: 'bold' }}>
        {showArchive ? 'הסתר ארכיון' : 'הצג ארכיון'}
      </button>
      {!showArchive ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredEvents.map((event, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', background: '#e3f2fd', borderRadius: 8, padding: 12, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 28, marginLeft: 12 }}>{event.icon}</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{event.action}</div>
                  <div style={{ color: '#1976d2' }}>{event.date}</div>
                </div>
              </div>
              <button onClick={() => handleDeleteEvent(idx)} style={{ background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 'bold' }}>ארכיב</button>
            </div>
          ))}
          {filteredEvents.length === 0 && <div>אין אירועים להצגה</div>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h4>ארכיון אירועים</h4>
          {archive.map((event, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', background: '#f3e5f5', borderRadius: 8, padding: 12, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 28, marginLeft: 12 }}>{event.icon}</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{event.action}</div>
                  <div style={{ color: '#1976d2' }}>{event.date}</div>
                </div>
              </div>
              <button onClick={() => handleRestoreEvent(idx)} style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 'bold' }}>שחזר</button>
            </div>
          ))}
          {archive.length === 0 && <div>הארכיון ריק</div>}
        </div>
      )}
      
      <InputForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleSubmitEvent}
        title="הוסף אירוע חדש"
        placeholder="בחר סוג פעולה"
        options={[
          { value: 'השקיה', label: 'השקיה 💧' },
          { value: 'גיזום', label: 'גיזום ✂️' },
          { value: 'דישון', label: 'דישון 🌱' },
          { value: 'צמיחה', label: 'צמיחה 🌿' },
          { value: 'קטיף', label: 'קטיף 🍅' }
        ]}
        validation={validateEventAction}
        submitText="הוסף אירוע"
      />
      </div>
    </ErrorBoundary>
  );
});

export default Calendar; 