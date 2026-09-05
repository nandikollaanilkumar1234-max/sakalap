// =============================================================================
// src/components/IvrSimulator.jsx
// Interactive Feature-Phone IVR Simulator Modal
// State machine: language → phone → crop → confirm → result
// =============================================================================

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import {
  Phone, PhoneOff, X, ChevronRight, Check, Loader2
} from 'lucide-react';

const CROPS = [
  { key: 'Wheat',  label: 'Wheat / गेहूं',  emoji: '🌾' },
  { key: 'Paddy',  label: 'Paddy / धान',    emoji: '🌿' },
  { key: 'Maize',  label: 'Maize / मक्का',  emoji: '🌽' },
  { key: 'Soybean',label: 'Soybean / सोयाबीन', emoji: '🫘' },
];

const STEPS = ['language','phone','crop','confirm','result'];

export default function IvrSimulator() {
  const { setShowIvr, fetchSlots, pushSms, language: appLang, t } = useApp();

  const [step, setStep]           = useState('language');
  const [ivrLang, setIvrLang]     = useState('en');
  const [phoneInput, setPhoneInput] = useState('');
  const [selectedCrop, setCrop]   = useState(null);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [transcript, setTranscript] = useState([]);

  // Typewriter transcript effect
  const addLine = (line, delay = 0) => {
    setTimeout(() => setTranscript(p => [...p, line]), delay);
  };

  useEffect(() => {
    addLine({ speaker: 'ivr', text: '📞 Call connected to DoCA Procurement Portal…' }, 100);
    addLine({ speaker: 'ivr', text: '🔊 "Welcome to DoCA Procurement Portal. For English, press 1. हिंदी के लिए 2 दबाएं।"' }, 800);
  }, []);

  // ── Step Handlers ─────────────────────────────────────────────────────────
  function handleLanguage(choice) {
    const lang = choice === '1' ? 'en' : 'hi';
    setIvrLang(lang);
    addLine({ speaker: 'user',  text: `🔢 Pressed: ${choice}` });
    addLine({ speaker: 'ivr',   text: lang === 'en'
      ? '🔊 "English selected. Please enter your 10-digit mobile number."'
      : '🔊 "हिंदी चुनी गई। कृपया अपना 10 अंकों का मोबाइल नंबर दर्ज करें।"'
    }, 600);
    setStep('phone');
  }

  function handlePhoneDigit(d) {
    if (phoneInput.length >= 10) return;
    setPhoneInput(p => p + d);
  }

  function handlePhoneConfirm() {
    if (phoneInput.length < 10) return;
    addLine({ speaker: 'user', text: `📱 Entered number: ${phoneInput}` });
    addLine({ speaker: 'ivr',  text: ivrLang === 'en'
      ? `🔊 "Number ${phoneInput} registered. Press 1 for Wheat, 2 for Paddy, 3 for Maize, 4 for Soybean."`
      : `🔊 "नंबर ${phoneInput} दर्ज हुआ। गेहूं के लिए 1, धान के लिए 2, मक्का के लिए 3, सोयाबीन के लिए 4 दबाएं।"`,
    }, 600);
    setStep('crop');
  }

  function handleCrop(choice, cropKey) {
    setCrop(cropKey);
    addLine({ speaker: 'user', text: `🔢 Pressed: ${choice} (${cropKey})` });
    addLine({ speaker: 'ivr',  text: ivrLang === 'en'
      ? `🔊 "${cropKey} selected. 25 quintals will be assumed. Press 1 to confirm booking, * to cancel."`
      : `🔊 "${CROPS.find(c=>c.key===cropKey)?.label} चुना गया। 25 क्विंटल माना जाएगा। बुकिंग की पुष्टि के लिए 1 दबाएं, रद्द करने के लिए * दबाएं।"`,
    }, 600);
    setStep('confirm');
  }

  async function handleConfirm() {
    addLine({ speaker: 'user', text: '🔢 Pressed: 1 (Confirm)' });
    addLine({ speaker: 'ivr',  text: ivrLang === 'en'
      ? '🔊 "Please wait while we confirm your booking…"'
      : '🔊 "कृपया प्रतीक्षा करें, आपकी बुकिंग की पुष्टि हो रही है…"',
    }, 400);

    setLoading(true);
    try {
      const res = await api.bookIvr({
        farmer_name: `IVR Caller (${phoneInput})`,
        phone: phoneInput,
        crop: selectedCrop,
        quantity: 25,
      });

      const tokenNo = res.data.token_number;
      setResult(res.data);
      fetchSlots();
      if (res.sms) pushSms(res.sms);

      addLine({ speaker: 'ivr', text: ivrLang === 'en'
        ? `🔊 "Your slot is confirmed! Token Number ${tokenNo} has been assigned to you. An SMS has been sent to ${phoneInput}. Thank you for using DoCA. Jai Kisan!"`
        : `🔊 "आपका स्लॉट कन्फर्म हो गया! आपको टोकन नंबर ${tokenNo} दिया गया है। ${phoneInput} पर SMS भेजा गया है। DoCA का उपयोग करने के लिए धन्यवाद। जय किसान!"`,
      }, 800);

      setStep('result');
    } catch (e) {
      addLine({ speaker: 'ivr', text: '🔊 "Sorry, there was an error. Please try again later."' }, 400);
    } finally {
      setLoading(false);
    }
  }

  // ── Dial Pad ──────────────────────────────────────────────────────────────
  const dialPad = ['1','2','3','4','5','6','7','8','9','*','0','#'];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowIvr(false)}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
        maxHeight: '90vh',
      }}>

        {/* ── Feature Phone UI ──────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(160deg, #2d2d2d, #1a1a1a)',
          borderRadius: '32px',
          padding: '20px 16px 24px',
          width: '200px',
          flexShrink: 0,
          border: '3px solid #444',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}>
          {/* Screen */}
          <div style={{
            background: '#1a2e1e',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '16px',
            minHeight: '80px',
            border: '2px solid #333',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: '9px', color: '#52b788', fontWeight: 700, marginBottom: '4px', letterSpacing: '0.06em' }}>
              📞 DoCA PORTAL
            </div>
            {step === 'language' && <div style={{ color: '#95d5b2', fontSize: '11px' }}>Press 1 / 2</div>}
            {step === 'phone' && (
              <div style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 700, letterSpacing: '2px' }}>
                {phoneInput || '_ _ _ _ _ _ _ _ _ _'}
              </div>
            )}
            {step === 'crop' && <div style={{ color: '#95d5b2', fontSize: '11px' }}>1-4 चुनें</div>}
            {step === 'confirm' && <div style={{ color: '#fbbf24', fontSize: '11px' }}>1=Confirm, *=Cancel</div>}
            {step === 'result' && result && (
              <div style={{ color: '#52b788', fontSize: '11px', fontWeight: 700 }}>
                ✅ Token #{result.token_number}
              </div>
            )}
          </div>

          {/* Dial Pad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {dialPad.map(key => (
              <button
                key={key}
                onClick={() => {
                  if (step === 'language' && (key === '1' || key === '2')) handleLanguage(key);
                  else if (step === 'phone' && key !== '*' && key !== '#') handlePhoneDigit(key);
                  else if (step === 'crop') {
                    const cropMap = { '1': 'Wheat', '2': 'Paddy', '3': 'Maize', '4': 'Soybean' };
                    if (cropMap[key]) handleCrop(key, cropMap[key]);
                  } else if (step === 'confirm' && key === '1') handleConfirm();
                  else if (step === 'confirm' && key === '*') setShowIvr(false);
                }}
                style={{
                  background: key === '#' || key === '*' ? '#333' : 'linear-gradient(135deg, #3a3a3a, #2a2a2a)',
                  border: '1px solid #555',
                  borderRadius: '8px',
                  padding: '10px 4px',
                  color: key === '*' ? '#ef4444' : '#fff',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.background = '#4a4a4a'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = ''; }}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {step === 'phone' && (
              <button
                onClick={handlePhoneConfirm}
                disabled={phoneInput.length < 10}
                style={{
                  flex: 1,
                  background: phoneInput.length === 10 ? '#2d6a4f' : '#333',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  padding: '10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                CALL ✓
              </button>
            )}
            <button
              onClick={() => setPhoneInput('')}
              style={{
                flex: 1,
                background: '#333', color: '#ef4444', border: 'none',
                borderRadius: '8px', padding: '10px', fontSize: '20px', cursor: 'pointer',
              }}
            >
              ⌫
            </button>
          </div>

          {/* End Call */}
          <button
            onClick={() => setShowIvr(false)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #dc2626, #ef4444)',
              color: '#fff', border: 'none',
              borderRadius: '8px', padding: '10px',
              fontSize: '18px', cursor: 'pointer',
              marginTop: '8px',
              boxShadow: '0 4px 12px rgba(220,38,38,0.4)',
            }}
          >
            📵
          </button>
        </div>

        {/* ── IVR Transcript Panel ─────────────────────────────────────────── */}
        <div style={{
          flex: 1,
          background: '#fff',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1a3a2a, #2d6a4f)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>📞 IVR Phone Simulator</div>
              <div style={{ color: '#95d5b2', fontSize: '12px' }}>
                {t('Feature Phone Booking Sandbox', 'फीचर फोन बुकिंग सैंडबॉक्स')}
              </div>
            </div>
            <button
              onClick={() => setShowIvr(false)}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px', color: '#fff', cursor: 'pointer' }}
            >
              <X size={16}/>
            </button>
          </div>

          {/* Step indicator */}
          <div style={{ padding: '12px 16px', background: '#f0faf4', borderBottom: '1px solid #d8f3dc' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: STEPS.indexOf(step) >= i ? '#2d6a4f' : '#d8f3dc',
                  transition: 'background 0.3s ease',
                }}/>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: '#4a6741', fontWeight: 600, marginTop: '6px' }}>
              {t(
                `Step ${STEPS.indexOf(step) + 1}/5: ${step.charAt(0).toUpperCase() + step.slice(1)}`,
                `चरण ${STEPS.indexOf(step) + 1}/5: ${step}`
              )}
            </div>
          </div>

          {/* Transcript */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {transcript.map((line, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: line.speaker === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'fadeIn 0.3s ease both',
                }}
              >
                <div style={{
                  background: line.speaker === 'ivr'
                    ? 'linear-gradient(135deg, #f0faf4, #d8f3dc)'
                    : 'linear-gradient(135deg, #2d6a4f, #52b788)',
                  color: line.speaker === 'ivr' ? '#1a3a2a' : '#fff',
                  padding: '8px 12px',
                  borderRadius: line.speaker === 'ivr' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  maxWidth: '90%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                  {line.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4a6741' }}>
                <Loader2 size={14} className="animate-spin"/>
                <span style={{ fontSize: '13px' }}>{t('Connecting to server…', 'सर्वर से जुड़ रहे हैं…')}</span>
              </div>
            )}

            {step === 'result' && result && (
              <div style={{
                background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                border: '2px solid #10b981',
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'center',
                animation: 'fadeIn 0.4s ease both',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                <div style={{ fontWeight: 800, fontSize: '18px', color: '#065f46' }}>
                  {t('Booking Confirmed!', 'बुकिंग सफल हुई!')}
                </div>
                <div style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '12px',
                  marginTop: '12px',
                  border: '1px solid #6ee7b7',
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#2d6a4f' }}>
                    #{result.token_number}
                  </div>
                  <div style={{ fontSize: '12px', color: '#4a6741', fontWeight: 600 }}>
                    {t('Your Token Number', 'आपका टोकन नंबर')}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#065f46' }}>
                    {result.crop} • IVR / Feature Phone
                  </div>
                  <div style={{ fontSize: '12px', color: '#4a6741', marginTop: '4px' }}>
                    {t(`SMS sent to ${result.phone}`, `${result.phone} पर SMS भेजा गया`)}
                  </div>
                </div>
                <button
                  onClick={() => setShowIvr(false)}
                  className="btn btn-primary"
                  style={{ marginTop: '12px', width: '100%' }}
                >
                  {t('Close & View Dashboard', 'बंद करें और डैशबोर्ड देखें')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
