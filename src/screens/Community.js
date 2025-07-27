import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import InputForm from '../components/InputForm';
import ErrorBoundary from '../components/ErrorBoundary';
import { validatePostContent, validateLocalStorageData } from '../utils/validation';

const initialPosts = [
  { user: 'דנה', text: 'העגבניות שלי גדלו פי 2 השבוע!', image: '🍅' },
  { user: 'יוסי', text: 'ממליץ לבדוק pH אחרי כל מילוי מים.', image: '' },
  { user: 'נועה', text: 'הבזיליקום שלי פורח!', image: '🌿' },
];

const STORAGE_KEY = 'posts';

const Community = memo(() => {
  const [posts, setPosts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const validatedPosts = validateLocalStorageData(saved, 'posts');
        setPosts(validatedPosts.length > 0 ? validatedPosts : initialPosts);
      } else {
        setPosts(initialPosts);
      }
    } catch (error) {
      console.error('Error loading posts data:', error.message);
      setPosts(initialPosts);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (error) {
      console.error('Error saving posts data:', error.message);
    }
  }, [posts]);

  const handleAddPost = useCallback(() => {
    setShowAddForm(true);
  }, []);

  const handleSubmitPost = useCallback((text) => {
    try {
      const newPost = { 
        user: 'אתה', 
        text, 
        image: '',
        id: Date.now().toString(), // Add unique ID
        timestamp: new Date().toISOString()
      };
      
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding post:', error.message);
      alert('שגיאה בהוספת הפוסט: ' + error.message);
    }
  }, []);

  // Memoize posts rendering for performance
  const postsToRender = useMemo(() => {
    return posts.map((post, idx) => (
      <div key={post.id || idx} style={{ background: '#f3e5f5', borderRadius: 8, padding: 12 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{post.user}</div>
        <div>{post.text}</div>
        {post.image && <div style={{ fontSize: 32, marginTop: 8 }}>{post.image}</div>}
      </div>
    ));
  }, [posts]);

  return (
    <ErrorBoundary>
      <div style={{ direction: 'rtl', fontFamily: 'Arial', maxWidth: 400, margin: 'auto', padding: 20 }}>
        <h2>קהילה</h2>
        <button onClick={handleAddPost} style={{ padding: 10, borderRadius: 6, border: 'none', background: '#1976d2', color: '#fff', fontWeight: 'bold', marginBottom: 16 }}>
          + שתף פוסט חדש
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {postsToRender}
        </div>
        
        <InputForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleSubmitPost}
          title="שתף פוסט חדש"
          placeholder="כתוב את הפוסט שלך..."
          validation={validatePostContent}
          submitText="שתף פוסט"
          type="textarea"
        />
      </div>
    </ErrorBoundary>
  );
});

export default Community; 