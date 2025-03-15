'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Sermon } from '@/types';
import LatestSermons from './LatestSermons';

export default function ClientSermons() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const sermonsQuery = query(
          collection(db, 'sermons'),
          orderBy('date', 'desc'),
          limit(6)
        );
        const querySnapshot = await getDocs(sermonsQuery);
        const sermonsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Sermon[];
        setSermons(sermonsData);
      } catch (error) {
        console.error('Error fetching sermons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSermons();
  }, []);

  if (loading) return null;
  return <LatestSermons sermons={sermons} />;
} 