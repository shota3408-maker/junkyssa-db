// src/hooks/useReviews.ts
import { useState, useEffect, useCallback } from 'react';
import {
  db, storage, collection, doc, addDoc, deleteDoc,
  query, where, onSnapshot, runTransaction,
  COLLECTIONS, Timestamp,
  ref, uploadBytes, getDownloadURL,
} from '../firebase';
import { Review } from '../types';

function docToReview(d: any): Review {
  const data = d.data();
  return {
    id: d.id,
    cafeId: data.cafeId,
    userId: data.userId,
    userName: data.userName,
    userPhoto: data.userPhoto,
    retroScore: data.retroScore,
    masterScore: data.masterScore,
    soloScore: data.soloScore,
    timelessScore: data.timelessScore,
    overallScore: data.overallScore,
    comment: data.comment,
    visitDate: data.visitDate,
    photos: data.photos || [],
    signatureMenus: data.signatureMenus || [],
    tags: data.tags || [],
    createdAt: data.createdAt?.toDate() || new Date(),
  };
}

export function useReviews(cafeId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cafeId) { setLoading(false); return; }
    const q = query(collection(db, COLLECTIONS.REVIEWS), where('cafeId', '==', cafeId));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(docToReview)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setReviews(list);
      setLoading(false);
    });
    return unsub;
  }, [cafeId]);

  const uploadPhotos = useCallback(async (files: File[], cafeId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const storageRef = ref(storage, `reviews/${cafeId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    return urls;
  }, []);

  const addReview = useCallback(async (
    review: Omit<Review, 'id' | 'createdAt'>,
    photoFiles: File[],
  ) => {
    const photoUrls = await uploadPhotos(photoFiles, review.cafeId);
    const reviewData = { ...review, photos: [...review.photos, ...photoUrls], createdAt: Timestamp.now() };

    await runTransaction(db, async (transaction) => {
      const cafeRef = doc(db, COLLECTIONS.CAFES, review.cafeId);
      const cafeSnap = await transaction.get(cafeRef);
      if (!cafeSnap.exists()) throw new Error('店舗が見つかりません');

      const cafeData = cafeSnap.data();
      const n = (cafeData.reviewCount || 0) + 1;

      const avg = (field: string) =>
        ((cafeData[field] || 0) * (n - 1) + (review as any)[field]) / n;

      transaction.update(cafeRef, {
        retroScore:    avg('retroScore'),
        masterScore:   avg('masterScore'),
        soloScore:     avg('soloScore'),
        timelessScore: avg('timelessScore'),
        overallScore:  avg('overallScore'),
        reviewCount:   n,
        updatedAt:     Timestamp.now(),
      });

      const reviewRef = doc(collection(db, COLLECTIONS.REVIEWS));
      transaction.set(reviewRef, reviewData);

      const userRef = doc(db, COLLECTIONS.USERS, review.userId);
      const userSnap = await transaction.get(userRef);
      if (userSnap.exists()) {
        transaction.update(userRef, { reviewCount: (userSnap.data().reviewCount || 0) + 1 });
      }
    });
  }, [uploadPhotos]);

  return { reviews, loading, addReview };
}
