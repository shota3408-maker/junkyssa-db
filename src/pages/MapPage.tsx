// src/pages/MapPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCafes } from '../hooks/useCafes';
import { useFavorites } from '../hooks/useFavorites';
import { Cafe } from '../types';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distLabel(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

type CafeWithDist = Cafe & { distance: number };

function NearbyCard({ cafe, isFav, onToggleFav }: { cafe: CafeWithDist; isFav: boolean; onToggleFav: (id: string) => void }) {
  const navigate = useNavigate();
  const photo = cafe.coverPhoto || cafe.googlePhotos?.[0];
  return (
    <div
      onClick={() => navigate(`/cafe/${cafe.id}`)}
      style={{ display: 'flex', gap: 12, background: 'var(--card)', borderRadius: 14, padding: 12, marginBottom: 12, boxShadow: 'var(--shadow)', border: '1px solid var(--line)', cursor: 'pointer' }}
    >
      {photo
        ? <img src={photo} alt={cafe.name} style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
        : <div style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--pri-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>☕</div>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Noto Serif JP, serif', fontWeight: 700, fontSize: 15, color: 'var(--txt-m)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cafe.name}</div>
        <div style={{ fontSize: 12, color: 'var(--txt-s)', marginBottom: 6 }}>📍 {distLabel(cafe.distance)} · {cafe.address}</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {cafe.overallScore > 0 && (
            <span style={{ background: 'var(--acc-lt)', color: 'var(--acc)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>⭐ {cafe.overallScore.toFixed(1)}</span>
          )}
          {cafe.tags.slice(0, 2).map((t) => (
            <span key={t} style={{ background: 'var(--pri-lt)', color: 'var(--pri)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{t}</span>
          ))}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFav(cafe.id); }}
        style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', alignSelf: 'flex-start', padding: 2, flexShrink: 0 }}
      >
        {isFav ? '❤️' : '🤍'}
      </button>
    </div>
  );
}

export function MapPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cafes, loading } = useCafes();
  const { favoriteIds, toggleFavorite } = useFavorites(user);

  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyCafes, setNearbyCafes] = useState<CafeWithDist[]>([]);
  const [locating, setLocating] = useState(false);

  // マップ初期化
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;
    const map = L.map(mapDivRef.current, { zoomControl: true }).setView([35.6762, 139.6503], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // カフェのピンを追加
  useEffect(() => {
    if (!mapRef.current || cafes.length === 0) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    cafes.forEach((cafe) => {
      if (!cafe.lat || !cafe.lng) return;
      const icon = L.divIcon({
        className: '',
        html: `<div style="font-size:22px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35));cursor:pointer">☕</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14],
      });
      const marker = L.marker([cafe.lat, cafe.lng], { icon }).addTo(mapRef.current!);
      marker.bindPopup(
        `<div style="font-family:sans-serif;min-width:120px">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px">${cafe.name}</div>
          <div style="font-size:12px;color:#888;margin-bottom:6px">${cafe.address}</div>
          <button onclick="window.location.href='/cafe/${cafe.id}'" style="background:#6B3A2A;color:#FDF6E3;border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;width:100%">詳細を見る</button>
        </div>`,
        { maxWidth: 200 }
      );
      markersRef.current.push(marker);
    });
  }, [cafes]);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('このブラウザは位置情報に対応していません');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos({ lat: latitude, lng: longitude });
        setLocating(false);

        mapRef.current?.setView([latitude, longitude], 14);

        // 現在地マーカー（既存あれば削除）
        userMarkerRef.current?.remove();
        const userIcon = L.divIcon({
          className: '',
          html: `<div style="width:18px;height:18px;background:#4285f4;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.45)"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
          .addTo(mapRef.current!)
          .bindTooltip('現在地', { permanent: false });

        // 距離順ソート（上位15件）
        const sorted = cafes
          .filter((c) => c.lat && c.lng)
          .map((c) => ({ ...c, distance: haversineKm(latitude, longitude, c.lat, c.lng) }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 15);
        setNearbyCafes(sorted);
      },
      () => {
        setLocating(false);
        alert('位置情報を取得できませんでした。ブラウザの設定をご確認ください。');
      },
      { timeout: 10000 }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--bg)', paddingBottom: 80 }}>
      {/* マップ */}
      <div ref={mapDivRef} style={{ height: '48vh', width: '100%', flexShrink: 0 }} />

      {/* コントロール・リスト */}
      <div style={{ padding: '16px 16px 0', maxWidth: 680, margin: '0 auto', width: '100%' }}>
        <button
          onClick={handleLocate}
          disabled={locating || loading}
          style={{
            width: '100%', background: 'var(--pri)', color: '#FDF6E3', border: 'none',
            borderRadius: 12, padding: '13px 0', fontSize: 15, fontWeight: 700,
            cursor: locating ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            opacity: locating ? 0.7 : 1, marginBottom: 16, transition: 'opacity .15s',
          }}
        >
          {locating ? '📍 位置情報を取得中...' : '📍 現在地から近い純喫茶を探す'}
        </button>

        {nearbyCafes.length > 0 && (
          <>
            <div style={{ fontFamily: 'Noto Serif JP, serif', fontSize: 15, fontWeight: 700, color: 'var(--txt-m)', marginBottom: 12 }}>
              現在地から近い純喫茶 <span style={{ color: 'var(--acc)' }}>{nearbyCafes.length}件</span>
            </div>
            {nearbyCafes.map((cafe) => (
              <NearbyCard
                key={cafe.id}
                cafe={cafe}
                isFav={favoriteIds.includes(cafe.id)}
                onToggleFav={toggleFavorite}
              />
            ))}
          </>
        )}

        {!userPos && !loading && cafes.length > 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--txt-s)', fontSize: 13, lineHeight: 1.8 }}>
            マップ上の <strong>☕</strong> をタップすると店舗情報が表示されます<br />
            ボタンを押すと現在地周辺の純喫茶を近い順に表示します
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--txt-s)', fontSize: 13 }}>読み込み中...</div>
        )}
      </div>
    </div>
  );
}
