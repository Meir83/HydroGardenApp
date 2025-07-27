import React, { useState, useEffect, memo, useCallback } from 'react';

const STORAGE_KEY = 'settings';

const defaultSettings = {
  name: 'משתמש',
  notif: 'הכל',
  lang: 'עברית',
  units: 'מטרי (מ"ל, ס"מ)',
};

const Settings = memo(() => {
  const [settings, setSettings] = useState(defaultSettings);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleSave = useCallback(() => {
    setMsg('ההגדרות נשמרו בהצלחה!');
    setTimeout(() => setMsg(''), 2000);
  }, []);

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Arial', maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>הגדרות</h2>
      <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <label>שם משתמש:</label>
          <input type="text" value={settings.name} onChange={e => setSettings(s => ({ ...s, name: e.target.value }))} style={{ marginRight: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>התראות:</label>
          <select value={settings.notif} onChange={e => setSettings(s => ({ ...s, notif: e.target.value }))} style={{ marginRight: 8, padding: 6, borderRadius: 4 }}>
            <option>הכל</option>
            <option>רק השקיה</option>
            <option>ללא התראות</option>
          </select>
        </div>
        <div>
          <label>שפה:</label>
          <select value={settings.lang} onChange={e => setSettings(s => ({ ...s, lang: e.target.value }))} style={{ marginRight: 8, padding: 6, borderRadius: 4 }}>
            <option>עברית</option>
            <option>English</option>
          </select>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>יחידות מידה:</label>
          <select value={settings.units} onChange={e => setSettings(s => ({ ...s, units: e.target.value }))} style={{ marginRight: 8, padding: 6, borderRadius: 4 }}>
            <option>מטרי (מ"ל, ס"מ)</option>
            <option>אמריקאי (Oz, Inch)</option>
          </select>
        </div>
      </div>
      <button onClick={handleSave} style={{ padding: 10, borderRadius: 6, border: 'none', background: '#4caf50', color: '#fff', fontWeight: 'bold' }}>
        שמור שינויים
      </button>
      {msg && <div style={{ color: 'green', marginTop: 10 }}>{msg}</div>}
    </div>
  );
});

export default Settings; 