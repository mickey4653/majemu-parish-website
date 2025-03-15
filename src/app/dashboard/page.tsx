'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

interface Stats {
  totalSermons: number;
  totalEvents: number;
  totalAnnouncements: number;
  recentSermon?: { title: string; date: string };
  upcomingEvent?: { title: string; date: string };
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalSermons: 0,
    totalEvents: 0,
    totalAnnouncements: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get collection sizes
        const sermonsSnap = await getDocs(collection(db, 'sermons'));
        const eventsSnap = await getDocs(collection(db, 'events'));
        const announcementsSnap = await getDocs(collection(db, 'announcements'));

        // Get most recent sermon
        const recentSermonQuery = query(
          collection(db, 'sermons'),
          orderBy('date', 'desc'),
          limit(1)
        );
        const recentSermonSnap = await getDocs(recentSermonQuery);
        const recentSermon = recentSermonSnap.docs[0]?.data();

        // Get upcoming event
        const upcomingEventQuery = query(
          collection(db, 'events'),
          orderBy('date', 'asc'),
          limit(1)
        );
        const upcomingEventSnap = await getDocs(upcomingEventQuery);
        const upcomingEvent = upcomingEventSnap.docs[0]?.data();

        setStats({
          totalSermons: sermonsSnap.size,
          totalEvents: eventsSnap.size,
          totalAnnouncements: announcementsSnap.size,
          recentSermon: recentSermon ? {
            title: recentSermon.title,
            date: recentSermon.date,
          } : undefined,
          upcomingEvent: upcomingEvent ? {
            title: upcomingEvent.title,
            date: upcomingEvent.date,
          } : undefined,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Total Sermons',
      value: stats.totalSermons,
      href: '/dashboard/sermons',
      color: 'bg-blue-500',
    },
    {
      title: 'Total Events',
      value: stats.totalEvents,
      href: '/dashboard/events',
      color: 'bg-green-500',
    },
    {
      title: 'Active Announcements',
      value: stats.totalAnnouncements,
      href: '/dashboard/announcements',
      color: 'bg-yellow-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to the CCC Majemu admin dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="relative group rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {loading ? '...' : card.value}
                </p>
              </div>
              <span
                className="absolute bottom-0 left-0 w-full h-1 group-hover:h-2 transition-all"
                style={{ backgroundColor: card.color.replace('bg-', '') }}
              />
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recentSermon && (
              <div>
                <p className="text-sm font-medium text-gray-600">Latest Sermon</p>
                <p className="mt-1">{stats.recentSermon.title}</p>
                <p className="text-sm text-gray-500">{stats.recentSermon.date}</p>
              </div>
            )}
            {stats.upcomingEvent && (
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Event</p>
                <p className="mt-1">{stats.upcomingEvent.title}</p>
                <p className="text-sm text-gray-500">{stats.upcomingEvent.date}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 