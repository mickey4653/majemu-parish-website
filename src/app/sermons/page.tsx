'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Sermon } from '@/types';
import Header from '@/components/layout/Header';

export default function PublicSermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const sermonsQuery = query(collection(db, 'sermons'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(sermonsQuery);
        const sermonsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Sermon[];
        setSermons(sermonsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sermons:', error);
        setError('Failed to load sermons');
        setLoading(false);
      }
    };

    fetchSermons();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Our Sermons
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Watch and listen to our latest sermons and messages
            </p>
          </div>

          {error && (
            <div className="mt-8 bg-red-50 text-red-700 p-4 rounded-md">
              {error}
            </div>
          )}

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sermons.map((sermon) => (
              <div
                key={sermon.id}
                className="flex flex-col bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="flex-1 p-6">
                  <div className="aspect-video mb-4">
                    <iframe
                      src={sermon.youtubeUrl}
                      title={sermon.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {sermon.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {sermon.description}
                  </p>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Preacher: {sermon.preacher}</p>
                    <p>Date: {new Date(sermon.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 