// =============================================================================
// src/components/RegisterFarmerModal.jsx
// New farmer self-registration with Aadhaar number
// =============================================================================

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import OtpVerifyModal from './OtpVerifyModal';
import { X, User, Phone, Lock, MapPin, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';

const STATES = ['Uttar Pradesh', 'Maharashtra', 'Bihar', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Andhra Pradesh', 'Telangana', 'Karnataka', 'Punjab', 'Haryana', 'Other'];

export default function RegisterFarmerModal({ onClose, onSuccess }) {
  const { t, language } = useApp();
  const [form, setForm] = useState({
    full_name: '', aadhaar: '', phone: '',
    password: '', confirm: '', village: '', district: '',
    state: 'Uttar Pradesh',
  });
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);
  const [showOtp,   setShowOtp]   = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError(''); }

  function formatAadhaar(val) {
    // allow only digits, max 12
    return val.replace(/\D/g, '').slice(0, 12);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm)
      return setError('Passwords do not match.');
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters.');
    if (form.aadhaar.length !== 12)
      return setError('Aadhaar must be exactly 12 digits.');
    if (form.phone.length !== 10)
      return setError('Phone must be exactly 10 digits.');

    setLoading(true);
    try {
      const res = await api.register({
        full_name: form.full_name.trim(),
        aadhaar:   form.aadhaar,
        phone:     form.phone,
        password:  form.password,
        village:   form.village,
        district:  form.district,
        state:     form.state,
      });
      if (res.success) {
        // Send OTP for phone verification
        try {
          await api.sendOtp(form.phone, 'register', form.aadhaar);
        } catch (_) { /* OTP send failure is non-fatal */ }
        setSuccess(true);
        setShowOtp(true);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
      backdropFilter: 'blur(6px)',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: '520px',
        background: 'linear-gradient(160deg, #0d2117, #1a3a2a)',
        border: '1px solid rgba(82,183,136,0.25)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        animation: 'fadeIn 0.25s ease both',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2d6a4f, #52b788)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '24px' }}>🌾</div>
            <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, margin: '4px 0 2px' }}>
              {t('Register as Farmer', 'किसान के रूप में पंजीकरण', 'शेतकरी म्हणून नोंदणी', 'రైతుగా నమోదు')}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
              {t('Use your Aadhaar number to login after registration',
                 'पंजीकरण के बाद आधार नंबर से लॉगिन करें',
                 'नोंदणीनंतर आधार नंबरने लॉगिन करा',
                 'నమోదు తర్వాత ఆధార్ నంబర్‌తో లాగిన్ చేయండి')}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', width: 36, height: 36, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18}/>
          </button>
        </div>

        {/* Success State — show OTP prompt */}
        {success ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📱</div>
            <h3 style={{ color: '#95d5b2', fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
              {t('Registration Done! Verify Phone', 'पंजीकरण हुआ! फोन सत्यापित करें', 'नोंदणी झाली! फोन तपासा', 'నమోదు అయింది! ఫోన్ నిర్ధారించు')}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
              OTP sent to +91 ****{form.phone.slice(-4)}
            </p>
            <div style={{ marginTop: '14px', background: 'rgba(82,183,136,0.15)', border: '1px solid #52b788', borderRadius: '12px', padding: '10px 14px', fontFamily: 'monospace', color: '#95d5b2', fontSize: '15px', fontWeight: 800 }}>
              🪪 {form.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '65vh', overflowY: 'auto' }}>

            {/* Full Name */}
            <Field icon={<User size={14}/>} label={t('Full Name','पूरा नाम','पूर्ण नाव','పూర్తి పేరు')} required>
              <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Ramesh Kumar" required style={inputStyle}/>
            </Field>

            {/* Aadhaar */}
            <Field icon="🪪" label={t('Aadhaar Number (12 digits)','आधार नंबर (12 अंक)','आधार नंबर (12 अंक)','ఆధార్ నంబర్ (12 అంకెలు)')} required>
              <input
                value={form.aadhaar.replace(/(\d{4})(\d{4})?(\d{4})?/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '))}
                onChange={e => set('aadhaar', formatAadhaar(e.target.value))}
                placeholder="1234 5678 9012"
                maxLength={14}
                required
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '18px', letterSpacing: '0.1em' }}
              />
              <div style={{ color: form.aadhaar.length === 12 ? '#52b788' : 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '3px' }}>
                {form.aadhaar.length}/12 digits {form.aadhaar.length === 12 ? '✓' : ''}
              </div>
            </Field>

            {/* Phone */}
            <Field icon={<Phone size={14}/>} label={t('Mobile Number (10 digits)','मोबाइल नंबर (10 अंक)','मोबाइल नंबर (10 अंक)','మొబైల్ నంబర్ (10 అంకెలు)')} required>
              <input value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" maxLength={10} required style={{ ...inputStyle, fontFamily: 'monospace' }}/>
            </Field>

            {/* Location row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Field icon={<MapPin size={14}/>} label={t('Village','गाँव','गाव','గ్రామం')}>
                <input value={form.village} onChange={e => set('village', e.target.value)} placeholder="e.g. Rampur" style={inputStyle}/>
              </Field>
              <Field icon={<MapPin size={14}/>} label={t('District','जिला','जिल्हा','జిల్లా')}>
                <input value={form.district} onChange={e => set('district', e.target.value)} placeholder="e.g. Lucknow" style={inputStyle}/>
              </Field>
            </div>

            {/* State */}
            <Field icon="🗺️" label={t('State','राज्य','राज्य','రాష్ట్రం')}>
              <select value={form.state} onChange={e => set('state', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {STATES.map(s => <option key={s} value={s} style={{ background: '#1a3a2a' }}>{s}</option>)}
              </select>
            </Field>

            {/* Password */}
            <Field icon={<Lock size={14}/>} label={t('Create Password','पासवर्ड बनाएं','पासवर्ड तयार करा','పాస్‌వర్డ్ రూపొందించండి')} required>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 characters" required minLength={6} style={{ ...inputStyle, paddingRight: '38px' }}/>
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px' }}>
                  {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </Field>

            {/* Confirm Password */}
            <Field icon={<Lock size={14}/>} label={t('Confirm Password','पासवर्ड दोबारा','पासवर्ड पुन्हा','పాస్‌వర్డ్ నిర్ధారించండి')} required>
              <input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Re-enter password" required style={{ ...inputStyle, borderColor: form.confirm && form.confirm !== form.password ? '#ef4444' : undefined }}/>
              {form.confirm && form.confirm !== form.password && (
                <div style={{ color: '#fca5a5', fontSize: '11px', marginTop: '2px' }}>⚠️ Passwords do not match</div>
              )}
            </Field>

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '10px', padding: '9px 13px', color: '#fca5a5', fontSize: '13px' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: '13px', border: 'none',
              background: 'linear-gradient(135deg, #2d6a4f, #52b788)',
              color: '#fff', fontSize: '15px', fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(45,106,79,0.4)',
            }}>
              {loading
                ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }}/> {t('Registering…','पंजीकरण हो रहा है…','नोंदणी होत आहे…','నమోదవుతోంది…')}</>
                : <><CheckCircle size={17}/> {t('Register Now','अभी पंजीकरण करें','आत्ता नोंदणी करा','ఇప్పుడే నమోదు చేయండి')}</>
              }
            </button>

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textAlign: 'center' }}>
              🔒 {t('Your Aadhaar is encrypted and never shared','आपका आधार एन्क्रिप्टेड है और कभी साझा नहीं किया जाता','तुमचा आधार एनक्रिप्टेड आहे','మీ ఆధార్ ఎన్‌క్రిప్ట్ చేయబడింది')}
            </p>

          </form>
        )}
      </div>
    </div>
    {showOtp && (
      <OtpVerifyModal
        phone={form.phone}
        purpose="register"
        aadhaar={form.aadhaar}
        title="Verify Your Phone"
        subtitle="Enter the OTP sent to your registered mobile"
        onClose={() => { setShowOtp(false); onSuccess(form.aadhaar); }}
        onSuccess={() => { setShowOtp(false); onSuccess(form.aadhaar); }}
      />
    )}
    </>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.07)',
  color: '#fff', fontSize: '14px',
  fontFamily: 'inherit', outline: 'none',
};

function Field({ icon, label, required, children }) {
  return (
    <div>
      <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
        <span>{icon}</span> {label} {required && <span style={{ color: '#f87171' }}>*</span>}
      </label>
      {children}
    </div>
  );
}
