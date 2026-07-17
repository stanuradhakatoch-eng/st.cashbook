import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import PaymentsDashboard from './components/payments/PaymentsDashboard';
import CashbooksList from './components/cashbooks/CashbooksList';
import TransactionView from './components/cashbooks/TransactionView';
import BookSettings from './components/cashbooks/BookSettings';
import TeamPage from './components/team/TeamPage';
import BusinessSettings from './components/settings/BusinessSettings';
import WhatsNew from './components/shared/WhatsNew';
import MobileBlock from './components/shared/MobileBlock';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import { useWindowWidth } from './hooks/useWindowWidth';

function MobileGate({ children }) {
  const width = useWindowWidth();
  if (width <= 767) return <MobileBlock />;
  return children;
}

/* ── Auth guard ────────────────────────────────────────── */
function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, border: '3px solid #E5E7EB',
          borderTopColor: '#2563EB', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 13, color: '#6B7280' }}>Loading…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

/* ── App inner (needs AuthContext) ────────────────────── */
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/onboarding" replace /> : <LandingPage />} />
      <Route
        path="/login"
        element={isAuthenticated
          ? <Navigate to="/onboarding" replace />
          : <LoginPage />}
      />

      {/* First Business Setup */}
      <Route path="/onboarding" element={
        <RequireAuth>
          <AppProvider>
            <OnboardingPage />
          </AppProvider>
        </RequireAuth>
      } />

      {/* Profile */}
      <Route path="/profile" element={
        <RequireAuth>
          <ProfilePage />
        </RequireAuth>
      } />

      {/* Protected routes */}
      <Route path="/businesses/:businessId/*" element={
        <RequireAuth>
          <AppProvider>
            <Layout>
              <Routes>
                <Route path="payments/dashboard" element={<PaymentsDashboard />} />
                <Route path="cashbooks" element={<CashbooksList />} />
                <Route path="cashbooks/:bookId" element={<TransactionView />} />
                <Route path="cashbooks/:bookId/settings" element={<BookSettings />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="settings" element={<BusinessSettings />} />
                <Route path="whats-new" element={<WhatsNew />} />
                <Route path="" element={<Navigate to="cashbooks" replace />} />
                <Route path="*" element={<Navigate to="cashbooks" replace />} />
              </Routes>
            </Layout>
          </AppProvider>
        </RequireAuth>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <MobileGate>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </MobileGate>
  );
}
