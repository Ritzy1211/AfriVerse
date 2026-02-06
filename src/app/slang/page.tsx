import type { Metadata } from 'next';
import SlangDictionary from './SlangDictionary';

export const metadata: Metadata = {
  title: 'African Slang Dictionary | AfriVerse',
  description: 'Learn popular African slangs and expressions from Nigeria, South Africa, Ghana, Kenya, and more. Discover the meaning, pronunciation, and usage of African words.',
  keywords: ['African slang', 'Nigerian slang', 'South African slang', 'Pidgin English', 'Wahala', 'Eish', 'Chale', 'African expressions', 'African dictionary'],
  openGraph: {
    title: 'African Slang Dictionary | AfriVerse',
    description: 'Your guide to African slang, expressions, and street lingo from across the continent.',
    images: ['/assets/images/slang-og.jpg'],
  },
};

export default function SlangPage() {
  return <SlangDictionary />;
}
