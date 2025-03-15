'use client';

import { useState, useEffect } from 'react';
import { storage, db } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, getDoc } from 'firebase/firestore';
import DashboardLayout from '@/components/DashboardLayout';
import Image from 'next/image';
import { Event } from '@/types';
import ImageUploader from '@/components/ImageUploader';
import { useAuth } from '@/context/AuthContext';

export default function EventsDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    images: [] as File[],
  });

  useEffect(() => {
    fetchEvents();
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const isUserAdmin = userDoc.exists() && userData?.isAdmin === true;
      setIsAdmin(isUserAdmin);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check admin status';
      setError(errorMessage);
      setIsAdmin(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'));
      const snapshot = await getDocs(eventsQuery);
      const eventsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Timestamps to ISO strings
          createdAt: data.createdAt?.toDate().toISOString() || null,
          updatedAt: data.updatedAt?.toDate().toISOString() || null,
        };
      }) as Event[];
      setEvents(eventsData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading events';
      setError(`${errorMessage}. Please try again.`);
    }
  };

  const handleImageChange = (files: File[]) => {
    setFormData(prev => ({ ...prev, images: files }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to perform this action.');
      return;
    }

    if (!isAdmin) {
      setError('You must be an admin to perform this action.');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      let imageUrls: string[] = editingEvent?.imageUrls || [];
      
      if (formData.images.length > 0) {
        // Upload all new images
        const uploadPromises = formData.images.map(async (image, index) => {
          try {
            const safeFileName = image.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const timestamp = Date.now();
            const path = `events/${user.uid}_${timestamp}_${index}_${safeFileName}`;
            const imageRef = ref(storage, path);
            
            const metadata = {
              customMetadata: {
                uploadedBy: user.uid,
                uploadedAt: new Date().toISOString(),
                originalName: image.name
              }
            };

            const snapshot = await uploadBytes(imageRef, image, metadata);
            const url = await getDownloadURL(snapshot.ref);
            return url;
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
            setError(errorMessage);
            throw error;
          }
        });

        // Track upload progress
        let completed = 0;
        const newImageUrls = await Promise.all(
          uploadPromises.map(async (promise) => {
            try {
              const url = await promise;
              completed++;
              setUploadProgress((completed / formData.images.length) * 100);
              return url;
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to get download URL';
              setError(errorMessage);
              throw error;
            }
          })
        );

        imageUrls = [...newImageUrls];
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        imageUrls,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      if (editingEvent) {
        // Update existing event
        await updateDoc(doc(db, 'events', editingEvent.id), eventData);
      } else {
        // Add new event
        await addDoc(collection(db, 'events'), eventData);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        images: [],
      });
      setEditingEvent(null);
      setUploadProgress(0);

      await fetchEvents();
      setLoading(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error saving event';
      setError(`${errorMessage}. Please try again.`);
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      images: [],
    });
    setImagePreview(event.imageUrls && event.imageUrls.length > 0 ? event.imageUrls[0] : null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (event: Event) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'events', event.id));

      // Delete all images from Storage
      if (event.imageUrls && event.imageUrls.length > 0) {
        try {
          await Promise.all(
            event.imageUrls.map(async (url) => {
              const imageRef = ref(storage, url);
              await deleteObject(imageRef);
            })
          );
        } catch (error: unknown) {
          setError(error instanceof Error ? error.message : 'Error deleting images. Please try again.');
        }
      }

      await fetchEvents();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Error deleting event. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            {editingEvent ? 'Edit Event' : 'Add New Event'}
          </h1>
          <div className="flex gap-4 items-center">
            <span className={`px-3 py-1 rounded-full text-sm ${isAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isAdmin ? 'Admin' : 'Not Admin'}
            </span>
            <button
              type="button"
              onClick={checkAdminStatus}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Check Admin Status
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Event Title *
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
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Event Date *
            </label>
            <input
              type="text"
              id="date"
              required
              placeholder="e.g., 22-27 SEPT 2025"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-main focus:ring-primary-main"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-main focus:ring-primary-main"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Event Images {editingEvent ? '(Upload new images to replace existing ones)' : '*'}
            </label>
            <ImageUploader
              onImageSelect={handleImageChange}
              maxFiles={5}
              maxSizeMB={2}
            />
            <p className="mt-1 text-sm text-gray-500">
              Upload up to 5 images (max 2MB each)
            </p>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative w-full h-48">
              <Image
                src={imagePreview}
                alt="Event preview"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary-main h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-main hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main disabled:opacity-50"
            >
              {loading ? 'Saving...' : (editingEvent ? 'Update Event' : 'Add Event')}
            </button>
            {editingEvent && (
              <button
                type="button"
                onClick={() => {
                  setEditingEvent(null);
                  setFormData({
                    title: '',
                    description: '',
                    date: '',
                    images: [],
                  });
                  setImagePreview(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="divide-y divide-gray-200">
            {events.map((event) => (
              <div key={event.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-6">
                    {event.imageUrls && event.imageUrls.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto py-2">
                        {event.imageUrls.map((url, index) => (
                          <div key={index} className="relative w-24 h-24 flex-shrink-0">
                            <Image
                              src={url}
                              alt={`${event.title} - Image ${index + 1}`}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{event.description}</p>
                      <p className="mt-2 text-sm font-medium text-primary-main">{event.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-sm font-medium text-primary-main hover:text-primary-dark"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event)}
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