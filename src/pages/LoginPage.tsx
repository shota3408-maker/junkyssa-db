// src/pages/LoginPage.tsx
import React, { useState } from 'react';

interface Props {
  onGoogle: () => void;
  onEmail: (email: string, password: string) => void;
  onSignUp: (email: string, password: string) => void;
}

export function LoginPage({ onGoogle, onEmail, onSignUp }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      if (isSignUp) await onSignUp(email, password);
      else await onEmail(email, password);
    } catch (e: any) {
      setError('メールアドレスまたはパスワードが正しくありません');
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 32, fontWeight: 700, color: 'var(--pri)', letterSpacing: 3, marginBottom: 8 }}>
          純喫茶<span style={{ color: 'var(--acc)' }}>DB</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--txt-s)' }}>昭和レトロ喫茶の聖地巡礼データベース</div>
      </div>

      <div style={{ width: '100%', maxWidth: 360 }}>
        <button
          onClick={onGoogle}
          style={{ width: '100%', background: 'white', border: '1.5px solid var(--line)', borderRadius: 12, padding: '12px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16, fontFamily: 'inherit' }}
        >
          <span>G</span> Googleでログイン
        </button>

        <div style={{ textAlign: 'center', color: 'var(--txt-s)', fontSize: 12, marginBottom: 16 }}>または</div>

        <div className="field">
          <label>メールアドレス</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="coffee@example.com" />
        </div>
        <div className="field">
          <label>パスワード</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        {error && <div style={{ color: '#c00', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <button className="btn-pri" onClick={handleSubmit}>{isSignUp ? '新規登録' : 'ログイン'}</button>

        <button
          onClick={() => setIsSignUp((v) => !v)}
          style={{ width: '100%', background: 'none', border: 'none', color: 'var(--pri)', fontSize: 13, cursor: 'pointer', marginTop: 12, fontFamily: 'inherit' }}
        >
          {isSignUp ? 'ログインはこちら' : 'アカウントを作成'}
        </button>
      </div>
    </div>
  );
}
