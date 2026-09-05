// =============================================================================
// src/components/FarmerDashboard.jsx
// Farmer's complete portal: slot booking + queue tracker + DBT ledger
// =============================================================================

import { useApp } from '../context/AppContext';
import QueueTracker  from './QueueTracker';
import DbtLedger     from './DbtLedger';
import {
  Plus, Phone, MessageCircle, Wheat, Ticket,
  IndianRupee, MapPin, Clock, CheckCircle
} from 'lucide-react';

export default function FarmerDashboard() {
  const {
    t, language,
    setShowSlotForm, setShowIvr, setShowChatbot,
    myToken, slots, stats,
  } = useApp();

  const mySlot = myToken ? slots.find(s => s.token_number === myToken) : null;

  return (
    <div style={{ padding: '32px 0 80px' }}>
      <div className="container">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#1a3a2a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '36px' }}>👨‍🌾</span>
                {t('Farmer Dashboard', 'किसान डैशबोर्ड')}
              </h1>
              <p style={{ color: '#4a6741', fontSize: '15px', marginTop: '6px' }}>
                {t('Manage your procurement slots, track queue, and monitor payments.',
                   'अपने खरीद स्लॉट, कतार और भुगतान की स्थिति देखें।')}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowIvr(true)}
                className="btn btn-outline"
                style={{ gap: '8px' }}
              >
                <Phone size={16}/>
                {t('IVR Simulator', 'IVR सिमुलेटर')}
              </button>
              <button
                onClick={() => setShowSlotForm(true)}
                className="btn btn-primary btn-lg"
                style={{ gap: '8px' }}
              >
                <Plus size={18}/>
                {t('Book New Slot', 'नया स्लॉट बुक करें')}
              </button>
            </div>
          </div>
        </div>

        {/* ── My Active Slot Card ──────────────────────────────────────────── */}
        {mySlot ? (
          <div style={{
            background: 'linear-gradient(135deg, #1a3a2a, #2d6a4f)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            boxShadow: '0 8px 32px rgba(45,106,79,0.30)',
            animation: 'fadeIn 0.4s ease both',
          }}>
            <div style={{
              width: 70, height: 70,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '3px solid rgba(245,158,11,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px',
              flexShrink: 0,
            }}>🎫</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#95d5b2', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t('Your Active Booking', 'आपकी सक्रिय बुकिंग')}
              </div>
              <div style={{ color: '#fbbf24', fontSize: '32px', fontWeight: 900, lineHeight: 1, marginTop: '4px' }}>
                Token #{mySlot.token_number}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', marginTop: '6px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span>🌾 {mySlot.crop} ({mySlot.quantity} qtl)</span>
                <span>📍 {mySlot.center_location}</span>
                <span>📅 {mySlot.target_date}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <span className={`badge badge-${mySlot.queue_status}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
                {mySlot.queue_status === 'pending' ? '⏳ ' : mySlot.queue_status === 'serving' ? '✅ ' : '✓ '}
                {t(mySlot.queue_status, mySlot.queue_status === 'pending' ? 'प्रतीक्षित' : mySlot.queue_status === 'serving' ? 'सेवा में' : 'पूर्ण')}
              </span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setShowSlotForm(true)}
            style={{
              background: 'linear-gradient(135deg, #f0faf4, #d8f3dc)',
              border: '2px dashed #52b788',
              borderRadius: '20px',
              padding: '28px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#d8f3dc'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(135deg, #f0faf4, #d8f3dc)'}
          >
            <div style={{
              width: 60, height: 60,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2d6a4f, #52b788)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px',
              flexShrink: 0,
            }}>🌾</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '18px', color: '#1a3a2a' }}>
                {t('No active slot — Book one now!', 'कोई सक्रिय स्लॉट नहीं — अभी बुक करें!')}
              </div>
              <div style={{ color: '#4a6741', fontSize: '14px', marginTop: '4px' }}>
                {t('Click here or use voice command "Book Slot"', 'यहाँ क्लिक करें या "स्लॉट बुक करें" बोलें')}
              </div>
            </div>
            <Plus size={24} style={{ marginLeft: 'auto', color: '#2d6a4f', flexShrink: 0 }}/>
          </div>
        )}

        {/* ── Main Grid: Queue + DBT ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
          <QueueTracker/>
          <DbtLedger/>
        </div>

        {/* ── Quick Stats ───────────────────────────────────────────────── */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
            {[
              { icon: '🌾', value: stats.total,     label_en: 'Total Bookings',    label_hi: 'कुल बुकिंग', color: '#2d6a4f' },
              { icon: '⏳', value: stats.pending,   label_en: 'Pending',           label_hi: 'प्रतीक्षित', color: '#d4831a' },
              { icon: '📞', value: stats.ivr,       label_en: 'Via IVR Phone',     label_hi: 'IVR फोन से', color: '#7c3aed' },
              { icon: '✅', value: stats.disbursed, label_en: 'Payments Released',  label_hi: 'भुगतान जारी', color: '#10b981' },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ animation: `fadeIn 0.4s ease ${i * 0.1}s both` }}>
                <div className="stat-icon" style={{ background: `${s.color}22` }}>
                  <span style={{ fontSize: '24px' }}>{s.icon}</span>
                </div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{language === 'hi' ? s.label_hi : s.label_en}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Help CTA Strip ─────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          border: '1px solid #fde68a',
          borderRadius: '20px',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: '#92400e' }}>
              🤖 {t('Need help? Ask Kisan Mitra', 'मदद चाहिए? किसान मित्र से पूछें')}
            </div>
            <div style={{ color: '#b45309', fontSize: '14px', marginTop: '4px' }}>
              {t('Voice + text assistant available in Hindi & English. Ask about booking, payments, status…',
                 'हिंदी और अंग्रेजी में वॉइस और टेक्स्ट सहायक उपलब्ध। बुकिंग, भुगतान, स्टेटस…')}
            </div>
          </div>
          <button
            onClick={() => setShowChatbot(true)}
            className="btn btn-accent"
          >
            {t('Open Kisan Mitra', 'किसान मित्र खोलें')} 🌾
          </button>
        </div>

      </div>
    </div>
  );
}
