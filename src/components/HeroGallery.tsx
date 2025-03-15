'use client';

import Image from 'next/image';

interface HeroGalleryProps {
  mainImage: {
    src: string;
    alt: string;
  };
  topLeftImage: {
    src: string;
    alt: string;
  };
  bottomRightImage: {
    src: string;
    alt: string;
  };
}

export default function HeroGallery({ mainImage, topLeftImage, bottomRightImage }: HeroGalleryProps) {
  return (
    <div className="relative w-full max-w-6xl mx-auto aspect-[16/9] my-12">
      {/* Main center image */}
      <div className="relative w-[80%] h-full mx-auto">
        <Image
          src={mainImage.src}
          alt={mainImage.alt}
          fill
          className="object-cover rounded-2xl shadow-2xl"
          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 80vw, 1000px"
          priority
        />
      </div>

      {/* Top left image */}
      <div className="absolute left-0 top-0 w-[30%] aspect-square -translate-x-[10%] -translate-y-[10%] z-10">
        <div className="relative w-full h-full">
          <Image
            src={topLeftImage.src}
            alt={topLeftImage.alt}
            fill
            className="object-cover rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 30vw, 300px"
          />
        </div>
      </div>

      {/* Bottom right image */}
      <div className="absolute right-0 bottom-0 w-[30%] aspect-square translate-x-[10%] translate-y-[10%] z-10">
        <div className="relative w-full h-full">
          <Image
            src={bottomRightImage.src}
            alt={bottomRightImage.alt}
            fill
            className="object-cover rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 30vw, 300px"
          />
        </div>
      </div>
    </div>
  );
} 