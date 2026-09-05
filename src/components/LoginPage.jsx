// =============================================================================
// src/components/LoginPage.jsx
// Admin: username login | Farmer: 12-digit Aadhaar login + Register button
// =============================================================================

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import RegisterFarmerModal from './RegisterFarmerModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import { Eye, EyeOff, Loader2, LogIn, Lock, User, UserPlus, RefreshCw, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const { login, setPage, language, t } = useApp();

  const [tab,          setTab]       = useState('farmer');
  const [admins,       setAdmins]    = useState([]);
  const [farmers,      setFarmers]   = useState([]);
  const [loadingUsers, setLoading2]  = useState(true);
  const [selectedAdmin,setAdmin]     = useState(null);

  // Farmer Aadhaar login fields
  const [aadhaar,   setAadhaar]   = useState('');
  const [password,  setPassword]  = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [showReg,   setShowReg]   = useState(false);
  const [showForgot,setForgot]    = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading2(true);
    try {
      const res = await api.getUsers();
      setAdmins(res.admins || []);
      setFarmers(res.farmers || []);
    } catch { /* use empty lists */ }
    finally { setLoading2(false); }
  }

  // ── Admin login ────────────────────────────────────────────────────────────
  async function handleAdminLogin(e) {
    e.preventDefault();
    if (!selectedAdmin || !password) return;
    setError(''); setLoading(true);
    try {
      const session = await login(selectedAdmin.username, password);
      setPage('admin');
    } catch (err) { setError(err.message || 'Invalid credentials.'); }
    finally { setLoading(false); }
  }

  // ── Farmer Aadhaar login ───────────────────────────────────────────────────
  async function handleFarmerLogin(e) {
    e.preventDefault();
    const clean = aadhaar.replace(/\s/g, '');
    if (!/^\d{12}$/.test(clean)) return setError('Please enter your valid 12-digit Aadhaar number.');
    if (!password) return setError('Please enter your password.');
    setError(''); setLoading(true);
    try {
      const session = await login(clean, password);
      setPage('farmer');
    } catch (err) { setError(err.message || 'Invalid Aadhaar or password.'); }
    finally { setLoading(false); }
  }

  function formatAadhaarDisplay(val) {
    const d = val.replace(/\D/g, '').slice(0, 12);
    return d.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '));
  }

  const PERM_ICONS = { queue:'🔄', crop:'🌾', quality:'🔍', invoice:'📄', payment:'💰', db:'🗄️', users:'👥', register:'✅' };

  return (
    <>
    <div style={{
      minHeight: 'calc(100vh - 108px)',
      background: 'linear-gradient(160deg, #0d2117 0%, #1a3a2a 50%, #2d6a4f 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', overflow: 'hidden', position: 'relative',
    }}>
      {/* Rings */}
      {[160,280,400].map((s,i) => (
        <div key={i} style={{ position:'absolute', width:s, height:s, borderRadius:'50%', border:'1px solid rgba(82,183,136,0.07)', top:`${15+i*18}%`, left:`${3+i*2}%`, animation:`pulse ${4+i}s infinite`, pointerEvents:'none' }}/>
      ))}

      <div style={{ width:'100%', maxWidth:'960px', position:'relative', zIndex:1 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <div style={{ width:60, height:60, borderRadius:'16px', background:'linear-gradient(135deg,#2d6a4f,#52b788)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', margin:'0 auto 10px', boxShadow:'0 8px 32px rgba(45,106,79,0.5)' }}>🌾</div>
          <h1 style={{ color:'#fff', fontSize:'clamp(20px,3vw,30px)', fontWeight:900, marginBottom:'4px' }}>
            {t('DoCA Kisan Portal','DoCA किसान पोर्टल','DoCA शेतकरी पोर्टल','DoCA కిసాన్ పోర్టల్')}
          </h1>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'12px' }}>SIH 2026 | Problem Statement ID: 26032</p>
        </div>

        {/* Tab */}
        <div style={{ display:'flex', gap:'10px', marginBottom:'16px', maxWidth:'500px', margin:'0 auto 20px' }}>
          {[
            { key:'farmer', icon:'👨‍🌾', label: t('Farmer Login','किसान लॉगिन','शेतकरी लॉगिन','రైతు లాగిన్') },
            { key:'admin',  icon:'🛡️',  label: t('Admin Login','एडमिन लॉगिन','प्रशासक लॉगिन','అడ్మిన్ లాగిన్') },
          ].map(({key,icon,label}) => (
            <button key={key} onClick={() => { setTab(key); setError(''); setPassword(''); setAdmin(null); }} style={{
              flex:1, padding:'12px', borderRadius:'14px', border:'none',
              background: tab===key
                ? (key==='admin' ? 'linear-gradient(135deg,#92400e,#d97706)' : 'linear-gradient(135deg,#1a3a2a,#2d6a4f)')
                : 'rgba(255,255,255,0.07)',
              color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer',
              transition:'all 0.2s ease', boxShadow: tab===key ? '0 4px 16px rgba(0,0,0,0.25)' : 'none',
              fontFamily:'inherit',
            }}>{icon} {label}</button>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns: tab==='admin' ? '1fr 360px' : '1fr', gap:'20px', maxWidth: tab==='admin' ? '960px' : '480px', margin:'0 auto' }}>

          {/* ── ADMIN: user picker ──────────────────────────────────────────── */}
          {tab === 'admin' && (
            <div style={{ background:'rgba(255,255,255,0.07)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.13)', borderRadius:'20px', padding:'18px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  {t('Select Admin Account','एडमिन अकाउंट चुनें','प्रशासक अकाउंट निवडा','అడ్మిన్ అకౌంట్ ఎంచుకోండి')}
                </span>
                <button onClick={fetchUsers} style={{ background:'none', border:'none', color:'#52b788', cursor:'pointer', padding:'4px' }}><RefreshCw size={13}/></button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'340px', overflowY:'auto' }}>
                {admins.map(a => {
                  const sel = selectedAdmin?.username === a.username;
                  return (
                    <div key={a.username} onClick={() => { setAdmin(a); setPassword(''); setError(''); }}
                      style={{ padding:'12px 14px', borderRadius:'12px', border:`2px solid ${sel ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`, background: sel ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)', cursor:'pointer', transition:'all 0.18s ease', display:'flex', alignItems:'center', gap:'12px' }}
                      onMouseOver={e => { if(!sel) e.currentTarget.style.background='rgba(255,255,255,0.09)'; }}
                      onMouseOut={e => { if(!sel) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                    >
                      <span style={{ fontSize:'24px', flexShrink:0 }}>{a.avatar}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ color:'#fff', fontWeight:700, fontSize:'13px' }}>{a.displayName}</div>
                        <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'10px', fontFamily:'monospace' }}>@{a.username}</div>
                        {/* Permission badges */}
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'3px', marginTop:'5px' }}>
                          {(a.permissions||[]).map(p => (
                            <span key={p} style={{ background:'rgba(251,191,36,0.15)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:'6px', padding:'1px 5px', fontSize:'10px', color:'#fbbf24' }}>
                              {PERM_ICONS[p]} {p}
                            </span>
                          ))}
                        </div>
                      </div>
                      {sel && <div style={{ width:18, height:18, borderRadius:'50%', background:'#fbbf24', color:'#000', fontSize:'11px', fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✓</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── RIGHT: Login Form ─────────────────────────────────────────────── */}
          <div style={{ background:'rgba(255,255,255,0.09)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:'22px', padding:'28px', boxShadow:'0 16px 60px rgba(0,0,0,0.3)' }}>

            {/* ── FARMER FORM: Aadhaar ──────────────────────────────────────── */}
            {tab === 'farmer' && (
              <>
                <div style={{ textAlign:'center', marginBottom:'20px' }}>
                  <div style={{ fontSize:'40px', marginBottom:'8px' }}>🪪</div>
                  <h2 style={{ color:'#fff', fontSize:'18px', fontWeight:800 }}>
                    {t('Farmer Login','किसान लॉगिन','शेतकरी लॉगिन','రైతు లాగిన్')}
                  </h2>
                  <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'12px', marginTop:'4px' }}>
                    {t('Login with your 12-digit Aadhaar number','12 अंकों के आधार नंबर से लॉगिन करें','12 अंकी आधार नंबरने लॉगिन करा','12 అంకెల ఆధార్ నంబర్‌తో లాగిన్ చేయండి')}
                  </p>
                </div>

                <form onSubmit={handleFarmerLogin} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  {/* Aadhaar input */}
                  <div>
                    <label style={{ color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:600, display:'flex', alignItems:'center', gap:'5px', marginBottom:'6px' }}>
                      🪪 {t('Aadhaar Number','आधार नंबर','आधार नंबर','ఆధార్ నంబర్')}
                    </label>
                    <input
                      value={formatAadhaarDisplay(aadhaar)}
                      onChange={e => { setAadhaar(e.target.value.replace(/\D/g,'').slice(0,12)); setError(''); }}
                      placeholder="1234 5678 9012"
                      inputMode="numeric"
                      maxLength={14}
                      required
                      style={{ width:'100%', padding:'13px 14px', border:`2px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.2)'}`, borderRadius:'12px', background:'rgba(255,255,255,0.08)', color:'#fff', fontSize:'20px', fontFamily:'monospace', letterSpacing:'0.15em', outline:'none' }}
                      onFocus={e => { e.target.style.borderColor='#52b788'; }}
                      onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : 'rgba(255,255,255,0.2)'; }}
                    />
                    <div style={{ color: aadhaar.length===12 ? '#52b788' : 'rgba(255,255,255,0.3)', fontSize:'11px', marginTop:'3px' }}>
                      {aadhaar.length}/12 {aadhaar.length===12 ? '✓ Valid' : 'digits'}
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label style={{ color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:600, display:'flex', alignItems:'center', gap:'5px', marginBottom:'6px' }}>
                      <Lock size={12}/> {t('Password','पासवर्ड','पासवर्ड','పాస్‌వర్డ్')}
                    </label>
                    <div style={{ position:'relative' }}>
                      <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder={t('Enter password…','पासवर्ड दर्ज करें…','पासवर्ड टाका…','పాస్‌వర్డ్ నమోదు చేయండి…')} required
                        style={{ width:'100%', padding:'12px 40px 12px 14px', border:`2px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.2)'}`, borderRadius:'12px', background:'rgba(255,255,255,0.08)', color:'#fff', fontSize:'15px', fontFamily:'monospace', outline:'none' }}
                        onFocus={e => { e.target.style.borderColor='#52b788'; }}
                        onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : 'rgba(255,255,255,0.2)'; }}
                      />
                      <button type="button" onClick={() => setShowPwd(v=>!v)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:'4px' }}>
                        {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                  </div>

                  {error && <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:'10px', padding:'9px 13px', color:'#fca5a5', fontSize:'13px' }}>⚠️ {error}</div>}

                  <button type="submit" disabled={loading || aadhaar.length!==12 || !password}
                    style={{ width:'100%', padding:'13px', borderRadius:'13px', border:'none', background: (loading||aadhaar.length!==12||!password) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#2d6a4f,#52b788)', color:'#fff', fontSize:'15px', fontWeight:800, cursor:(loading||aadhaar.length!==12||!password)?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontFamily:'inherit', boxShadow: aadhaar.length===12&&password ? '0 4px 20px rgba(45,106,79,0.4)' : 'none' }}>
                    {loading ? <><Loader2 size={17} style={{ animation:'spin 1s linear infinite' }}/> {t('Verifying…','जाँच हो रही है…','तपासत आहे…','ధృవీకరిస్తోంది…')}</> : <><LogIn size={17}/> {t('Login','लॉगिन करें','लॉगिन करा','లాగిన్')}</>}
                  </button>

                  {/* Register button */}
                  <button type="button" onClick={() => setShowReg(true)}
                    style={{ width:'100%', padding:'11px', borderRadius:'13px', border:'2px dashed rgba(82,183,136,0.4)', background:'rgba(82,183,136,0.07)', color:'#95d5b2', fontSize:'14px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontFamily:'inherit', transition:'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.background='rgba(82,183,136,0.15)'; }}
                    onMouseOut={e => { e.currentTarget.style.background='rgba(82,183,136,0.07)'; }}
                  >
                    <UserPlus size={16}/> {t('New Farmer? Register Here','नए किसान? यहाँ पंजीकरण करें','नवीन शेतकरी? येथे नोंदणी करा','కొత్త రైతు? ఇక్కడ నమోదు చేయండి')}
                  </button>

                  {/* Registered farmers list */}
                  {farmers.length > 0 && (
                    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'12px' }}>
                      <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px', fontWeight:700, marginBottom:'8px' }}>
                        👨‍🌾 {t('Registered Farmers','पंजीकृत किसान','नोंदणीकृत शेतकरी','నమోదైన రైతులు')} ({farmers.length})
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                        {farmers.map(f => (
                          <div key={f.username} onClick={() => { setAadhaar(f.username); setError(''); }}
                            style={{ padding:'4px 10px', background:'rgba(82,183,136,0.12)', border:'1px solid rgba(82,183,136,0.25)', borderRadius:'20px', cursor:'pointer', fontSize:'12px', color:'#95d5b2', fontWeight:600 }}>
                            {f.avatar} {f.displayName} <span style={{ opacity:0.5 }}>({f.aadhaarHint})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              </>
            )}

            {/* ── ADMIN FORM ────────────────────────────────────────────────── */}
            {tab === 'admin' && (
              <>
                <div style={{ textAlign:'center', marginBottom:'20px' }}>
                  <div style={{ fontSize:'40px', marginBottom:'8px' }}>{selectedAdmin?.avatar || '🛡️'}</div>
                  <h2 style={{ color:'#fff', fontSize:'18px', fontWeight:800 }}>
                    {selectedAdmin ? selectedAdmin.displayName : t('Select an Admin','एडमिन चुनें','प्रशासक निवडा','అడ్మిన్ ఎంచుకోండి')}
                  </h2>
                  {selectedAdmin && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', justifyContent:'center', marginTop:'8px' }}>
                      {(selectedAdmin.permissions||[]).map(p => (
                        <span key={p} style={{ background:'rgba(251,191,36,0.15)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:'8px', padding:'2px 8px', fontSize:'11px', color:'#fbbf24' }}>
                          {PERM_ICONS[p]} {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <form onSubmit={handleAdminLogin} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  <div>
                    <label style={{ color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:600, display:'flex', alignItems:'center', gap:'5px', marginBottom:'6px' }}>
                      <User size={12}/> {t('Username','यूज़रनेम','वापरकर्तानाव','యూజర్‌నేమ్')}
                    </label>
                    <input value={selectedAdmin?.username||''} readOnly placeholder={t('Select admin from left…','बाईं ओर से चुनें…','डाव्या बाजूने निवडा…','ఎడమ నుండి ఎంచుకోండి…')}
                      style={{ width:'100%', padding:'12px 14px', border:'2px solid rgba(255,255,255,0.15)', borderRadius:'12px', background:'rgba(255,255,255,0.05)', color: selectedAdmin ? '#fff' : 'rgba(255,255,255,0.3)', fontSize:'14px', fontFamily:'monospace', outline:'none', cursor:'default' }}
                    />
                  </div>
                  <div>
                    <label style={{ color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:600, display:'flex', alignItems:'center', gap:'5px', marginBottom:'6px' }}>
                      <Lock size={12}/> {t('Password','पासवर्ड','पासवर्ड','పాస్‌వర్డ్')}
                    </label>
                    <div style={{ position:'relative' }}>
                      <input type={showPwd?'text':'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }} disabled={!selectedAdmin} placeholder={t('Enter password…','पासवर्ड दर्ज करें…','पासवर्ड टाका…','పాస్‌వర్డ్ నమోదు చేయండి…')} required
                        style={{ width:'100%', padding:'12px 40px 12px 14px', border:`2px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.2)'}`, borderRadius:'12px', background: selectedAdmin ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', color:'#fff', fontSize:'15px', fontFamily:'monospace', outline:'none', cursor: selectedAdmin ? 'text' : 'not-allowed' }}
                        onFocus={e => { e.target.style.borderColor='#fbbf24'; }}
                        onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : 'rgba(255,255,255,0.2)'; }}
                      />
                      <button type="button" onClick={() => setShowPwd(v=>!v)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:'4px' }}>
                        {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                  </div>

                  {error && <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:'10px', padding:'9px 13px', color:'#fca5a5', fontSize:'13px' }}>⚠️ {error}</div>}

                  <button type="submit" disabled={loading||!selectedAdmin||!password}
                    style={{ width:'100%', padding:'13px', borderRadius:'13px', border:'none', background:(loading||!selectedAdmin||!password)?'rgba(255,255,255,0.1)':'linear-gradient(135deg,#92400e,#fbbf24)', color:'#fff', fontSize:'15px', fontWeight:800, cursor:(loading||!selectedAdmin||!password)?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontFamily:'inherit', boxShadow: selectedAdmin&&password ? '0 4px 20px rgba(146,64,14,0.4)' : 'none' }}>
                    {loading ? <><Loader2 size={17} style={{ animation:'spin 1s linear infinite' }}/> {t('Verifying…','जाँच हो रही है…','तपासत आहे…','ధృవీకరిస్తోంది…')}</> : <><LogIn size={17}/> {t('Admin Login','एडमिन लॉगिन','लॉगिन करा','లాగిన్')}</>}
                  </button>

                  {/* Quick credentials */}
                  <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'10px 12px', fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>
                    🔑 admin→Admin@2026 · supervisor→Super@2026 · inspector→Inspect@2026
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Registration Modal */}
    {showReg && (
      <RegisterFarmerModal
        onClose={() => setShowReg(false)}
        onSuccess={(aadhaar) => {
          setShowReg(false);
          setAadhaar(aadhaar);
          fetchUsers();
        }}
      />
    )}
    </>
  );
}
