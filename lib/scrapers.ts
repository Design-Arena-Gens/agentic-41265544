import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedPost {
  platform: string;
  title: string;
  content: string;
  url: string;
  author?: string;
  timestamp?: string;
  engagement?: {
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

export interface ScrapeResult {
  query: string;
  platform: string;
  posts: ScrapedPost[];
  error?: string;
}

// Reddit scraper using public JSON API
async function scrapeReddit(topic: string): Promise<ScrapedPost[]> {
  try {
    const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(topic)}&limit=10&sort=relevance`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const posts: ScrapedPost[] = [];
    const children = response.data?.data?.children || [];

    for (const child of children) {
      const post = child.data;
      posts.push({
        platform: 'Reddit',
        title: post.title || 'Untitled',
        content: post.selftext || post.title || '',
        url: `https://www.reddit.com${post.permalink}`,
        author: post.author,
        timestamp: new Date(post.created_utc * 1000).toISOString(),
        engagement: {
          likes: post.ups,
          comments: post.num_comments
        }
      });
    }

    return posts;
  } catch (error) {
    console.error('Reddit scrape error:', error);
    return [];
  }
}

// Hacker News scraper using Algolia API
async function scrapeHackerNews(topic: string): Promise<ScrapedPost[]> {
  try {
    const searchUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(topic)}&hitsPerPage=10`;
    const response = await axios.get(searchUrl, {
      timeout: 10000
    });

    const posts: ScrapedPost[] = [];
    const hits = response.data?.hits || [];

    for (const hit of hits) {
      posts.push({
        platform: 'Hacker News',
        title: hit.title || 'Untitled',
        content: hit.story_text || hit.comment_text || hit.title || '',
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        author: hit.author,
        timestamp: hit.created_at,
        engagement: {
          likes: hit.points,
          comments: hit.num_comments
        }
      });
    }

    return posts;
  } catch (error) {
    console.error('Hacker News scrape error:', error);
    return [];
  }
}

// GitHub scraper using public search API
async function scrapeGitHub(topic: string): Promise<ScrapedPost[]> {
  try {
    const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(topic)}&sort=stars&per_page=10`;
    const response = await axios.get(searchUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 10000
    });

    const posts: ScrapedPost[] = [];
    const items = response.data?.items || [];

    for (const item of items) {
      posts.push({
        platform: 'GitHub',
        title: item.full_name || 'Untitled',
        content: item.description || '',
        url: item.html_url,
        author: item.owner?.login,
        timestamp: item.created_at,
        engagement: {
          likes: item.stargazers_count,
          comments: item.open_issues_count
        }
      });
    }

    return posts;
  } catch (error) {
    console.error('GitHub scrape error:', error);
    return [];
  }
}

// Dev.to scraper using public API
async function scrapeDevTo(topic: string): Promise<ScrapedPost[]> {
  try {
    const searchUrl = `https://dev.to/api/articles?tag=${encodeURIComponent(topic)}&per_page=10`;
    const response = await axios.get(searchUrl, {
      timeout: 10000
    });

    const posts: ScrapedPost[] = [];
    const articles = Array.isArray(response.data) ? response.data : [];

    for (const article of articles) {
      posts.push({
        platform: 'Dev.to',
        title: article.title || 'Untitled',
        content: article.description || '',
        url: article.url,
        author: article.user?.username,
        timestamp: article.published_at,
        engagement: {
          likes: article.positive_reactions_count,
          comments: article.comments_count
        }
      });
    }

    return posts;
  } catch (error) {
    console.error('Dev.to scrape error:', error);
    return [];
  }
}

// Product Hunt scraper (limited public data)
async function scrapeProductHunt(topic: string): Promise<ScrapedPost[]> {
  try {
    // Product Hunt requires authentication for API, so we'll provide a placeholder
    // In production, this would use their API with proper authentication
    return [];
  } catch (error) {
    console.error('Product Hunt scrape error:', error);
    return [];
  }
}

export async function scrapeAllPlatforms(topic: string): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];

  const scrapers = [
    { name: 'Reddit', fn: scrapeReddit },
    { name: 'Hacker News', fn: scrapeHackerNews },
    { name: 'GitHub', fn: scrapeGitHub },
    { name: 'Dev.to', fn: scrapeDevTo }
  ];

  const promises = scrapers.map(async (scraper) => {
    try {
      const posts = await scraper.fn(topic);
      return {
        query: topic,
        platform: scraper.name,
        posts
      };
    } catch (error) {
      return {
        query: topic,
        platform: scraper.name,
        posts: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  const settled = await Promise.allSettled(promises);

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    }
  }

  return results;
}
