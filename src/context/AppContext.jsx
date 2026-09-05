// =============================================================================
// src/context/AppContext.jsx — Global State Engine
// Bridges frontend UI state with backend APIs, language, SMS, SSE
// =============================================================================

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api';

const AppContext = createContext(null);

// Restore session from localStorage (survives page refresh)
function restoreSession() {
  try {
    const stored = localStorage.getItem('doca_session');
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

export function AppProvider({ children }) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(restoreSession);
  // currentUser shape: { username, role, displayName, avatar, token }

  const login = useCallback(async (username, password) => {
    const res = await api.login(username, password); // throws on 401
    const session = { ...res.user, token: res.token };
    setCurrentUser(session);
    localStorage.setItem('doca_session', JSON.stringify(session));
    return session;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('doca_session');
    setPage('landing');
  }, []);

  // ── Language ──────────────────────────────────────────────────────────────
  const LANG_ORDER  = ['en', 'hi', 'mr', 'te'];
  const LANG_LABELS = { en: 'English', hi: 'हिन्दी', mr: 'मराठी', te: 'తెలుగు' };
  const LANG_FONTS  = {
    en: "'Outfit', system-ui, sans-serif",
    hi: "'Noto Sans Devanagari', 'Outfit', system-ui, sans-serif",
    mr: "'Noto Sans Devanagari', 'Outfit', system-ui, sans-serif",
    te: "'Noto Sans Telugu', 'Outfit', system-ui, sans-serif",
  };

  const [language, setLanguage] = useState('en');

  // Switch to next language in cycle
  const cycleLanguage = useCallback(() => {
    setLanguage(prev => {
      const idx = LANG_ORDER.indexOf(prev);
      return LANG_ORDER[(idx + 1) % LANG_ORDER.length];
    });
  }, []);

  // Legacy toggleLanguage kept for backward compat (en ↔ hi)
  const toggleLanguage = cycleLanguage;

  // t() — backwards-compatible translation helper:
  //   t('English text', 'हिंदी पाठ')          — old 2-arg form (mr/te fall back to hi)
  //   t({ en:'...', hi:'...', mr:'...', te:'...' }) — new object form (full 4-lang)
  const t = useCallback((enOrObj, hi, mr, te) => {
    if (typeof enOrObj === 'object' && enOrObj !== null) {
      return enOrObj[language] || enOrObj.en || '';
    }
    const map = {
      en: enOrObj,
      hi: hi  !== undefined ? hi  : enOrObj,
      mr: mr  !== undefined ? mr  : (hi !== undefined ? hi : enOrObj),
      te: te  !== undefined ? te  : (hi !== undefined ? hi : enOrObj),
    };
    return map[language] ?? enOrObj;
  }, [language]);

  // Apply font dynamically when language changes
  useEffect(() => {
    document.body.style.fontFamily = LANG_FONTS[language];
  }, [language]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const [page, setPage] = useState('landing'); // 'landing' | 'farmer' | 'admin'

  // ── Slots / Queue data ────────────────────────────────────────────────────
  const [slots, setSlots] = useState([]);
  const [servingToken, setServingToken] = useState(1);
  const [stats, setStats]   = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchSlots = useCallback(async () => {
    try {
      setLoadingSlots(true);
      const [slotsRes, tokenRes, statsRes] = await Promise.all([
        api.getSlots(),
        api.getServingToken(),
        api.getStats(),
      ]);
      setSlots(slotsRes.data || []);
      setServingToken(tokenRes.serving_token || 1);
      setStats(statsRes.data || null);
    } catch (e) {
      console.error('fetchSlots:', e);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // ── SMS Notification Queue ────────────────────────────────────────────────
  const [smsQueue, setSmsQueue] = useState([]);

  const pushSms = useCallback((smsEntry) => {
    const id = smsEntry.id || Date.now();
    setSmsQueue(prev => [{ ...smsEntry, id }, ...prev].slice(0, 6));
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setSmsQueue(prev => prev.filter(s => s.id !== id));
    }, 6000);
  }, []);

  const dismissSms = useCallback((id) => {
    setSmsQueue(prev => prev.filter(s => s.id !== id));
  }, []);

  // ── SSE Connection ─────────────────────────────────────────────────────────
  const sseRef = useRef(null);

  const connectSse = useCallback(() => {
    if (sseRef.current) sseRef.current.close();

    const es = new EventSource('/api/events');
    sseRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.type === 'sms') {
          pushSms(event.data);
        }
        if (['slot_added', 'queue_updated', 'payment_updated'].includes(event.type)) {
          fetchSlots();
        }
      } catch (_) {}
    };

    es.onerror = () => {
      // Reconnect after 5 seconds on error
      setTimeout(connectSse, 5000);
    };
  }, [fetchSlots, pushSms]);

  // ── IVR Simulator visibility ───────────────────────────────────────────────
  const [showIvr, setShowIvr] = useState(false);

  // ── Chatbot visibility ─────────────────────────────────────────────────────
  const [showChatbot, setShowChatbot] = useState(false);

  // ── Slot Booking Form visibility ──────────────────────────────────────────
  const [showSlotForm, setShowSlotForm] = useState(false);

  // ── My Token (farmer's own booking) ──────────────────────────────────────
  const [myToken, setMyToken] = useState(null);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchSlots();
    connectSse();

    // Poll every 30 seconds as backup
    const poll = setInterval(fetchSlots, 30000);

    return () => {
      clearInterval(poll);
      if (sseRef.current) sseRef.current.close();
    };
  }, [fetchSlots, connectSse]);

  // ── Context Value ─────────────────────────────────────────────────────────
  const value = {
    // Auth
    currentUser, login, logout,

    // Language
    language, setLanguage, toggleLanguage, cycleLanguage, t, LANG_LABELS,


    // Navigation
    page, setPage,

    // Data
    slots, setSlots, servingToken, setServingToken, stats, loadingSlots, fetchSlots,

    // SMS
    smsQueue, pushSms, dismissSms,

    // UI visibility flags
    showIvr, setShowIvr,
    showChatbot, setShowChatbot,
    showSlotForm, setShowSlotForm,

    // Farmer's own token
    myToken, setMyToken,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
