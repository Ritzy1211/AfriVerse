import { NextResponse } from 'next/server';

// Sample African events database
// In production, this would come from a database or CMS
const africanEvents = [
  // Festivals & Cultural Events
  {
    id: '1',
    title: 'Lagos Jazz Festival',
    description: 'West Africa\'s premier jazz festival featuring international and local artists.',
    startDate: '2025-02-14',
    endDate: '2025-02-16',
    location: 'Lagos, Nigeria',
    country: 'Nigeria',
    category: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
    ticketUrl: 'https://lagosjazzfestival.com',
    isFree: false,
    featured: true
  },
  {
    id: '2',
    title: 'AFCON 2025',
    description: 'Africa Cup of Nations - the continent\'s biggest football tournament.',
    startDate: '2025-12-21',
    endDate: '2026-01-18',
    location: 'Morocco',
    country: 'Morocco',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
    ticketUrl: 'https://www.cafonline.com',
    isFree: false,
    featured: true
  },
  {
    id: '3',
    title: 'Afrobeats Festival Berlin',
    description: 'Europe\'s largest Afrobeats festival celebrating African music and culture.',
    startDate: '2025-07-11',
    endDate: '2025-07-13',
    location: 'Berlin, Germany',
    country: 'Germany',
    category: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    ticketUrl: 'https://afrobeatsfestival.de',
    isFree: false,
    featured: true
  },
  {
    id: '4',
    title: 'Kenya Tech Week',
    description: 'East Africa\'s largest technology conference and startup expo.',
    startDate: '2025-03-10',
    endDate: '2025-03-14',
    location: 'Nairobi, Kenya',
    country: 'Kenya',
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    ticketUrl: 'https://kenyatechweek.com',
    isFree: false,
    featured: true
  },
  {
    id: '5',
    title: 'Durban July',
    description: 'Africa\'s greatest horse racing event and fashion showcase.',
    startDate: '2025-07-05',
    endDate: '2025-07-05',
    location: 'Durban, South Africa',
    country: 'South Africa',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?w=400',
    ticketUrl: 'https://durbanjuly.co.za',
    isFree: false,
    featured: false
  },
  {
    id: '6',
    title: 'African Leadership Summit',
    description: 'Annual gathering of African business leaders, politicians, and changemakers.',
    startDate: '2025-04-22',
    endDate: '2025-04-24',
    location: 'Kigali, Rwanda',
    country: 'Rwanda',
    category: 'Business',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
    ticketUrl: 'https://africanleadershipsummit.org',
    isFree: false,
    featured: false
  },
  {
    id: '7',
    title: 'Essence Festival Durban',
    description: 'Celebrating Black excellence with music, culture, and empowerment.',
    startDate: '2025-11-07',
    endDate: '2025-11-09',
    location: 'Durban, South Africa',
    country: 'South Africa',
    category: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400',
    ticketUrl: 'https://essencefestivaldurban.com',
    isFree: false,
    featured: true
  },
  {
    id: '8',
    title: 'Ghana Independence Day',
    description: 'National celebration of Ghana\'s independence with parades and festivities.',
    startDate: '2025-03-06',
    endDate: '2025-03-06',
    location: 'Accra, Ghana',
    country: 'Ghana',
    category: 'Holiday',
    imageUrl: 'https://images.unsplash.com/photo-1603910234616-c1bfe6a41d72?w=400',
    ticketUrl: null,
    isFree: true,
    featured: false
  },
  {
    id: '9',
    title: 'Nigeria Democracy Day',
    description: 'National celebration of Nigeria\'s return to democracy.',
    startDate: '2025-06-12',
    endDate: '2025-06-12',
    location: 'Abuja, Nigeria',
    country: 'Nigeria',
    category: 'Holiday',
    imageUrl: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?w=400',
    ticketUrl: null,
    isFree: true,
    featured: false
  },
  {
    id: '10',
    title: 'GITEX Africa',
    description: 'Africa\'s largest tech and startup event, connecting global innovators.',
    startDate: '2025-04-14',
    endDate: '2025-04-16',
    location: 'Marrakech, Morocco',
    country: 'Morocco',
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400',
    ticketUrl: 'https://gitexafrica.com',
    isFree: false,
    featured: true
  },
  {
    id: '11',
    title: 'Afrochella',
    description: 'Ghana\'s biggest music and cultural festival during Detty December.',
    startDate: '2025-12-28',
    endDate: '2025-12-29',
    location: 'Accra, Ghana',
    country: 'Ghana',
    category: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    ticketUrl: 'https://afrochella.com',
    isFree: false,
    featured: true
  },
  {
    id: '12',
    title: 'African Cup of Clubs',
    description: 'Continental basketball championship featuring top African clubs.',
    startDate: '2025-05-15',
    endDate: '2025-05-25',
    location: 'Cairo, Egypt',
    country: 'Egypt',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
    ticketUrl: 'https://fiba.basketball/africa',
    isFree: false,
    featured: false
  },
  {
    id: '13',
    title: 'Cape Town Design Week',
    description: 'Showcasing African creativity and innovation in design.',
    startDate: '2025-08-18',
    endDate: '2025-08-22',
    location: 'Cape Town, South Africa',
    country: 'South Africa',
    category: 'Culture',
    imageUrl: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=400',
    ticketUrl: 'https://capetowndesignweek.co.za',
    isFree: false,
    featured: false
  },
  {
    id: '14',
    title: 'African Fashion Week',
    description: 'The continent\'s premier fashion event showcasing African designers.',
    startDate: '2025-09-12',
    endDate: '2025-09-15',
    location: 'Lagos, Nigeria',
    country: 'Nigeria',
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    ticketUrl: 'https://africanfashionweek.com',
    isFree: false,
    featured: true
  },
  {
    id: '15',
    title: 'Nyege Nyege Festival',
    description: 'East Africa\'s wildest music festival on the banks of the Nile.',
    startDate: '2025-09-18',
    endDate: '2025-09-21',
    location: 'Jinja, Uganda',
    country: 'Uganda',
    category: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400',
    ticketUrl: 'https://nyegenyegefestival.com',
    isFree: false,
    featured: true
  },
  {
    id: '16',
    title: 'Africa Day',
    description: 'Continental celebration of African unity and achievement.',
    startDate: '2025-05-25',
    endDate: '2025-05-25',
    location: 'Across Africa',
    country: 'Continental',
    category: 'Holiday',
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400',
    ticketUrl: null,
    isFree: true,
    featured: true
  },
  {
    id: '17',
    title: 'Zanzibar International Film Festival',
    description: 'East Africa\'s largest film festival celebrating African cinema.',
    startDate: '2025-07-14',
    endDate: '2025-07-22',
    location: 'Stone Town, Zanzibar',
    country: 'Tanzania',
    category: 'Film',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400',
    ticketUrl: 'https://ziff.or.tz',
    isFree: false,
    featured: false
  },
  {
    id: '18',
    title: 'Afro Nation Ghana',
    description: 'The world\'s biggest Afrobeats festival on the beaches of Ghana.',
    startDate: '2025-12-27',
    endDate: '2025-12-30',
    location: 'Accra, Ghana',
    country: 'Ghana',
    category: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
    ticketUrl: 'https://afronation.com',
    isFree: false,
    featured: true
  },
  {
    id: '19',
    title: 'African Startup Summit',
    description: 'Connecting founders, investors, and innovators across Africa.',
    startDate: '2025-06-05',
    endDate: '2025-06-07',
    location: 'Lagos, Nigeria',
    country: 'Nigeria',
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400',
    ticketUrl: 'https://africanstartupsummit.com',
    isFree: false,
    featured: false
  },
  {
    id: '20',
    title: 'Mandela Day',
    description: 'International day honoring Nelson Mandela\'s legacy with 67 minutes of service.',
    startDate: '2025-07-18',
    endDate: '2025-07-18',
    location: 'Global',
    country: 'Global',
    category: 'Holiday',
    imageUrl: 'https://images.unsplash.com/photo-1580127643057-63e1c8d2be54?w=400',
    ticketUrl: null,
    isFree: true,
    featured: true
  }
];

const categories = ['Music', 'Sports', 'Technology', 'Business', 'Culture', 'Fashion', 'Film', 'Holiday'];
const countries = [...new Set(africanEvents.map(e => e.country))].sort();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const country = searchParams.get('country');
  const month = searchParams.get('month'); // Format: YYYY-MM
  const featured = searchParams.get('featured') === 'true';
  const upcoming = searchParams.get('upcoming') === 'true';

  let filteredEvents = [...africanEvents];

  // Filter by category
  if (category && category !== 'all') {
    filteredEvents = filteredEvents.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by country
  if (country && country !== 'all') {
    filteredEvents = filteredEvents.filter(e => e.country.toLowerCase() === country.toLowerCase());
  }

  // Filter by month
  if (month) {
    filteredEvents = filteredEvents.filter(e => e.startDate.startsWith(month));
  }

  // Filter featured only
  if (featured) {
    filteredEvents = filteredEvents.filter(e => e.featured);
  }

  // Filter upcoming only
  if (upcoming) {
    const today = new Date().toISOString().split('T')[0];
    filteredEvents = filteredEvents.filter(e => e.startDate >= today || e.endDate >= today);
  }

  // Sort by date
  filteredEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return NextResponse.json({
    success: true,
    events: filteredEvents,
    categories,
    countries,
    total: filteredEvents.length
  });
}

export async function POST(request: Request) {
  // This would handle event submissions in production
  // For now, return a success response
  const body = await request.json();
  
  return NextResponse.json({
    success: true,
    message: 'Event submission received. It will be reviewed within 24 hours.',
    eventId: `evt_${Date.now()}`
  });
}
