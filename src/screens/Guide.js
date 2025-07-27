import React, { useState, memo, useCallback, useMemo } from 'react';

const tips = [
  'השתמש במים מסוננים להידרופוניקה',
  'בדוק pH אחת לשבוע',
  'העדף צמחים עמידים לחום בקיץ הישראלי',
];

const faqs = [
  { q: 'איזה צמחים מתאימים לקיץ?', a: 'עגבנייה, בזיליקום, חסה, נענע.' },
  { q: 'כל כמה זמן צריך להחליף מים?', a: 'פעם בשבועיים-שלושה.' },
];

// פונקציה מדמה חיפוש אינטרנטי (להחליף ב-API אמיתי בהמשך)
async function searchWeb(query) {
  // כאן תוכל להחליף ל-fetch ל-API אמיתי
  return [
    {
      title: 'איך בודקים pH במערכת הידרופונית?',
      snippet: 'בדיקת pH מתבצעת באמצעות ערכת בדיקה פשוטה. יש להכניס דגימה מהמים ולקרוא את התוצאה.',
      link: 'https://www.example.com/ph-hydroponics',
    },
    {
      title: 'צמחים עמידים לחום בישראל',
      snippet: 'עגבנייה, בזיליקום, חסה ונענע הם צמחים עמידים במיוחד לחום הישראלי.',
      link: 'https://www.example.com/israel-heat-plants',
    },
  ];
}

const Guide = memo(() => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    const res = await searchWeb(query);
    setResults(res);
    setLoading(false);
  }, [query]);

  // Memoize tips rendering
  const tipsToRender = useMemo(() => {
    return tips.map((tip, idx) => <li key={idx}>{tip}</li>);
  }, []);

  // Memoize FAQs rendering
  const faqsToRender = useMemo(() => {
    return faqs.map((faq, idx) => (
      <div key={idx} style={{ marginBottom: 10 }}>
        <div style={{ color: '#0288d1' }}>{faq.q}</div>
        <div>{faq.a}</div>
      </div>
    ));
  }, []);

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Arial', maxWidth: 500, margin: 'auto', padding: 20 }}>
      <h2>מדריך למתחילים</h2>
      <div style={{ marginBottom: 16, background: '#e3f2fd', borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="חפש שאלה או נושא..."
            style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #bbb' }}
          />
          <button onClick={handleSearch} style={{ padding: 8, borderRadius: 6, border: 'none', background: '#1976d2', color: '#fff', fontWeight: 'bold' }}>
            חפש
          </button>
        </div>
        {loading && <div style={{ marginTop: 8 }}>מחפש...</div>}
        {results.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <b>תוצאות חיפוש:</b>
            <ul>
              {results.map((r, idx) => (
                <li key={idx} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 'bold' }}>{r.title}</div>
                  <div>{r.snippet}</div>
                  <a href={r.link} target="_blank" rel="noopener noreferrer">לקריאה נוספת</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div style={{ background: '#fffde7', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>טיפים:</div>
        <ul>
          {tipsToRender}
        </ul>
      </div>
      <div style={{ background: '#e1f5fe', borderRadius: 8, padding: 16 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>שאלות נפוצות:</div>
        {faqsToRender}
      </div>
    </div>
  );
});

export default Guide; 