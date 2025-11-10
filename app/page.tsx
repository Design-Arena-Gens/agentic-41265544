'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import { ScrapeResult } from '@/lib/scrapers';

export default function Home() {
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedTopic, setSearchedTopic] = useState<string>('');

  const handleSearch = async (topic: string) => {
    setLoading(true);
    setError(null);
    setSearchedTopic(topic);
    setResults([]);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        setError(data.error || 'Failed to fetch results');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <header className="header">
        <h1>🔍 Social Media Scraper Agent</h1>
        <p className="subtitle">
          Discover niche content across multiple platforms instantly
        </p>
      </header>

      <SearchForm onSearch={handleSearch} loading={loading} />

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Scraping platforms for "{searchedTopic}"...</p>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      <ResultsDisplay results={results} />

      <footer className="footer">
        <p>
          Platforms: Reddit • Hacker News • GitHub • Dev.to
        </p>
      </footer>
    </main>
  );
}
