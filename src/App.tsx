// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { TopPage } from './pages/TopPage';
import { CoffeeCupIcon } from './components/CoffeeCupIcon';
import { MyPage } from './pages/MyPage';
import { CafeDetailPage } from './pages/CafeDetailPage';
import { ReviewFormPage } from './pages/ReviewFormPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import './styles/global.css';

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  if (['/review', '/cafe', '/admin'].some((p) => path.startsWith(p))) return null;

  const items = [
    { icon: '☕', label: 'トップ', to: '/' },
    { icon: '👤', label: 'マイページ', to: '/mypage' },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button
          key={item.to}
          className={`nav-btn ${path === item.to ? 'active' : ''}`}
          onClick={() => navigate(item.to)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function AppInner() {
  const { user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDetailPage = ['/review', '/cafe', '/admin'].some((p) => location.pathname.startsWith(p));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: 'var(--bg)' }}>
      <div style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 28, fontWeight: 700, color: 'var(--pri)', letterSpacing: 3 }}>
        純喫茶<span style={{ color: 'var(--acc)' }}>DB</span>
      </div>
    </div>
  );

  if (!user) return (
    <LoginPage
      onGoogle={signInWithGoogle}
      onEmail={signInWithEmail}
      onSignUp={signUpWithEmail}
    />
  );

  return (
    <>
      {!isDetailPage && (
        <div className="site-header">
          <CoffeeCupIcon size={36} />
          <div className="header-actions">
            {profile?.role === 'admin' && (
              <button className="btn-header" onClick={() => navigate('/admin')}>管理</button>
            )}
            <button className="btn-header" onClick={logout}>ログアウト</button>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/"               element={<TopPage />} />
        <Route path="/mypage"         element={<MyPage />} />
        <Route path="/cafe/:id"       element={<CafeDetailPage />} />
        <Route path="/review/new/:id" element={<ReviewFormPage user={user} />} />
        <Route path="/admin"          element={<AdminPage profile={profile} />} />
        <Route path="*"               element={<TopPage />} />
      </Routes>

      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
