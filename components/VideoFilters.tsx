'use client';

import { useState } from 'react';

export type SortOption = 'viral_score' | 'view_count' | 'recent' | 'saved';
export type ScoreFilter = 'all' | 'exceptional' | 'strong' | 'good';

interface VideoFiltersProps {
  sortBy: SortOption;
  scoreFilter: ScoreFilter;
  onSortChange: (sort: SortOption) => void;
  onScoreFilterChange: (filter: ScoreFilter) => void;
  totalResults: number;
  savedOnly: boolean;
  onSavedOnlyChange: (savedOnly: boolean) => void;
}

export default function VideoFilters({
  sortBy,
  scoreFilter,
  onSortChange,
  onScoreFilterChange,
  totalResults,
  savedOnly,
  onSavedOnlyChange,
}: VideoFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Results Count */}
        <div className="flex items-center gap-3">
          <p className="text-sm text-[var(--foreground-secondary)]">
            <span className="font-bold text-white text-lg">{totalResults}</span> videos found
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Saved Only Toggle */}
          <button
            onClick={() => onSavedOnlyChange(!savedOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              savedOnly
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                : 'bg-white/5 text-[var(--foreground-secondary)] border border-white/10 hover:border-white/20'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill={savedOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Saved Only
            </span>
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium cursor-pointer hover:border-white/20 transition-colors"
          >
            <option value="viral_score">Sort: Viral Score</option>
            <option value="view_count">Sort: Most Views</option>
            <option value="recent">Sort: Most Recent</option>
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isExpanded
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-white/5 text-[var(--foreground-secondary)] border border-white/10 hover:border-white/20'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 animate-fadeIn">
          <div className="space-y-3">
            <p className="text-sm font-semibold mb-2">Filter by Viral Score:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onScoreFilterChange('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  scoreFilter === 'all'
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-white/5 text-[var(--foreground-secondary)] border border-white/10 hover:border-white/20'
                }`}
              >
                All Scores
              </button>
              <button
                onClick={() => onScoreFilterChange('exceptional')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  scoreFilter === 'exceptional'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-[var(--foreground-secondary)] border border-white/10 hover:border-white/20'
                }`}
              >
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Exceptional (5.0x+)
                </span>
              </button>
              <button
                onClick={() => onScoreFilterChange('strong')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  scoreFilter === 'strong'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-white/5 text-[var(--foreground-secondary)] border border-white/10 hover:border-white/20'
                }`}
              >
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  Strong (2.0-5.0x)
                </span>
              </button>
              <button
                onClick={() => onScoreFilterChange('good')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  scoreFilter === 'good'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-white/5 text-[var(--foreground-secondary)] border border-white/10 hover:border-white/20'
                }`}
              >
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  Good (1.5-2.0x)
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
