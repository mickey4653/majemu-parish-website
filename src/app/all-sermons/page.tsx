'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, startAfter, limit, QueryDocumentSnapshot, DocumentData, where, QueryConstraint } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Sermon } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Tag from '@/components/ui/Tag';

const SERMONS_PER_PAGE = 9;

type SortOption = 'newest' | 'oldest' | 'preacher';

export default function AllSermons() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const fetchSermons = async (isInitial = false) => {
    try {
      setLoading(true);
      
      // Base query
      const baseQuery = collection(db, 'sermons');
      const queryConstraints: QueryConstraint[] = [];

      // Add date range filters if provided
      if (startDate) {
        queryConstraints.push(where('date', '>=', startDate));
      }
      if (endDate) {
        queryConstraints.push(where('date', '<=', endDate));
      }

      // Add sorting
      switch (sortBy) {
        case 'oldest':
          queryConstraints.push(orderBy('date', 'asc'));
          break;
        case 'preacher':
          queryConstraints.push(orderBy('preacher', 'asc'), orderBy('date', 'desc'));
          break;
        default: // newest
          queryConstraints.push(orderBy('date', 'desc'));
      }

      if (isInitial) {
        queryConstraints.push(limit(SERMONS_PER_PAGE));
      } else if (lastVisible) {
        queryConstraints.push(startAfter(lastVisible), limit(SERMONS_PER_PAGE));
      }

      const sermonsQuery = query(baseQuery, ...queryConstraints);
      const querySnapshot = await getDocs(sermonsQuery);
      let sermonsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sermon[];

      // Client-side search filtering
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        sermonsData = sermonsData.filter(sermon => 
          sermon.title.toLowerCase().includes(searchLower) ||
          sermon.preacher.toLowerCase().includes(searchLower) ||
          sermon.description.toLowerCase().includes(searchLower)
        );
      }

      if (isInitial) {
        setSermons(sermonsData);
      } else {
        setSermons(prev => [...prev, ...sermonsData]);
      }

      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setHasMore(querySnapshot.docs.length === SERMONS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching sermons:', error);
      setError('Failed to load sermons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSermons(true);
  }, [sortBy, startDate, endDate]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchSermons(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSermons(true);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
    fetchSermons(true);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 mt-[5rem]">
            <Tag 
              text="All Sermons"
              bgColor="black"
              textColor="#DFE6E7"
              className="mb-8 backdrop-blur"
            />

            <h2 className="text-4xl md:text-5xl font-bold text-[#0F1415] mb-4">
              Find Latest Sermons Here
            </h2>

            <p className="text-[#0F1415]/80 text-lg md:text-xl max-w-3xl mx-auto mb-12">
              Over the years here are life changing transformation events you should not miss as a CCC Member
            </p>

            {/* Search and Filter Section */}
            <div className="max-w-4xl mx-auto mb-12">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="search" className="sr-only">Search sermons</label>
                    <input
                      id="search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by title, preacher, or description"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary-main text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300"
                  >
                    Search
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div>
                      <label htmlFor="start-date" className="block text-sm text-gray-600 mb-1">Start Date</label>
                      <input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="end-date" className="block text-sm text-gray-600 mb-1">End Date</label>
                      <input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="sort-by" className="block text-sm text-gray-600 mb-1">Sort By</label>
                      <select
                        id="sort-by"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="preacher">Preacher Name</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              </form>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-center mb-8">
              {error}
            </div>
          )}

          {sermons.length === 0 && !loading && (
            <div className="text-center text-gray-600 mb-8">
              No sermons found matching your criteria.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sermons.map((sermon) => (
              <div 
                key={sermon.id} 
                className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="aspect-video relative">
                  <iframe
                    src={sermon.youtubeUrl}
                    title={sermon.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#0F1415] mb-2">
                    {sermon.title}
                  </h3>
                  <p className="text-[#0F1415]/70 text-sm mb-4">
                    {sermon.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-[#0F1415]/60">
                    <span>{sermon.preacher}</span>
                    <span>{new Date(sermon.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loading && (
            <div className="text-center mb-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-main border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            </div>
          )}

          {!loading && hasMore && (
            <div className="text-center mb-12">
              <button
                onClick={loadMore}
                className="bg-primary-main text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300"
              >
                Load More Sermons
              </button>
            </div>
          )}

          {!loading && !hasMore && sermons.length > 0 && (
            <div className="text-center text-[#0F1415]/60 mb-12">
              You&apos;ve reached the end of our sermons collection.
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 