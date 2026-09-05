// =============================================================================
// src/components/OtpVerifyModal.jsx
// 6-digit OTP verification with countdown, resend, and auto-submit
// Used after farmer registration and for reverification
// =============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { X, Loader2, CheckCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export default function OtpVerifyModal({ phone, purpose = 'register', aadhaar, onSuccess, onClose, title, subtitle }) {
  const { t } = useApp();
  const [otp,       setOtp]     = useState(['', '', '', '', '', '']);
  const [loading,   setLoading] = useState(false);
  const [sending,   setSending] = useState(false);
  const [error,     setError]   = useState('');
  const [success,   setSuccess] = useState(false);
  const [countdown, setCount]   = useState(60);
  const [devOtp,    setDevOtp]  = useState('');  // shows OTP in dev mode
  const inputs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Auto-focus first input
  useEffect(() => { inputs.current[0]?.focus(); }, []);

  const handleChange = useCallback((i, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    setError('');
    // Auto-advance
    if (digit && i < 5) inputs.current[i + 1]?.focus();
    // Auto-submit when all 6 filled
    if (digit && i === 5 && next.every(d => d)) {
      setTimeout(() => submit(next.join('')), 100);
    }
  }, [otp]);

  const handleKeyDown = useCallback((i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }, [otp]);

  const handlePaste = useCallback((e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const arr = pasted.split('');
      setOtp(arr);
      inputs.current[5]?.focus();
      setTimeout(() => submit(pasted), 100);
    }
    e.preventDefault();
  }, []);

  async function submit(otpStr) {
    const code = otpStr || otp.join('');
    if (code.length !== 6) return setError('Please enter all 6 digits.');
    setLoading(true); setError('');
    try {
      await api.verifyOtp(phone, code, purpose);
      setSuccess(true);
      setTimeout(() => onSuccess(), 1200);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally { setLoading(false); }
  }

  async function resend() {
    setSending(true); setError(''); setOtp(['', '', '', '', '', '']);
    try {
      const res = await api.sendOtp(phone, purpose, aadhaar);
      setCount(60);
      if (res.dev_otp) setDevOtp(res.dev_otp);
    } catch (err) { setError(err.message); }
    finally { setSending(false); inputs.current[0]?.focus(); }
  }

  const maskedPhone = phone ? `+91 ****${phone.slice(-4)}` : '';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      background: 'rgba(0,0,0,0.8)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '16px', backdropFilter: 'blur(8px)',
    }} onClick={e => { if (e.target === e.currentTarget && !loading) onClose(); }}>

      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'linear-gradient(160deg, #0d2117, #1a3a2a)',
        border: '1px solid rgba(82,183,136,0.3)',
        borderRadius: '24px', overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        animation: 'fadeIn 0.2s ease both',
      }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #2d6a4f, #52b788)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} color="#fff"/>
            </div>
            <div>
              <h2 style={{ color: '#fff', fontSize: '17px', fontWeight: 800, margin: 0 }}>
                {title || t('OTP Verification', 'OTP सत्यापन', 'OTP पडताळणी', 'OTP ధృవీకరణ')}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', margin: '2px 0 0' }}>
                {subtitle || t('Enter the 6-digit code', '6 अंकों का कोड दर्ज करें', '6 अंकी कोड टाका', '6 అంకెల కోడ్ నమోదు చేయండి')}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={loading} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', width: 34, height: 34, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16}/>
          </button>
        </div>

        <div style={{ padding: '28px 24px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '56px', marginBottom: '12px' }}>✅</div>
              <div style={{ color: '#95d5b2', fontSize: '18px', fontWeight: 800 }}>
                {t('Verified!', 'सत्यापित!', 'पडताळणी यशस्वी!', 'ధృవీకరించబడింది!')}
              </div>
            </div>
          ) : (
            <>
              {/* Phone info */}
              <div style={{ background: 'rgba(82,183,136,0.1)', border: '1px solid rgba(82,183,136,0.25)', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>📱</span>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                    {t('OTP sent to', 'OTP भेजा गया', 'OTP पाठवला', 'OTP పంపబడింది')}
                  </div>
                  <div style={{ color: '#95d5b2', fontWeight: 700, fontSize: '15px', fontFamily: 'monospace' }}>
                    {maskedPhone}
                  </div>
                </div>
              </div>

              {/* Dev OTP hint */}
              {devOtp && (
                <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', padding: '8px 14px', marginBottom: '16px', fontSize: '12px', color: '#fbbf24', textAlign: 'center' }}>
                  🧪 <strong>Dev Mode OTP:</strong> {devOtp}
                </div>
              )}

              {/* 6-digit OTP inputs */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    disabled={loading || success}
                    style={{
                      width: 48, height: 56,
                      textAlign: 'center',
                      fontSize: '24px', fontWeight: 800, fontFamily: 'monospace',
                      border: `2px solid ${error ? '#ef4444' : digit ? '#52b788' : 'rgba(255,255,255,0.2)'}`,
                      borderRadius: '12px',
                      background: digit ? 'rgba(82,183,136,0.15)' : 'rgba(255,255,255,0.06)',
                      color: '#fff', outline: 'none',
                      transition: 'all 0.15s ease',
                      caretColor: '#52b788',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#52b788'; e.target.style.boxShadow = '0 0 0 3px rgba(82,183,136,0.2)'; }}
                    onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : digit ? '#52b788' : 'rgba(255,255,255,0.2)'; e.target.style.boxShadow = 'none'; }}
                  />
                ))}
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '10px', padding: '9px 14px', color: '#fca5a5', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Verify button */}
              <button
                onClick={() => submit()}
                disabled={loading || otp.some(d => !d)}
                style={{
                  width: '100%', padding: '13px', borderRadius: '13px', border: 'none',
                  background: (loading || otp.some(d => !d)) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #2d6a4f, #52b788)',
                  color: '#fff', fontSize: '15px', fontWeight: 800,
                  cursor: (loading || otp.some(d => !d)) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontFamily: 'inherit', marginBottom: '14px',
                  boxShadow: otp.every(d => d) ? '0 4px 20px rgba(45,106,79,0.4)' : 'none',
                }}
              >
                {loading
                  ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }}/> {t('Verifying…','जाँच हो रही है…','तपासत आहे…','ధృవీకరిస్తోంది…')}</>
                  : <><CheckCircle size={17}/> {t('Verify OTP','OTP सत्यापित करें','OTP तपासा','OTP ధృవీకరించండి')}</>
                }
              </button>

              {/* Resend */}
              <div style={{ textAlign: 'center' }}>
                {countdown > 0 ? (
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                    {t('Resend in','फिर भेजें','पुन्हा पाठवा','మళ్ళీ పంపు')} <strong style={{ color: '#95d5b2' }}>{countdown}s</strong>
                  </span>
                ) : (
                  <button onClick={resend} disabled={sending} style={{ background: 'none', border: 'none', color: '#52b788', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'inherit' }}>
                    {sending ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }}/> : <RefreshCw size={13}/>}
                    {t('Resend OTP','OTP दोबारा भेजें','OTP पुन्हा पाठवा','OTP మళ్ళీ పంపు')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
