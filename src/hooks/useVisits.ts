// src/hooks/useVisits.ts
import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { db, doc, getDoc, updateDoc, COLLECTIONS } from '../firebase';

export function useVisits(user: User | null) {
  const [visitedIds, setVisitedIds] = useState<string[]>([]);
  const [visitedDates, setVisitedDates] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) { setVisitedIds([]); setVisitedDates({}); return; }
    getDoc(doc(db, COLLECTIONS.USERS, user.uid)).then((snap) => {
      if (snap.exists()) {
        setVisitedIds(snap.data().visitedIds || []);
        setVisitedDates(snap.data().visitedDates || {});
      }
    });
  }, [user]);

  const toggleVisit = useCallback(async (cafeId: string) => {
    if (!user) return;
    const isVisited = visitedIds.includes(cafeId);
    const nextIds = isVisited
      ? visitedIds.filter((id) => id !== cafeId)
      : [...visitedIds, cafeId];
    const nextDates = { ...visitedDates };
    if (!isVisited) {
      nextDates[cafeId] = new Date().toISOString().split('T')[0];
    } else {
      delete nextDates[cafeId];
    }
    setVisitedIds(nextIds);
    setVisitedDates(nextDates);
    await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
      visitedIds: nextIds,
      visitedDates: nextDates,
    });
  }, [user, visitedIds, visitedDates]);

  return { visitedIds, visitedDates, toggleVisit };
}
