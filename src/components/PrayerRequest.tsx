'use client';

import Tag from '@/components/ui/Tag';

export default function PrayerRequest() {
  return (
    <div className="relative w-full py-24 overflow-hidden">
      {/* Background SVG */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/prayerbg.svg')`,
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Tag 
          text="Don't Miss it"
          className="mb-8"
        />

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-[#F7FCFD] mb-4">
          Let&apos;s Pray with you
        </h2>

        {/* Body Text */}
        <p className="text-[#F9FBFB]/90 text-lg md:text-xl max-w-2xl mx-auto mb-8">
          We have never for once forgotten that we always need to pray for you and all that concerns you
        </p>

        {/* Button */}
        <button className="bg-secondary-main hover:bg-secondary-dark text-text-primary font-semibold px-8 py-3 rounded-button transition-all duration-300 transform hover:-translate-y-1">
          Fill Prayer Request
        </button>
      </div>
    </div>
  );
} 