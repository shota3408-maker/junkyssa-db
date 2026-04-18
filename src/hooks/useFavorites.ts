// src/hooks/useFavorites.ts
import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { db, doc, getDoc, updateDoc, setDoc, COLLECTIONS } from '../firebase';

export interface MyList {
  id: string;
  name: string;
  emoji: string;
  cafeIds: string[];
}

export function useFavorites(user: User | null) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [lists, setLists] = useState<MyList[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) { setFavoriteIds([]); setLists([]); setLoaded(false); return; }
    getDoc(doc(db, COLLECTIONS.USERS, user.uid)).then((snap) => {
      if (snap.exists()) {
        setFavoriteIds(snap.data().favoriteIds || []);
        setLists(snap.data().lists || []);
      }
      setLoaded(true);
    });
  }, [user]);

  const save = useCallback(async (newFavIds: string[], newLists: MyList[]) => {
    if (!user) return;
    await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
      favoriteIds: newFavIds,
      lists: newLists,
    });
  }, [user]);

  const toggleFavorite = useCallback(async (cafeId: string) => {
    const next = favoriteIds.includes(cafeId)
      ? favoriteIds.filter((id) => id !== cafeId)
      : [...favoriteIds, cafeId];
    setFavoriteIds(next);
    await save(next, lists);
  }, [favoriteIds, lists, save]);

  const createList = useCallback(async (name: string, emoji: string) => {
    const newList: MyList = { id: Date.now().toString(), name, emoji, cafeIds: [] };
    const next = [...lists, newList];
    setLists(next);
    await save(favoriteIds, next);
    return newList.id;
  }, [lists, favoriteIds, save]);

  const deleteList = useCallback(async (listId: string) => {
    const next = lists.filter((l) => l.id !== listId);
    setLists(next);
    await save(favoriteIds, next);
  }, [lists, favoriteIds, save]);

  const toggleCafeInList = useCallback(async (listId: string, cafeId: string) => {
    const next = lists.map((l) => {
      if (l.id !== listId) return l;
      const ids = l.cafeIds.includes(cafeId)
        ? l.cafeIds.filter((id) => id !== cafeId)
        : [...l.cafeIds, cafeId];
      return { ...l, cafeIds: ids };
    });
    setLists(next);
    await save(favoriteIds, next);
  }, [lists, favoriteIds, save]);

  return { favoriteIds, lists, loaded, toggleFavorite, createList, deleteList, toggleCafeInList };
}
