// src/pages/MyPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFavorites, MyList } from '../hooks/useFavorites';
import { db, collection, query, where, getDocs, doc, getDoc, COLLECTIONS } from '../firebase';
import { useVisits } from '../hooks/useVisits';
import { Cafe, Review } from '../types';

const EMOJIS = ['☕', '🍰', '📍', '⭐', '🕰️', '🪑', '🎵', '🌿', '🏠', '💛'];

async function fetchCafesByIds(ids: string[]): Promise<Cafe[]> {
  if (!ids.length) return [];
  const results: Cafe[] = [];
  for (const id of ids) {
    const snap = await getDoc(doc(db, COLLECTIONS.CAFES, id));
    if (snap.exists()) {
      const d = snap.data();
      results.push({ id: snap.id, ...d, createdAt: d.createdAt?.toDate?.() || new Date(), updatedAt: d.updatedAt?.toDate?.() || new Date() } as Cafe);
    }
  }
  return results;
}

function CafeMiniCard({ cafe, onRemove }: { cafe: Cafe; onRemove?: () => void }) {
  const navigate = useNavigate();
  const photo = cafe.coverPhoto || cafe.googlePhotos?.[0];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer' }} onClick={() => navigate(`/cafe/${cafe.id}`)}>
      {photo
        ? <img src={photo} alt={cafe.name} style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
        : <div style={{ width: 52, height: 52, borderRadius: 8, background: 'var(--pri-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>☕</div>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--txt-m)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cafe.name}</div>
        <div style={{ fontSize: 12, color: 'var(--txt-s)', marginTop: 2 }}>📍 {cafe.prefecture}{cafe.city}</div>
      </div>
      {onRemove && (
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--txt-s)', padding: '4px 8px' }}>✕</button>
      )}
    </div>
  );
}

export function MyPage() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const { favoriteIds, lists, toggleFavorite, createList, deleteList, toggleCafeInList } = useFavorites(user);
  const { visitedIds, visitedDates, toggleVisit } = useVisits(user);
  const [favCafes, setFavCafes] = useState<Cafe[]>([]);
  const [visitedCafes, setVisitedCafes] = useState<Cafe[]>([]);
  const [listCafes, setListCafes] = useState<Record<string, Cafe[]>>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [openSection, setOpenSection] = useState<'fav' | 'visited' | string | 'reviews' | null>('fav');
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListEmoji, setNewListEmoji] = useState('☕');
  const [loadingFavs, setLoadingFavs] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, COLLECTIONS.REVIEWS), where('userId', '==', user.uid));
    getDocs(q).then((snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, ...data, createdAt: data.createdAt?.toDate?.() || new Date() } as Review;
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setReviews(list);
    });
  }, [user]);

  useEffect(() => {
    if (!favoriteIds.length) { setFavCafes([]); return; }
    setLoadingFavs(true);
    fetchCafesByIds(favoriteIds).then((c) => { setFavCafes(c); setLoadingFavs(false); });
  }, [favoriteIds.join(',')]);

  useEffect(() => {
    if (!visitedIds.length) { setVisitedCafes([]); return; }
    fetchCafesByIds(visitedIds).then(setVisitedCafes);
  }, [visitedIds.join(',')]);

  useEffect(() => {
    lists.forEach(async (list) => {
      if (!list.cafeIds.length) { setListCafes((p) => ({ ...p, [list.id]: [] })); return; }
      const cafes = await fetchCafesByIds(list.cafeIds);
      setListCafes((p) => ({ ...p, [list.id]: cafes }));
    });
  }, [lists.map((l) => l.id + l.cafeIds.join('')).join(',')]);

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    await createList(newListName.trim(), newListEmoji);
    setNewListName('');
    setNewListEmoji('☕');
    setShowNewList(false);
  };

  if (!user || !profile) return null;

  const SectionHeader = ({ id, emoji, title, count }: { id: string; emoji: string; title: string; count: number }) => (
    <button
      onClick={() => setOpenSection(openSection === id ? null : id as any)}
      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', padding: '14px 0', cursor: 'pointer', fontFamily: 'inherit', borderBottom: '1px solid var(--line)' }}
    >
      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--txt-m)' }}>{emoji} {title}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--txt-s)', background: 'var(--pri-lt)', padding: '2px 10px', borderRadius: 12 }}>{count}件</span>
        <span style={{ fontSize: 12, color: 'var(--txt-s)' }}>{openSection === id ? '▲' : '▼'}</span>
      </span>
    </button>
  );

  return (
    <div className="page">
      {/* プロフィール */}
      <div style={{ background: 'var(--pri)', padding: '32px 20px 24px', textAlign: 'center' }}>
        {profile.photoUrl
          ? <img src={profile.photoUrl} alt="" style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid var(--acc)', objectFit: 'cover' }} />
          : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--acc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto' }}>☕</div>
        }
        <div style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 18, fontWeight: 700, color: '#FDF6E3', marginTop: 12 }}>{profile.displayName}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--acc)' }}>{visitedIds.length}</div>
            <div style={{ fontSize: 11, color: 'rgba(253,246,227,.7)' }}>行った</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--acc)' }}>{profile.reviewCount}</div>
            <div style={{ fontSize: 11, color: 'rgba(253,246,227,.7)' }}>口コミ</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--acc)' }}>{favoriteIds.length}</div>
            <div style={{ fontSize: 11, color: 'rgba(253,246,227,.7)' }}>お気に入り</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--acc)' }}>{lists.length}</div>
            <div style={{ fontSize: 11, color: 'rgba(253,246,227,.7)' }}>マイリスト</div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 8, paddingBottom: 40 }}>

        {/* ❤️ お気に入り */}
        <SectionHeader id="fav" emoji="❤️" title="お気に入り" count={favoriteIds.length} />
        {openSection === 'fav' && (
          <div style={{ paddingBottom: 8 }}>
            {loadingFavs && <div style={{ padding: 20, textAlign: 'center', color: 'var(--txt-s)' }}>読み込み中...</div>}
            {!loadingFavs && favCafes.length === 0 && (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--txt-s)', fontSize: 14 }}>
                カード上のハートボタンで追加できます
              </div>
            )}
            {favCafes.map((cafe) => (
              <CafeMiniCard key={cafe.id} cafe={cafe} onRemove={() => toggleFavorite(cafe.id)} />
            ))}
          </div>
        )}

        {/* 📍 行った純喫茶 */}
        <SectionHeader id="visited" emoji="📍" title="行った純喫茶" count={visitedIds.length} />
        {openSection === 'visited' && (
          <div style={{ paddingBottom: 8 }}>
            {visitedIds.length === 0 && (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--txt-s)', fontSize: 14 }}>
                店舗詳細ページの「行ったことがある」ボタンで記録できます
              </div>
            )}
            {visitedCafes.map((cafe) => (
              <div key={cafe.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer' }} onClick={() => navigate(`/cafe/${cafe.id}`)}>
                {(cafe.coverPhoto || cafe.googlePhotos?.[0])
                  ? <img src={cafe.coverPhoto || cafe.googlePhotos?.[0]} alt={cafe.name} style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0, marginRight: 12 }} />
                  : <div style={{ width: 52, height: 52, borderRadius: 8, background: 'var(--pri-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, marginRight: 12 }}>☕</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--txt-m)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cafe.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--txt-s)', marginTop: 2 }}>
                    📍 {cafe.prefecture}{cafe.city}
                    {visitedDates[cafe.id] && <span style={{ marginLeft: 8, color: 'var(--acc)', fontWeight: 700 }}>· {visitedDates[cafe.id]}</span>}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleVisit(cafe.id); }}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--txt-s)', padding: '4px 8px' }}
                >✕</button>
              </div>
            ))}
          </div>
        )}

        {/* 📁 マイリスト */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--txt-m)', padding: '14px 0 8px' }}>📁 マイリスト</div>
          <button
            onClick={() => setShowNewList(true)}
            style={{ background: 'var(--acc)', border: 'none', borderRadius: 8, padding: '6px 14px', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
          >＋ 新規リスト</button>
        </div>

        {showNewList && (
          <div style={{ background: 'var(--card)', borderRadius: 12, padding: 16, marginBottom: 12, border: '1px solid var(--line)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--txt-m)' }}>新しいリストを作成</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {EMOJIS.map((e) => (
                <button key={e} onClick={() => setNewListEmoji(e)} style={{ width: 36, height: 36, fontSize: 20, borderRadius: 8, border: `2px solid ${newListEmoji === e ? 'var(--acc)' : 'var(--line)'}`, background: newListEmoji === e ? 'var(--acc-lt)' : 'white', cursor: 'pointer' }}>{e}</button>
              ))}
            </div>
            <input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="リスト名（例：行きたい、行った）"
              style={{ width: '100%', border: '1.5px solid var(--line)', borderRadius: 8, padding: '9px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCreateList} style={{ flex: 1, background: 'var(--pri)', border: 'none', borderRadius: 8, padding: 10, color: '#FDF6E3', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>作成</button>
              <button onClick={() => setShowNewList(false)} style={{ flex: 1, background: 'none', border: '1.5px solid var(--line)', borderRadius: 8, padding: 10, color: 'var(--txt-s)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>キャンセル</button>
            </div>
          </div>
        )}

        {lists.length === 0 && !showNewList && (
          <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--txt-s)', fontSize: 13 }}>
            「＋ 新規リスト」でリストを作成できます
          </div>
        )}

        {lists.map((list) => (
          <div key={list.id} style={{ marginBottom: 4 }}>
            <SectionHeader id={list.id} emoji={list.emoji} title={list.name} count={list.cafeIds.length} />
            {openSection === list.id && (
              <div style={{ paddingBottom: 8 }}>
                {(listCafes[list.id] || []).length === 0 && (
                  <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--txt-s)', fontSize: 13 }}>
                    店舗詳細ページからこのリストに追加できます
                  </div>
                )}
                {(listCafes[list.id] || []).map((cafe) => (
                  <CafeMiniCard key={cafe.id} cafe={cafe} onRemove={() => toggleCafeInList(list.id, cafe.id)} />
                ))}
                <button
                  onClick={() => deleteList(list.id)}
                  style={{ width: '100%', marginTop: 10, background: 'none', border: '1px dashed var(--line)', borderRadius: 8, padding: '8px', color: 'var(--txt-s)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                >このリストを削除</button>
              </div>
            )}
          </div>
        ))}

        {/* 口コミ履歴 */}
        <div style={{ marginTop: 8 }}>
          <SectionHeader id="reviews" emoji="✍️" title="口コミ履歴" count={reviews.length} />
          {openSection === 'reviews' && (
            <div style={{ paddingBottom: 8 }}>
              {reviews.length === 0 && (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--txt-s)', fontSize: 14 }}>まだ口コミがありません</div>
              )}
              {reviews.map((r) => (
                <div key={r.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer' }} onClick={() => navigate(`/cafe/${r.cafeId}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, color: 'var(--txt-s)' }}>{r.visitDate}</div>
                    <div style={{ fontSize: 13, color: 'var(--acc)', fontWeight: 700 }}>⭐ {r.overallScore.toFixed(1)}</div>
                  </div>
                  {r.comment && <div style={{ fontSize: 13, color: 'var(--txt-m)', lineHeight: 1.6 }}>{r.comment}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ログアウト */}
        <button
          onClick={logout}
          style={{ width: '100%', background: 'none', border: '1.5px solid var(--line)', borderRadius: 12, padding: '12px', color: 'var(--txt-s)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 24 }}
        >ログアウト</button>
      </div>
    </div>
  );
}
