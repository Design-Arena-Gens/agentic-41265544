'use client';

import { ScrapeResult, ScrapedPost } from '@/lib/scrapers';
import { formatDistanceToNow } from 'date-fns';

interface ResultsDisplayProps {
  results: ScrapeResult[];
}

function PostCard({ post }: { post: ScrapedPost }) {
  const timeAgo = post.timestamp
    ? formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })
    : 'Unknown time';

  return (
    <div className="post-card">
      <div className="post-header">
        <span className="platform-badge">{post.platform}</span>
        {post.author && <span className="author">by {post.author}</span>}
        <span className="timestamp">{timeAgo}</span>
      </div>
      <h3 className="post-title">
        <a href={post.url} target="_blank" rel="noopener noreferrer">
          {post.title}
        </a>
      </h3>
      {post.content && (
        <p className="post-content">
          {post.content.length > 200
            ? `${post.content.substring(0, 200)}...`
            : post.content}
        </p>
      )}
      {post.engagement && (
        <div className="engagement">
          {post.engagement.likes !== undefined && (
            <span className="stat">👍 {post.engagement.likes}</span>
          )}
          {post.engagement.comments !== undefined && (
            <span className="stat">💬 {post.engagement.comments}</span>
          )}
          {post.engagement.shares !== undefined && (
            <span className="stat">🔄 {post.engagement.shares}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const totalPosts = results.reduce((acc, result) => acc + result.posts.length, 0);

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Found {totalPosts} posts across {results.length} platforms</h2>
      </div>

      {results.map((result, idx) => (
        <div key={idx} className="platform-section">
          <h3 className="platform-title">
            {result.platform} ({result.posts.length} results)
          </h3>
          {result.error && (
            <div className="error-message">
              Error: {result.error}
            </div>
          )}
          {result.posts.length === 0 && !result.error && (
            <p className="no-results">No results found on this platform</p>
          )}
          <div className="posts-grid">
            {result.posts.map((post, postIdx) => (
              <PostCard key={postIdx} post={post} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
