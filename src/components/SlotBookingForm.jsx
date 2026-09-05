// =============================================================================
// src/components/SlotBookingForm.jsx
// Multi-step procurement slot booking form (4 steps) + QR receipt download
// =============================================================================

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import {
  MapPin, Wheat, Scale, Calendar, Check, ChevronRight,
  ChevronLeft, Download, X, Loader2, QrCode
} from 'lucide-react';

const CENTRES = [
  'Mandi Bhawan, Lucknow',
  'Grain Centre, Varanasi',
  'Agri Hub, Kanpur',
  'Procurement Depot, Agra',
  'State Warehouse, Prayagraj',
  'Rural Centre, Gorakhpur',
];

const CROPS = [
  { value: 'Wheat',    label_en: 'Wheat',    label_hi: 'गेहूं',    emoji: '🌾' },
  { value: 'Paddy',    label_en: 'Paddy',    label_hi: 'धान',      emoji: '🌿' },
  { value: 'Maize',    label_en: 'Maize',    label_hi: 'मक्का',    emoji: '🌽' },
  { value: 'Soybean',  label_en: 'Soybean',  label_hi: 'सोयाबीन',  emoji: '🫘' },
  { value: 'Mustard',  label_en: 'Mustard',  label_hi: 'सरसों',    emoji: '🌼' },
  { value: 'Jowar',    label_en: 'Jowar',    label_hi: 'ज्वार',    emoji: '🌾' },
];

const STEPS = [
  { icon: <MapPin size={20}/>,  en: 'Select Centre',  hi: 'केंद्र चुनें' },
  { icon: <Wheat size={20}/>,   en: 'Choose Crop',    hi: 'फसल चुनें' },
  { icon: <Scale size={20}/>,   en: 'Quantity & Date',hi: 'मात्रा व तारीख' },
  { icon: <Check size={20}/>,   en: 'Confirm',        hi: 'पुष्टि करें' },
];

export default function SlotBookingForm() {
  const { setShowSlotForm, fetchSlots, pushSms, setMyToken, language, t } = useApp();

  const [step, setStep]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const [form, setForm] = useState({
    farmer_name:     '',
    phone:           '',
    center_location: '',
    crop:            '',
    quantity:        '',
    target_date:     '',
  });

  const update = (field, val) => setForm(p => ({ ...p, [field]: val }));

  // ── Step validation ───────────────────────────────────────────────────────
  const canNext = () => {
    if (step === 0) return form.farmer_name && form.phone && form.center_location;
    if (step === 1) return form.crop;
    if (step === 2) return form.quantity && form.target_date;
    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  async function submit() {
    setLoading(true);
    try {
      const res = await api.bookSlot(form);
      setReceipt(res.data);
      setMyToken(res.data.token_number);
      fetchSlots();
      if (res.sms) pushSms(res.sms);
    } catch (e) {
      alert(t('Booking failed: ' + e.message, 'बुकिंग विफल: ' + e.message));
    } finally {
      setLoading(false);
    }
  }

  // ── QR Code receipt download (canvas-based) ───────────────────────────────
  function downloadReceipt() {
    if (!receipt) return;
    const canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#fef9f0';
    ctx.fillRect(0, 0, 600, 800);

    // Header
    ctx.fillStyle = '#1a3a2a';
    ctx.fillRect(0, 0, 600, 120);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 120, 600, 6);

    // Logo text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px Outfit, Arial';
    ctx.fillText('🌾 DoCA Kisan Portal', 30, 55);
    ctx.fillStyle = '#95d5b2';
    ctx.font = '16px Outfit, Arial';
    ctx.fillText('Smart Agricultural Procurement Receipt', 30, 85);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 13px Outfit, Arial';
    ctx.fillText('SIH 2026 | Problem Statement ID: 26032', 30, 108);

    // Token circle
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath(); ctx.arc(520, 65, 55, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Outfit, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TOKEN', 520, 52);
    ctx.font = 'bold 36px Outfit, Arial';
    ctx.fillText(`#${receipt.token_number}`, 520, 85);
    ctx.textAlign = 'left';

    // Details
    const details = [
      ['Farmer Name', receipt.farmer_name],
      ['Mobile No.', receipt.phone],
      ['Crop', receipt.crop],
      ['Quantity', `${receipt.quantity} Quintals`],
      ['Centre', receipt.center_location],
      ['Date', receipt.target_date],
      ['Booking Via', receipt.source],
      ['Status', 'Confirmed ✓'],
    ];

    ctx.font = '14px Outfit, Arial';
    details.forEach(([label, val], i) => {
      const y = 175 + i * 52;
      ctx.fillStyle = '#f0faf4';
      ctx.fillRect(30, y, 540, 42);
      ctx.fillStyle = '#4a6741';
      ctx.font = 'bold 11px Outfit, Arial';
      ctx.fillText(label.toUpperCase(), 44, y + 16);
      ctx.fillStyle = '#1a2e1e';
      ctx.font = '15px Outfit, Arial';
      ctx.fillText(val, 44, y + 34);
    });

    // QR placeholder
    ctx.fillStyle = '#1a3a2a';
    ctx.fillRect(30, 605, 100, 100);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('QR CODE', 48, 658);
    ctx.fillStyle = '#52b788';
    ctx.font = '9px monospace';
    ctx.fillText(`TOKEN:${receipt.token_number}`, 36, 680);
    ctx.fillText(receipt.id?.substring(0, 16), 36, 696);

    ctx.fillStyle = '#4a6741';
    ctx.font = '12px Outfit, Arial';
    ctx.fillText('Show this receipt at the Procurement Centre', 145, 650);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px Outfit, Arial';
    ctx.fillText('Helpline: 1800-XXX-FARM  |  Jai Kisan 🌾', 145, 680);

    // Footer
    ctx.fillStyle = '#1a3a2a';
    ctx.fillRect(0, 750, 600, 50);
    ctx.fillStyle = '#95d5b2';
    ctx.font = '11px Outfit, Arial';
    ctx.fillText('This is a digitally generated receipt. No signature required. — DoCA, Govt. of India', 20, 780);

    const link = document.createElement('a');
    link.download = `DoCA-Receipt-Token-${receipt.token_number}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // ── Receipt Screen ────────────────────────────────────────────────────────
  if (receipt) {
    return (
      <div className="modal-overlay">
        <div className="modal-box" style={{ maxWidth: '440px', overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a3a2a, #2d6a4f)',
            padding: '24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
            <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800 }}>
              {t('Slot Booked Successfully!', 'स्लॉट सफलतापूर्वक बुक हुआ!')}
            </h2>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '16px',
              padding: '16px',
              marginTop: '16px',
            }}>
              <div style={{ color: '#95d5b2', fontSize: '13px', fontWeight: 600 }}>
                {t('YOUR TOKEN NUMBER', 'आपका टोकन नंबर')}
              </div>
              <div style={{ color: '#fbbf24', fontSize: '56px', fontWeight: 900, lineHeight: 1.1 }}>
                #{receipt.token_number}
              </div>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{
              background: '#f0faf4',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}>
              {[
                [t('Farmer','किसान'), receipt.farmer_name],
                [t('Crop','फसल'), receipt.crop],
                [t('Quantity','मात्रा'), `${receipt.quantity} qtl`],
                [t('Centre','केंद्र'), receipt.center_location],
                [t('Date','तारीख'), receipt.target_date],
                [t('Source','स्रोत'), receipt.source],
              ].map(([k,v]) => (
                <div key={k}>
                  <div style={{ fontSize: '10px', color: '#4a6741', fontWeight: 700, textTransform: 'uppercase' }}>{k}</div>
                  <div style={{ fontSize: '13px', color: '#1a2e1e', fontWeight: 600, marginTop: '2px' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* QR placeholder */}
            <div style={{
              background: 'linear-gradient(135deg, #1a3a2a, #2d6a4f)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px',
            }}>
              <div style={{
                width: 70, height: 70,
                background: '#fff',
                borderRadius: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(7,1fr)',
                gap: '2px',
                padding: '6px',
                flexShrink: 0,
              }}>
                {Array.from({length: 49}).map((_,i) => (
                  <div key={i} style={{
                    borderRadius: '1px',
                    background: Math.random() > 0.5 ? '#1a3a2a' : 'transparent',
                  }}/>
                ))}
              </div>
              <div>
                <div style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 700 }}>QR CODE — SCAN AT CENTRE</div>
                <div style={{ color: '#95d5b2', fontSize: '12px', marginTop: '4px' }}>Token #{receipt.token_number}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginTop: '2px' }}>
                  ID: {receipt.id?.substring(0, 16)}…
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={downloadReceipt} className="btn btn-accent" style={{ flex: 1 }}>
                <Download size={16}/> {t('Download Receipt', 'रसीद डाउनलोड करें')}
              </button>
              <button onClick={() => setShowSlotForm(false)} className="btn btn-primary" style={{ flex: 1 }}>
                <Check size={16}/> {t('Done', 'हो गया')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Form Modal ────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowSlotForm(false)}>
      <div className="modal-box" style={{ maxWidth: '520px' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a3a2a, #2d6a4f)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 800 }}>
              🌾 {t('Book Procurement Slot', 'खरीद स्लॉट बुक करें')}
            </h2>
            <p style={{ color: '#95d5b2', fontSize: '13px', marginTop: '2px' }}>
              {t(STEPS[step].en, STEPS[step].hi)}
            </p>
          </div>
          <button onClick={() => setShowSlotForm(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px', color: '#fff', cursor: 'pointer' }}>
            <X size={16}/>
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ padding: '16px 24px', background: '#f0faf4', borderBottom: '1px solid #d8f3dc' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: 32, height: 32,
                  borderRadius: '50%',
                  background: i < step ? '#10b981' : i === step ? '#2d6a4f' : '#d8f3dc',
                  color: i <= step ? '#fff' : '#7a9b7f',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                }}>
                  {i < step ? <Check size={14}/> : i + 1}
                </div>
                <span style={{ fontSize: '9px', color: i === step ? '#2d6a4f' : '#7a9b7f', fontWeight: i === step ? 700 : 400, textAlign: 'center' }}>
                  {language === 'hi' ? s.hi : s.en}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div style={{ padding: '24px' }}>
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">👤 {t('Full Name', 'पूरा नाम')}</label>
                <input
                  className="form-input"
                  value={form.farmer_name}
                  onChange={e => update('farmer_name', e.target.value)}
                  placeholder={t('e.g. Ramesh Kumar', 'जैसे: रमेश कुमार')}
                />
              </div>
              <div className="form-group">
                <label className="form-label">📱 {t('Mobile Number', 'मोबाइल नंबर')}</label>
                <input
                  className="form-input"
                  type="tel"
                  maxLength={10}
                  value={form.phone}
                  onChange={e => update('phone', e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                />
              </div>
              <div className="form-group">
                <label className="form-label"><MapPin size={14}/> {t('Procurement Centre', 'खरीद केंद्र')}</label>
                <select
                  className="form-select"
                  value={form.center_location}
                  onChange={e => update('center_location', e.target.value)}
                >
                  <option value="">{t('-- Select Centre --', '-- केंद्र चुनें --')}</option>
                  {CENTRES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {CROPS.map(crop => (
                <button
                  key={crop.value}
                  onClick={() => update('crop', crop.value)}
                  style={{
                    padding: '16px',
                    border: `2px solid ${form.crop === crop.value ? '#2d6a4f' : '#d8f3dc'}`,
                    borderRadius: '16px',
                    background: form.crop === crop.value
                      ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
                      : '#fff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    transform: form.crop === crop.value ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '6px' }}>{crop.emoji}</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a3a2a' }}>
                    {language === 'hi' ? crop.label_hi : crop.label_en}
                  </div>
                  {form.crop === crop.value && (
                    <div style={{ marginTop: '4px', color: '#2d6a4f', fontWeight: 700, fontSize: '12px' }}>
                      ✓ {t('Selected', 'चुना')}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label"><Scale size={14}/> {t('Quantity (Quintals)', 'मात्रा (क्विंटल)')}</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  max="500"
                  value={form.quantity}
                  onChange={e => update('quantity', e.target.value)}
                  placeholder={t('e.g. 50 quintals', 'जैसे: 50 क्विंटल')}
                />
              </div>
              <div className="form-group">
                <label className="form-label"><Calendar size={14}/> {t('Target Date', 'लक्षित तारीख')}</label>
                <input
                  className="form-input"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.target_date}
                  onChange={e => update('target_date', e.target.value)}
                />
              </div>
              {/* Summary card */}
              {form.crop && (
                <div style={{ background: '#f0faf4', borderRadius: '12px', padding: '16px', border: '1px solid #b7e4c7' }}>
                  <div style={{ fontSize: '12px', color: '#4a6741', fontWeight: 700, marginBottom: '8px' }}>
                    {t('BOOKING SUMMARY', 'बुकिंग सारांश')}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#1a2e1e' }}>
                    <span>🌾 {form.crop}</span>
                    <span>📍 {form.center_location}</span>
                    {form.quantity && <span>⚖️ {form.quantity} qtl</span>}
                    {form.target_date && <span>📅 {form.target_date}</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div style={{ background: '#f0faf4', borderRadius: '16px', padding: '20px', border: '1px solid #b7e4c7' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a3a2a', marginBottom: '16px' }}>
                {t('✅ Confirm Your Booking', '✅ बुकिंग की पुष्टि करें')}
              </div>
              {[
                [t('Farmer', 'किसान'), form.farmer_name],
                [t('Phone', 'फोन'), form.phone],
                [t('Centre', 'केंद्र'), form.center_location],
                [t('Crop', 'फसल'), form.crop],
                [t('Quantity', 'मात्रा'), `${form.quantity} Quintals`],
                [t('Date', 'तारीख'), form.target_date],
              ].map(([label, val]) => (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid #d8f3dc',
                  fontSize: '14px',
                }}>
                  <span style={{ color: '#4a6741', fontWeight: 600 }}>{label}</span>
                  <span style={{ color: '#1a2e1e', fontWeight: 700, textAlign: 'right', maxWidth: '55%' }}>{val}</span>
                </div>
              ))}
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#4a6741', background: '#fff', borderRadius: '8px', padding: '10px' }}>
                📱 {t(`An SMS confirmation will be sent to ${form.phone}`, `${form.phone} पर SMS पुष्टि भेजी जाएगी`)}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ padding: '0 24px 24px', display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : setShowSlotForm(false)}
            className="btn btn-outline"
          >
            <ChevronLeft size={16}/>
            {step === 0 ? t('Cancel', 'रद्द करें') : t('Back', 'वापस')}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {t('Next', 'आगे')} <ChevronRight size={16}/>
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading}
              className="btn btn-accent"
              style={{ flex: 1 }}
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin"/> {t('Booking…', 'बुक हो रहा है…')}</>
                : <><Check size={16}/> {t('Confirm Booking', 'बुकिंग कन्फर्म करें')}</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
