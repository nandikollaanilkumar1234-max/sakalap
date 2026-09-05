// =============================================================================
// src/App.jsx — Root Application
// Auth-gated router: Login → Farmer Dashboard / Admin Portal
// =============================================================================

import { useApp }          from './context/AppContext';
import Header              from './components/Header';
import LoginPage           from './components/LoginPage';
import LandingPage         from './components/LandingPage';
import FarmerDashboard     from './components/FarmerDashboard';
import AdminDashboard      from './components/AdminDashboard';
import IvrSimulator        from './components/IvrSimulator';
import ChatbotWidget       from './components/ChatbotWidget';
import SlotBookingForm     from './components/SlotBookingForm';
import SmsNotification     from './components/SmsNotification';

export default function App() {
  const {
    currentUser,
    page,
    showIvr,
    showChatbot,
    showSlotForm,
    t,
  } = useApp();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Sticky header — always visible */}
      <Header/>

      {/* ── Auth gate ──────────────────────────────────────────────────────── */}
      {!currentUser ? (
        // Not logged in → show Login page always
        <LoginPage/>
      ) : (
        <>
          {/* Page router — visible only when authenticated */}
          {page === 'landing' && <LandingPage/>}

          {/* Role-guarded routes */}
          {page === 'farmer' && (
            currentUser.role === 'farmer' || currentUser.role === 'admin'
              ? <FarmerDashboard/>
              : <AccessDenied role="Farmer" t={t}/>
          )}
          {page === 'admin' && (
            currentUser.role === 'admin'
              ? <AdminDashboard/>
              : <AccessDenied role="Admin" t={t}/>
          )}

          {/* ── Global Overlays ────────────────────────────────────────────── */}
          {showIvr      && <IvrSimulator/>}
          {showSlotForm && <SlotBookingForm/>}
          <ChatbotWidget/>
          <SmsNotification/>
        </>
      )}

      {/* Footer */}
      <footer style={{
        background: '#1a3a2a',
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        padding: '20px',
        fontSize: '13px',
        borderTop: '2px solid var(--amber-600)',
      }}>
        <div style={{ marginBottom: '6px', color: '#95d5b2', fontWeight: 600 }}>
          🌾 DoCA Kisan Portal — Smart Agricultural Procurement System
        </div>
        <div>
          Smart India Hackathon 2026 | Problem Statement ID: 26032 | Department of Consumer Affairs, Govt. of India
        </div>
        <div style={{ marginTop: '6px', color: '#fbbf24', fontWeight: 600 }}>
          Helpline: 1800-XXX-FARM (24/7 Toll-Free)
        </div>
      </footer>
    </div>
  );
}

// ── Access Denied fallback ────────────────────────────────────────────────────
function AccessDenied({ role, t }) {
  const { setPage, logout } = useApp();
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
      <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a3a2a', marginBottom: '8px' }}>
        {t('Access Denied', 'पहुंच अस्वीकृत')}
      </h2>
      <p style={{ color: '#4a6741', fontSize: '15px', marginBottom: '24px' }}>
        {t(`You need ${role} permissions to view this page.`,
           `इस पेज को देखने के लिए ${role} अनुमति चाहिए।`)}
      </p>
      <button onClick={() => setPage('landing')} className="btn btn-primary">
        {t('Go to Home', 'होम पर जाएं')}
      </button>
    </div>
  );
}
