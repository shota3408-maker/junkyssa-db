// src/pages/CafeDetailPage.tsx
import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCafe } from '../hooks/useCafes';
import { useReviews } from '../hooks/useReviews';
import { useAuth } from '../hooks/useAuth';
import { useVisits } from '../hooks/useVisits';
import { SCORE_LABELS } from '../types';

// ── ライトボックス ──
function Lightbox({ photos, index, onClose, onPrev, onNext }: {
  photos: string[]; index: number; onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* 閉じるボタン */}
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >✕</button>

      {/* カウンター */}
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,.7)', fontSize: 13, fontWeight: 700 }}>
        {index + 1} / {photos.length}
      </div>

      {/* 写真 */}
      <img
        src={photos[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '92vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: 10, boxShadow: '0 8px 40px rgba(0,0,0,.6)' }}
      />

      {/* 前へ */}
      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', width: 44, height: 44, borderRadius: '50%', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >‹</button>
      )}

      {/* 次へ */}
      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', width: 44, height: 44, borderRadius: '50%', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >›</button>
      )}

      {/* サムネイル一覧 */}
      {photos.length > 1 && (
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          {photos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              onClick={(e) => { e.stopPropagation(); }}
              style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', cursor: 'pointer', opacity: i === index ? 1 : 0.45, border: i === index ? '2px solid white' : '2px solid transparent', transition: 'opacity .15s' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── 写真グリッド ──
function PhotoGrid({ photos, onOpen }: { photos: string[]; onOpen: (i: number) => void }) {
  if (photos.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 15, fontWeight: 700, color: 'var(--txt-m)', marginBottom: 10 }}>
        📷 フォトギャラリー <span style={{ fontSize: 12, color: 'var(--txt-s)', fontFamily: 'Noto Sans JP, sans-serif' }}>{photos.length}枚</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
        {photos.slice(0, 9).map((url, i) => (
          <div key={i} style={{ position: 'relative', aspectRatio: '1', cursor: 'pointer' }} onClick={() => onOpen(i)}>
            <img
              src={url}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, display: 'block' }}
            />
            {i === 8 && photos.length > 9 && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18 }}>
                +{photos.length - 9}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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

function ReviewCard({ review, onPhotoOpen }: { review: any; onPhotoOpen: (url: string) => void }) {
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
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {review.photos.map((url: string, i: number) => (
            <img
              key={i} src={url} alt=""
              onClick={() => onPhotoOpen(url)}
              style={{ width: 90, height: 90, borderRadius: 8, objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }}
            />
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
  const { user } = useAuth();
  const { cafe, loading } = useCafe(id);
  const { reviews } = useReviews(id);
  const { visitedIds, visitedDates, toggleVisit } = useVisits(user);
  const isVisited = id ? visitedIds.includes(id) : false;
  const visitDate = id ? visitedDates[id] : undefined;

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const allPhotos = reviews.flatMap((r) => r.photos || []);
  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevPhoto = useCallback(() => setLightboxIndex((i) => i !== null ? (i - 1 + allPhotos.length) % allPhotos.length : null), [allPhotos.length]);
  const nextPhoto = useCallback(() => setLightboxIndex((i) => i !== null ? (i + 1) % allPhotos.length : null), [allPhotos.length]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--txt-s)' }}>読み込み中...</div>;
  if (!cafe) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--txt-s)' }}>店舗が見つかりません</div>;

  const photo = cafe.coverPhoto || cafe.googlePhotos?.[0];

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      {lightboxIndex !== null && (
        <Lightbox photos={allPhotos} index={lightboxIndex} onClose={closeLightbox} onPrev={prevPhoto} onNext={nextPhoto} />
      )}
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

        {/* 写真ギャラリー */}
        {allPhotos.length > 0 && (
          <PhotoGrid photos={allPhotos} onOpen={openLightbox} />
        )}

        {/* 行った！ボタン */}
        <button
          onClick={() => id && toggleVisit(id)}
          style={{
            width: '100%', marginBottom: 12, border: `2px solid ${isVisited ? '#C8860A' : 'var(--line)'}`,
            borderRadius: 12, padding: '13px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'all .2s',
            background: isVisited ? 'var(--acc-lt)' : 'var(--card)',
            color: isVisited ? 'var(--acc)' : 'var(--txt-s)',
          }}
        >
          {isVisited ? `✓ 行ったことがある（${visitDate}）` : '📍 行ったことがある'}
        </button>

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
          reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              onPhotoOpen={(url) => {
                const idx = allPhotos.indexOf(url);
                if (idx >= 0) setLightboxIndex(idx);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
