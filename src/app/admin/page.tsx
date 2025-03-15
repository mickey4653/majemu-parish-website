import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Hero Section */}
        <div className="relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Welcome to</span>
                    <span className="block text-primary-main">CCC Majemu Parish</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    A vibrant congregation of the Celestial Church of Christ located in the heart of Washington, DC.
                    Join us in worship and fellowship.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        href="/dashboard"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-button text-text-primary bg-secondary-main hover:bg-secondary-dark transition duration-200 md:py-4 md:text-lg md:px-10"
                      >
                        Go to Dashboard
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center" id="about">
              <h2 className="text-base text-primary-main font-semibold tracking-wide uppercase">Our Values</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                B.F.G.P.S
              </p>
            </div>

            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-main text-white">
                      B
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Bible Based</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    We root all our teachings and practices in Biblical truth.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-main text-white">
                      F
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Faith-Focused</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    We nurture and strengthen faith as the cornerstone of our spiritual journey.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-main text-white">
                      G
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">God-Centered</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    We place God at the center of all our activities and decisions.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-main text-white">
                      P
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">People-Oriented</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    We create an inclusive, welcoming environment focused on community and outreach.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-main text-white">
                      S
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Spirit-Led</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    We remain open to the guidance and direction of the Holy Spirit in all we do.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
} 