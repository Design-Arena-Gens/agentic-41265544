import { NextRequest, NextResponse } from 'next/server';
import { scrapeAllPlatforms } from '@/lib/scrapers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required and must be a string' },
        { status: 400 }
      );
    }

    const results = await scrapeAllPlatforms(topic);

    return NextResponse.json({
      success: true,
      topic,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to scrape platforms',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Social Media Scraper API',
    usage: 'POST /api/scrape with { "topic": "your-search-term" }',
    platforms: ['Reddit', 'Hacker News', 'GitHub', 'Dev.to']
  });
}
