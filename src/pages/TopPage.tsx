// src/pages/TopPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCafes } from '../hooks/useCafes';
import { useFavorites } from '../hooks/useFavorites';
import { useVisits } from '../hooks/useVisits';
import { Cafe, SCORE_LABELS, POPULAR_TAGS, SearchFilters } from '../types';

const PER_PAGE = 30;

function ScoreBadge({ emoji, value }: { emoji: string; value: number }) {
  if (!value) return null;
  return <div className="score-badge">{emoji} {value.toFixed(1)}</div>;
}

function CafeCard({ cafe, isFav, onToggleFav, isVisited }: { cafe: Cafe; isFav: boolean; onToggleFav: (id: string) => void; isVisited: boolean }) {
  const navigate = useNavigate();
  const photo = cafe.coverPhoto || cafe.googlePhotos?.[0];
  return (
    <div className="card cafe-card" style={{ position: 'relative' }} onClick={() => navigate(`/cafe/${cafe.id}`)}>
      {photo
        ? <img src={photo} alt={cafe.name} className="cafe-card-photo" />
        : <div className="cafe-card-photo">☕</div>
      }
      {isVisited && (
        <div style={{ position: 'absolute', top: 10, left: 10, background: 'var(--acc)', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,.25)' }}>
          ✓ 行った
        </div>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFav(cafe.id); }}
        style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,.85)', border: 'none', borderRadius: '50%', width: 34, height: 34, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }}
      >
        {isFav ? '❤️' : '🤍'}
      </button>
      <div className="cafe-card-body">
        <div className="cafe-card-name">{cafe.name}</div>
        <div className="cafe-card-address">📍 {cafe.address}</div>
        <div className="cafe-card-scores">
          <ScoreBadge emoji={SCORE_LABELS.retroScore.emoji}    value={cafe.retroScore} />
          <ScoreBadge emoji={SCORE_LABELS.masterScore.emoji}   value={cafe.masterScore} />
          <ScoreBadge emoji={SCORE_LABELS.soloScore.emoji}     value={cafe.soloScore} />
          <ScoreBadge emoji={SCORE_LABELS.timelessScore.emoji} value={cafe.timelessScore} />
        </div>
        {cafe.tags.length > 0 && (
          <div className="tag-row">
            {cafe.tags.slice(0, 4).map((t) => <span key={t} className="tag-chip">{t}</span>)}
          </div>
        )}
        {cafe.reviewCount > 0 && (
          <div style={{ fontSize: 11, color: 'var(--txt-s)', marginTop: 6 }}>口コミ {cafe.reviewCount}件</div>
        )}
      </div>
    </div>
  );
}

export function TopPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites(user);
  const { visitedIds } = useVisits(user);
  const [keyword, setKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const filters: SearchFilters = {
    keyword: keyword || undefined,
    tags: selectedTag ? [selectedTag] : undefined,
  };

  const { cafes, loading } = useCafes(filters);

  useEffect(() => { setPage(0); }, [keyword, selectedTag]);

  const total = cafes.length;
  const paged = cafes.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(total / PER_PAGE);
  const startNum = page * PER_PAGE + 1;
  const endNum = Math.min((page + 1) * PER_PAGE, total);

  return (
    <div className="page">
      {/* Hero */}
      <div style={{ background: 'var(--pri)', padding: '24px 20px 28px' }}>
        <div style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 26, fontWeight: 700, color: '#FDF6E3', letterSpacing: 2, marginBottom: 4 }}>
          純喫茶<span style={{ color: 'var(--acc)' }}>DB</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(253,246,227,.7)', marginBottom: 16 }}>昭和レトロ喫茶の聖地巡礼データベース</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="店名・エリアで検索..."
            style={{ flex: 1, border: 'none', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', background: 'rgba(255,255,255,.95)', color: 'var(--txt-m)' }}
          />
        </div>
      </div>

      {/* タグフィルター */}
      <div style={{ overflowX: 'auto', display: 'flex', gap: 8, padding: '12px 16px', scrollbarWidth: 'none' }}>
        <button onClick={() => setSelectedTag(null)} style={{ whiteSpace: 'nowrap', padding: '5px 14px', borderRadius: 20, border: '1.5px solid var(--line)', background: !selectedTag ? 'var(--pri)' : 'white', color: !selectedTag ? '#FDF6E3' : 'var(--txt-s)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>すべて</button>
        {POPULAR_TAGS.slice(0, 10).map((tag) => (
          <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)} style={{ whiteSpace: 'nowrap', padding: '5px 14px', borderRadius: 20, border: '1.5px solid var(--line)', background: selectedTag === tag ? 'var(--pri)' : 'white', color: selectedTag === tag ? '#FDF6E3' : 'var(--txt-s)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{tag}</button>
        ))}
      </div>

      {/* 店舗一覧 */}
      <div className="container">
        <div style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 13, color: 'var(--txt-s)', marginBottom: 12 }}>
          {loading ? '読み込み中...' : total === 0 ? '0件' : `${startNum}〜${endNum}件目 / 全${total}件`}
        </div>

        {!loading && total === 0 && (
          <div className="empty-state">
            <div className="empty-icon">☕</div>
            <p>該当する店舗がありません</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {paged.map((cafe) => (
            <CafeCard
              key={cafe.id}
              cafe={cafe}
              isFav={favoriteIds.includes(cafe.id)}
              onToggleFav={toggleFavorite}
              isVisited={visitedIds.includes(cafe.id)}
            />
          ))}
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '24px 0' }}>
            <button
              onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
              disabled={page === 0}
              style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid var(--line)', background: page === 0 ? 'var(--line)' : 'var(--pri)', color: page === 0 ? 'var(--txt-s)' : '#FDF6E3', fontWeight: 700, cursor: page === 0 ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 14 }}
            >← 前へ</button>
            <span style={{ fontSize: 13, color: 'var(--txt-s)' }}>{page + 1} / {totalPages}</span>
            <button
              onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
              disabled={page >= totalPages - 1}
              style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid var(--line)', background: page >= totalPages - 1 ? 'var(--line)' : 'var(--pri)', color: page >= totalPages - 1 ? 'var(--txt-s)' : '#FDF6E3', fontWeight: 700, cursor: page >= totalPages - 1 ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 14 }}
            >次へ →</button>
          </div>
        )}
      </div>
    </div>
  );
}
