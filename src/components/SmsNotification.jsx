// =============================================================================
// src/components/SmsNotification.jsx — Slide-in SMS Toast Widget
// Every DB mutation fires an SSE event → this component shows a mobile-style alert
// =============================================================================

import { useApp } from '../context/AppContext';
import { MessageSquare, X, Smartphone } from 'lucide-react';

export default function SmsNotification() {
  const { smsQueue, dismissSms } = useApp();

  if (!smsQueue.length) return null;

  return (
    <div className="sms-toast-container">
      {smsQueue.map((sms, i) => (
        <div
          key={sms.id || i}
          className="sms-toast"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <div className="sms-toast-icon">
            <Smartphone size={20} color="#95d5b2" />
          </div>
          <div className="sms-toast-body">
            <div className="sms-toast-title">📱 SMS Alert — DoCA Portal</div>
            <div className="sms-toast-msg">{sms.message}</div>
            {sms.phone && (
              <div className="sms-toast-phone">To: +91 {sms.phone}</div>
            )}
          </div>
          <button
            onClick={() => dismissSms(sms.id)}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '8px',
              padding: '4px',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
