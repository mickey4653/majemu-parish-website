'use client';

import Link from 'next/link';

interface Event {
  id: string;
  date: string;
  title: string;
  description: string;
  imageUrl?: string;
}

interface EventsProps {
  events: Event[];
}

export default function Events({ events }: EventsProps) {
  return (
    <div className="relative w-full py-24 bg-gradient-white-grey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Text Content */}
          <div className="space-y-6">
            <p className="text-lg font-medium text-gray-600">Events Calendar</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Upcoming & Jaw Dropping <span className="text-primary-main">Events and Programs</span>
            </h2>
            <p className="text-[#595956] text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
              incididunt ut labore et dolore magna aliqua. Tellus in hac habitasse platea dictumst.
            </p>
          </div>

          {/* Right Column - Event Boxes */}
          <div className="space-y-4">
            {events.slice(0, 3).map((event) => (
              <div 
                key={event.id}
                className="bg-gray-50 p-6 rounded-tr-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <p className="text-primary-main font-semibold mb-2">{event.date}</p>
                <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
              </div>
            ))}
            
            {/* View Calendar Button Box */}
            <Link 
              href="/all-upcoming-events"
              className="block bg-secondary-main p-6 rounded-tr-lg text-center hover:bg-secondary-dark transition-colors duration-200"
            >
              <span className="font-semibold text-lg">VIEW COMPLETE CALENDAR</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 