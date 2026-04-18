// src/pages/AdminPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddCafe } from '../hooks/useCafes';
import { POPULAR_TAGS } from '../types';

const PLACES_API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY || '';

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  formatted_phone_number?: string;
  opening_hours?: { weekday_text: string[] };
  rating?: number;
  photos?: { photo_reference: string }[];
}

export function AdminPage({ profile }: { profile: any }) {
  const navigate = useNavigate();
  const { addCafe } = useAddCafe();

  // Places API検索
  const [searchQuery, setSearchQuery] = useState('');
  const [placeResult, setPlaceResult] = useState<PlaceResult | null>(null);
  const [searching, setSearching] = useState(false);

  // 手動入力フィールド
  const [name,        setName]        = useState('');
  const [address,     setAddress]     = useState('');
  const [prefecture,  setPrefecture]  = useState('');
  const [city,        setCity]        = useState('');
  const [lat,         setLat]         = useState('');
  const [lng,         setLng]         = useState('');
  const [phone,       setPhone]       = useState('');
  const [established, setEstablished] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [signatureMenus, setSignatureMenus] = useState('');
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'search' | 'manual'>('manual');

  if (profile?.role !== 'admin') {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <p>管理者のみアクセスできます</p>
          <button className="btn-sec" style={{ marginTop: 16 }} onClick={() => navigate('/')}>トップに戻る</button>
        </div>
      </div>
    );
  }

  const searchPlace = async () => {
    if (!searchQuery.trim() || !PLACES_API_KEY) return;
    setSearching(true);
    try {
      // Places Text Search → Find Place → Place Details の流れ
      // ※ CORSの関係でサーバーサイドが必要なため、ここでは手動入力フォームを主体にする
      // 将来的にCloud Functionsで実装
      alert('Places API連携はCloud Functions経由で実装予定です。現在は手動入力をご利用ください。');
    } finally {
      setSearching(false);
    }
  };

  const fillFromPlace = (place: PlaceResult) => {
    setName(place.name);
    setAddress(place.formatted_address);
    setLat(String(place.geometry.location.lat));
    setLng(String(place.geometry.location.lng));
    setPhone(place.formatted_phone_number || '');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleSave = async () => {
    if (!name || !address) return;
    setSaving(true);
    try {
      await addCafe({
        placeId: placeResult?.place_id,
        name, address,
        prefecture, city,
        lat: parseFloat(lat) || 0,
        lng: parseFloat(lng) || 0,
        phone: phone || undefined,
        hours: placeResult?.opening_hours?.weekday_text || [],
        googleRating: placeResult?.rating,
        googlePhotos: [],
        retroScore: 0, masterScore: 0, soloScore: 0, timelessScore: 0, overallScore: 0,
        reviewCount: 0,
        tags: selectedTags,
        signatureMenus: signatureMenus.split('、').map((s) => s.trim()).filter(Boolean),
        established: established || undefined,
        status: 'open',
      });
      alert(`「${name}」を登録しました`);
      navigate('/');
    } catch (e) {
      alert('登録に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div style={{ position: 'sticky', top: 0, background: 'var(--bg)', padding: '10px 16px', zIndex: 10, borderBottom: '1px solid var(--line)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--pri)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>← 戻る</button>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>
        <h2 style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>店舗を登録する</h2>

        <div className="field"><label>店名 *</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="○○珈琲店" /></div>
        <div className="field"><label>住所 *</label><input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="東京都新宿区..." /></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="field" style={{ flex: 1 }}><label>都道府県</label><input value={prefecture} onChange={(e) => setPrefecture(e.target.value)} placeholder="東京都" /></div>
          <div className="field" style={{ flex: 1 }}><label>市区町村</label><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="新宿区" /></div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="field" style={{ flex: 1 }}><label>緯度</label><input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="35.6895" /></div>
          <div className="field" style={{ flex: 1 }}><label>経度</label><input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="139.6917" /></div>
        </div>
        <div className="field"><label>電話番号</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03-xxxx-xxxx" /></div>
        <div className="field"><label>創業年</label><input value={established} onChange={(e) => setEstablished(e.target.value)} placeholder="1962年" /></div>
        <div className="field">
          <label>名物メニュー（読点「、」区切り）</label>
          <input value={signatureMenus} onChange={(e) => setSignatureMenus(e.target.value)} placeholder="ナポリタン、プリン、クリームソーダ" />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--txt-s)', marginBottom: 8 }}>タグ</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {POPULAR_TAGS.map((tag) => (
              <button key={tag} onClick={() => toggleTag(tag)}
                style={{ padding: '4px 12px', borderRadius: 20, border: '1.5px solid var(--line)', background: selectedTags.includes(tag) ? 'var(--pri)' : 'white', color: selectedTags.includes(tag) ? '#FDF6E3' : 'var(--txt-s)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-pri" onClick={handleSave} disabled={!name || !address || saving}>
          {saving ? '登録中...' : '登録する'}
        </button>
      </div>
    </div>
  );
}
