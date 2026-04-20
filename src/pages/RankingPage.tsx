// src/pages/RankingPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCafes } from '../hooks/useCafes';
import { useVisits } from '../hooks/useVisits';
import { Cafe, SCORE_LABELS } from '../types';

type ScoreKey = 'overallScore' | 'retroScore' | 'masterScore' | 'soloScore' | 'timelessScore';

const TABS: { key: ScoreKey; emoji: string; label: string }[] = [
  { key: 'overallScore',   emoji: '⭐', label: '総合' },
  { key: 'retroScore',     emoji: '☕', label: '昭和感' },
  { key: 'masterScore',    emoji: '👴', label: 'マスター感' },
  { key: 'soloScore',      emoji: '🪑', label: '一人入り' },
  { key: 'timelessScore',  emoji: '⏰', label: '時止まり' },
];

const MEDAL: Record<number, { bg: string; color: string; label: string }> = {
  0: { bg: '#FFD700', color: '#7A5A00', label: '1位' },
  1: { bg: '#C0C0C0', color: '#555',    label: '2位' },
  2: { bg: '#CD7F32', color: '#5A3210', label: '3位' },
};

function RankCard({ cafe, rank, score, isVisited }: { cafe: Cafe; rank: number; score: number; isVisited: boolean }) {
  const navigate = useNavigate();
  const photo = cafe.coverPhoto || cafe.googlePhotos?.[0];
  const medal = MEDAL[rank];

  return (
    <div
      onClick={() => navigate(`/cafe/${cafe.id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--card)', borderRadius: 14, padding: '12px 14px',
        marginBottom: 10, boxShadow: 'var(--shadow)',
        border: rank < 3 ? `1.5px solid ${medal.bg}` : '1px solid var(--line)',
        cursor: 'pointer', transition: 'transform .15s',
      }}
    >
      {/* ランクバッジ */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: medal ? medal.bg : 'var(--pri-lt)',
        color: medal ? medal.color : 'var(--txt-s)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: rank < 3 ? 13 : 14,
      }}>
        {rank < 3 ? medal.label : `${rank + 1}位`}
      </div>

      {/* サムネイル */}
      {photo
        ? <img src={photo} alt={cafe.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
        : <div style={{ width: 56, height: 56, borderRadius: 10, background: 'var(--pri-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>☕</div>
      }

      {/* 情報 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontFamily: 'Noto Serif JP, serif', fontWeight: 700, fontSize: 15, color: 'var(--txt-m)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {cafe.name}
          </span>
          {isVisited && (
            <span style={{ fontSize: 10, background: 'var(--acc)', color: 'white', padding: '1px 6px', borderRadius: 10, flexShrink: 0, fontWeight: 700 }}>行った</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--txt-s)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          📍 {cafe.address}
        </div>
        {cafe.tags.slice(0, 2).map((t) => (
          <span key={t} style={{ fontSize: 10, background: 'var(--pri-lt)', color: 'var(--pri)', padding: '1px 8px', borderRadius: 20, marginRight: 4, fontWeight: 700 }}>{t}</span>
        ))}
      </div>

      {/* スコア */}
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--acc)', lineHeight: 1 }}>{score.toFixed(1)}</div>
        <div style={{ fontSize: 10, color: 'var(--txt-s)', marginTop: 2 }}>/ 5.0</div>
      </div>
    </div>
  );
}

export function RankingPage() {
  const { user } = useAuth();
  const { cafes, loading } = useCafes();
  const { visitedIds } = useVisits(user);
  const [activeTab, setActiveTab] = useState<ScoreKey>('overallScore');

  const ranked = cafes
    .filter((c) => (c[activeTab] as number) > 0)
    .sort((a, b) => (b[activeTab] as number) - (a[activeTab] as number))
    .slice(0, 20);

  const meta = SCORE_LABELS[activeTab];

  return (
    <div className="page">
      {/* ヘッダー */}
      <div style={{ background: 'var(--pri)', padding: '20px 20px 0' }}>
        <div style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 22, fontWeight: 700, color: '#FDF6E3', letterSpacing: 2, marginBottom: 4 }}>
          🏆 ランキング
        </div>
        <div style={{ fontSize: 12, color: 'rgba(253,246,227,.7)', marginBottom: 14 }}>
          口コミスコアに基づくTOP20
        </div>

        {/* タブ */}
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', marginLeft: -20, marginRight: -20, paddingLeft: 20 }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                whiteSpace: 'nowrap', padding: '10px 16px', border: 'none', fontFamily: 'inherit',
                background: 'transparent', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                color: activeTab === tab.key ? '#FDF6E3' : 'rgba(253,246,227,.5)',
                borderBottom: activeTab === tab.key ? '3px solid var(--acc)' : '3px solid transparent',
                transition: 'color .15s',
              }}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
          <div style={{ minWidth: 20 }} />
        </div>
      </div>

      <div className="container" style={{ paddingTop: 16 }}>
        {/* 現在のカテゴリ説明 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', background: 'var(--acc-lt)', borderRadius: 10 }}>
          <span style={{ fontSize: 20 }}>{meta.emoji}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--acc)' }}>{meta.label} TOP20</div>
            <div style={{ fontSize: 11, color: 'var(--txt-s)' }}>{meta.description}</div>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--txt-s)', fontSize: 14 }}>読み込み中...</div>
        )}

        {!loading && ranked.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">☕</div>
            <p>まだ口コミがありません</p>
            <span>最初の口コミを投稿しましょう</span>
          </div>
        )}

        {ranked.map((cafe, i) => (
          <RankCard
            key={cafe.id}
            cafe={cafe}
            rank={i}
            score={cafe[activeTab] as number}
            isVisited={visitedIds.includes(cafe.id)}
          />
        ))}

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
