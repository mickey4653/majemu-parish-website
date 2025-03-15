'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, orderBy, getDocs, deleteDoc, doc, updateDoc, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Sermon } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [preacher, setPreacher] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPreacher, setFilterPreacher] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedSermons, setSelectedSermons] = useState<Set<string>>(new Set());
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 5;

  // Keyboard navigation state
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    fetchSermons();
  }, []);

  const filteredSermons = sermons.filter(sermon => {
    const matchesSearch = searchTerm === '' || 
      sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPreacher = filterPreacher === '' || 
      sermon.preacher.toLowerCase() === filterPreacher.toLowerCase();

    const sermonDate = new Date(sermon.date);
    const matchesDateRange = 
      (!dateRange.start || sermonDate >= new Date(dateRange.start)) &&
      (!dateRange.end || sermonDate <= new Date(dateRange.end));

    return matchesSearch && matchesPreacher && matchesDateRange;
  });

  const fetchSermons = async (loadMore = false) => {
    try {
      setLoading(true);
      let sermonsQuery;
      
      if (loadMore && lastDoc) {
        sermonsQuery = query(
          collection(db, 'sermons'),
          orderBy('date', 'desc'),
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE)
        );
      } else {
        sermonsQuery = query(
          collection(db, 'sermons'),
          orderBy('date', 'desc'),
          limit(ITEMS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(sermonsQuery);
      const sermonsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sermon[];

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === ITEMS_PER_PAGE);

      if (loadMore) {
        setSermons(prev => [...prev, ...sermonsData]);
      } else {
        setSermons(sermonsData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sermons:', error);
      setError('Failed to load sermons');
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchSermons(true);
    }
  };

  // Keyboard navigation handlers
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, filteredSermons.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        if (focusedIndex >= 0) {
          handleEdit(filteredSermons[focusedIndex]);
        }
        break;
      case 'Delete':
        if (focusedIndex >= 0 && e.shiftKey) {
          handleDelete(filteredSermons[focusedIndex].id);
        }
        break;
      case 'a':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleSelectAll();
        }
        break;
    }
  }, [focusedIndex, filteredSermons]);

  // Batch operations
  const handleSelectAll = () => {
    if (selectedSermons.size === filteredSermons.length) {
      setSelectedSermons(new Set());
    } else {
      setSelectedSermons(new Set(filteredSermons.map(sermon => sermon.id)));
    }
  };

  const handleSelectSermon = (sermonId: string) => {
    const newSelected = new Set(selectedSermons);
    if (newSelected.has(sermonId)) {
      newSelected.delete(sermonId);
    } else {
      newSelected.add(sermonId);
    }
    setSelectedSermons(newSelected);
  };

  const handleBatchDelete = async () => {
    if (selectedSermons.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedSermons.size} sermon(s)?`)) {
      try {
        const deletePromises = Array.from(selectedSermons).map(id =>
          deleteDoc(doc(db, 'sermons', id))
        );
        await Promise.all(deletePromises);
        setSelectedSermons(new Set());
        fetchSermons();
      } catch (error) {
        console.error('Error deleting sermons:', error);
        setError('Failed to delete sermons');
      }
    }
  };

  const handleEdit = (sermon: Sermon) => {
    setEditingSermon(sermon);
    setTitle(sermon.title);
    setDescription(sermon.description);
    setYoutubeUrl(sermon.youtubeUrl);
    setPreacher(sermon.preacher);
    setDate(sermon.date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingSermon(null);
    setTitle('');
    setDescription('');
    setYoutubeUrl('');
    setPreacher('');
    setDate('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Extract video ID from YouTube URL
      let videoId;
      
      if (youtubeUrl.includes('/clip/')) {
        // For clip URLs, we need to get the video ID from the clip page
        throw new Error('YouTube clips are not supported. Please use the full video URL instead.');
      } else if (youtubeUrl.includes('youtu.be/')) {
        // Short URL format
        videoId = youtubeUrl.split('youtu.be/')[1]?.split('?')[0];
      } else if (youtubeUrl.includes('youtube.com/watch')) {
        // Standard watch URL
        videoId = new URL(youtubeUrl).searchParams.get('v');
      } else if (youtubeUrl.includes('youtube.com/embed/')) {
        // Embed URL
        videoId = youtubeUrl.split('embed/')[1]?.split('?')[0];
      }

      if (!videoId) {
        throw new Error('Invalid YouTube URL. Please use a standard YouTube video URL (e.g., https://youtube.com/watch?v=...)');
      }

      const embedUrl = `https://www.youtube.com/embed/${videoId}`;

      const sermonData = {
        title,
        description,
        youtubeUrl: embedUrl,
        preacher,
        date,
        updatedAt: new Date().toISOString(),
      };

      if (editingSermon) {
        // Update existing sermon
        await updateDoc(doc(db, 'sermons', editingSermon.id), sermonData);
      } else {
        // Add new sermon
        await addDoc(collection(db, 'sermons'), {
          ...sermonData,
          createdAt: new Date().toISOString(),
        });
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      setYoutubeUrl('');
      setPreacher('');
      setDate('');
      setEditingSermon(null);
      
      // Refresh sermons list
      fetchSermons();
    } catch (error) {
      console.error('Error saving sermon:', error);
      setError(error instanceof Error ? error.message : 'Failed to save sermon');
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

  const uniquePreachers = Array.from(new Set(sermons.map(sermon => sermon.preacher)));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div 
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <h1 className="text-2xl font-bold mb-6">Manage Sermons</h1>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by title or description"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-main focus:ring-primary-main"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="preacher" className="block text-sm font-medium text-gray-700">
                Filter by Preacher
              </label>
              <select
                id="preacher"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-main focus:ring-primary-main"
                value={filterPreacher}
                onChange={(e) => setFilterPreacher(e.target.value)}
              >
                <option value="">All Preachers</option>
                {uniquePreachers.map(preacher => (
                  <option key={preacher} value={preacher}>{preacher}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="startDate" className="sr-only">Start Date</label>
                  <input
                    id="startDate"
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-main focus:ring-primary-main"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    aria-label="Start date filter"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="sr-only">End Date</label>
                  <input
                    id="endDate"
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-main focus:ring-primary-main"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    aria-label="End date filter"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Batch Operations */}
        {filteredSermons.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                id="selectAll"
                checked={selectedSermons.size === filteredSermons.length}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-primary-main focus:ring-primary-main"
              />
              <label htmlFor="selectAll" className="text-sm text-gray-700">
                Select All
              </label>
            </div>
            {selectedSermons.size > 0 && (
              <button
                onClick={handleBatchDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete Selected ({selectedSermons.size})
              </button>
            )}
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
              <p className="mt-1 text-sm text-gray-500">
                Supported formats: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
              </p>
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

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {editingSermon ? 'Update Sermon' : 'Add Sermon'}
              </button>
              {editingSermon && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="bg-white rounded-lg shadow-md">
          <div className="divide-y divide-gray-200">
            {filteredSermons.map((sermon, index) => (
              <div 
                key={sermon.id} 
                className={`p-6 ${focusedIndex === index ? 'ring-2 ring-primary-main' : ''}`}
                tabIndex={0}
                onFocus={() => setFocusedIndex(index)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedSermons.has(sermon.id)}
                      onChange={() => handleSelectSermon(sermon.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-main focus:ring-primary-main"
                      aria-label={`Select sermon: ${sermon.title}`}
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{sermon.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{sermon.description}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Preacher: {sermon.preacher}</p>
                        <p>Date: {new Date(sermon.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleEdit(sermon)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sermon.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
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

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-white px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 