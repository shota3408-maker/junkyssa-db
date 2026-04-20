// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { TopPage } from './pages/TopPage';
import { CoffeeCupIcon } from './components/CoffeeCupIcon';
import { MyPage } from './pages/MyPage';
import { MapPage } from './pages/MapPage';
import { RankingPage } from './pages/RankingPage';
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
    { icon: '☕', label: 'トップ',        to: '/' },
    { icon: '🗺️', label: 'マップ',       to: '/map' },
    { icon: '🏆', label: 'ランキング',    to: '/ranking' },
    { icon: '👤', label: 'マイページ',   to: '/mypage' },
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

function ShareModal({ onClose }: { onClose: () => void }) {
  const APP_URL = 'https://junkyssa-db.vercel.app';
  const SHARE_TEXT = '昭和レトロ純喫茶のデータベースアプリ「純喫茶DB」を使ってみてください☕\n全国の純喫茶・昭和喫茶を検索・記録できます！\n\n👇 こちらからアクセス';
  const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(APP_URL)}&bgcolor=FDF6E3&color=6B3A2A&margin=10`;
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: '純喫茶DB', text: SHARE_TEXT, url: APP_URL }); } catch {}
    } else {
      navigator.clipboard?.writeText(`${SHARE_TEXT}\n${APP_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--bg)', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 18, fontWeight: 700, color: 'var(--pri)' }}>🎁 純喫茶DBを紹介する</div>
          <div style={{ fontSize: 13, color: 'var(--txt-s)', marginTop: 4 }}>純喫茶好きな知り合いに教えよう</div>
        </div>
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <img src={QR_URL} alt="QR" style={{ width: 160, height: 160, borderRadius: 12, border: '2px solid var(--line)' }} />
          <div style={{ fontSize: 12, color: 'var(--txt-s)', marginTop: 6 }}>カメラで読み取ってもらえます</div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <button onClick={() => window.open(`https://line.me/R/share?text=${encodeURIComponent(SHARE_TEXT + '\n' + APP_URL)}`, '_blank')}
            style={{ flex: 1, background: '#06C755', border: 'none', borderRadius: 10, padding: '12px 0', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
            LINE で送る
          </button>
          <button onClick={() => window.open(`mailto:?subject=${encodeURIComponent('純喫茶DBのご紹介')}&body=${encodeURIComponent(SHARE_TEXT + '\n\n' + APP_URL)}`, '_blank')}
            style={{ flex: 1, background: 'var(--pri)', border: 'none', borderRadius: 10, padding: '12px 0', color: '#FDF6E3', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
            メールで送る
          </button>
        </div>
        <button onClick={handleShare}
          style={{ width: '100%', background: 'var(--pri-lt)', border: 'none', borderRadius: 10, padding: '12px 0', color: 'var(--pri)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
          {copied ? '✓ コピーしました！' : 'その他のアプリで共有 / URLコピー'}
        </button>
        <button onClick={onClose} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'var(--txt-s)', fontSize: 14, cursor: 'pointer', padding: '8px 0', fontFamily: 'inherit' }}>閉じる</button>
      </div>
    </div>
  );
}

function AppInner() {
  const { user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showShare, setShowShare] = useState(false);
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
            <button className="btn-header" onClick={() => setShowShare(true)}>紹介</button>
            {profile?.role === 'admin' && (
              <button className="btn-header" onClick={() => navigate('/admin')}>管理</button>
            )}
            <button className="btn-header" onClick={logout}>ログアウト</button>
          </div>
        </div>
      )}
      {showShare && <ShareModal onClose={() => setShowShare(false)} />}

      <Routes>
        <Route path="/"               element={<TopPage />} />
        <Route path="/map"            element={<MapPage />} />
        <Route path="/ranking"        element={<RankingPage />} />
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
