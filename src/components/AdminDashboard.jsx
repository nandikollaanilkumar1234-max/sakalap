// =============================================================================
// src/components/AdminDashboard.jsx
// DoCA Admin Portal — Queue Monitor + Controls + DB Inspector
// =============================================================================

import { useState } from 'react';
import { useApp }   from '../context/AppContext';
import { api }      from '../utils/api';
import DatabaseViewer from './DatabaseViewer';
import {
  Shield, CheckCircle, RefreshCw, ChevronRight,
  Database, LayoutList, TrendingUp, Loader2, AlertCircle
} from 'lucide-react';

const PAYMENT_STAGES = ['crop_handed', 'verified', 'invoice_generated', 'disbursed'];
const PAYMENT_LABELS = {
  crop_handed:       { en: 'Crop Handed', hi: 'फसल सौंपी', color: '#d4831a' },
  verified:          { en: 'Verified',    hi: 'जाँची',     color: '#2563eb' },
  invoice_generated: { en: 'Invoice',     hi: 'Invoice',   color: '#7c3aed' },
  disbursed:         { en: 'Disbursed',   hi: 'जारी',      color: '#10b981' },
};

export default function AdminDashboard() {
  const { t, language, slots, stats, fetchSlots, loadingSlots, pushSms } = useApp();

  const [activeTab, setActiveTab]  = useState('queue');   // 'queue' | 'db'
  const [updating, setUpdating]    = useState({});         // { slotId: true }
  const [filterSource, setFilter]  = useState('all');      // 'all' | 'app' | 'ivr'

  // ── Queue / Payment actions ───────────────────────────────────────────────
  async function advanceQueue(slot) {
    const nextStatus = slot.queue_status === 'pending' ? 'serving' : 'completed';
    setUpdating(p => ({ ...p, [slot.id]: 'queue' }));
    try {
      await api.updateQueue(slot.id, nextStatus);
      await fetchSlots();
    } finally {
      setUpdating(p => { const n = { ...p }; delete n[slot.id]; return n; });
    }
  }

  async function advancePayment(slot) {
    const idx  = PAYMENT_STAGES.indexOf(slot.payment_status);
    if (idx >= PAYMENT_STAGES.length - 1) return;
    const next = PAYMENT_STAGES[idx + 1];
    setUpdating(p => ({ ...p, [slot.id]: 'payment' }));
    try {
      await api.updatePayment(slot.id, next);
      await fetchSlots();
    } finally {
      setUpdating(p => { const n = { ...p }; delete n[slot.id]; return n; });
    }
  }

  // ── Filter slots ──────────────────────────────────────────────────────────
  const filtered = slots.filter(s => {
    if (filterSource === 'all') return true;
    if (filterSource === 'app') return s.source === 'Mobile App';
    if (filterSource === 'ivr') return s.source === 'IVR / Feature Phone';
    return true;
  });

  return (
    <div style={{ padding: '32px 0 80px' }}>
      <div className="container">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#1a3a2a', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield size={32} style={{ color: '#2d6a4f' }}/>
              {t('Admin Portal', 'एडमिन पोर्टल')}
            </h1>
            <p style={{ color: '#4a6741', fontSize: '15px', marginTop: '6px' }}>
              {t('DoCA Procurement Officials — Manage queue, payments & database',
                 'DoCA खरीद अधिकारी — कतार, भुगतान और डेटाबेस प्रबंधन')}
            </p>
          </div>
          <button onClick={fetchSlots} disabled={loadingSlots} className="btn btn-outline">
            {loadingSlots
              ? <Loader2 size={16} className="animate-spin"/>
              : <RefreshCw size={16}/>
            }
            {t('Refresh', 'ताज़ा करें')}
          </button>
        </div>

        {/* ── Stats Row ────────────────────────────────────────────────────── */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '12px', marginBottom: '28px' }}>
            {[
              { icon: '📋', v: stats.total,     l: t('Total','कुल'),       c: '#2d6a4f' },
              { icon: '⏳', v: stats.pending,   l: t('Pending','प्रतीक्षित'), c: '#d4831a' },
              { icon: '✅', v: stats.serving,   l: t('Serving','सेवा में'), c: '#2d6a4f' },
              { icon: '🏁', v: stats.completed, l: t('Done','पूर्ण'),      c: '#10b981' },
              { icon: '📱', v: stats.app_src,   l: t('App','ऐप'),          c: '#0ea5e9' },
              { icon: '📞', v: stats.ivr,       l: t('IVR','IVR'),         c: '#7c3aed' },
              { icon: '💰', v: stats.disbursed, l: t('Paid','भुगतान'),     c: '#059669' },
            ].map((s, i) => (
              <div key={i} style={{
                background: '#fff',
                border: '1px solid #d8f3dc',
                borderRadius: '12px',
                padding: '14px 12px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(45,106,79,0.08)',
                animation: `fadeIn 0.3s ease ${i * 0.05}s both`,
              }}>
                <div style={{ fontSize: '22px', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: '10px', color: '#7a9b7f', fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab Nav ─────────────────────────────────────────────────────── */}
        <div className="tab-nav" style={{ marginBottom: '24px' }}>
          <button
            className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            <LayoutList size={16}/>
            {t('Omni-Channel Queue Monitor', 'ऑम्नी-चैनल कतार मॉनिटर')}
            <span className="badge badge-green" style={{ fontSize: '11px' }}>{slots.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'db' ? 'active' : ''}`}
            onClick={() => setActiveTab('db')}
          >
            <Database size={16}/>
            {t('Visual Database Inspector', 'विज़ुअल डेटाबेस निरीक्षक')}
          </button>
        </div>

        {/* ── Queue Monitor Tab ────────────────────────────────────────────── */}
        {activeTab === 'queue' && (
          <div>
            {/* Filter bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#4a6741' }}>
                {t('Filter by source:', 'स्रोत के अनुसार:')}
              </span>
              {[
                { key: 'all', label: `${t('All','सभी')} (${slots.length})` },
                { key: 'app', label: `📱 ${t('Mobile App','मोबाइल ऐप')} (${stats?.app_src || 0})` },
                { key: 'ivr', label: `📞 ${t('IVR Phone','IVR फोन')} (${stats?.ivr || 0})` },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`btn btn-sm ${filterSource === f.key ? 'btn-primary' : 'btn-outline'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div className="data-table-wrap" style={{ borderRadius: '16px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('Token','टोकन')}</th>
                      <th>{t('Farmer','किसान')}</th>
                      <th>{t('Phone','फोन')}</th>
                      <th>{t('Crop','फसल')}</th>
                      <th>{t('Qty','मात्रा')}</th>
                      <th>{t('Centre','केंद्र')}</th>
                      <th>{t('Date','तारीख')}</th>
                      <th>{t('Source','स्रोत')}</th>
                      <th>{t('Queue','कतार')}</th>
                      <th>{t('Payment','भुगतान')}</th>
                      <th>{t('Actions','क्रिया')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={11} style={{ textAlign: 'center', padding: '32px', color: '#7a9b7f' }}>
                          {t('No slots found', 'कोई स्लॉट नहीं मिला')}
                        </td>
                      </tr>
                    )}
                    {filtered.map((slot, i) => {
                      const isLoading = updating[slot.id];
                      const payIdx    = PAYMENT_STAGES.indexOf(slot.payment_status);
                      const payLabel  = PAYMENT_LABELS[slot.payment_status];

                      return (
                        <tr key={slot.id} style={{ animation: `fadeIn 0.3s ease ${i * 0.04}s both` }}>
                          <td>
                            <span style={{
                              fontWeight: 900,
                              fontSize: '18px',
                              color: '#2d6a4f',
                            }}>
                              #{slot.token_number}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#1a2e1e' }}>{slot.farmer_name}</div>
                          </td>
                          <td>
                            <code style={{ fontSize: '12px', color: '#4a6741' }}>{slot.phone}</code>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>
                              {slot.crop === 'Wheat'   ? '🌾' :
                               slot.crop === 'Paddy'   ? '🌿' :
                               slot.crop === 'Maize'   ? '🌽' : '🫘'} {slot.crop}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{slot.quantity} qtl</td>
                          <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>
                            {slot.center_location}
                          </td>
                          <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{slot.target_date}</td>
                          <td>
                            {slot.source === 'IVR / Feature Phone'
                              ? <span className="badge badge-ivr">📞 IVR</span>
                              : <span className="badge badge-app">📱 App</span>
                            }
                          </td>
                          <td>
                            <span className={`badge badge-${slot.queue_status}`}>
                              {slot.queue_status === 'pending'   ? '⏳ ' :
                               slot.queue_status === 'serving'   ? '🔔 ' : '✓ '}
                              {slot.queue_status}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              background: `${payLabel?.color}22`,
                              color: payLabel?.color,
                              borderRadius: '20px',
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}>
                              {language === 'hi' ? payLabel?.hi : payLabel?.en}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {/* Advance Queue */}
                              {slot.queue_status !== 'completed' && (
                                <button
                                  onClick={() => advanceQueue(slot)}
                                  disabled={!!isLoading}
                                  className="btn btn-sm btn-primary"
                                  title={t('Advance Queue', 'कतार आगे बढ़ाएं')}
                                  style={{ padding: '4px 8px', fontSize: '11px' }}
                                >
                                  {isLoading === 'queue'
                                    ? <Loader2 size={12} className="animate-spin"/>
                                    : <ChevronRight size={12}/>
                                  }
                                  {slot.queue_status === 'pending' ? t('Serve','सेवा') : t('Done','पूर्ण')}
                                </button>
                              )}

                              {/* Advance Payment */}
                              {payIdx < PAYMENT_STAGES.length - 1 && (
                                <button
                                  onClick={() => advancePayment(slot)}
                                  disabled={!!isLoading}
                                  className="btn btn-sm btn-accent"
                                  title={t('Advance Payment', 'भुगतान आगे बढ़ाएं')}
                                  style={{ padding: '4px 8px', fontSize: '11px' }}
                                >
                                  {isLoading === 'payment'
                                    ? <Loader2 size={12} className="animate-spin"/>
                                    : '₹'
                                  }
                                  {t('Pay+','Pay+')}
                                </button>
                              )}

                              {slot.queue_status === 'completed' && payIdx === PAYMENT_STAGES.length - 1 && (
                                <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 700 }}>✓ All Done</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div style={{
              marginTop: '16px',
              padding: '12px 20px',
              background: '#f0faf4',
              borderRadius: '12px',
              border: '1px solid #d8f3dc',
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              fontSize: '12px',
              color: '#4a6741',
            }}>
              <span><strong>Serve</strong> → advances queue from Pending → Serving → Completed</span>
              <span><strong>Pay+</strong> → advances payment stage toward DBT Disbursement</span>
              <span>📞 IVR = Feature phone booking | 📱 App = Mobile app booking</span>
            </div>
          </div>
        )}

        {/* ── DB Inspector Tab ─────────────────────────────────────────────── */}
        {activeTab === 'db' && (
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <DatabaseViewer/>
          </div>
        )}

      </div>
    </div>
  );
}
