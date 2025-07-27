import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { syncToCloud, syncQueue } from '../services/syncService';
import InputForm from '../components/InputForm';
import ErrorBoundary from '../components/ErrorBoundary';
import { validatePlantName, validateLocalStorageData } from '../utils/validation';
import storageOptimizer from '../utils/storageOptimizer';
import performanceMonitor from '../utils/performanceMonitor';

const initialPlants = [
  { name: 'עגבנייה', status: 'בריא', image: '🍅' },
  { name: 'בזיליקום', status: 'דורש השקיה', image: '🌿' },
  { name: 'חסה', status: 'בריא', image: '🥬' },
];

const STORAGE_KEY = 'plants';

const Plants = memo(() => {
  const [plants, setPlants] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Performance monitoring
  const renderMeasure = useMemo(() => 
    performanceMonitor.startRenderMeasure('Plants'), 
  []);

  useEffect(() => {
    try {
      const saved = storageOptimizer.getItem(STORAGE_KEY);
      if (saved) {
        const validatedPlants = validateLocalStorageData(saved, 'plants');
        setPlants(validatedPlants.length > 0 ? validatedPlants : initialPlants);
      } else {
        setPlants(initialPlants);
      }
      // נסה לסנכרן תור בהעלאה
      syncQueue();
    } catch (error) {
      console.error('Error loading plants data:', error.message);
      performanceMonitor.recordError(error, 'Plants - loading data');
      setPlants(initialPlants);
    }
  }, []);

  useEffect(() => {
    if (plants.length === 0) return;
    try {
      // Use optimized storage with debouncing
      storageOptimizer.setItem(STORAGE_KEY, JSON.stringify(plants));
      syncToCloud(plants, 'plants');
    } catch (error) {
      console.error('Error saving plants data:', error.message);
      performanceMonitor.recordError(error, 'Plants - saving data');
    }
  }, [plants]);

  // Finish performance measurement
  useEffect(() => {
    if (renderMeasure?.finish) {
      const duration = renderMeasure.finish();
      performanceMonitor.recordMetric('Plants.renderTime', duration);
    }
  });

  const handleAddPlant = useCallback(() => {
    setShowAddForm(true);
  }, []);

  const handleSubmitPlant = useCallback((name) => {
    try {
      const newPlant = { 
        name, 
        status: 'חדש', 
        image: '🌱',
        id: Date.now().toString() // Add unique ID
      };
      
      setPlants(prevPlants => [...prevPlants, newPlant]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding plant:', error.message);
      alert('שגיאה בהוספת הצמח: ' + error.message);
    }
  }, []);

  // Memoize plant list rendering for performance
  const plantsToRender = useMemo(() => {
    return plants.map((plant, idx) => (
      <div key={plant.id || idx} style={{ display: 'flex', alignItems: 'center', background: '#f1f8e9', borderRadius: 8, padding: 12 }}>
        <span style={{ fontSize: 32, marginLeft: 12 }}>{plant.image}</span>
        <div>
          <div style={{ fontWeight: 'bold' }}>{plant.name}</div>
          <div style={{ color: plant.status === 'בריא' ? 'green' : plant.status === 'חדש' ? 'blue' : 'orange' }}>{plant.status}</div>
        </div>
      </div>
    ));
  }, [plants]);

  return (
    <ErrorBoundary>
      <div style={{ direction: 'rtl', fontFamily: 'Arial', maxWidth: 400, margin: 'auto', padding: 20 }}>
        <h2>הצמחים שלי</h2>
        <button onClick={handleAddPlant} style={{ padding: 10, borderRadius: 6, border: 'none', background: '#4caf50', color: '#fff', fontWeight: 'bold', marginBottom: 16 }}>
          + הוסף צמח חדש
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {plantsToRender}
        </div>
        
        <InputForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleSubmitPlant}
          title="הוסף צמח חדש"
          placeholder="הכנס שם הצמח"
          validation={validatePlantName}
          submitText="הוסף צמח"
        />
      </div>
    </ErrorBoundary>
  );
});

export default Plants; 