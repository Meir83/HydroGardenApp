# HydroGarden APP

אפליקציה חכמה לניהול גידול הידרופוני ביתי, מותאמת לאקלים הישראלי.

## פיצ'רים עיקריים
- לוח זמנים חכם (השקיה, גיזום, דישון)
- מעקב צמיחה גרפי
- מדריך למתחילים
- קהילה ושיתוף
- ניהול מלאי וציוד

## טכנולוגיות
- React Native (מובייל)
- React Native Web (ווב)
- Node.js (שרת עתידי)

## מבנה תיקיות מוצע לפרונטאנד

```
HydroGarden APP/
│
├── src/
│   ├── components/      # קומפוננטות UI חוזרות
│   ├── screens/         # מסכים ראשיים (Dashboard, Plants, Calendar...)
│   ├── navigation/      # ניווט בין מסכים
│   ├── assets/          # תמונות, אייקונים, סטיילים
│   ├── hooks/           # React hooks מותאמים
│   ├── utils/           # פונקציות עזר
│   ├── services/        # תקשורת עם שרת/אחסון
│   └── App.js           # קובץ ראשי
│
├── package.json
├── README.md
└── ...
```

---

## הגדרת הסביבה

### 1. משתני סביבה (Environment Variables)

צור קובץ `.env` בשורש הפרויקט והעתק את התוכן מ `.env.example`:

```bash
cp .env.example .env
```

ערוך את הקובץ `.env` והחלף את הערכים הבאים:

- `REACT_APP_GOOGLE_CLIENT_ID`: ה-Client ID שלך מ-Google Cloud Console
- `REACT_APP_GOOGLE_API_KEY`: ה-API Key שלך מ-Google Cloud Console  
- `REACT_APP_SYNC_API_URL`: כתובת השרת שלך (אם קיים)

### 2. אבטחה

⚠️ **חשוב**: אל תשתף את קובץ ה `.env` או תעלה אותו ל-Git!

- הקובץ `.env` מוגן ב `.gitignore`
- השתמש תמיד במשתני סביבה עבור מפתחות API
- בדוק שכל הקלטים עוברים validation
- משתמש רק בקומפוננטות form מאובטחות (לא `prompt()`)

### 3. הרצה

```bash
npm install
npm start
```

## שינויים אחרונים - אבטחה וקוד איכותי

### שיפורי אבטחה שבוצעו:
- הסרת מפתחות API קשיחים מהקוד
- הוספת validation לכל הקלטי המשתמש
- החלפת `prompt()` בקומפוננטות form מאובטחות
- הוספת Error Boundaries לטיפול בשגיאות
- הגנה מפני XSS ו-injection attacks

### קומפוננטות חדשות:
- `Modal` - חלון מודלי כללי
- `InputForm` - טופס קלט מאובטח
- `ErrorBoundary` - טיפול בשגיאות
- `validation.js` - פונקציות validation

השלב הבא: בניית מסך בית בסיסי עם דמה-דאטה מאובטחת. 