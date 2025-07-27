import React, { memo } from 'react';

const App = memo(() => {
  return (
    <div style={{ direction: 'rtl', fontFamily: 'Arial', maxWidth: 600, margin: 'auto', padding: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ color: '#2e7d32', fontSize: 36, margin: 0 }}>🌱 HydroGarden</h1>
        <p style={{ color: '#666', fontSize: 18, margin: '8px 0 0 0' }}>מערכת ניהול גינה הידרופונית חכמה</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>הצמחים שלי</h3>
          <p style={{ margin: 0, color: '#666' }}>עקוב אחר הצמחים שלך ומצבם</p>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>לוח זמנים</h3>
          <p style={{ margin: 0, color: '#666' }}>תזכורות לטיפול ותחזוקה</p>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📖</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#f57c00' }}>מדריך</h3>
          <p style={{ margin: 0, color: '#666' }}>טיפים ועצות למתחילים</p>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#7b1fa2' }}>קהילה</h3>
          <p style={{ margin: 0, color: '#666' }}>שתף ולמד מגננים אחרים</p>
        </div>
      </div>
      
      <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>סטטוס מערכת</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, color: '#4caf50' }}>💧</div>
            <div style={{ fontSize: 14, color: '#666' }}>רמת מים</div>
            <div style={{ fontWeight: 'bold', color: '#4caf50' }}>טובה</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, color: '#2196f3' }}>⚗️</div>
            <div style={{ fontSize: 14, color: '#666' }}>pH</div>
            <div style={{ fontWeight: 'bold', color: '#2196f3' }}>6.5</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, color: '#ff9800' }}>🌡️</div>
            <div style={{ fontSize: 14, color: '#666' }}>טמפרטורה</div>
            <div style={{ fontWeight: 'bold', color: '#ff9800' }}>24°C</div>
          </div>
        </div>
      </div>
      
      <div style={{ background: '#e8f5e8', borderRadius: 8, padding: 16, border: '1px solid #c8e6c9' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>טיפ היום</h4>
        <p style={{ margin: 0, color: '#333' }}>
          בדוק את רמת ה-pH של המים אחת לשבוע כדי לוודא שהצמחים מקבלים את הרכיבים הנדרשים בצורה אופטימלית.
        </p>
      </div>
    </div>
  );
});

export default App; 