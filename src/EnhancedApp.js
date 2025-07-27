import React, { useState, useEffect } from 'react';
import { theme } from './styles/theme';
import { cardLayouts, typography, spacing } from './styles/responsive';
import AnimatedCard from './components/AnimatedCard';
import LoadingSpinner from './components/LoadingSpinner';
import Tooltip from './components/Tooltip';
import { ToastContainer, ToastManager } from './components/Toast';
import { useAriaLive } from './hooks/useKeyboardNavigation';

const EnhancedApp = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [systemData, setSystemData] = useState({
    waterLevel: 'טובה',
    ph: '6.5',
    temperature: '24°C'
  });
  const { announce } = useAriaLive();

  useEffect(() => {
    // Simulate loading system data
    const timer = setTimeout(() => {
      setIsLoading(false);
      announce('המערכת נטענה בהצלחה', 'polite');
    }, 1500);

    return () => clearTimeout(timer);
  }, [announce]);

  const navigationCards = [
    {
      id: 'plants',
      title: 'הצמחים שלי',
      description: 'עקוב אחר הצמחים שלך ומצבם',
      icon: '🌿',
      color: theme.colors.success,
      href: '/plants'
    },
    {
      id: 'calendar',
      title: 'לוח זמנים',
      description: 'תזכורות לטיפול ותחזוקה',
      icon: '📅',
      color: theme.colors.info,
      href: '/calendar'
    },
    {
      id: 'guide',
      title: 'מדריך',
      description: 'טיפים ועצות למתחילים',
      icon: '📖',
      color: theme.colors.warning,
      href: '/guide'
    },
    {
      id: 'community',
      title: 'קהילה',
      description: 'שתף ולמד מגננים אחרים',
      icon: '👥',
      color: theme.colors.secondary,
      href: '/community'
    }
  ];

  const handleCardClick = (card) => {
    ToastManager.info(`מעבר ל${card.title}`);
    // In a real app, this would use router navigation
    console.log('Navigate to:', card.href);
  };

  const refreshSystemData = () => {
    setIsLoading(true);
    ToastManager.info('מרענן נתוני מערכת...');
    
    setTimeout(() => {
      // Simulate data refresh
      setSystemData(prev => ({
        ...prev,
        temperature: `${Math.round(20 + Math.random() * 10)}°C`
      }));
      setIsLoading(false);
      ToastManager.success('נתוני המערכת עודכנו בהצלחה');
    }, 2000);
  };

  if (isLoading) {
    return (
      <div style={{
        ...spacing.container,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        direction: 'rtl',
        backgroundColor: theme.colors.background.default
      }}>
        <LoadingSpinner 
          size="large" 
          label="טוען את המערכת..." 
        />
      </div>
    );
  }

  return (
    <div style={{ 
      direction: 'rtl', 
      fontFamily: theme.typography.fontFamily, 
      maxWidth: 1000, 
      margin: 'auto', 
      padding: spacing.container.padding,
      minHeight: '100vh',
      backgroundColor: theme.colors.background.default
    }}>
      <header style={{ 
        textAlign: 'center', 
        marginBottom: theme.spacing.xl,
        paddingTop: theme.spacing.lg
      }}>
        <AnimatedCard 
          animationType="fadeIn" 
          hover={false}
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary.light}20 0%, ${theme.colors.success.light}20 100%)`,
            border: `1px solid ${theme.colors.primary.light}30`,
            textAlign: 'center'
          }}
        >
          <h1 style={{ 
            ...typography.heading1,
            color: theme.colors.primary.main, 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.sm
          }}>
            <span role="img" aria-label="צמח">🌱</span> 
            HydroGarden
          </h1>
          <p style={{ 
            ...typography.body,
            color: theme.colors.text.secondary, 
            margin: `${theme.spacing.sm}px 0 0 0` 
          }}>
            מערכת ניהול גינה הידרופונית חכמה
          </p>
        </AnimatedCard>
      </header>

      <section 
        style={{ 
          ...cardLayouts.grid, 
          marginBottom: theme.spacing.xl 
        }}
        aria-label="תפריט ניווט ראשי"
      >
        {navigationCards.map((card, index) => (
          <AnimatedCard
            key={card.id}
            animationType="slideUp"
            delay={index * 100}
            onClick={() => handleCardClick(card)}
            style={{
              background: `linear-gradient(135deg, ${card.color.background} 0%, ${card.color.light}40 100%)`,
              border: `1px solid ${card.color.border || card.color.light}`,
              textAlign: 'center',
              cursor: 'pointer'
            }}
            role="button"
            tabIndex={0}
            aria-label={`עבור ל${card.title}: ${card.description}`}
          >
            <div 
              style={{ 
                fontSize: 48, 
                marginBottom: theme.spacing.sm,
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))'
              }}
              role="img"
              aria-hidden="true"
            >
              {card.icon}
            </div>
            <h3 style={{ 
              ...typography.heading3,
              margin: `0 0 ${theme.spacing.xs}px 0`, 
              color: card.color.main || card.color.dark
            }}>
              {card.title}
            </h3>
            <p style={{ 
              ...typography.body,
              margin: 0, 
              color: theme.colors.text.secondary
            }}>
              {card.description}
            </p>
          </AnimatedCard>
        ))}
      </section>

      <section aria-label="סטטוס מערכת" style={{ marginBottom: theme.spacing.lg }}>
        <AnimatedCard 
          animationType="slideUp" 
          delay={400}
          hover={false}
          style={{
            background: theme.colors.background.paper,
            border: `1px solid ${theme.colors.grey[200]}`
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.md
          }}>
            <h3 style={{ 
              ...typography.heading3,
              margin: 0, 
              color: theme.colors.text.primary,
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm
            }}>
              <span role="img" aria-label="מערכת">⚙️</span>
              סטטוס מערכת
            </h3>
            
            <Tooltip content="רענן נתוני מערכת">
              <button
                onClick={refreshSystemData}
                style={{
                  background: 'none',
                  border: `1px solid ${theme.colors.primary.main}`,
                  borderRadius: theme.borderRadius.md,
                  color: theme.colors.primary.main,
                  cursor: 'pointer',
                  padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
                  fontSize: theme.typography.fontSizes.sm,
                  transition: `all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.colors.primary.main;
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = theme.colors.primary.main;
                }}
                aria-label="רענן נתוני מערכת"
              >
                🔄 רענן
              </button>
            </Tooltip>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: theme.spacing.md 
          }}>
            <Tooltip content="רמת המים במאגר הראשי - מצב תקין">
              <div style={{ textAlign: 'center', padding: theme.spacing.sm }}>
                <div style={{ 
                  fontSize: 32, 
                  color: theme.colors.success.main,
                  marginBottom: theme.spacing.xs
                }} aria-hidden="true">💧</div>
                <div style={{ 
                  fontSize: theme.typography.fontSizes.sm, 
                  color: theme.colors.text.secondary
                }}>רמת מים</div>
                <div style={{ 
                  fontWeight: theme.typography.fontWeights.bold, 
                  color: theme.colors.success.main,
                  fontSize: theme.typography.fontSizes.md
                }} aria-label={`רמת מים: ${systemData.waterLevel}`}>
                  {systemData.waterLevel}
                </div>
              </div>
            </Tooltip>
            
            <Tooltip content="רמת החומציות של המים - מצב אידיאלי לצמיחה">
              <div style={{ textAlign: 'center', padding: theme.spacing.sm }}>
                <div style={{ 
                  fontSize: 32, 
                  color: theme.colors.info.main,
                  marginBottom: theme.spacing.xs
                }} aria-hidden="true">⚗️</div>
                <div style={{ 
                  fontSize: theme.typography.fontSizes.sm, 
                  color: theme.colors.text.secondary
                }}>pH</div>
                <div style={{ 
                  fontWeight: theme.typography.fontWeights.bold, 
                  color: theme.colors.info.main,
                  fontSize: theme.typography.fontSizes.md
                }} aria-label={`רמת pH: ${systemData.ph}`}>
                  {systemData.ph}
                </div>
              </div>
            </Tooltip>
            
            <Tooltip content="טמפרטורת המים והסביבה - מצב אופטימלי">
              <div style={{ textAlign: 'center', padding: theme.spacing.sm }}>
                <div style={{ 
                  fontSize: 32, 
                  color: theme.colors.warning.main,
                  marginBottom: theme.spacing.xs
                }} aria-hidden="true">🌡️</div>
                <div style={{ 
                  fontSize: theme.typography.fontSizes.sm, 
                  color: theme.colors.text.secondary
                }}>טמפרטורה</div>
                <div style={{ 
                  fontWeight: theme.typography.fontWeights.bold, 
                  color: theme.colors.warning.main,
                  fontSize: theme.typography.fontSizes.md
                }} aria-label={`טמפרטורה: ${systemData.temperature}`}>
                  {systemData.temperature}
                </div>
              </div>
            </Tooltip>
          </div>
        </AnimatedCard>
      </section>

      <section aria-label="טיפ היום">
        <AnimatedCard 
          animationType="scale" 
          delay={600}
          hover={false}
          style={{
            background: theme.colors.success.background,
            border: `1px solid ${theme.colors.success.border}`
          }}
        >
          <h4 style={{ 
            ...typography.heading3,
            margin: `0 0 ${theme.spacing.sm}px 0`, 
            color: theme.colors.success.main,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            fontSize: theme.typography.fontSizes.md
          }}>
            <span role="img" aria-label="טיפ">💡</span>
            טיפ היום
          </h4>
          <p style={{ 
            ...typography.body,
            margin: 0, 
            color: theme.colors.text.primary,
            lineHeight: theme.typography.lineHeights.relaxed
          }}>
            בדוק את רמת ה-pH של המים אחת לשבוע כדי לוודא שהצמחים מקבלים את הרכיבים הנדרשים בצורה אופטימלית.
            {' '}
            <Tooltip content="לחץ כדי לראות עוד טיפים">
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.primary.main,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: 'inherit',
                  fontFamily: 'inherit'
                }}
                onClick={() => ToastManager.info('בקרוב - עוד טיפים שימושיים!')}
              >
                עוד טיפים
              </button>
            </Tooltip>
          </p>
        </AnimatedCard>
      </section>
      
      <ToastContainer />
    </div>
  );
};

export default EnhancedApp;