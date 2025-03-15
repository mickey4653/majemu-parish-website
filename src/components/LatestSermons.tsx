'use client';

import Link from 'next/link';
import Tag from '@/components/ui/Tag';
import { Sermon } from '@/types';

interface LatestSermonsProps {
  sermons: Sermon[];
}

export default function LatestSermons({ sermons }: LatestSermonsProps) {
  return (
    <div className="relative w-full py-24">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-white" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Tag 
            text="Latest Sermons"
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
        </div>

        {/* Section Header with SEE ALL link */}
        <div className="flex justify-end mb-6">
          <Link 
            href="/all-sermons"
            className="inline-flex items-center text-primary-main hover:text-primary-dark font-semibold transition-colors duration-200"
          >
            SEE ALL
            <svg 
              className="ml-2 w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </Link>
        </div>

        {/* Sermons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sermons.slice(0, 6).map((sermon) => (
            <div 
              key={sermon.id} 
              className="bg-black/30 backdrop-blur rounded-tr-lg overflow-hidden shadow-lg"
            >
              <div className="aspect-video relative">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(sermon.youtubeUrl)}`}
                  title={sermon.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold text-lg mb-2">{sermon.title}</h3>
                <p className="text-white/70 text-sm">{sermon.preacher}</p>
                <p className="text-white/50 text-xs">
                  {new Date(sermon.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper function to extract YouTube video ID from URL
function getYouTubeId(url: string): string {
  try {
    if (url.includes('youtube.com/embed/')) {
      // Already an embed URL, just extract the ID
      return url.split('embed/')[1]?.split('?')[0] || '';
    }
    
    if (url.includes('youtu.be/')) {
      // Short URL format
      return url.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    
    if (url.includes('youtube.com/watch')) {
      // Standard watch URL
      return new URL(url).searchParams.get('v') || '';
    }
    
    return '';
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    return '';
  }
} 