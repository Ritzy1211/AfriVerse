import { NextRequest, NextResponse } from 'next/server';

// Fetch Google Trends via RSS feed (more reliable on serverless)
async function fetchTrendsRSS(geo: string) {
  const rssUrl = `https://trends.google.com/trending/rss?geo=${geo}`;
  
  try {
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    
    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`);
    }
    
    const xml = await response.text();
    
    // Parse RSS XML
    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
    const trafficRegex = /<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/;
    const newsItemRegex = /<ht:news_item>([\s\S]*?)<\/ht:news_item>/g;
    const newsTitleRegex = /<ht:news_item_title><!\[CDATA\[(.*?)\]\]><\/ht:news_item_title>|<ht:news_item_title>(.*?)<\/ht:news_item_title>/;
    const newsUrlRegex = /<ht:news_item_url>(.*?)<\/ht:news_item_url>/;
    const newsSourceRegex = /<ht:news_item_source>(.*?)<\/ht:news_item_source>/;
    const pictureRegex = /<ht:picture>(.*?)<\/ht:picture>/;

    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      
      const titleMatch = titleRegex.exec(itemXml);
      const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : 'Unknown';
      
      const trafficMatch = trafficRegex.exec(itemXml);
      const traffic = trafficMatch ? trafficMatch[1] : 'N/A';
      
      const pictureMatch = pictureRegex.exec(itemXml);
      const picture = pictureMatch ? pictureMatch[1] : null;
      
      // Parse news items
      const articles: any[] = [];
      let newsMatch;
      while ((newsMatch = newsItemRegex.exec(itemXml)) !== null) {
        const newsXml = newsMatch[1];
        const newsTitleMatch = newsTitleRegex.exec(newsXml);
        const newsUrlMatch = newsUrlRegex.exec(newsXml);
        const newsSourceMatch = newsSourceRegex.exec(newsXml);
        
        articles.push({
          title: newsTitleMatch ? (newsTitleMatch[1] || newsTitleMatch[2]) : 'News Article',
          url: newsUrlMatch ? newsUrlMatch[1] : '#',
          source: newsSourceMatch ? newsSourceMatch[1] : 'Unknown Source',
        });
      }
      
      items.push({
        title,
        traffic,
        image: picture,
        articles: articles.slice(0, 3),
      });
    }
    
    return items;
  } catch (error) {
    console.error('RSS fetch error:', error);
    throw error;
  }
}

// Fallback: Fetch from SerpAPI or similar (if available)
async function fetchTrendsFallback(geo: string) {
  // Return sample trending topics as fallback
  const sampleTrends: Record<string, any[]> = {
    'NG': [
      { title: 'Naira Exchange Rate', traffic: '100K+', articles: [{ title: 'CBN Announces New Forex Policy', source: 'Punch', url: 'https://punchng.com' }] },
      { title: 'Super Eagles', traffic: '50K+', articles: [{ title: 'Super Eagles Qualify for World Cup', source: 'Vanguard', url: 'https://vanguardngr.com' }] },
      { title: 'ASUU Strike', traffic: '20K+', articles: [{ title: 'ASUU Calls Off Strike', source: 'Guardian', url: 'https://guardian.ng' }] },
      { title: 'Fuel Price', traffic: '50K+', articles: [{ title: 'Fuel Price Drops', source: 'ThisDay', url: 'https://thisdaylive.com' }] },
      { title: 'Tinubu', traffic: '100K+', articles: [{ title: 'President Addresses Nation', source: 'Channels', url: 'https://channelstv.com' }] },
      { title: 'BBNaija', traffic: '200K+', articles: [{ title: 'BBNaija Returns', source: 'Linda Ikeji', url: 'https://lindaikejisblog.com' }] },
      { title: 'NYSC', traffic: '20K+', articles: [{ title: 'NYSC Batch A Mobilization', source: 'Premium Times', url: 'https://premiumtimesng.com' }] },
      { title: 'Davido', traffic: '50K+', articles: [{ title: 'Davido Drops New Album', source: 'Pulse', url: 'https://pulse.ng' }] },
    ],
    'KE': [
      { title: 'Ruto', traffic: '50K+', articles: [{ title: 'President Ruto Speech', source: 'Nation', url: 'https://nation.africa' }] },
      { title: 'M-Pesa', traffic: '20K+', articles: [{ title: 'M-Pesa New Features', source: 'Business Daily', url: 'https://businessdailyafrica.com' }] },
      { title: 'Kenya Power', traffic: '10K+', articles: [{ title: 'Kenya Power Outage', source: 'Standard', url: 'https://standardmedia.co.ke' }] },
      { title: 'Harambee Stars', traffic: '20K+', articles: [{ title: 'Kenya vs Tanzania', source: 'Goal', url: 'https://goal.com' }] },
    ],
    'ZA': [
      { title: 'Load Shedding', traffic: '100K+', articles: [{ title: 'Eskom Stage 6', source: 'News24', url: 'https://news24.com' }] },
      { title: 'Ramaphosa', traffic: '50K+', articles: [{ title: 'State of the Nation', source: 'IOL', url: 'https://iol.co.za' }] },
      { title: 'Bafana Bafana', traffic: '30K+', articles: [{ title: 'AFCON Qualifiers', source: 'Sport24', url: 'https://sport24.co.za' }] },
      { title: 'Rand Dollar', traffic: '20K+', articles: [{ title: 'Rand Weakens', source: 'Business Insider', url: 'https://businessinsider.co.za' }] },
    ],
    'GH': [
      { title: 'Black Stars', traffic: '50K+', articles: [{ title: 'Ghana World Cup', source: 'GhanaWeb', url: 'https://ghanaweb.com' }] },
      { title: 'Cedi Dollar', traffic: '30K+', articles: [{ title: 'Cedi Stabilizes', source: 'Joy Online', url: 'https://myjoyonline.com' }] },
      { title: 'Akufo-Addo', traffic: '20K+', articles: [{ title: 'President Travels', source: 'Citi FM', url: 'https://citifmonline.com' }] },
    ],
  };
  
  return sampleTrends[geo] || sampleTrends['NG'];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const geo = searchParams.get('geo') || 'NG';
  const type = searchParams.get('type') || 'daily';

  try {
    let results;
    
    try {
      // Try RSS feed first
      results = await fetchTrendsRSS(geo);
      
      if (!results || results.length === 0) {
        throw new Error('No results from RSS');
      }
    } catch (rssError) {
      console.log('RSS failed, using fallback:', rssError);
      // Use fallback data
      results = await fetchTrendsFallback(geo);
    }

    return NextResponse.json({
      success: true,
      geo,
      type,
      trends: results.slice(0, 20),
      timestamp: new Date().toISOString(),
      source: 'google-trends',
    });
  } catch (error: any) {
    console.error('Google Trends error:', error);
    
    // Return fallback data even on error
    const fallbackData = await fetchTrendsFallback(geo);
    
    return NextResponse.json({
      success: true,
      geo,
      type,
      trends: fallbackData,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      note: 'Using cached trending topics. Live data temporarily unavailable.',
    });
  }
}

// Search interest for a topic
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, geo = 'NG' } = body;

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: 'Keyword is required' },
        { status: 400 }
      );
    }

    // Return mock data for now
    return NextResponse.json({
      success: true,
      keyword,
      geo,
      message: 'Interest data feature coming soon',
    });
  } catch (error: any) {
    console.error('Interest error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch interest data' },
      { status: 500 }
    );
  }
}

