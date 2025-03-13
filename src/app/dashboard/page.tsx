import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="mt-4 text-gray-600">
                Welcome to your dashboard! This is a protected page that only authenticated users can see.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 