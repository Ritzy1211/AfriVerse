import { NextResponse } from 'next/server';

// AfriVerse Radio - Verified working African radio streams

interface AfriVerseStation {
  id: string;
  name: string;
  description: string;
  country: string;
  countryCode: string;
  genre: string;
  streamUrl: string;
  imageUrl: string;
  homepage: string;
  isLive: boolean;
  bitrate: number;
  codec: string;
  listeners: number;
  votes: number;
  language: string;
  color?: string;
  featured?: boolean;
}

// Hardcoded working stations (verified February 2026)
const VERIFIED_STATIONS: AfriVerseStation[] = [
  // ===== SOUTH AFRICA - iono.fm (ALL VERIFIED WORKING) =====
  {
    id: 'metro-fm-sa',
    name: 'Metro FM',
    description: 'South Africa\'s #1 urban station. R&B, Hip-Hop, and Kwaito.',
    country: 'South Africa',
    countryCode: 'ZA',
    genre: 'R&B, Hip-Hop, Kwaito',
    streamUrl: 'https://edge.iono.fm/xice/116_medium.aac',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    homepage: 'https://metrofm.co.za',
    isLive: true,
    bitrate: 128,
    codec: 'AAC',
    listeners: 5200,
    votes: 920,
    language: 'English',
    color: '#FF6B35',
    featured: true
  },
  {
    id: 'yfm-sa',
    name: 'YFM 99.2',
    description: 'Johannesburg\'s youth station. Hip-hop, Amapiano, and R&B.',
    country: 'South Africa',
    countryCode: 'ZA',
    genre: 'Amapiano, Hip-Hop, R&B',
    streamUrl: 'https://edge.iono.fm/xice/170_medium.aac',
    imageUrl: 'https://images.unsplash.com/photo-1571266028243-d220bac66bd9?w=400',
    homepage: 'https://yfm.co.za',
    isLive: true,
    bitrate: 128,
    codec: 'AAC',
    listeners: 4200,
    votes: 780,
    language: 'English',
    color: '#9B5DE5',
    featured: true
  },
  {
    id: '5fm-sa',
    name: '5FM',
    description: 'SABC\'s national youth station. Fresh hits and new music.',
    country: 'South Africa',
    countryCode: 'ZA',
    genre: 'Top 40, Dance, Pop',
    streamUrl: 'https://edge.iono.fm/xice/117_medium.aac',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    homepage: 'https://5fm.co.za',
    isLive: true,
    bitrate: 128,
    codec: 'AAC',
    listeners: 3800,
    votes: 710,
    language: 'English',
    color: '#00BBF9',
    featured: true
  },
  {
    id: 'heart-fm-sa',
    name: 'Heart FM 104.9',
    description: 'Cape Town\'s home of great music. Adult contemporary hits.',
    country: 'South Africa',
    countryCode: 'ZA',
    genre: 'Pop, Adult Contemporary',
    streamUrl: 'https://edge.iono.fm/xice/101_medium.aac',
    imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
    homepage: 'https://heartfm.co.za',
    isLive: true,
    bitrate: 128,
    codec: 'AAC',
    listeners: 2800,
    votes: 540,
    language: 'English',
    color: '#F15BB5'
  },
  {
    id: 'kfm-sa',
    name: 'KFM 94.5',
    description: 'Cape Town\'s leading station. Music, news, and entertainment.',
    country: 'South Africa',
    countryCode: 'ZA',
    genre: 'Pop, Rock, Dance',
    streamUrl: 'https://edge.iono.fm/xice/37_medium.aac',
    imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400',
    homepage: 'https://kfm.co.za',
    isLive: true,
    bitrate: 128,
    codec: 'AAC',
    listeners: 3100,
    votes: 620,
    language: 'English',
    color: '#00F5D4'
  },
  {
    id: 'power-fm-sa',
    name: 'Power FM 98.7',
    description: 'Johannesburg\'s powerful voice. News, talk, and music.',
    country: 'South Africa',
    countryCode: 'ZA',
    genre: 'News, Talk, R&B',
    streamUrl: 'https://edge.iono.fm/xice/139_medium.aac',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    homepage: 'https://powerfm.co.za',
    isLive: true,
    bitrate: 128,
    codec: 'AAC',
    listeners: 2400,
    votes: 460,
    language: 'English',
    color: '#FEE440'
  },
  {
    id: 'goodhope-fm-sa',
    name: 'Good Hope FM',
    description: 'Cape Town\'s feel-good station. Music that moves you.',
    country: 'South Africa',
    countryCode: 'ZA',
    genre: 'Pop, R&B, Dance',
    streamUrl: 'https://edge.iono.fm/xice/100_medium.aac',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    homepage: 'https://goodhopefm.co.za',
    isLive: true,
    bitrate: 128,
    codec: 'AAC',
    listeners: 2100,
    votes: 420,
    language: 'English',
    color: '#FF006E'
  },
  {
    id: 'ukhozi-fm-sa',
    name: 'Ukhozi FM',
    description: 'South Africa\'s Zulu station. Maskandi and traditional music.',
    country: 'South Africa',
    countryCode: 'ZA',
    genre: 'Maskandi, Traditional, Gospel',
    streamUrl: 'https://edge.iono.fm/xice/118_medium.aac',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    homepage: 'https://ukhozifm.co.za',
    isLive: true,
    bitrate: 128,
    codec: 'AAC',
    listeners: 4500,
    votes: 850,
    language: 'Zulu',
    color: '#FB5607'
  },
  {
    id: 'lesedi-fm-sa',
    name: 'Lesedi FM',
    description: 'South Africa\'s Sesotho station. Culture and music.',
    country: 'South Africa',
    countryCode: 'ZA',
    genre: 'Traditional, Gospel, Talk',
    streamUrl: 'https://edge.iono.fm/xice/120_medium.aac',
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400',
    homepage: 'https://lesedifm.co.za',
    isLive: true,
    bitrate: 128,
    codec: 'AAC',
    listeners: 2900,
    votes: 520,
    language: 'Sesotho',
    color: '#8338EC'
  },
  {
    id: 'motsweding-fm-sa',
    name: 'Motsweding FM',
    description: 'Tswana language station. Traditional and contemporary.',
    country: 'South Africa',
    countryCode: 'ZA',
    genre: 'Traditional, Pop, Gospel',
    streamUrl: 'https://edge.iono.fm/xice/121_medium.aac',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400',
    homepage: 'https://motswedingfm.co.za',
    isLive: true,
    bitrate: 128,
    codec: 'AAC',
    listeners: 2200,
    votes: 410,
    language: 'Setswana',
    color: '#3A86FF'
  },
  
  // ===== NIGERIA - VERIFIED WORKING =====
  {
    id: 'wazobia-fm',
    name: 'Wazobia FM 95.1',
    description: 'Lagos biggest pidgin radio station. Entertainment, music & news.',
    country: 'Nigeria',
    countryCode: 'NG',
    genre: 'Afrobeats, Pidgin',
    streamUrl: 'https://stream.radiojar.com/8s5u5tpdtwzuv',
    imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400',
    homepage: 'https://wazobiafm.com',
    isLive: true,
    bitrate: 128,
    codec: 'MP3',
    listeners: 3200,
    votes: 580,
    language: 'Pidgin English',
    color: '#00C49A',
    featured: true
  },

  // ===== SENEGAL - VERIFIED WORKING =====
  {
    id: 'rfm-senegal',
    name: 'RFM Senegal',
    description: 'Dakar\'s rhythm and blues. Mbalax and international hits.',
    country: 'Senegal',
    countryCode: 'SN',
    genre: 'Mbalax, R&B, Pop',
    streamUrl: 'https://stream.radiojar.com/0tpy1h0kxtzuv',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    homepage: 'https://rfm.sn',
    isLive: true,
    bitrate: 128,
    codec: 'MP3',
    listeners: 1400,
    votes: 280,
    language: 'French, Wolof',
    color: '#FFBE0B'
  },

  // ===== MOROCCO - infomaniak (VERIFIED WORKING) =====
  {
    id: 'hit-radio-morocco',
    name: 'Hit Radio Morocco',
    description: 'Morocco\'s #1 hit station. International and Moroccan music.',
    country: 'Morocco',
    countryCode: 'MA',
    genre: 'Pop, Rai, Hip-Hop',
    streamUrl: 'https://hitradio-maroc.ice.infomaniak.ch/hitradio-maroc-128.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    homepage: 'https://hitradio.ma',
    isLive: true,
    bitrate: 128,
    codec: 'MP3',
    listeners: 3100,
    votes: 620,
    language: 'French, Arabic',
    color: '#E71D36',
    featured: true
  },
  {
    id: 'med-radio-morocco',
    name: 'Med Radio',
    description: 'The Mediterranean sound. News, talk, and Moroccan music.',
    country: 'Morocco',
    countryCode: 'MA',
    genre: 'News, Talk, Arabic',
    streamUrl: 'https://medradio.ice.infomaniak.ch/medradio-64.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    homepage: 'https://medradio.ma',
    isLive: true,
    bitrate: 64,
    codec: 'MP3',
    listeners: 1800,
    votes: 350,
    language: 'Arabic, French',
    color: '#2EC4B6'
  },
  {
    id: 'chada-fm-morocco',
    name: 'Chada FM',
    description: 'Morocco\'s modern Arabic station. Pop, culture, and news.',
    country: 'Morocco',
    countryCode: 'MA',
    genre: 'Arabic Pop, News',
    streamUrl: 'https://chadafm.ice.infomaniak.ch/chadafm-128.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    homepage: 'https://chadafm.ma',
    isLive: true,
    bitrate: 128,
    codec: 'MP3',
    listeners: 1500,
    votes: 290,
    language: 'Arabic',
    color: '#011627'
  },
  {
    id: 'mfm-radio-morocco',
    name: 'MFM Radio',
    description: 'Morocco\'s favorite music mix. Arabic and international hits.',
    country: 'Morocco',
    countryCode: 'MA',
    genre: 'Pop, Arabic, Dance',
    streamUrl: 'https://mfmradio.ice.infomaniak.ch/mfmradio-128.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
    homepage: 'https://mfmradio.ma',
    isLive: true,
    bitrate: 128,
    codec: 'MP3',
    listeners: 1200,
    votes: 240,
    language: 'Arabic, French',
    color: '#FF9F1C'
  },
  {
    id: 'aswat-morocco',
    name: 'Aswat Radio',
    description: 'Voice of Morocco. Arabic music, news, and entertainment.',
    country: 'Morocco',
    countryCode: 'MA',
    genre: 'Arabic, News, Culture',
    streamUrl: 'https://aswat.ice.infomaniak.ch/aswat-128.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    homepage: 'https://aswat.ma',
    isLive: true,
    bitrate: 128,
    codec: 'MP3',
    listeners: 950,
    votes: 180,
    language: 'Arabic',
    color: '#7209B7'
  },

  // ===== TUNISIA - VERIFIED WORKING =====
  {
    id: 'mosaique-fm-tunisia',
    name: 'Mosaique FM',
    description: 'Tunisia\'s leading private station. News, music, and culture.',
    country: 'Tunisia',
    countryCode: 'TN',
    genre: 'Pop, Arabic, News',
    streamUrl: 'https://radio.mosaiquefm.net/mosalive',
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400',
    homepage: 'https://mosaiquefm.net',
    isLive: true,
    bitrate: 128,
    codec: 'MP3',
    listeners: 2200,
    votes: 440,
    language: 'Arabic, French',
    color: '#4361EE'
  },

  // ===== ALGERIA =====
  {
    id: 'chaine3-algeria',
    name: 'Chaîne 3 Algeria',
    description: 'Algeria\'s French language station. Music and culture.',
    country: 'Algeria',
    countryCode: 'DZ',
    genre: 'French, Pop, Rai',
    streamUrl: 'https://webradio.tda.dz/Chaine_3_64K.mp3',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    homepage: 'https://radioalgerie.dz',
    isLive: true,
    bitrate: 64,
    codec: 'MP3',
    listeners: 1800,
    votes: 350,
    language: 'French',
    color: '#06D6A0'
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const genre = searchParams.get('genre');
  const country = searchParams.get('country');

  // Return empty briefings for now - use TTS in frontend
  if (type === 'briefings') {
    return NextResponse.json({
      success: true,
      briefings: [],
      categories: ['Daily Briefing', 'Technology', 'Sports', 'Business', 'Entertainment'],
      message: 'News briefings are generated client-side using Text-to-Speech'
    });
  }

  // Filter stations
  let filteredStations = [...VERIFIED_STATIONS];

  if (country && country !== 'all') {
    filteredStations = filteredStations.filter(s => 
      s.country.toLowerCase().includes(country.toLowerCase()) ||
      s.countryCode.toLowerCase() === country.toLowerCase()
    );
  }

  if (genre && genre !== 'all') {
    filteredStations = filteredStations.filter(s => 
      s.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }

  // Sort by votes/popularity
  filteredStations.sort((a, b) => b.votes - a.votes);

  // Get unique countries and genres for filters
  const countries = [...new Set(VERIFIED_STATIONS.map(s => s.country))].sort();
  const genres = [...new Set(VERIFIED_STATIONS.flatMap(s => s.genre.split(',').map(g => g.trim())))].sort();
  const featured = VERIFIED_STATIONS.filter(s => s.featured);

  return NextResponse.json({
    success: true,
    stations: filteredStations,
    featured,
    countries,
    genres,
    total: filteredStations.length
  });
}
