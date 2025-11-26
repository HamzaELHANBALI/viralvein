'use client';

import { useState } from 'react';

export default function AlgorithmInfo() {
  const [isExpanded, setIsExpanded] = useState(false);

  const filterStages = [
    {
      stage: '1',
      name: 'Date Filter',
      icon: '📅',
      criteria: '< 30 days old',
      description: 'Only recent content to catch trending topics',
      color: 'text-blue-400'
    },
    {
      stage: '2',
      name: 'Whale Filter',
      icon: '🐋',
      criteria: '< 500K followers',
      description: 'Excludes large creators to find hidden gems',
      color: 'text-purple-400'
    },
    {
      stage: '3',
      name: 'Minimum Viability',
      icon: '👁️',
      criteria: '> 5K views',
      description: 'Ensures content has proven traction',
      color: 'text-pink-400'
    },
    {
      stage: '4',
      name: 'Gold Threshold',
      icon: '⚡',
      criteria: 'Score > 1.5x',
      description: 'Views must exceed followers by 1.5x or more',
      color: 'text-yellow-400'
    },
  ];

  return (
    <div className="glass-card p-6 mb-8">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold">How the Algorithm Works</h3>
            <p className="text-sm text-[var(--foreground-secondary)]">
              4-stage filtering system to find viral content
            </p>
          </div>
        </div>

        <button className="text-[var(--foreground-secondary)] hover:text-white transition-colors">
          <svg
            className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-6 space-y-6 animate-fadeIn">
          {/* Viral Score Formula */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
            <p className="text-sm font-semibold text-purple-300 mb-2">Viral Score Formula:</p>
            <div className="font-mono text-xl font-bold text-center py-2">
              <span className="text-green-400">Views</span>
              <span className="text-white mx-2">/</span>
              <span className="text-blue-400">Followers</span>
              <span className="text-white mx-2">=</span>
              <span className="text-yellow-400">Viral Score</span>
            </div>
            <p className="text-xs text-[var(--foreground-secondary)] text-center mt-2">
              Example: 50,000 views / 10,000 followers = 5.0x viral score
            </p>
          </div>

          {/* Filter Stages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filterStages.map((filter) => (
              <div
                key={filter.stage}
                className="bg-[#12121a] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-bold text-white">
                      {filter.stage}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{filter.icon}</span>
                      <h4 className="font-semibold">{filter.name}</h4>
                    </div>
                    <p className={`text-sm font-mono font-bold ${filter.color} mb-1`}>
                      {filter.criteria}
                    </p>
                    <p className="text-xs text-[var(--foreground-secondary)]">
                      {filter.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Score Color Legend */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-sm font-semibold mb-3">Score Color Legend:</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-[var(--foreground-secondary)]">
                  <span className="font-bold text-green-400">5.0x+</span> Exceptional
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-[var(--foreground-secondary)]">
                  <span className="font-bold text-orange-400">2.0-5.0x</span> Strong
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-[var(--foreground-secondary)]">
                  <span className="font-bold text-yellow-400">1.5-2.0x</span> Good
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
