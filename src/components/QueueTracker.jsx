// =============================================================================
// src/components/QueueTracker.jsx
// Live Mandi Line / Token Queue Tracker
// =============================================================================

import { useApp } from '../context/AppContext';
import { Ticket, Users, Clock, TrendingUp, RefreshCw } from 'lucide-react';

export default function QueueTracker() {
  const { myToken, servingToken, slots, fetchSlots, language, t } = useApp();

  const pendingSlots = slots.filter(s => s.queue_status === 'pending');
  const activeToken  = servingToken;

  // farmer-specific stats
  const farmersAhead = myToken ? Math.max(0, myToken - activeToken - 1) : '—';
  const estimatedWait = typeof farmersAhead === 'number' ? farmersAhead * 9 : '—';

  return (
    <div id="queue-tracker" className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a3a2a, #2d6a4f)',
        margin: '-24px -24px 24px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: 42, height: 42,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px',
          }}>🎫</div>
          <div>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 800 }}>
              {t('Live Queue Tracker', 'लाइव कतार ट्रैकर')}
            </h3>
            <p style={{ color: '#95d5b2', fontSize: '12px' }}>
              {t('Real-time mandi line status', 'रियल-टाइम मंडी लाइन स्थिति')}
            </p>
          </div>
        </div>
        <button
          onClick={fetchSlots}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '10px',
            padding: '8px',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title={t('Refresh', 'ताज़ा करें')}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >
          <RefreshCw size={16}/>
        </button>
      </div>

      {/* ── Live Token Banner ──────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #f0faf4, #d1fae5)',
        border: '2px solid #52b788',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* My Token */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#4a6741', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t('YOUR TOKEN', 'आपका टोकन')}
          </div>
          <div style={{
            fontSize: '52px',
            fontWeight: 900,
            color: myToken ? '#1a3a2a' : '#b7e4c7',
            lineHeight: 1,
            marginTop: '4px',
          }}>
            {myToken ? `#${myToken}` : '—'}
          </div>
          {!myToken && (
            <div style={{ fontSize: '11px', color: '#4a6741', marginTop: '4px' }}>
              {t('Book a slot to see your token', 'टोकन के लिए स्लॉट बुक करें')}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '60px', background: '#b7e4c7' }}/>

        {/* Active Token */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#4a6741', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t('NOW SERVING', 'अभी सेवा')}
          </div>
          <div style={{
            fontSize: '52px',
            fontWeight: 900,
            color: '#2d6a4f',
            lineHeight: 1,
            marginTop: '4px',
            animation: 'pulse 2s infinite',
          }}>
            #{activeToken}
          </div>
          <div style={{ fontSize: '11px', color: '#4a6741', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 1s infinite' }}/>
            {t('Active', 'सक्रिय')}
          </div>
        </div>

        <div style={{ width: '1px', height: '60px', background: '#b7e4c7' }}/>

        {/* Farmers Ahead */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#4a6741', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t('AHEAD OF YOU', 'आपसे आगे')}
          </div>
          <div style={{ fontSize: '52px', fontWeight: 900, color: '#d4831a', lineHeight: 1, marginTop: '4px' }}>
            {farmersAhead}
          </div>
          <div style={{ fontSize: '11px', color: '#4a6741', marginTop: '4px' }}>
            {t('farmers', 'किसान')}
          </div>
        </div>

        <div style={{ width: '1px', height: '60px', background: '#b7e4c7' }}/>

        {/* Estimated Wait */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#4a6741', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t('EST. WAIT', 'अनुमानित प्रतीक्षा')}
          </div>
          <div style={{ fontSize: '36px', fontWeight: 900, color: '#1a3a2a', lineHeight: 1, marginTop: '4px' }}>
            {typeof estimatedWait === 'number' ? estimatedWait : '—'}
          </div>
          <div style={{ fontSize: '11px', color: '#4a6741', marginTop: '4px' }}>
            {t('minutes', 'मिनट')}
          </div>
        </div>
      </div>

      {/* ── Pending Slots List ─────────────────────────────────────────────── */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#4a6741', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={14}/>
          {t(`${pendingSlots.length} farmers waiting`, `${pendingSlots.length} किसान प्रतीक्षा में`)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
          {pendingSlots.slice(0, 8).map((slot, i) => {
            const isMe = myToken === slot.token_number;
            return (
              <div key={slot.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: isMe ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : '#f0faf4',
                border: `1px solid ${isMe ? '#10b981' : '#d8f3dc'}`,
                animation: `fadeIn 0.3s ease ${i * 0.05}s both`,
              }}>
                <div style={{
                  width: 36, height: 36,
                  borderRadius: '10px',
                  background: isMe ? '#2d6a4f' : '#d8f3dc',
                  color: isMe ? '#fff' : '#2d6a4f',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  #{slot.token_number}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1a2e1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {slot.farmer_name} {isMe && <span style={{ color: '#2d6a4f', fontSize: '11px' }}>({t('You', 'आप')})</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: '#4a6741' }}>
                    {slot.crop} • {slot.quantity} qtl • {slot.center_location.split(',')[0]}
                  </div>
                </div>
                <span className={`badge badge-${slot.source === 'IVR / Feature Phone' ? 'ivr' : 'app'}`}>
                  {slot.source === 'IVR / Feature Phone' ? '📞 IVR' : '📱 App'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
