'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Header() {
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/admin" className="text-2xl font-bold text-indigo-600">
              CCC Majemu Parish
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link href="/admin" className="text-gray-700 hover:text-indigo-600">
              Home
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-indigo-600">
              About
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
} 