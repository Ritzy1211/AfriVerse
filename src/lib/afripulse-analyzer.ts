/**
 * AfriPulse Analyzer
 * Analyzes articles to generate sentiment suggestions for the AfriPulse Index™
 */

import { prisma } from './prisma';

// Sentiment keywords by category
const SENTIMENT_KEYWORDS = {
  positive: {
    economy: ['growth', 'investment', 'profit', 'boom', 'surge', 'expansion', 'funding', 'startup', 'success', 'billion', 'million', 'revenue', 'jobs', 'employment', 'opportunity', 'innovation', 'export', 'trade'],
    politics: ['peace', 'democracy', 'reform', 'progress', 'unity', 'agreement', 'cooperation', 'elected', 'transparent', 'accountability', 'development', 'stability'],
    social: ['celebration', 'festival', 'community', 'unity', 'achievement', 'milestone', 'breakthrough', 'education', 'health', 'improvement', 'access', 'inclusion'],
    technology: ['innovation', 'launch', 'breakthrough', 'startup', 'funding', 'expansion', 'digital', 'tech', 'AI', 'fintech', 'growth', 'adoption', 'unicorn'],
    sports: ['victory', 'champion', 'win', 'medal', 'qualify', 'triumph', 'record', 'achievement', 'historic', 'successful'],
    entertainment: ['award', 'hit', 'success', 'premiere', 'Grammy', 'Oscar', 'global', 'international', 'tour', 'album', 'streaming']
  },
  negative: {
    economy: ['crisis', 'inflation', 'debt', 'recession', 'unemployment', 'collapse', 'decline', 'shortage', 'poverty', 'bankruptcy', 'devaluation', 'scarcity'],
    politics: ['conflict', 'corruption', 'protest', 'violence', 'coup', 'crisis', 'scandal', 'unrest', 'tension', 'instability', 'fraud', 'arrest'],
    social: ['crisis', 'disaster', 'tragedy', 'violence', 'inequality', 'poverty', 'hunger', 'disease', 'outbreak', 'emergency', 'displacement'],
    technology: ['hack', 'breach', 'scam', 'fraud', 'failure', 'shutdown', 'layoff', 'collapse', 'ban', 'restriction'],
    sports: ['defeat', 'loss', 'injury', 'ban', 'scandal', 'disqualified', 'eliminated', 'controversy', 'failure'],
    entertainment: ['controversy', 'scandal', 'backlash', 'cancel', 'boycott', 'criticism', 'flop', 'failure']
  }
};

// Country keywords mapping
const COUNTRY_KEYWORDS: Record<string, string[]> = {
  NG: ['nigeria', 'nigerian', 'lagos', 'abuja', 'naira', 'buhari', 'tinubu', 'nollywood', 'super eagles', 'afrobeats'],
  KE: ['kenya', 'kenyan', 'nairobi', 'mombasa', 'shilling', 'ruto', 'safari', 'harambee'],
  ZA: ['south africa', 'south african', 'johannesburg', 'cape town', 'rand', 'ramaphosa', 'springboks', 'proteas'],
  GH: ['ghana', 'ghanaian', 'accra', 'kumasi', 'cedi', 'black stars', 'jollof'],
  EG: ['egypt', 'egyptian', 'cairo', 'alexandria', 'pound', 'pharaohs', 'suez'],
  RW: ['rwanda', 'rwandan', 'kigali', 'kagame', 'franc'],
  ET: ['ethiopia', 'ethiopian', 'addis ababa', 'birr'],
  TZ: ['tanzania', 'tanzanian', 'dar es salaam', 'zanzibar'],
  UG: ['uganda', 'ugandan', 'kampala'],
  CI: ['ivory coast', 'cote d\'ivoire', 'ivorian', 'abidjan'],
  SN: ['senegal', 'senegalese', 'dakar'],
  MA: ['morocco', 'moroccan', 'casablanca', 'rabat', 'atlas lions'],
  CM: ['cameroon', 'cameroonian', 'yaounde', 'douala', 'indomitable lions']
};

// Category detection keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  economy: ['business', 'economy', 'finance', 'money', 'market', 'stock', 'trade', 'investment', 'startup', 'fintech', 'bank', 'currency'],
  politics: ['politics', 'government', 'election', 'president', 'minister', 'parliament', 'policy', 'law', 'vote'],
  social: ['society', 'community', 'health', 'education', 'culture', 'lifestyle', 'social', 'people', 'youth'],
  technology: ['technology', 'tech', 'digital', 'software', 'app', 'startup', 'AI', 'internet', 'mobile', 'innovation'],
  sports: ['sports', 'football', 'soccer', 'basketball', 'athletics', 'olympics', 'AFCON', 'premier league', 'match', 'game'],
  entertainment: ['entertainment', 'music', 'film', 'movie', 'nollywood', 'afrobeats', 'artist', 'celebrity', 'concert']
};

interface ArticleAnalysis {
  articleId: string;
  title: string;
  countries: string[];
  categories: string[];
  sentiment: number; // -1 to 1
  keywords: string[];
}

interface CountrySentiment {
  countryCode: string;
  countryName: string;
  articleCount: number;
  overallSentiment: number;
  economySentiment: number;
  politicsSentiment: number;
  socialSentiment: number;
  techSentiment: number;
  sportsSentiment: number;
  entertainmentSentiment: number;
  confidence: number; // 0-100 based on article count
  recentArticles: { title: string; sentiment: number }[];
}

interface TrendingTopicSuggestion {
  name: string;
  category: string;
  sentiment: number;
  articleCount: number;
  countries: string[];
}

/**
 * Analyze text for sentiment
 */
function analyzeSentiment(text: string, category: string): number {
  const lowerText = text.toLowerCase();
  
  const positiveWords = SENTIMENT_KEYWORDS.positive[category as keyof typeof SENTIMENT_KEYWORDS.positive] || [];
  const negativeWords = SENTIMENT_KEYWORDS.negative[category as keyof typeof SENTIMENT_KEYWORDS.negative] || [];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) positiveCount += matches.length;
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) negativeCount += matches.length;
  });
  
  const total = positiveCount + negativeCount;
  if (total === 0) return 0.5; // Neutral
  
  // Return value between 0 and 1 (0 = very negative, 1 = very positive)
  return positiveCount / total;
}

/**
 * Detect countries mentioned in text
 */
function detectCountries(text: string): string[] {
  const lowerText = text.toLowerCase();
  const detected: string[] = [];
  
  Object.entries(COUNTRY_KEYWORDS).forEach(([code, keywords]) => {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        if (!detected.includes(code)) {
          detected.push(code);
        }
        break;
      }
    }
  });
  
  return detected;
}

/**
 * Detect categories in text
 */
function detectCategories(text: string, articleCategory?: string): string[] {
  const lowerText = text.toLowerCase();
  const detected: string[] = [];
  
  // Map article category to our categories
  if (articleCategory) {
    const categoryMap: Record<string, string> = {
      'business': 'economy',
      'technology': 'technology',
      'politics': 'politics',
      'sports': 'sports',
      'entertainment': 'entertainment',
      'lifestyle': 'social',
      'culture': 'social'
    };
    const mapped = categoryMap[articleCategory.toLowerCase()];
    if (mapped) detected.push(mapped);
  }
  
  // Also detect from content
  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword) && !detected.includes(category)) {
        detected.push(category);
        break;
      }
    }
  });
  
  return detected.length > 0 ? detected : ['social']; // Default to social
}

/**
 * Analyze a single article
 */
function analyzeArticle(article: {
  id: string;
  title: string;
  content?: string | null;
  excerpt?: string | null;
  category?: string | null;
}): ArticleAnalysis {
  const fullText = `${article.title} ${article.excerpt || ''} ${article.content || ''}`;
  const countries = detectCountries(fullText);
  const categories = detectCategories(fullText, article.category || undefined);
  
  // Calculate average sentiment across detected categories
  let totalSentiment = 0;
  categories.forEach(cat => {
    totalSentiment += analyzeSentiment(fullText, cat);
  });
  const avgSentiment = categories.length > 0 ? totalSentiment / categories.length : 0.5;
  
  return {
    articleId: article.id,
    title: article.title,
    countries,
    categories,
    sentiment: avgSentiment,
    keywords: extractKeywords(fullText)
  };
}

/**
 * Extract key phrases/topics from text
 */
function extractKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();
  const keywords: string[] = [];
  
  // Common trending topics to detect
  const trendingPatterns = [
    'afcon', 'world cup', 'election', 'inflation', 'naira', 'dollar',
    'startup', 'funding', 'tech', 'AI', 'crypto', 'bitcoin',
    'oil', 'fuel', 'subsidy', 'strike', 'protest',
    'covid', 'health', 'education', 'university',
    'grammy', 'oscar', 'award', 'tour', 'album'
  ];
  
  trendingPatterns.forEach(pattern => {
    if (lowerText.includes(pattern)) {
      keywords.push(pattern);
    }
  });
  
  return keywords;
}

/**
 * Convert sentiment (0-1) to AfriPulse score (0-100)
 */
function sentimentToScore(sentiment: number): number {
  // Map 0-1 to 30-90 range (we don't want extremes)
  const score = 30 + (sentiment * 60);
  return Math.round(Math.min(90, Math.max(30, score)));
}

/**
 * Main function: Analyze recent articles and generate AfriPulse suggestions
 */
export async function generateAfriPulseSuggestions(days: number = 7): Promise<{
  countrySuggestions: CountrySentiment[];
  topicSuggestions: TrendingTopicSuggestion[];
  analyzedArticleCount: number;
  analysisDate: Date;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Fetch recent published articles
  const articles = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: {
        gte: startDate
      }
    },
    select: {
      id: true,
      title: true,
      content: true,
      excerpt: true,
      category: true
    },
    orderBy: {
      publishedAt: 'desc'
    },
    take: 100 // Analyze up to 100 recent articles
  });
  
  // Analyze each article
  const analyses = articles.map(article => analyzeArticle(article));
  
  // Aggregate by country
  const countryData: Record<string, {
    articles: ArticleAnalysis[];
    categorySentiments: Record<string, number[]>;
  }> = {};
  
  analyses.forEach(analysis => {
    analysis.countries.forEach(country => {
      if (!countryData[country]) {
        countryData[country] = {
          articles: [],
          categorySentiments: {
            economy: [],
            politics: [],
            social: [],
            technology: [],
            sports: [],
            entertainment: []
          }
        };
      }
      
      countryData[country].articles.push(analysis);
      
      analysis.categories.forEach(cat => {
        if (countryData[country].categorySentiments[cat]) {
          countryData[country].categorySentiments[cat].push(analysis.sentiment);
        }
      });
    });
  });
  
  // Generate country suggestions
  const countryNames: Record<string, string> = {
    NG: 'Nigeria', KE: 'Kenya', ZA: 'South Africa', GH: 'Ghana',
    EG: 'Egypt', RW: 'Rwanda', ET: 'Ethiopia', TZ: 'Tanzania',
    UG: 'Uganda', CI: 'Ivory Coast', SN: 'Senegal', MA: 'Morocco', CM: 'Cameroon'
  };
  
  const countrySuggestions: CountrySentiment[] = Object.entries(countryData)
    .map(([code, data]) => {
      const avgCategory = (cat: string) => {
        const sentiments = data.categorySentiments[cat];
        if (sentiments.length === 0) return 0.5; // Neutral default
        return sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
      };
      
      const overallSentiments = data.articles.map(a => a.sentiment);
      const overallAvg = overallSentiments.length > 0
        ? overallSentiments.reduce((a, b) => a + b, 0) / overallSentiments.length
        : 0.5;
      
      // Confidence based on article count (more articles = higher confidence)
      const confidence = Math.min(100, data.articles.length * 10);
      
      return {
        countryCode: code,
        countryName: countryNames[code] || code,
        articleCount: data.articles.length,
        overallSentiment: sentimentToScore(overallAvg),
        economySentiment: sentimentToScore(avgCategory('economy')),
        politicsSentiment: sentimentToScore(avgCategory('politics')),
        socialSentiment: sentimentToScore(avgCategory('social')),
        techSentiment: sentimentToScore(avgCategory('technology')),
        sportsSentiment: sentimentToScore(avgCategory('sports')),
        entertainmentSentiment: sentimentToScore(avgCategory('entertainment')),
        confidence,
        recentArticles: data.articles.slice(0, 5).map(a => ({
          title: a.title,
          sentiment: Math.round(a.sentiment * 100)
        }))
      };
    })
    .sort((a, b) => b.articleCount - a.articleCount);
  
  // Generate trending topic suggestions
  const keywordCounts: Record<string, {
    count: number;
    sentiments: number[];
    countries: Set<string>;
    category: string;
  }> = {};
  
  analyses.forEach(analysis => {
    analysis.keywords.forEach(keyword => {
      if (!keywordCounts[keyword]) {
        keywordCounts[keyword] = {
          count: 0,
          sentiments: [],
          countries: new Set(),
          category: analysis.categories[0] || 'social'
        };
      }
      keywordCounts[keyword].count++;
      keywordCounts[keyword].sentiments.push(analysis.sentiment);
      analysis.countries.forEach(c => keywordCounts[keyword].countries.add(c));
    });
  });
  
  const topicSuggestions: TrendingTopicSuggestion[] = Object.entries(keywordCounts)
    .filter(([_, data]) => data.count >= 2) // At least 2 articles
    .map(([keyword, data]) => ({
      name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
      category: data.category.toUpperCase(),
      sentiment: sentimentToScore(
        data.sentiments.reduce((a, b) => a + b, 0) / data.sentiments.length
      ),
      articleCount: data.count,
      countries: Array.from(data.countries)
    }))
    .sort((a, b) => b.articleCount - a.articleCount)
    .slice(0, 10);
  
  return {
    countrySuggestions,
    topicSuggestions,
    analyzedArticleCount: articles.length,
    analysisDate: new Date()
  };
}

/**
 * Get the trend direction based on score comparison
 */
export function calculateTrend(currentScore: number, previousScore: number): string {
  const diff = currentScore - previousScore;
  if (diff > 5) return 'RISING';
  if (diff < -5) return 'FALLING';
  if (Math.abs(diff) > 2) return 'VOLATILE';
  return 'STABLE';
}

/**
 * Apply suggestions to update AfriPulse Index
 */
export async function applySuggestion(
  countryCode: string,
  scores: {
    overallSentiment?: number;
    economySentiment?: number;
    politicsSentiment?: number;
    socialSentiment?: number;
    techSentiment?: number;
  }
) {
  const existing = await prisma.afriPulseIndex.findUnique({
    where: { country: countryCode }
  });
  
  if (!existing) {
    throw new Error(`Country ${countryCode} not found in AfriPulse Index`);
  }
  
  // Calculate trend based on the schema field names
  const newOverall = scores.overallSentiment || existing.overallScore;
  const trend = calculateTrend(newOverall, existing.overallScore);
  
  return prisma.afriPulseIndex.update({
    where: { country: countryCode },
    data: {
      overallScore: scores.overallSentiment ?? existing.overallScore,
      economyScore: scores.economySentiment ?? existing.economyScore,
      politicsScore: scores.politicsSentiment ?? existing.politicsScore,
      socialScore: scores.socialSentiment ?? existing.socialScore,
      techScore: scores.techSentiment ?? existing.techScore,
      overallTrend: trend as any,
      lastUpdated: new Date()
    }
  });
}
