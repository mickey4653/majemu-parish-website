'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Sermon } from '@/types';

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [preacher, setPreacher] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSermons();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Extract video ID from YouTube URL
      const videoId = youtubeUrl.includes('v=') 
        ? youtubeUrl.split('v=')[1].split('&')[0]
        : youtubeUrl.split('/').pop();

      const embedUrl = `https://www.youtube.com/embed/${videoId}`;

      const sermon = {
        title,
        description,
        youtubeUrl: embedUrl,
        preacher,
        date,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'sermons'), sermon);
      
      // Reset form
      setTitle('');
      setDescription('');
      setYoutubeUrl('');
      setPreacher('');
      setDate('');
      
      // Refresh sermons list
      fetchSermons();
    } catch (error) {
      console.error('Error adding sermon:', error);
      setError('Failed to add sermon');
    }
  };

  const handleDelete = async (sermonId: string) => {
    if (window.confirm('Are you sure you want to delete this sermon?')) {
      try {
        await deleteDoc(doc(db, 'sermons', sermonId));
        fetchSermons();
      } catch (error) {
        console.error('Error deleting sermon:', error);
        setError('Failed to delete sermon');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Sermons</h1>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter sermon title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter sermon description"
            />
          </div>

          <div>
            <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700">YouTube URL</label>
            <input
              id="youtubeUrl"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              required
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="preacher" className="block text-sm font-medium text-gray-700">Preacher</label>
            <input
              id="preacher"
              type="text"
              value={preacher}
              onChange={(e) => setPreacher(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter preacher's name"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add Sermon
          </button>
        </div>
      </form>

      <div className="bg-white rounded-lg shadow-md">
        <div className="divide-y divide-gray-200">
          {sermons.map((sermon) => (
            <div key={sermon.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{sermon.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{sermon.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Preacher: {sermon.preacher}</p>
                    <p>Date: {new Date(sermon.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(sermon.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
              <div className="mt-4 aspect-video">
                <iframe
                  src={sermon.youtubeUrl}
                  title={sermon.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 