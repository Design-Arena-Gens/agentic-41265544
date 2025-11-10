'use client';

import { useState } from 'react';

interface SearchFormProps {
  onSearch: (topic: string) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSearch(topic.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="input-group">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a niche topic (e.g., 'WebAssembly', 'vertical farming', 'quantum computing')"
          disabled={loading}
          className="search-input"
        />
        <button type="submit" disabled={loading || !topic.trim()} className="search-button">
          {loading ? 'Scraping...' : 'Search'}
        </button>
      </div>
      <p className="helper-text">
        Search across Reddit, Hacker News, GitHub, and Dev.to for your niche topic
      </p>
    </form>
  );
}
