// =============================================================================
// src/components/ForgotPasswordModal.jsx
// 3-step forgot password: Aadhaar+Phone → OTP → New Password
// =============================================================================

import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { X, Loader2, CheckCircle, Eye, EyeOff, Lock, ArrowLeft, KeyRound } from 'lucide-react';

export default function ForgotPasswordModal({ onClose, onSuccess }) {
  const { t } = useApp();

  const [step,       setStep]    = useState(1); // 1=aadhaar+phone, 2=OTP, 3=new password
  const [aadhaar,    setAadhaar] = useState('');
  const [phone,      setPhone]   = useState('');
  const [otp,        setOtp]     = useState(['', '', '', '', '', '']);
  const [newPwd,     setNewPwd]  = useState('');
  const [confirmPwd, setConfirm] = useState('');
  const [showPwd,    setShowPwd] = useState(false);
  const [loading,    setLoad]    = useState(false);
  const [error,      setError]   = useState('');
  const [success,    setSuccess] = useState(false);
  const [maskedPhone,setMasked]  = useState('');
  const [countdown,  setCount]   = useState(0);
  const [devOtp,     setDevOtp]  = useState('');
  const inputs = useRef([]);

  function formatAadhaar(v) { return v.replace(/\D/g,'').slice(0,12); }

  // ── STEP 1: Send OTP ────────────────────────────────────────────────────────
  async function sendOtp(e) {
    e.preventDefault();
    if (aadhaar.length !== 12) return setError('Enter valid 12-digit Aadhaar.');
    if (phone.length !== 10)   return setError('Enter valid 10-digit phone number.');
    setError(''); setLoad(true);
    try {
      const res = await api.forgotPassword(aadhaar, phone);
      setMasked(res.maskedPhone || `+91 ****${phone.slice(-4)}`);
      if (res.dev_otp) setDevOtp(res.dev_otp);
      setCount(60);
      setStep(2);
      startCountdown();
    } catch (err) { setError(err.message); }
    finally { setLoad(false); }
  }

  function startCountdown() {
    const interval = setInterval(() => {
      setCount(c => { if (c <= 1) { clearInterval(interval); return 0; } return c - 1; });
    }, 1000);
  }

  // OTP input handlers
  function handleOtpChange(i, val) {
    const digit = val.replace(/\D/g,'').slice(-1);
    const next = [...otp]; next[i] = digit; setOtp(next); setError('');
    if (digit && i < 5) inputs.current[i+1]?.focus();
    if (digit && i === 5 && next.every(d=>d)) setTimeout(() => verifyOtpStep(next.join('')), 100);
  }
  function handleOtpKey(i, e) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i-1]?.focus();
  }
  function handlePaste(e) {
    const p = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (p.length===6) { setOtp(p.split('')); inputs.current[5]?.focus(); setTimeout(() => verifyOtpStep(p), 100); }
    e.preventDefault();
  }

  // ── STEP 2: Verify OTP ─────────────────────────────────────────────────────
  async function verifyOtpStep(code) {
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) return setError('Enter all 6 digits.');
    setError(''); setLoad(true);
    try {
      await api.verifyOtp(phone, otpCode, 'forgot_password');
      setStep(3);
    } catch (err) {
      setError(err.message);
      setOtp(['','','','','','']);
      inputs.current[0]?.focus();
    } finally { setLoad(false); }
  }

  async function resendOtp() {
    if (countdown > 0) return;
    setLoad(true); setError('');
    try {
      const res = await api.forgotPassword(aadhaar, phone);
      if (res.dev_otp) setDevOtp(res.dev_otp);
      setCount(60); startCountdown();
      setOtp(['','','','','','']);
      inputs.current[0]?.focus();
    } catch (err) { setError(err.message); }
    finally { setLoad(false); }
  }

  // ── STEP 3: Set New Password ────────────────────────────────────────────────
  async function resetPassword(e) {
    e.preventDefault();
    if (newPwd.length < 6)    return setError('Password must be at least 6 characters.');
    if (newPwd !== confirmPwd) return setError('Passwords do not match.');
    setError(''); setLoad(true);
    try {
      await api.resetPassword(aadhaar, phone, otp.join(''), newPwd);
      setSuccess(true);
      setTimeout(() => onSuccess(), 2500);
    } catch (err) { setError(err.message); }
    finally { setLoad(false); }
  }

  const STEPS = [
    t('Aadhaar & Phone','आधार और फोन','आधार आणि फोन','ఆధార్ మరియు ఫోన్'),
    t('Enter OTP','OTP दर्ज करें','OTP टाका','OTP నమోదు'),
    t('New Password','नया पासवर्ड','नवीन पासवर्ड','నూతన పాస్‌వర్డ్'),
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      background: 'rgba(0,0,0,0.82)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', backdropFilter: 'blur(8px)',
    }} onClick={e => { if (e.target === e.currentTarget && !loading) onClose(); }}>

      <div style={{
        width: '100%', maxWidth: '440px',
        background: 'linear-gradient(160deg, #0d2117, #1a3a2a)',
        border: '1px solid rgba(82,183,136,0.25)',
        borderRadius: '24px', overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        animation: 'fadeIn 0.2s ease both',
      }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1a3a2a, #2d6a4f)', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {step > 1 && !success && (
              <button onClick={() => { setStep(s => s-1); setError(''); }} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', width: 30, height: 30, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={14}/>
              </button>
            )}
            <div>
              <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, margin: 0 }}>
                <KeyRound size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}/>
                {t('Forgot Password','पासवर्ड भूल गए','पासवर्ड विसरलात','పాస్‌వర్డ్ మర్చిపోయారా')}
              </h2>
              {!success && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', margin: '2px 0 0' }}>Step {step} of 3 — {STEPS[step-1]}</p>}
            </div>
          </div>
          <button onClick={onClose} disabled={loading} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '10px', width: 32, height: 32, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15}/>
          </button>
        </div>

        {/* Step dots */}
        {!success && (
          <div style={{ display: 'flex', gap: '6px', padding: '10px 22px 0', justifyContent: 'center' }}>
            {[1,2,3].map(s => (
              <div key={s} style={{ height: 4, flex: 1, borderRadius: 4, background: s <= step ? '#52b788' : 'rgba(255,255,255,0.15)', transition: 'background 0.3s ease' }}/>
            ))}
          </div>
        )}

        <div style={{ padding: '22px' }}>

          {/* SUCCESS */}
          {success ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '56px', marginBottom: '12px' }}>🔓</div>
              <h3 style={{ color: '#95d5b2', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
                {t('Password Reset!','पासवर्ड रीसेट!','पासवर्ड रीसेट!','పాస్‌వర్డ్ రీసెట్!')}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                {t('Your password has been updated. Login with your new password.',
                   'आपका पासवर्ड अपडेट हो गया। नए पासवर्ड से लॉगिन करें।',
                   'तुमचा पासवर्ड अपडेट झाला. नव्या पासवर्डने लॉगिन करा.',
                   'మీ పాస్‌వర్డ్ అప్‌డేట్ అయింది. కొత్త పాస్‌వర్డ్‌తో లాగిన్ చేయండి.')}
              </p>
            </div>
          ) : step === 1 ? (
            /* ── STEP 1 ── */
            <form onSubmit={sendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>
                {t('Enter your registered Aadhaar number and phone to receive a reset OTP.',
                   'रीसेट OTP पाने के लिए अपना आधार नंबर और फोन दर्ज करें।',
                   'रीसेट OTP मिळवण्यासाठी तुमचा आधार नंबर आणि फोन टाका.',
                   'రీసెట్ OTP కోసం మీ ఆధార్ మరియు ఫోన్ నమోదు చేయండి.')}
              </p>

              <div>
                <label style={labelStyle}>🪪 {t('Aadhaar Number','आधार नंबर','आधार नंबर','ఆధార్ నంబర్')}</label>
                <input value={aadhaar.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_,a,b,c) => [a,b,c].filter(Boolean).join(' '))}
                  onChange={e => { setAadhaar(formatAadhaar(e.target.value)); setError(''); }}
                  placeholder="1234 5678 9012" inputMode="numeric" maxLength={14} required
                  style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '18px', letterSpacing: '0.1em' }}/>
                <div style={{ color: aadhaar.length===12 ? '#52b788' : 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '2px' }}>{aadhaar.length}/12 {aadhaar.length===12 && '✓'}</div>
              </div>

              <div>
                <label style={labelStyle}>📱 {t('Registered Phone','पंजीकृत फोन','नोंदणीकृत फोन','నమోదిత ఫోన్')}</label>
                <input value={phone} onChange={e => { setPhone(e.target.value.replace(/\D/g,'').slice(0,10)); setError(''); }}
                  placeholder="9876543210" inputMode="numeric" maxLength={10} required
                  style={{ ...inputStyle, fontFamily: 'monospace' }}/>
              </div>

              {error && <ErrorBox msg={error}/>}

              <button type="submit" disabled={loading || aadhaar.length!==12 || phone.length!==10}
                style={btnStyle(loading || aadhaar.length!==12 || phone.length!==10, 'green')}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }}/> {t('Sending OTP…','OTP भेजा जा रहा है…','OTP पाठवत आहे…','OTP పంపుతోంది…')}</> : <>{t('Send Reset OTP →','रीसेट OTP भेजें →','रीसेट OTP पाठवा →','రీసెట్ OTP పంపు →')}</>}
              </button>
            </form>

          ) : step === 2 ? (
            /* ── STEP 2 ── */
            <div>
              <div style={{ background: 'rgba(82,183,136,0.1)', border: '1px solid rgba(82,183,136,0.2)', borderRadius: '12px', padding: '10px 14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '18px' }}>📱</span>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>OTP sent to</div>
                  <div style={{ color: '#95d5b2', fontWeight: 700, fontFamily: 'monospace' }}>{maskedPhone}</div>
                </div>
              </div>

              {devOtp && <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', padding: '8px 14px', marginBottom: '14px', fontSize: '12px', color: '#fbbf24', textAlign: 'center' }}>🧪 Dev OTP: <strong>{devOtp}</strong></div>}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '18px' }}>
                {otp.map((d, i) => (
                  <input key={i} ref={el => inputs.current[i]=el} type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)} onPaste={handlePaste}
                    style={{ width: 46, height: 54, textAlign: 'center', fontSize: '22px', fontWeight: 800, fontFamily: 'monospace', border: `2px solid ${error ? '#ef4444' : d ? '#52b788' : 'rgba(255,255,255,0.2)'}`, borderRadius: '12px', background: d ? 'rgba(82,183,136,0.15)' : 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none' }}
                    onFocus={e => { e.target.style.borderColor='#52b788'; e.target.style.boxShadow='0 0 0 3px rgba(82,183,136,0.2)'; }}
                    onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : d ? '#52b788' : 'rgba(255,255,255,0.2)'; e.target.style.boxShadow='none'; }}
                  />
                ))}
              </div>

              {error && <ErrorBox msg={error}/>}

              <button onClick={() => verifyOtpStep()} disabled={loading || otp.some(d=>!d)} style={{ ...btnStyle(loading || otp.some(d=>!d), 'green'), marginTop: '4px' }}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }}/> Verifying…</> : <><CheckCircle size={16}/> {t('Verify OTP','OTP सत्यापित करें','OTP तपासा','OTP ధృవీకరించు')}</>}
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                {countdown > 0
                  ? <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Resend in <strong style={{ color: '#95d5b2' }}>{countdown}s</strong></span>
                  : <button onClick={resendOtp} disabled={loading} style={{ background: 'none', border: 'none', color: '#52b788', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>↻ Resend OTP</button>
                }
              </div>
            </div>

          ) : (
            /* ── STEP 3 ── */
            <form onSubmit={resetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>
                {t('Create a strong new password for your account.',
                   'अपने अकाउंट के लिए एक मजबूत नया पासवर्ड बनाएं।',
                   'तुमच्या अकाउंटसाठी एक मजबूत नवीन पासवर्ड तयार करा.',
                   'మీ ఖాతాకు కొత్త బలమైన పాస్‌వర్డ్ రూపొందించండి.')}
              </p>

              <div>
                <label style={labelStyle}><Lock size={12}/> {t('New Password','नया पासवर्ड','नवीन पासवर्ड','నూతన పాస్‌వర్డ్')}</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPwd?'text':'password'} value={newPwd} onChange={e => { setNewPwd(e.target.value); setError(''); }} required minLength={6}
                    placeholder={t('Min 6 characters','कम से कम 6 अक्षर','किमान 6 अक्षरे','కనీసం 6 అక్షరాలు')}
                    style={{ ...inputStyle, paddingRight: '40px' }}/>
                  <button type="button" onClick={() => setShowPwd(v=>!v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px' }}>
                    {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
                {/* Strength indicator */}
                {newPwd && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                    {[6, 8, 10].map((len, i) => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: newPwd.length >= len ? ['#ef4444','#fbbf24','#52b788'][i] : 'rgba(255,255,255,0.1)', transition: 'background 0.2s' }}/>
                    ))}
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginLeft: '6px' }}>{newPwd.length < 6 ? 'Weak' : newPwd.length < 8 ? 'Fair' : newPwd.length < 10 ? 'Good' : 'Strong'}</span>
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}><Lock size={12}/> {t('Confirm Password','पासवर्ड दोबारा','पासवर्ड पुन्हा','పాస్‌వర్డ్ నిర్ధారించు')}</label>
                <input type="password" value={confirmPwd} onChange={e => { setConfirm(e.target.value); setError(''); }} required
                  placeholder={t('Re-enter password','पासवर्ड फिर से दर्ज करें','पासवर्ड पुन्हा टाका','పాస్‌వర్డ్ మళ్ళీ నమోదు')}
                  style={{ ...inputStyle, borderColor: confirmPwd && confirmPwd!==newPwd ? '#ef4444' : undefined }}/>
                {confirmPwd && confirmPwd !== newPwd && <div style={{ color: '#fca5a5', fontSize: '11px', marginTop: '2px' }}>⚠️ Passwords don't match</div>}
              </div>

              {error && <ErrorBox msg={error}/>}

              <button type="submit" disabled={loading || !newPwd || !confirmPwd} style={btnStyle(loading || !newPwd || !confirmPwd, 'green')}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }}/> Updating…</> : <><CheckCircle size={16}/> {t('Reset Password','पासवर्ड रीसेट करें','पासवर्ड रीसेट करा','పాస్‌వర్డ్ రీసెట్ చేయండి')}</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Shared styles
const labelStyle = { color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' };
const inputStyle  = { width: '100%', padding: '11px 12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '14px', fontFamily: 'inherit', outline: 'none' };
const btnStyle = (disabled, color) => ({
  width: '100%', padding: '13px', borderRadius: '13px', border: 'none',
  background: disabled ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #2d6a4f, #52b788)',
  color: '#fff', fontSize: '14px', fontWeight: 800,
  cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  fontFamily: 'inherit',
  boxShadow: disabled ? 'none' : '0 4px 16px rgba(45,106,79,0.4)',
  transition: 'all 0.2s ease',
});

function ErrorBox({ msg }) {
  return (
    <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '10px', padding: '9px 14px', color: '#fca5a5', fontSize: '13px', textAlign: 'center' }}>
      ⚠️ {msg}
    </div>
  );
}
