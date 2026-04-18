// src/pages/ReviewFormPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCafe } from '../hooks/useCafes';
import { useReviews } from '../hooks/useReviews';
import { SCORE_LABELS, POPULAR_TAGS } from '../types';

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="star-row">
      {[1,2,3,4,5].map((s) => (
        <span key={s} className={`star ${s <= value ? 'filled' : ''}`} onClick={() => onChange(s)}>★</span>
      ))}
    </div>
  );
}

export function ReviewFormPage({ user }: { user: any }) {
  const { id: cafeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cafe } = useCafe(cafeId);
  const { addReview } = useReviews(cafeId);

  const [retroScore,    setRetroScore]    = useState(0);
  const [masterScore,   setMasterScore]   = useState(0);
  const [soloScore,     setSoloScore]     = useState(0);
  const [timelessScore, setTimelessScore] = useState(0);
  const [overallScore,  setOverallScore]  = useState(0);
  const [comment,       setComment]       = useState('');
  const [visitDate,     setVisitDate]     = useState(new Date().toISOString().split('T')[0]);
  const [selectedTags,  setSelectedTags]  = useState<string[]>([]);
  const [photoFiles,    setPhotoFiles]    = useState<File[]>([]);
  const [saving,        setSaving]        = useState(false);

  const valid = overallScore > 0 && comment.trim().length >= 10;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async () => {
    if (!user || !cafeId || !valid) return;
    setSaving(true);
    try {
      await addReview({
        cafeId,
        userId: user.uid,
        userName: user.displayName || 'ゲスト',
        userPhoto: user.photoURL || undefined,
        retroScore, masterScore, soloScore, timelessScore, overallScore,
        comment: comment.trim(),
        visitDate,
        photos: [],
        signatureMenus: [],
        tags: selectedTags,
      }, photoFiles);
      navigate(`/cafe/${cafeId}`);
    } catch (e) {
      alert('投稿に失敗しました。もう一度お試しください。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div style={{ position: 'sticky', top: 0, background: 'var(--bg)', padding: '10px 16px', zIndex: 10, borderBottom: '1px solid var(--line)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--pri)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← 戻る
        </button>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>
        <h2 style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>口コミを投稿</h2>
        {cafe && <div style={{ fontSize: 14, color: 'var(--txt-s)', marginBottom: 24 }}>{cafe.name}</div>}

        {/* 5軸評価 */}
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>純喫茶スコア</div>
          {([ ['retroScore', retroScore, setRetroScore], ['masterScore', masterScore, setMasterScore], ['soloScore', soloScore, setSoloScore], ['timelessScore', timelessScore, setTimelessScore], ['overallScore', overallScore, setOverallScore] ] as const).map(([key, val, set]) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--txt-s)', marginBottom: 6 }}>
                {SCORE_LABELS[key].emoji} {SCORE_LABELS[key].label}
                <span style={{ fontSize: 11, marginLeft: 6 }}>— {SCORE_LABELS[key].description}</span>
              </div>
              <StarPicker value={val as number} onChange={set as any} />
            </div>
          ))}
        </div>

        {/* コメント */}
        <div className="field">
          <label>コメント（10文字以上）</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="店の雰囲気、マスターの人柄、おすすめメニューなど..."
            rows={5}
          />
          <span style={{ fontSize: 11, color: comment.trim().length >= 10 ? 'var(--acc)' : 'var(--txt-s)' }}>
            {comment.trim().length} 文字
          </span>
        </div>

        {/* 訪問日 */}
        <div className="field">
          <label>訪問日</label>
          <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
        </div>

        {/* タグ */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--txt-s)', marginBottom: 8 }}>タグ（当てはまるものを選択）</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{ padding: '4px 12px', borderRadius: 20, border: '1.5px solid var(--line)', background: selectedTags.includes(tag) ? 'var(--pri)' : 'white', color: selectedTags.includes(tag) ? '#FDF6E3' : 'var(--txt-s)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >{tag}</button>
            ))}
          </div>
        </div>

        {/* 写真 */}
        <div className="field">
          <label>写真（任意・最大3枚）</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []).slice(0, 3);
              setPhotoFiles(files);
            }}
          />
          {photoFiles.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {photoFiles.map((f, i) => (
                <img key={i} src={URL.createObjectURL(f)} alt="" style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover' }} />
              ))}
            </div>
          )}
        </div>

        <button className="btn-pri" onClick={handleSubmit} disabled={!valid || saving}>
          {saving ? '投稿中...' : '投稿する'}
        </button>
        {!valid && overallScore === 0 && (
          <div style={{ fontSize: 12, color: 'var(--txt-s)', textAlign: 'center', marginTop: 8 }}>総合評価を選択してください</div>
        )}
      </div>
    </div>
  );
}
