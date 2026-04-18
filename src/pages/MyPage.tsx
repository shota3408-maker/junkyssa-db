// src/pages/MyPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db, collection, query, where, getDocs, COLLECTIONS } from '../firebase';
import { Review, SCORE_LABELS } from '../types';

function docToReview(d: any): Review {
  const data = d.data();
  return {
    id: d.id,
    cafeId: data.cafeId,
    userId: data.userId,
    userName: data.userName,
    userPhoto: data.userPhoto,
    retroScore: data.retroScore,
    masterScore: data.masterScore,
    soloScore: data.soloScore,
    timelessScore: data.timelessScore,
    overallScore: data.overallScore,
    comment: data.comment,
    visitDate: data.visitDate,
    photos: data.photos || [],
    signatureMenus: data.signatureMenus || [],
    tags: data.tags || [],
    createdAt: data.createdAt?.toDate() || new Date(),
  };
}

export function MyPage() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, COLLECTIONS.REVIEWS), where('userId', '==', user.uid));
    getDocs(q).then((snap) => {
      const list = snap.docs.map(docToReview).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setReviews(list);
      setLoading(false);
    });
  }, [user]);

  if (!user || !profile) return null;

  return (
    <div className="page">
      {/* プロフィールカード */}
      <div style={{ background: 'var(--pri)', padding: '32px 20px 24px', textAlign: 'center' }}>
        {profile.photoUrl
          ? <img src={profile.photoUrl} alt="" style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid var(--acc)', objectFit: 'cover' }} />
          : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto' }}>☕</div>
        }
        <div style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 18, fontWeight: 700, color: '#FDF6E3', marginTop: 12 }}>{profile.displayName}</div>
        <div style={{ fontSize: 12, color: 'rgba(253,246,227,.6)', marginTop: 4 }}>{user.email}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--acc)' }}>{profile.reviewCount}</div>
            <div style={{ fontSize: 11, color: 'rgba(253,246,227,.7)' }}>口コミ数</div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>
        {/* 口コミ履歴 */}
        <div style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 16, fontWeight: 700, color: 'var(--txt-m)', marginBottom: 16 }}>
          口コミ履歴
        </div>

        {loading && <div style={{ textAlign: 'center', color: 'var(--txt-s)', padding: 40 }}>読み込み中...</div>}

        {!loading && reviews.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">✍️</div>
            <p>まだ口コミがありません</p>
            <span>気に入った純喫茶に口コミを投稿しよう</span>
            <button
              onClick={() => navigate('/')}
              style={{ marginTop: 16, background: 'var(--pri)', color: '#FDF6E3', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              お店を探す
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {reviews.map((r) => (
            <div key={r.id} className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => navigate(`/cafe/${r.cafeId}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--txt-m)' }}>{r.visitDate}</div>
                <div style={{ fontSize: 13, color: 'var(--acc)', fontWeight: 700 }}>⭐ {r.overallScore.toFixed(1)}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {Object.entries(SCORE_LABELS).filter(([k]) => k !== 'overallScore').map(([key, { emoji }]) => (
                  <span key={key} style={{ fontSize: 12, color: 'var(--txt-s)' }}>{emoji} {((r as any)[key] || 0).toFixed(1)}</span>
                ))}
              </div>
              {r.comment && <div style={{ fontSize: 13, color: 'var(--txt-m)', lineHeight: 1.6 }}>{r.comment}</div>}
            </div>
          ))}
        </div>

        {/* ログアウト */}
        <button
          onClick={logout}
          style={{ width: '100%', background: 'none', border: '1.5px solid var(--line)', borderRadius: 12, padding: '12px', color: 'var(--txt-s)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 32 }}
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
