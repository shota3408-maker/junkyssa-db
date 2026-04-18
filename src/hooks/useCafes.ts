// src/hooks/useCafes.ts
import { useState, useEffect, useCallback } from 'react';
import {
  db, collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, where, orderBy, limit, onSnapshot,
  COLLECTIONS, Timestamp,
} from '../firebase';
import { Cafe, SearchFilters } from '../types';

function docToCafe(d: any): Cafe {
  const data = d.data();
  return {
    id: d.id,
    placeId: data.placeId,
    name: data.name,
    address: data.address,
    prefecture: data.prefecture || '',
    city: data.city || '',
    lat: data.lat || 0,
    lng: data.lng || 0,
    phone: data.phone,
    hours: data.hours || [],
    googleRating: data.googleRating,
    googlePhotos: data.googlePhotos || [],
    retroScore: data.retroScore || 0,
    masterScore: data.masterScore || 0,
    soloScore: data.soloScore || 0,
    timelessScore: data.timelessScore || 0,
    overallScore: data.overallScore || 0,
    reviewCount: data.reviewCount || 0,
    tags: data.tags || [],
    signatureMenus: data.signatureMenus || [],
    established: data.established,
    status: data.status || 'unknown',
    coverPhoto: data.coverPhoto,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

export function useCafes(filters?: SearchFilters) {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let q = query(collection(db, COLLECTIONS.CAFES), orderBy('overallScore', 'desc'), limit(2000));

    if (filters?.prefecture) {
      q = query(collection(db, COLLECTIONS.CAFES), where('prefecture', '==', filters.prefecture), limit(2000));
    }

    const unsub = onSnapshot(q, (snap) => {
      let list = snap.docs.map(docToCafe);

      if (filters?.keyword) {
        const kw = filters.keyword.toLowerCase();
        list = list.filter((c) =>
          c.name.toLowerCase().includes(kw) ||
          c.address.toLowerCase().includes(kw) ||
          c.tags.some((t) => t.includes(kw))
        );
      }
      if (filters?.minRetroScore) list = list.filter((c) => c.retroScore >= filters.minRetroScore!);
      if (filters?.minSoloScore)  list = list.filter((c) => c.soloScore  >= filters.minSoloScore!);
      if (filters?.tags?.length)  list = list.filter((c) => filters.tags!.some((t) => c.tags.includes(t)));

      setCafes(list);
      setLoading(false);
    });
    return unsub;
  }, [filters?.prefecture, filters?.keyword, filters?.minRetroScore, filters?.minSoloScore]);

  return { cafes, loading };
}

export function useCafe(cafeId: string | undefined) {
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cafeId) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, COLLECTIONS.CAFES, cafeId), (snap) => {
      setCafe(snap.exists() ? docToCafe(snap) : null);
      setLoading(false);
    });
    return unsub;
  }, [cafeId]);

  return { cafe, loading };
}

export function useAddCafe() {
  const addCafe = useCallback(async (data: Omit<Cafe, 'id' | 'createdAt' | 'updatedAt'>) => {
    const ref = await addDoc(collection(db, COLLECTIONS.CAFES), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return ref.id;
  }, []);

  return { addCafe };
}
