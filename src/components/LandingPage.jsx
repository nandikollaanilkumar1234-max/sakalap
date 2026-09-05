// =============================================================================
// src/components/LandingPage.jsx
// DoCA Kisan Portal — Hero + Feature Cards + IVR Promo
// =============================================================================

import { useApp } from '../context/AppContext';
import {
  Wheat, Phone, Bot, Mic, Globe, Shield,
  ArrowRight, CheckCircle, TrendingUp, Users, Clock
} from 'lucide-react';

const FEATURES = [
  {
    icon: '🎫',
    en_title: 'Digital Slot Booking',
    hi_title: 'डिजिटल स्लॉट बुकिंग',
    en_desc: 'Multi-step online form with instant token generation. Download a digital receipt with QR code.',
    hi_desc: 'तुरंत टोकन के साथ ऑनलाइन फॉर्म। QR कोड सहित डिजिटल रसीद डाउनलोड करें।',
  },
  {
    icon: '📞',
    en_title: 'IVR Phone Booking',
    hi_title: 'IVR फोन बुकिंग',
    en_desc: 'No smartphone needed! Call 1800-XXX-FARM from any basic phone. Get token via SMS.',
    hi_desc: 'स्मार्टफोन की जरूरत नहीं! किसी भी साधारण फोन से कॉल करें। SMS से टोकन पाएं।',
  },
  {
    icon: '🤖',
    en_title: 'AI Kisan Mitra',
    hi_title: 'AI किसान मित्र',
    en_desc: 'Voice-enabled AI assistant in Hindi & English. Ask anything about slots, payments, status.',
    hi_desc: 'हिंदी और अंग्रेजी में वॉइस-इनेबल्ड AI सहायक। स्लॉट, भुगतान, स्टेटस - सब पूछें।',
  },
  {
    icon: '💰',
    en_title: 'DBT Payment Tracker',
    hi_title: 'DBT भुगतान ट्रैकर',
    en_desc: '4-step real-time pipeline: Crop Received → Verified → Invoice → Bank Transfer.',
    hi_desc: '4-चरण रियल-टाइम पाइपलाइन: फसल प्राप्त → जाँच → Invoice → बैंक ट्रांसफर।',
  },
  {
    icon: '🎙️',
    en_title: 'Voice Commands',
    hi_title: 'वॉइस कमांड',
    en_desc: 'Navigate the entire portal hands-free using natural voice in Hindi or English.',
    hi_desc: 'हिंदी या अंग्रेजी में आवाज़ से पूरे पोर्टल को नियंत्रित करें।',
  },
  {
    icon: '📊',
    en_title: 'Admin Dashboard',
    hi_title: 'एडमिन डैशबोर्ड',
    en_desc: 'Government officials manage queue, verify weights, update payments & inspect raw DB.',
    hi_desc: 'सरकारी अधिकारी कतार, वजन, भुगतान और डेटाबेस प्रबंधित करें।',
  },
];

const STATS = [
  { icon: '👨‍🌾', value: '2.4L+', en: 'Farmers Registered', hi: 'किसान पंजीकृत' },
  { icon: '🌾', value: '₹840Cr', en: 'Procurement Value', hi: 'खरीद मूल्य' },
  { icon: '📍', value: '340+', en: 'Centres Active', hi: 'सक्रिय केंद्र' },
  { icon: '⚡', value: '3 Days', en: 'Avg DBT Time', hi: 'औसत DBT समय' },
];

export default function LandingPage() {
  const { t, setPage, setShowIvr, setShowSlotForm, setShowChatbot, language } = useApp();

  return (
    <div>
      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(160deg, #0d2117 0%, #1a3a2a 40%, #2d6a4f 100%)',
        padding: '80px 0 100px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${80 + i * 60}px`, height: `${80 + i * 60}px`,
            borderRadius: '50%',
            border: '1px solid rgba(82,183,136,0.1)',
            top: `${10 + i * 8}%`,
            right: `${5 + i * 3}%`,
            animation: `pulse ${3 + i * 0.5}s infinite ${i * 0.3}s`,
          }}/>
        ))}

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '700px' }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.4)',
              borderRadius: '20px',
              padding: '6px 16px',
              marginBottom: '24px',
            }}>
              <span style={{ background: '#f59e0b', borderRadius: '50%', width: 8, height: 8, display: 'inline-block', animation: 'pulse 1.5s infinite' }}/>
              <span style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 700 }}>
                {t('Smart India Hackathon 2026 — PS ID: 26032', 'स्मार्ट इंडिया हैकाथॉन 2026 — PS ID: 26032')}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 58px)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: '20px',
            }}>
              {t('Smart Procurement', 'स्मार्ट खरीद')}<br/>
              <span style={{
                background: 'linear-gradient(135deg, #52b788, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {t('for Every Kisan', 'हर किसान के लिए')}
              </span>
            </h1>

            <p style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.7,
              marginBottom: '36px',
              maxWidth: '560px',
            }}>
              {t(
                'DoCA\'s next-generation agricultural procurement portal. Book slots, track tokens, receive DBT payments — even from a basic feature phone.',
                'DoCA का अगली पीढ़ी का कृषि खरीद पोर्टल। स्लॉट बुक करें, टोकन ट्रैक करें, DBT भुगतान प्राप्त करें — साधारण फोन से भी।',
              )}
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setPage('farmer'); setShowSlotForm(true); }}
                className="btn btn-accent btn-xl"
                style={{ fontSize: '16px' }}
              >
                🌾 {t('Book a Slot Now', 'अभी स्लॉट बुक करें')} <ArrowRight size={18}/>
              </button>
              <button
                onClick={() => setShowIvr(true)}
                className="btn btn-ghost btn-xl"
                style={{ fontSize: '16px' }}
              >
                📞 {t('Try IVR Simulator', 'IVR सिमुलेटर आज़माएं')}
              </button>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, overflow: 'hidden', lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" style={{ display: 'block', fill: '#fef9f0' }}>
            <path d="M0,40 C360,0 1080,80 1440,20 L1440,60 L0,60 Z"/>
          </svg>
        </div>
      </section>

      {/* ── Stats Banner ─────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '32px 0', borderBottom: '1px solid #d8f3dc' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                textAlign: 'center',
                padding: '20px',
                borderRadius: '16px',
                background: i % 2 === 0 ? '#f0faf4' : '#fffbeb',
                border: `1px solid ${i % 2 === 0 ? '#b7e4c7' : '#fde68a'}`,
                animation: `fadeIn 0.4s ease ${i * 0.1}s both`,
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#1a3a2a' }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: '#4a6741', fontWeight: 600, marginTop: '4px' }}>
                  {language === 'hi' ? s.hi : s.en}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: '#fef9f0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, color: '#1a3a2a', marginBottom: '12px' }}>
              {t('Everything a Farmer Needs', 'किसान को चाहिए सब कुछ यहाँ')}
            </h2>
            <p style={{ fontSize: '16px', color: '#4a6741', maxWidth: '500px', margin: '0 auto' }}>
              {t('Designed for accessibility — works on any device, any network, any language.',
                 'सभी के लिए डिज़ाइन — किसी भी डिवाइस, नेटवर्क और भाषा में।')}
            </p>
          </div>

          <div className="grid grid-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="card"
                style={{
                  animation: `fadeIn 0.4s ease ${i * 0.08}s both`,
                  cursor: 'default',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: 56, height: 56,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #d8f3dc, #b7e4c7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px',
                  marginBottom: '16px',
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1a3a2a', marginBottom: '8px' }}>
                  {language === 'hi' ? f.hi_title : f.en_title}
                </h3>
                <p style={{ fontSize: '14px', color: '#4a6741', lineHeight: 1.6 }}>
                  {language === 'hi' ? f.hi_desc : f.en_desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IVR Promo Banner ─────────────────────────────────────────────── */}
      <section style={{ padding: '60px 0', background: 'linear-gradient(135deg, #1a3a2a, #2d6a4f)' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '48px',
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(245,158,11,0.2)',
                border: '1px solid rgba(245,158,11,0.4)',
                borderRadius: '20px',
                padding: '4px 14px',
                marginBottom: '16px',
              }}>
                <span style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 700 }}>
                  {t('FOR FEATURE PHONE USERS', 'साधारण फोन उपयोगकर्ताओं के लिए')}
                </span>
              </div>
              <h2 style={{ color: '#fff', fontSize: 'clamp(22px,3vw,36px)', fontWeight: 900, lineHeight: 1.2, marginBottom: '16px' }}>
                {t('No Smartphone? No Problem.', 'स्मार्टफोन नहीं? कोई बात नहीं।')}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '16px', lineHeight: 1.7, marginBottom: '28px' }}>
                {t(
                  'Our IVR system lets any farmer book a procurement slot by simply calling 1800-XXX-FARM. The automated voice menu works in Hindi and English — no data, no app, no literacy required.',
                  'हमारा IVR सिस्टम किसी भी किसान को केवल 1800-XXX-FARM कॉल करके स्लॉट बुक करने देता है। हिंदी और अंग्रेजी में — बिना डेटा, बिना ऐप।',
                )}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => setShowIvr(true)} className="btn btn-accent">
                  📞 {t('Try IVR Simulator', 'IVR आज़माएं')} <ArrowRight size={16}/>
                </button>
                <button onClick={() => setShowChatbot(true)} className="btn btn-ghost">
                  🌾 {t('Ask Kisan Mitra', 'किसान मित्र से पूछें')}
                </button>
              </div>
            </div>

            {/* IVR script preview */}
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '20px',
              padding: '24px',
              minWidth: '300px',
              flex: 1,
              maxWidth: '420px',
            }}>
              <div style={{ fontSize: '12px', color: '#95d5b2', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.08em' }}>
                {t('IVR CALL TRANSCRIPT', 'IVR कॉल स्क्रिप्ट')}
              </div>
              {[
                { speaker: 'IVR', text: '"Welcome to DoCA Procurement. For English press 1. हिंदी के लिए 2 दबाएं।"', color: '#95d5b2' },
                { speaker: 'YOU', text: 'Pressed: 2', color: '#fbbf24' },
                { speaker: 'IVR', text: '"कृपया अपना 10 अंकों का मोबाइल नंबर दर्ज करें।"', color: '#95d5b2' },
                { speaker: 'YOU', text: 'Entered: 9876543210', color: '#fbbf24' },
                { speaker: 'IVR', text: '"गेहूं के लिए 1, धान के लिए 2 दबाएं।"', color: '#95d5b2' },
                { speaker: 'YOU', text: 'Pressed: 1 (Wheat)', color: '#fbbf24' },
                { speaker: 'IVR', text: '"✅ Token #8 assigned. SMS sent to 9876543210. Jai Kisan!"', color: '#52b788' },
              ].map((line, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '10px',
                  animation: `fadeIn 0.3s ease ${i * 0.1}s both`,
                }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: line.color, opacity: 0.7, flexShrink: 0, paddingTop: '2px', minWidth: '36px' }}>
                    {line.speaker}
                  </span>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                    {line.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: '#fef9f0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>🌾</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, color: '#1a3a2a', marginBottom: '16px' }}>
            {t('Ready to Get Started?', 'शुरू करने के लिए तैयार हैं?')}
          </h2>
          <p style={{ fontSize: '16px', color: '#4a6741', marginBottom: '32px', lineHeight: 1.7 }}>
            {t(
              'Join lakhs of farmers using DoCA\'s smart portal for fair, transparent procurement.',
              'लाखों किसानों के साथ जुड़ें जो न्यायपूर्ण, पारदर्शी खरीद के लिए DoCA के स्मार्ट पोर्टल का उपयोग कर रहे हैं।',
            )}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setPage('farmer')} className="btn btn-primary btn-xl">
              {t('Go to Farmer Dashboard', 'किसान डैशबोर्ड खोलें')} <ArrowRight size={20}/>
            </button>
            <button onClick={() => setPage('admin')} className="btn btn-outline btn-xl">
              <Shield size={18}/> {t('Admin Portal', 'एडमिन पोर्टल')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
