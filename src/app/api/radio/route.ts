import { NextResponse } from 'next/server';

// AfriVerse Radio - African News Briefings & Music Streams
// In production, these would come from a database/CMS with actual audio URLs

interface RadioStation {
  id: string;
  name: string;
  description: string;
  country: string;
  genre: string;
  streamUrl: string;
  imageUrl: string;
  isLive: boolean;
  currentShow?: string;
  listeners?: number;
}

interface NewsBriefing {
  id: string;
  title: string;
  description: string;
  duration: string;
  audioUrl: string;
  publishedAt: string;
  category: string;
  narrator: string;
}

// Sample African radio stations (using public streams)
const radioStations: RadioStation[] = [
  {
    id: 'afriverse-main',
    name: 'AfriVerse Radio',
    description: 'Your 24/7 source for Afrobeats, Amapiano, and African hits.',
    country: 'Pan-African',
    genre: 'Afrobeats',
    streamUrl: 'https://stream.zeno.fm/afrobeats', // Placeholder URL
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
    isLive: true,
    currentShow: 'Morning Vibes with DJ Pulse',
    listeners: 1234
  },
  {
    id: 'amapiano-fm',
    name: 'Amapiano FM',
    description: 'Non-stop Amapiano from South Africa to the world.',
    country: 'South Africa',
    genre: 'Amapiano',
    streamUrl: 'https://stream.zeno.fm/amapiano',
    imageUrl: 'https://images.unsplash.com/photo-1571266028243-d220bac66bd9?w=200',
    isLive: true,
    currentShow: 'Groove Session',
    listeners: 856
  },
  {
    id: 'highlife-classics',
    name: 'Highlife Classics',
    description: 'Classic Highlife music from Ghana and Nigeria.',
    country: 'Ghana',
    genre: 'Highlife',
    streamUrl: 'https://stream.zeno.fm/highlife',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200',
    isLive: true,
    currentShow: 'Golden Era',
    listeners: 432
  },
  {
    id: 'bongo-flava',
    name: 'Bongo Flava Radio',
    description: 'The best of Tanzanian Bongo Flava music.',
    country: 'Tanzania',
    genre: 'Bongo Flava',
    streamUrl: 'https://stream.zeno.fm/bongoflava',
    imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200',
    isLive: true,
    currentShow: 'East African Flow',
    listeners: 678
  },
  {
    id: 'naija-fm',
    name: 'Naija FM',
    description: 'Nigeria\'s favorite hits - Afrobeats, Hip-Hop, and more.',
    country: 'Nigeria',
    genre: 'Mixed',
    streamUrl: 'https://stream.zeno.fm/naija',
    imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=200',
    isLive: true,
    currentShow: 'Lagos Nights',
    listeners: 2100
  },
  {
    id: 'chill-africa',
    name: 'Chill Africa',
    description: 'Relaxing African sounds for work and study.',
    country: 'Pan-African',
    genre: 'Chill/Lofi',
    streamUrl: 'https://stream.zeno.fm/chillafro',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200',
    isLive: true,
    currentShow: 'Sunset Vibes',
    listeners: 543
  }
];

// Sample news briefings
const newsBriefings: NewsBriefing[] = [
  {
    id: 'briefing-1',
    title: 'AfriVerse Daily Briefing',
    description: 'Today\'s top stories from across Africa in 5 minutes.',
    duration: '5:00',
    audioUrl: '/audio/briefings/daily.mp3', // Would be actual audio files
    publishedAt: new Date().toISOString(),
    category: 'Daily Briefing',
    narrator: 'AI Voice'
  },
  {
    id: 'briefing-2',
    title: 'Tech Africa Update',
    description: 'Latest tech news, funding rounds, and startup updates.',
    duration: '3:30',
    audioUrl: '/audio/briefings/tech.mp3',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    category: 'Technology',
    narrator: 'AI Voice'
  },
  {
    id: 'briefing-3',
    title: 'Sports Roundup',
    description: 'African football, basketball, and athletics highlights.',
    duration: '4:15',
    audioUrl: '/audio/briefings/sports.mp3',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    category: 'Sports',
    narrator: 'AI Voice'
  },
  {
    id: 'briefing-4',
    title: 'Business & Markets',
    description: 'Stock updates, business news, and economic insights.',
    duration: '3:45',
    audioUrl: '/audio/briefings/business.mp3',
    publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    category: 'Business',
    narrator: 'AI Voice'
  },
  {
    id: 'briefing-5',
    title: 'Entertainment Weekly',
    description: 'Music releases, movie premieres, and celebrity news.',
    duration: '6:00',
    audioUrl: '/audio/briefings/entertainment.mp3',
    publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    category: 'Entertainment',
    narrator: 'AI Voice'
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'stations' or 'briefings'
  const genre = searchParams.get('genre');
  const country = searchParams.get('country');

  if (type === 'briefings') {
    const category = searchParams.get('category');
    let filteredBriefings = [...newsBriefings];
    
    if (category && category !== 'all') {
      filteredBriefings = filteredBriefings.filter(b => 
        b.category.toLowerCase() === category.toLowerCase()
      );
    }

    return NextResponse.json({
      success: true,
      briefings: filteredBriefings,
      categories: [...new Set(newsBriefings.map(b => b.category))]
    });
  }

  // Default: return stations
  let filteredStations = [...radioStations];

  if (genre && genre !== 'all') {
    filteredStations = filteredStations.filter(s => 
      s.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }

  if (country && country !== 'all') {
    filteredStations = filteredStations.filter(s => 
      s.country.toLowerCase().includes(country.toLowerCase())
    );
  }

  const genres = [...new Set(radioStations.map(s => s.genre))];
  const countries = [...new Set(radioStations.map(s => s.country))];

  return NextResponse.json({
    success: true,
    stations: filteredStations,
    genres,
    countries,
    total: filteredStations.length
  });
}
