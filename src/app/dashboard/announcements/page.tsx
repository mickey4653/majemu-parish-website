'use client';

import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import DashboardLayout from '@/components/DashboardLayout';
import { Announcement } from '@/types';

export default function AnnouncementsDashboard() {
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isActive: true,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const announcementsQuery = query(collection(db, 'announcements'), orderBy('startDate', 'desc'));
      const snapshot = await getDocs(announcementsQuery);
      const announcementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[];
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      alert('Error loading announcements. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const announcementData = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      if (editingAnnouncement) {
        // Update existing announcement
        await updateDoc(doc(db, 'announcements', editingAnnouncement.id), announcementData);
      } else {
        // Add new announcement
        await addDoc(collection(db, 'announcements'), {
          ...announcementData,
          createdAt: serverTimestamp(),
        });
      }

      // Reset form
      setFormData({
        title: '',
        content: '',
        isActive: true,
        startDate: '',
        endDate: '',
      });
      setEditingAnnouncement(null);

      alert(editingAnnouncement ? 'Announcement updated successfully!' : 'Announcement added successfully!');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Error saving announcement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      isActive: announcement.isActive,
      startDate: announcement.startDate,
      endDate: announcement.endDate || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (announcement: Announcement) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await deleteDoc(doc(db, 'announcements', announcement.id));
      alert('Announcement deleted successfully!');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Error deleting announcement. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-8">
          {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
        </h1>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Announcement Title
            </label>
            <input
              type="text"
              id="title"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-main focus:ring-primary-main"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-main focus:ring-primary-main"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-main focus:ring-primary-main"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date (Optional)
              </label>
              <input
                type="date"
                id="endDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-main focus:ring-primary-main"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              className="h-4 w-4 rounded border-gray-300 text-primary-main focus:ring-primary-main"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Make announcement active immediately
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-main hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main disabled:opacity-50"
            >
              {loading ? 'Saving...' : (editingAnnouncement ? 'Update Announcement' : 'Add Announcement')}
            </button>
            {editingAnnouncement && (
              <button
                type="button"
                onClick={() => {
                  setEditingAnnouncement(null);
                  setFormData({
                    title: '',
                    content: '',
                    isActive: true,
                    startDate: '',
                    endDate: '',
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* Announcements List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {announcement.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{announcement.content}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Start Date: {new Date(announcement.startDate).toLocaleDateString()}</p>
                      {announcement.endDate && (
                        <p>End Date: {new Date(announcement.endDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="text-sm font-medium text-primary-main hover:text-primary-dark"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(announcement)}
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 