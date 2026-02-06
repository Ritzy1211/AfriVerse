import { NextRequest, NextResponse } from 'next/server';

// Simple AI summarizer using extractive summarization
// For production, you could integrate OpenAI, Claude, or other AI APIs

function extractKeysentences(text: string, numSentences: number = 5): string[] {
  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  
  // Split into sentences
  const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length <= numSentences) {
    return sentences.map(s => s.trim());
  }
  
  // Score sentences based on importance indicators
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();
    
    // First sentence often contains key info
    if (index === 0) score += 3;
    if (index === 1) score += 2;
    
    // Keywords that indicate importance
    const importantWords = [
      'announced', 'launched', 'revealed', 'confirmed', 'breaking',
      'first', 'new', 'major', 'significant', 'historic',
      'billion', 'million', 'percent', 'growth', 'increase', 'decrease',
      'president', 'minister', 'government', 'official',
      'africa', 'nigeria', 'kenya', 'south africa', 'ghana', 'egypt',
      'according to', 'reported', 'said', 'stated',
    ];
    
    importantWords.forEach(word => {
      if (lowerSentence.includes(word)) score += 1;
    });
    
    // Longer sentences often contain more info (but not too long)
    const wordCount = sentence.split(' ').length;
    if (wordCount > 10 && wordCount < 40) score += 1;
    
    // Contains numbers (statistics, data)
    if (/\d+/.test(sentence)) score += 1;
    
    // Contains quotes
    if (sentence.includes('"') || sentence.includes("'")) score += 1;
    
    return { sentence: sentence.trim(), score, index };
  });
  
  // Sort by score and take top sentences
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, numSentences)
    .sort((a, b) => a.index - b.index) // Restore original order
    .map(s => s.sentence);
  
  return topSentences;
}

function generateBulletPoints(sentences: string[]): string[] {
  return sentences.map(sentence => {
    // Clean up the sentence
    let clean = sentence.trim();
    // Capitalize first letter
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    // Ensure it ends with proper punctuation
    if (!/[.!?]$/.test(clean)) clean += '.';
    return clean;
  });
}

function estimateReadTime(text: string): number {
  const words = text.split(/\s+/).length;
  const wordsPerMinute = 200;
  return Math.ceil(words / wordsPerMinute);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // Extract key sentences
    const keySentences = extractKeysentences(content, 5);
    
    // Generate bullet points
    const bulletPoints = generateBulletPoints(keySentences);
    
    // Calculate read times
    const fullReadTime = estimateReadTime(content);
    const summaryReadTime = Math.ceil(bulletPoints.join(' ').split(/\s+/).length / 200);

    // Generate a one-line TLDR
    const tldr = keySentences[0] || 'Summary not available.';

    return NextResponse.json({
      success: true,
      summary: {
        bulletPoints,
        tldr,
        fullReadTime,
        summaryReadTime: summaryReadTime || 1,
        sentenceCount: bulletPoints.length,
      },
    });
  } catch (error: any) {
    console.error('Summarize error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to summarize' },
      { status: 500 }
    );
  }
}
