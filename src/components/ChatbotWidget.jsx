// =============================================================================
// src/components/ChatbotWidget.jsx
// Kisan Mitra / किसान मित्र — Floating AI Assistant
// Web Speech API for audio input + window.speechSynthesis for audio output
// =============================================================================

import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import {
  MessageCircle, X, Mic, MicOff, Volume2, VolumeX,
  Send, Bot, User, Loader2
} from 'lucide-react';

const SUGGESTED = [
  { en: 'How do I book a slot?',       hi: 'स्लॉट कैसे बुक करें?',       mr: 'स्लॉट कसे बुक करावे?',       te: 'స్లాట్ ఎలా బుక్ చేయాలి?' },
  { en: 'Check my token status',       hi: 'मेरा टोकन कहाँ है?',          mr: 'माझा टोकन कुठे आहे?',        te: 'నా టోకెన్ స్థితి?' },
  { en: 'When will my money arrive?',  hi: 'मेरा पैसा कब आएगा?',          mr: 'माझे पैसे कधी येतील?',        te: 'నా డబ్బు ఎప్పుడు వస్తుంది?' },
  { en: 'IVR phone booking help',      hi: 'फोन से बुकिंग कैसे करें?',    mr: 'फोनवरून बुकिंग कशी करायची?', te: 'ఫోన్ బుకింగ్ సహాయం?' },
];

export default function ChatbotWidget() {
  const { showChatbot, setShowChatbot, language, t } = useApp();

  const GREETINGS = {
    en: "Namaste! I'm Kisan Mitra 🌾 I'm here to help you with slot booking, token status, payment queries, and more!",
    hi: 'नमस्ते! मैं किसान मित्र हूँ 🌾 मैं आपकी स्लॉट बुकिंग, टोकन स्टेटस, या भुगतान से जुड़े सवालों में मदद करूँगा।',
    mr: 'नमस्कार! मी किसान मित्र आहे 🌾 मी तुम्हाला स्लॉट बुकिंग, टोकन स्टेटस, देयक प्रश्नांमध्ये मदत करेन.',
    te: 'నమస్కారం! నేను కిసాన్ మిత్ర 🌾 స్లాట్ బుకింగ్, టోకెన్ స్టేటస్, చెల్లింపు సందేహాలలో సహాయం చేస్తాను.',
  };

  const [messages, setMessages] = useState([
    { role: 'bot', text: GREETINGS[language] || GREETINGS.en },
  ]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking]   = useState(null);

  const endRef    = useRef(null);
  const inputRef  = useRef(null);
  const recogRef  = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (showChatbot) setTimeout(() => inputRef.current?.focus(), 300);
  }, [showChatbot]);

  // ── Send message ─────────────────────────────────────────────────────────
  async function send(text) {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const res = await api.chat(msg, language);
      const botMsg = { role: 'bot', text: res.response };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: t('Sorry, I could not connect. Please try again.', 'क्षमा करें, कनेक्ट नहीं हो पाया। फिर से कोशिश करें।') }]);
    } finally {
      setLoading(false);
    }
  }

  // ── Speech Input ──────────────────────────────────────────────────────────
  function toggleMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Speech recognition not supported in this browser.');

    if (listening) {
      recogRef.current?.stop();
      setListening(false);
      return;
    }

    const recog = new SR();
    recog.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recog.continuous = false;
    recog.interimResults = false;

    recog.onstart  = () => setListening(true);
    recog.onend    = () => setListening(false);
    recog.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setInput(t);
      setTimeout(() => send(t), 200);
    };
    recog.onerror  = () => setListening(false);
    recog.start();
    recogRef.current = recog;
  }

  // ── Speech Output ─────────────────────────────────────────────────────────
  function speak(text, idx) {
    if (speaking === idx) {
      window.speechSynthesis?.cancel();
      setSpeaking(null);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utter.rate = 0.9;
    utter.onend = () => setSpeaking(null);
    window.speechSynthesis?.cancel();
    window.speechSynthesis?.speak(utter);
    setSpeaking(idx);
  }

  if (!showChatbot) {
    return (
      <button
        onClick={() => setShowChatbot(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 800,
          width: '64px', height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2d6a4f, #52b788)',
          border: 'none',
          color: '#fff',
          fontSize: '26px',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(45,106,79,0.45)',
          animation: 'pulse 2.5s infinite',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s ease',
        }}
        title={t('Open Kisan Mitra Chatbot', 'किसान मित्र खोलें')}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        🌾
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 800,
      width: '380px',
      maxWidth: 'calc(100vw - 32px)',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 16px 60px rgba(0,0,0,0.25)',
      animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '580px',
    }}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a3a2a, #2d6a4f)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: 44, height: 44,
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px',
          border: '2px solid rgba(255,255,255,0.3)',
        }}>🌾</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>
            {t('Kisan Mitra', 'किसान मित्र')}
          </div>
          <div style={{ color: '#95d5b2', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#52b788', display: 'inline-block' }}/>
            {t('AI Assistant — Online', 'AI सहायक — ऑनलाइन')}
          </div>
        </div>
        <button
          onClick={() => setShowChatbot(false)}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px', color: '#fff', cursor: 'pointer' }}
        >
          <X size={16}/>
        </button>
      </div>

      {/* ── Messages ─────────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        background: '#fafffe',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minHeight: '300px',
        maxHeight: '380px',
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: '8px',
              animation: 'fadeIn 0.3s ease both',
            }}
          >
            {msg.role === 'bot' && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2d6a4f, #52b788)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', flexShrink: 0, marginTop: 2,
              }}>🌾</div>
            )}
            <div style={{
              maxWidth: '78%',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #2d6a4f, #52b788)'
                : '#fff',
              color: msg.role === 'user' ? '#fff' : '#1a2e1e',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              fontSize: '14px',
              lineHeight: 1.5,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: msg.role === 'bot' ? '1px solid #d8f3dc' : 'none',
              position: 'relative',
            }}>
              {msg.text}
              {msg.role === 'bot' && (
                <button
                  onClick={() => speak(msg.text, i)}
                  style={{
                    position: 'absolute',
                    bottom: -4, right: -4,
                    width: 24, height: 24,
                    borderRadius: '50%',
                    border: '2px solid #fff',
                    background: speaking === i ? '#2d6a4f' : '#f0faf4',
                    color: speaking === i ? '#fff' : '#2d6a4f',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  title={t('Read aloud', 'ज़ोर से पढ़ें')}
                >
                  {speaking === i ? <VolumeX size={10}/> : <Volume2 size={10}/>}
                </button>
              )}
            </div>
            {msg.role === 'user' && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', flexShrink: 0, marginTop: 2,
              }}>👤</div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2d6a4f, #52b788)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px',
            }}>🌾</div>
            <div style={{
              background: '#fff',
              border: '1px solid #d8f3dc',
              borderRadius: '4px 16px 16px 16px',
              padding: '10px 14px',
              display: 'flex', gap: '4px', alignItems: 'center',
            }}>
              {[0,1,2].map(n => (
                <div key={n} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#52b788',
                  animation: `bounce 1.2s ease-in-out ${n * 0.2}s infinite`,
                }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {/* ── Suggested Questions ───────────────────────────────────────────────── */}
      <div style={{
        padding: '8px 12px',
        background: '#f0faf4',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        borderTop: '1px solid #d8f3dc',
        scrollbarWidth: 'none',
      }}>
        {SUGGESTED.map((s, i) => (
          <button
            key={i}
            onClick={() => send(s[language] || s.en)}
            style={{
              flexShrink: 0,
              background: '#fff',
              border: '1px solid #b7e4c7',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '11px',
              color: '#2d6a4f',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#d8f3dc'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#fff'; }}
          >
            {s[language] || s.en}
          </button>
        ))}
      </div>

      {/* ── Input Bar ────────────────────────────────────────────────────────── */}
      <div style={{
        padding: '12px 16px',
        background: '#fff',
        borderTop: '1px solid #d8f3dc',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      }}>
        <button
          onClick={toggleMic}
          style={{
            width: 40, height: 40,
            borderRadius: '50%',
            border: 'none',
            background: listening
              ? 'linear-gradient(135deg, #dc2626, #ef4444)'
              : 'linear-gradient(135deg, #d8f3dc, #b7e4c7)',
            color: listening ? '#fff' : '#2d6a4f',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            animation: listening ? 'pulse 1s infinite' : 'none',
            transition: 'all 0.2s ease',
          }}
          title={t('Voice input', 'आवाज़ से बोलें')}
        >
          {listening ? <MicOff size={16}/> : <Mic size={16}/>}
        </button>

        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder={t('Type your question…', 'अपना सवाल लिखें…')}
          style={{
            flex: 1,
            border: '2px solid #d8f3dc',
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '14px',
            fontFamily: 'inherit',
            outline: 'none',
            background: '#fafffe',
            color: '#1a2e1e',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={e => e.target.style.borderColor = '#52b788'}
          onBlur={e => e.target.style.borderColor = '#d8f3dc'}
        />

        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{
            width: 40, height: 40,
            borderRadius: '50%',
            border: 'none',
            background: input.trim()
              ? 'linear-gradient(135deg, #2d6a4f, #52b788)'
              : '#f0faf4',
            color: input.trim() ? '#fff' : '#b7e4c7',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
        </button>
      </div>
    </div>
  );
}
