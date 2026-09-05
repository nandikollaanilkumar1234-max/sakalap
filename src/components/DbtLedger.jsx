// =============================================================================
// src/components/DbtLedger.jsx
// 4-Step DBT Payment Pipeline Tracker
// =============================================================================

import { useApp } from '../context/AppContext';
import { CheckCircle, Circle, Loader2, IndianRupee } from 'lucide-react';

const STAGES = [
  {
    key: 'crop_handed',
    icon: '🌾',
    en: 'Crop Handed Over',
    hi: 'फसल सौंपी गई',
    desc_en: 'Your crop has been received at the procurement centre.',
    desc_hi: 'आपकी फसल खरीद केंद्र पर प्राप्त हो गई है।',
  },
  {
    key: 'verified',
    icon: '🔬',
    en: 'Quality Verified',
    hi: 'गुणवत्ता जाँची गई',
    desc_en: 'Quality & weight inspection completed. MSP rate locked.',
    desc_hi: 'गुणवत्ता और वजन जाँच पूरी हुई। MSP दर निर्धारित।',
  },
  {
    key: 'invoice_generated',
    icon: '📄',
    en: 'Invoice Generated',
    hi: 'Invoice बनाई गई',
    desc_en: 'Payment invoice has been generated and sent for approval.',
    desc_hi: 'भुगतान invoice बन गई है और अनुमोदन के लिए भेजी गई है।',
  },
  {
    key: 'disbursed',
    icon: '🏦',
    en: 'DBT Funds Disbursed',
    hi: 'DBT राशि जारी हुई',
    desc_en: 'Funds transferred directly to your Aadhaar-linked bank account!',
    desc_hi: 'राशि सीधे आपके आधार-लिंक्ड बैंक खाते में ट्रांसफर हो गई!',
  },
];

const STAGE_ORDER = ['crop_handed', 'verified', 'invoice_generated', 'disbursed'];

export default function DbtLedger() {
  const { myToken, slots, language, t } = useApp();

  // Find farmer's slot
  const mySlot = myToken ? slots.find(s => s.token_number === myToken) : slots[0];

  const currentStageIdx = mySlot
    ? STAGE_ORDER.indexOf(mySlot.payment_status)
    : -1;

  const progressPct = currentStageIdx >= 0
    ? Math.round(((currentStageIdx + 1) / STAGE_ORDER.length) * 100)
    : 0;

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #92400e, #d4831a)',
        margin: '-24px -24px 24px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: 42, height: 42,
          background: 'rgba(255,255,255,0.20)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px',
        }}>₹</div>
        <div>
          <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 800 }}>
            {t('DBT Payment Ledger', 'DBT भुगतान लेखाबही')}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>
            {t('Direct Benefit Transfer — 4-stage pipeline', 'प्रत्यक्ष लाभ हस्तांतरण — 4 चरण पाइपलाइन')}
          </p>
        </div>
        {mySlot && (
          <div style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,0.20)',
            border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: '10px',
            padding: '8px 14px',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 700,
          }}>
            Token #{mySlot.token_number}
          </div>
        )}
      </div>

      {mySlot ? (
        <>
          {/* Progress bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#4a6741', fontWeight: 600 }}>
                {t('Payment Progress', 'भुगतान प्रगति')}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#d4831a' }}>
                {progressPct}%
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #d4831a, #f59e0b)',
              }}/>
            </div>
          </div>

          {/* Stages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {STAGES.map((stage, i) => {
              const isDone    = i <= currentStageIdx;
              const isActive  = i === currentStageIdx;
              const isPending = i > currentStageIdx;

              return (
                <div key={stage.key} style={{ display: 'flex', gap: '16px' }}>
                  {/* Left: icon + connector */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 48, height: 48,
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px',
                      background: isDone
                        ? (isActive ? 'linear-gradient(135deg, #d4831a, #f59e0b)' : 'linear-gradient(135deg, #10b981, #34d399)')
                        : '#f0faf4',
                      border: `3px solid ${isDone ? (isActive ? '#d4831a' : '#10b981') : '#d8f3dc'}`,
                      transition: 'all 0.4s ease',
                      boxShadow: isActive ? '0 0 0 6px rgba(212,131,26,0.15)' : 'none',
                      animation: isActive ? 'pulse 2s infinite' : 'none',
                    }}>
                      {isDone && !isActive ? '✓' : stage.icon}
                    </div>
                    {i < STAGES.length - 1 && (
                      <div style={{
                        width: 3,
                        flex: 1,
                        minHeight: '32px',
                        background: i < currentStageIdx
                          ? 'linear-gradient(180deg, #10b981, #34d399)'
                          : '#d8f3dc',
                        transition: 'background 0.4s ease',
                        margin: '4px 0',
                        borderRadius: '2px',
                      }}/>
                    )}
                  </div>

                  {/* Right: content */}
                  <div style={{
                    flex: 1,
                    paddingBottom: i < STAGES.length - 1 ? '20px' : '0',
                    paddingTop: '4px',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                    }}>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: isDone ? (isActive ? '#92400e' : '#065f46') : '#7a9b7f',
                        transition: 'color 0.3s ease',
                      }}>
                        {language === 'hi' ? stage.hi : stage.en}
                      </span>
                      {isActive && (
                        <span style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '20px',
                          border: '1px solid #fcd34d',
                          animation: 'pulse 1.5s infinite',
                        }}>
                          {t('CURRENT', 'वर्तमान')}
                        </span>
                      )}
                      {isDone && !isActive && (
                        <span style={{
                          background: '#dcfce7',
                          color: '#166534',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '20px',
                        }}>
                          ✓ {t('DONE', 'पूर्ण')}
                        </span>
                      )}
                    </div>
                    <p style={{
                      fontSize: '13px',
                      color: isPending ? '#b8d4bb' : '#4a6741',
                      lineHeight: 1.5,
                    }}>
                      {language === 'hi' ? stage.desc_hi : stage.desc_en}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Disbursed celebration */}
          {mySlot.payment_status === 'disbursed' && (
            <div style={{
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
              border: '2px solid #10b981',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              marginTop: '24px',
              animation: 'fadeIn 0.5s ease both',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎊</div>
              <div style={{ fontWeight: 800, fontSize: '18px', color: '#065f46' }}>
                {t('Payment Successful!', 'भुगतान सफल!')}
              </div>
              <div style={{ fontSize: '14px', color: '#047857', marginTop: '4px' }}>
                {t('Funds have been credited to your bank account via DBT.',
                   'DBT के माध्यम से आपके बैंक खाते में राशि जमा हो गई है।')}
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px', color: '#7a9b7f' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>
            {t('Book a slot to track your payment', 'भुगतान ट्रैक करने के लिए स्लॉट बुक करें')}
          </div>
        </div>
      )}
    </div>
  );
}
