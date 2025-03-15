import RectangleBoxes from '@/components/RectangleBoxes';
import PrayerRequest from '@/components/PrayerRequest';
import Events from '@/components/EventsCalendar';
import { RECTANGLE_BOXES } from '@/constants/boxes';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import ClientSermons from '@/components/ClientSermons';
import { Event } from '@/types';
import Navbar from '@/components/layout/Navbar';
import HeroGallery from '@/components/HeroGallery';
import WelcomeHero from '@/components/WelcomeHero';

async function getEvents() {
  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, orderBy('createdAt', 'desc'), limit(3));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Event[];
}

export default async function Home() {
  const events = await getEvents();
  
  return (
    <main>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <WelcomeHero />
        <HeroGallery 
          mainImage={{
            src: "/images/centerimage.png",
            alt: "CCC Majemu Parish Main Image"
          }}
          topLeftImage={{
            src: "/images/topleftimage.png",
            alt: "CCC Majemu Parish Top Left Image"
          }}
          bottomRightImage={{
            src: "/images/bottomrightimage.png",
            alt: "CCC Majemu Parish Bottom Right Image"
          }}
        />
        <RectangleBoxes boxes={RECTANGLE_BOXES} />
        <PrayerRequest />
        <ClientSermons />
        <Events events={events} />
      </div>
    </main>
  );
}
