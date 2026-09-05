// =============================================================================
// src/components/Header.jsx
// Toll-Free Banner + Language Toggle + Global Voice Controller
// =============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mic, MicOff, Globe, Phone, Wheat,
  Shield, Home, LogOut
} from 'lucide-react';

export default function Header() {
  const {
    language, cycleLanguage, t, LANG_LABELS,
    page, setPage,
    setShowSlotForm, setShowChatbot, setShowIvr,
    currentUser, logout,
  } = useApp();

  const [listening, setListening] = useState(false);
  const [voiceResult, setVoiceResult] = useState('');
  const recognitionRef = useRef(null);

  // ── Voice Controller ────────────────────────────────────────────────────
  const processVoiceCommand = useCallback((transcript) => {
    const t = transcript.toLowerCase().trim();
    setVoiceResult(transcript);

    if (t.includes('book slot') || t.includes('स्लॉट बुक') || t.includes('slot book')) {
      setShowSlotForm(true);
      setPage('farmer');
    } else if (t.includes('check status') || t.includes('स्टेटस') || t.includes('status dekho')) {
      setPage('farmer');
      setTimeout(() => {
        document.getElementById('queue-tracker')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else if (t.includes('open chat') || t.includes('मदद') || t.includes('kisan mitra')) {
      setShowChatbot(true);
    } else if (t.includes('change language') || t.includes('भाषा') || t.includes('language')) {
      cycleLanguage();
    } else if (t.includes('admin') || t.includes('dashboard')) {
      setPage('admin');
    }

    setTimeout(() => setVoiceResult(''), 3000);
  }, [setShowSlotForm, setShowChatbot, cycleLanguage, setPage]);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Voice recognition not supported in this browser.');

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend   = () => setListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      processVoiceCommand(transcript);
    };
    recognition.onerror = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
  }, [language, processVoiceCommand]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 900 }}>
      {/* ── Toll-Free Banner ─────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a3a2a, #2d6a4f)',
        padding: '8px 0',
        borderBottom: '2px solid #f59e0b',
      }}>
        <div className="container flex items-center justify-between gap-4">
          <div className="flex items-center gap-3" style={{ color: '#fef9f0' }}>
            <div style={{
              background: 'rgba(245,158,11,0.2)',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              animation: 'pulse 2.5s infinite',
            }}>
              <Phone size={14} color="#f59e0b" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.04em' }}>
                TOLL-FREE
              </span>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.02em', color: '#fde68a' }}>
              1800-XXX-FARM
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
              {t('24/7 Farmer Helpline — Free from any phone', '24/7 किसान हेल्पलाइन — किसी भी फोन से नि:शुल्क')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              {t('Powered by DoCA, Govt of India', 'DoCA, भारत सरकार द्वारा संचालित')}
            </span>
            <div style={{
              background: '#f59e0b',
              color: '#1a2e1e',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.06em',
            }}>SIH 2026</div>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ───────────────────────────────────────────────────── */}
      <nav style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #d8f3dc',
        boxShadow: '0 2px 20px rgba(45,106,79,0.10)',
        padding: '0',
      }}>
        <div className="container flex items-center justify-between" style={{ height: '68px' }}>
          {/* Logo */}
          <div
            className="flex items-center gap-3"
            style={{ cursor: 'pointer' }}
            onClick={() => setPage('landing')}
          >
            <div style={{
              width: 44, height: 44,
              background: 'linear-gradient(135deg, #2d6a4f, #52b788)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(45,106,79,0.30)',
            }}>🌾</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '18px', color: '#1a3a2a', lineHeight: 1.1 }}>
                {t('DoCA Kisan Portal', 'DoCA किसान पोर्टल')}
              </div>
              <div style={{ fontSize: '11px', color: '#4a6741', fontWeight: 500 }}>
                {t('Smart Agricultural Procurement', 'स्मार्ट कृषि खरीद प्रणाली')}
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-2">
            <NavBtn icon={<Home size={16}/>} label={t('Home','होम')} active={page==='landing'} onClick={()=>setPage('landing')}/>
            <NavBtn icon={<Wheat size={16}/>} label={t('Farmer','किसान')} active={page==='farmer'} onClick={()=>setPage('farmer')}/>
            <NavBtn icon={<Shield size={16}/>} label={t('Admin','एडमिन')} active={page==='admin'} onClick={()=>setPage('admin')}/>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Voice Command Toggle */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={listening ? stopListening : startListening}
                title={t('Voice Command', 'वॉइस कमांड')}
                style={{
                  position: 'relative',
                  width: 44, height: 44,
                  borderRadius: '50%',
                  border: 'none',
                  background: listening
                    ? 'linear-gradient(135deg, #dc2626, #ef4444)'
                    : 'linear-gradient(135deg, #2d6a4f, #52b788)',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: listening ? '0 0 0 0 rgba(220,38,38,0.6)' : '0 4px 12px rgba(45,106,79,0.35)',
                  animation: listening ? 'none' : 'pulse 2s infinite',
                  transition: 'all 0.2s ease',
                }}
                aria-label="Voice command"
              >
                {listening ? <MicOff size={18}/> : <Mic size={18}/>}
                {listening && (
                  <span style={{
                    position: 'absolute',
                    inset: -6,
                    borderRadius: '50%',
                    border: '2px solid #ef4444',
                    animation: 'pulseRing 1.2s ease-out infinite',
                  }}/>
                )}
              </button>
              {voiceResult && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: '#1a3a2a',
                  color: '#fff',
                  fontSize: '12px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 100,
                  maxWidth: '220px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  🎙️ "{voiceResult}"
                </div>
              )}
            </div>

            {/* Language Cycle Toggle — EN → HI → MR → TE → EN */}
            <button
              onClick={cycleLanguage}
              className="btn btn-outline btn-sm"
              style={{ gap: '6px', minWidth: '90px', fontWeight: 700 }}
              title="Cycle Language"
            >
              <Globe size={14}/>
              {LANG_LABELS[language]}
            </button>

            {/* User chip + Logout */}
            {currentUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: currentUser.role === 'admin'
                    ? 'linear-gradient(135deg, #451a03, #92400e)'
                    : 'linear-gradient(135deg, #1a3a2a, #2d6a4f)',
                  borderRadius: '20px',
                  padding: '6px 14px 6px 8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}>
                  <span style={{ fontSize: '18px' }}>{currentUser.avatar}</span>
                  <div style={{ lineHeight: 1.2 }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '12px' }}>
                      {currentUser.displayName}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {currentUser.role}
                    </div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  style={{
                    width: 36, height: 36,
                    borderRadius: '10px',
                    border: '2px solid #fca5a5',
                    background: 'rgba(239,68,68,0.08)',
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = '#fee2e2'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                >
                  <LogOut size={15}/>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Voice listening indicator */}
      {listening && (
        <div style={{
          background: 'linear-gradient(90deg, #dc2626, #ef4444)',
          color: '#fff',
          textAlign: 'center',
          padding: '6px',
          fontSize: '13px',
          fontWeight: 600,
          animation: 'pulse 1s infinite',
        }}>
          🎙️ {t('Listening for voice command… Say "Book Slot", "Check Status", "Open Chat", or "Change Language"',
               'वॉइस कमांड सुन रहा है… "स्लॉट बुक करें", "स्टेटस देखें", "मदद चाहिए" या "भाषा बदलें" कहें')}
        </div>
      )}
    </header>
  );
}

function NavBtn({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: active ? 700 : 500,
        color: active ? '#2d6a4f' : '#4a6741',
        background: active ? '#d8f3dc' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseOver={e => { if (!active) e.currentTarget.style.background = '#f0faf4'; }}
      onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {icon}
      {label}
    </button>
  );
}
