import type { Metadata } from 'next';
import RadioPlayer from './RadioPlayer';

export const metadata: Metadata = {
  title: 'AfriVerse Radio | 24/7 African Music & News',
  description: 'Listen to AfriVerse Radio - your 24/7 source for Afrobeats, Amapiano, Highlife, and African news briefings. Stream live African music from anywhere.',
  keywords: ['African radio', 'Afrobeats radio', 'Amapiano', 'African music streaming', 'news briefings', 'African podcasts', 'live radio Africa'],
  openGraph: {
    title: 'AfriVerse Radio | 24/7 African Music & News',
    description: 'Stream live African music and get daily news briefings from across the continent.',
    images: ['/assets/images/radio-og.jpg'],
  },
};

export default function RadioPage() {
  return <RadioPlayer />;
}
