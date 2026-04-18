// src/pages/CafeDetailPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCafe } from '../hooks/useCafes';
import { useReviews } from '../hooks/useReviews';
import { SCORE_LABELS } from '../types';

function ScoreAxis({ field, value }: { field: string; value: number }) {
  const meta = SCORE_LABELS[field];
  return (
    <div className="score-axis">
      <div className="score-axis-label">{meta.emoji} {meta.label}</div>
      <div className="score-bar-bg">
        <div className="score-bar-fill" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <div className="score-axis-val">{value > 0 ? value.toFixed(1) : '--'}</div>
    </div>
  );
}

function ReviewCard({ review }: { review: any }) {
  const date = new Date(review.createdAt);
  return (
    <div className="card" style={{ padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pri-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--pri)' }}>
          {review.userPhoto
            ? <img src={review.userPhoto} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
            : (review.userName || 'U')[0]
          }
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{review.userName}</div>
          <div style={{ fontSize: 11, color: 'var(--txt-s)' }}>{review.visitDate} 訪問</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 18, fontWeight: 800, color: 'var(--acc)' }}>
          ⭐ {review.overallScore.toFixed(1)}
        </div>
      </div>

      {/* ミニスコア */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {(['retroScore','masterScore','soloScore','timelessScore'] as const).map((k) => (
          <div key={k} style={{ fontSize: 11, background: 'var(--acc-lt)', color: 'var(--acc)', borderRadius: 8, padding: '2px 8px', fontWeight: 700 }}>
            {SCORE_LABELS[k].emoji} {review[k].toFixed(1)}
          </div>
        ))}
      </div>

      {review.comment && <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--txt-m)', marginBottom: 8 }}>{review.comment}</p>}

      {review.photos?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          {review.photos.map((url: string, i: number) => (
            <img key={i} src={url} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
          ))}
        </div>
      )}

      {review.tags?.length > 0 && (
        <div className="tag-row" style={{ marginTop: 8 }}>
          {review.tags.map((t: string) => <span key={t} className="tag-chip">{t}</span>)}
        </div>
      )}
    </div>
  );
}

export function CafeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cafe, loading } = useCafe(id);
  const { reviews } = useReviews(id);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--txt-s)' }}>読み込み中...</div>;
  if (!cafe) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--txt-s)' }}>店舗が見つかりません</div>;

  const photo = cafe.coverPhoto || cafe.googlePhotos?.[0];

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      {/* 戻るボタン */}
      <div style={{ position: 'sticky', top: 0, background: 'var(--bg)', padding: '10px 16px', zIndex: 10, borderBottom: '1px solid var(--line)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--pri)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← 戻る
        </button>
      </div>

      {/* カバー写真 */}
      {photo
        ? <img src={photo} alt={cafe.name} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
        : <div style={{ width: '100%', height: 180, background: 'var(--pri-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>☕</div>
      }

      <div className="container">
        {/* 基本情報 */}
        <div style={{ padding: '20px 0 0' }}>
          {cafe.established && (
            <div style={{ fontSize: 12, color: 'var(--acc)', fontWeight: 700, marginBottom: 4 }}>創業 {cafe.established}</div>
          )}
          <h1 style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{cafe.name}</h1>
          <div style={{ fontSize: 13, color: 'var(--txt-s)', marginBottom: 8 }}>📍 {cafe.address}</div>
          {cafe.phone && <div style={{ fontSize: 13, color: 'var(--txt-s)', marginBottom: 8 }}>📞 {cafe.phone}</div>}
          {cafe.hours && cafe.hours.length > 0 && (
            <div style={{ fontSize: 13, color: 'var(--txt-s)', marginBottom: 12 }}>
              🕐 {cafe.hours.join(' / ')}
            </div>
          )}
          {cafe.tags.length > 0 && (
            <div className="tag-row" style={{ marginBottom: 12 }}>
              {cafe.tags.map((t) => <span key={t} className="tag-chip">{t}</span>)}
            </div>
          )}
        </div>

        {/* 独自スコア */}
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
            純喫茶スコア {cafe.reviewCount > 0 && <span style={{ fontSize: 12, color: 'var(--txt-s)', fontFamily: 'Noto Sans JP, sans-serif' }}>（{cafe.reviewCount}件の口コミより）</span>}
          </div>
          {cafe.reviewCount === 0 && (
            <div style={{ fontSize: 13, color: 'var(--txt-s)', marginBottom: 12 }}>まだ口コミがありません。最初の投稿者になりましょう！</div>
          )}
          <ScoreAxis field="retroScore"    value={cafe.retroScore} />
          <ScoreAxis field="masterScore"   value={cafe.masterScore} />
          <ScoreAxis field="soloScore"     value={cafe.soloScore} />
          <ScoreAxis field="timelessScore" value={cafe.timelessScore} />
          <ScoreAxis field="overallScore"  value={cafe.overallScore} />
        </div>

        {/* 口コミ投稿ボタン */}
        <button className="btn-pri" style={{ marginBottom: 24 }} onClick={() => navigate(`/review/new/${id}`)}>
          ☕ 口コミを投稿する
        </button>

        {/* 口コミ一覧 */}
        <div className="section-title">口コミ ({reviews.length}件)</div>
        {reviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>まだ口コミがありません</p>
          </div>
        ) : (
          reviews.map((r) => <ReviewCard key={r.id} review={r} />)
        )}
      </div>
    </div>
  );
}
