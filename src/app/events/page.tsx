import type { Metadata } from 'next';
import EventCalendar from './EventCalendar';

export const metadata: Metadata = {
  title: 'African Events Calendar | AfriVerse',
  description: 'Discover upcoming events across Africa - festivals, concerts, tech conferences, sports tournaments, holidays, and more. Your guide to what\'s happening in Africa.',
  keywords: ['African events', 'Africa calendar', 'festivals in Africa', 'African concerts', 'tech events Africa', 'AFCON', 'Afrochella', 'Lagos events', 'Nairobi events', 'African holidays'],
  openGraph: {
    title: 'African Events Calendar | AfriVerse',
    description: 'Your complete guide to events happening across Africa. Festivals, concerts, conferences, and more.',
    images: ['/assets/images/events-og.jpg'],
  },
};

export default function EventsPage() {
  return <EventCalendar />;
}
