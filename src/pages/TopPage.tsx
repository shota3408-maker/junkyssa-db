// src/pages/TopPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCafes } from '../hooks/useCafes';
import { Cafe, SCORE_LABELS, POPULAR_TAGS, SearchFilters } from '../types';

function ScoreBadge({ emoji, value }: { emoji: string; value: number }) {
  if (!value) return null;
  return (
    <div className="score-badge">
      {emoji} {value.toFixed(1)}
    </div>
  );
}

function CafeCard({ cafe }: { cafe: Cafe }) {
  const navigate = useNavigate();
  const photo = cafe.coverPhoto || cafe.googlePhotos?.[0];
  return (
    <div className="card cafe-card" onClick={() => navigate(`/cafe/${cafe.id}`)}>
      {photo
        ? <img src={photo} alt={cafe.name} className="cafe-card-photo" />
        : <div className="cafe-card-photo">☕</div>
      }
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
  const [keyword, setKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [minRetro, setMinRetro] = useState<number | undefined>();

  const filters: SearchFilters = {
    keyword: keyword || undefined,
    tags: selectedTag ? [selectedTag] : undefined,
    minRetroScore: minRetro,
  };

  const { cafes, loading } = useCafes(filters);

  return (
    <div className="page">
      {/* Hero */}
      <div style={{ background: 'var(--pri)', padding: '24px 20px 28px' }}>
        <div style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 26, fontWeight: 700, color: '#FDF6E3', letterSpacing: 2, marginBottom: 4 }}>
          純喫茶<span style={{ color: 'var(--acc)' }}>DB</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(253,246,227,.7)', marginBottom: 16 }}>昭和レトロ喫茶の聖地巡礼データベース</div>

        {/* 検索バー */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="店名・エリアで検索..."
            style={{ flex: 1, border: 'none', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', background: 'rgba(255,255,255,.95)', color: 'var(--txt-m)' }}
          />
          <button onClick={() => navigate('/search')} style={{ background: 'var(--acc)', border: 'none', borderRadius: 10, padding: '10px 14px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
            絞込
          </button>
        </div>
      </div>

      {/* タグフィルター */}
      <div style={{ overflowX: 'auto', display: 'flex', gap: 8, padding: '12px 16px', scrollbarWidth: 'none' }}>
        <button
          onClick={() => setSelectedTag(null)}
          style={{ whiteSpace: 'nowrap', padding: '5px 14px', borderRadius: 20, border: '1.5px solid var(--line)', background: !selectedTag ? 'var(--pri)' : 'white', color: !selectedTag ? '#FDF6E3' : 'var(--txt-s)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >すべて</button>
        {POPULAR_TAGS.slice(0, 10).map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            style={{ whiteSpace: 'nowrap', padding: '5px 14px', borderRadius: 20, border: '1.5px solid var(--line)', background: selectedTag === tag ? 'var(--pri)' : 'white', color: selectedTag === tag ? '#FDF6E3' : 'var(--txt-s)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >{tag}</button>
        ))}
      </div>

      {/* 店舗一覧 */}
      <div className="container">
        <div style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 14, color: 'var(--txt-s)', marginBottom: 12 }}>
          {loading ? '読み込み中...' : `${cafes.length}件`}
        </div>

        {!loading && cafes.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">☕</div>
            <p>まだ店舗がありません</p>
            <span>管理者が順次登録していきます</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {cafes.map((cafe) => <CafeCard key={cafe.id} cafe={cafe} />)}
        </div>
      </div>
    </div>
  );
}
