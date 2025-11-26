'use client';

import { useState } from 'react';
import type { ScrapeSession } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface SessionSelectorProps {
  sessions: ScrapeSession[];
  selectedSession: ScrapeSession | null;
  onSessionChange: (session: ScrapeSession | null) => void;
  onDeleteSession: (sessionId: string) => void;
}

export default function SessionSelector({
  sessions,
  selectedSession,
  onSessionChange,
  onDeleteSession,
}: SessionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this scrape session? All videos in this session will be removed.')) {
      onDeleteSession(sessionId);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-card px-4 py-3 flex items-center gap-3 hover:border-purple-500/30 transition-all w-full sm:w-auto"
      >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>

        <div className="flex-1 text-left">
          <p className="text-xs font-medium text-[var(--foreground-secondary)] mb-0.5">
            Viewing Session
          </p>
          <p className="font-semibold truncate">
            {selectedSession ? selectedSession.name : 'All Sessions'}
          </p>
        </div>

        <svg
          className={`w-5 h-5 text-[var(--foreground-secondary)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 sm:right-auto sm:min-w-[400px] mt-2 z-50 glass-card max-h-[400px] overflow-y-auto animate-fadeIn">
            {/* View All Option */}
            <button
              onClick={() => {
                onSessionChange(null);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 ${
                !selectedSession ? 'bg-purple-500/10' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">All Sessions</p>
                  <p className="text-xs text-[var(--foreground-secondary)]">
                    View videos from all scrapes
                  </p>
                </div>
              </div>
            </button>

            {/* Session List */}
            {sessions.length === 0 ? (
              <div className="px-4 py-8 text-center text-[var(--foreground-secondary)]">
                <p className="text-sm">No scrape sessions yet</p>
                <p className="text-xs mt-1">Run your first scrape to get started</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 ${
                    selectedSession?.id === session.id ? 'bg-purple-500/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => {
                        onSessionChange(session);
                        setIsOpen(false);
                      }}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{session.name}</p>
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium whitespace-nowrap">
                          {session.video_count} videos
                        </span>
                      </div>

                      {session.description && (
                        <p className="text-xs text-[var(--foreground-secondary)] mb-1 line-clamp-1">
                          {session.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-[var(--foreground-secondary)]">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                        </span>

                        {session.hashtags_scraped.length > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                            {session.hashtags_scraped.length} tags
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDelete(e, session.id)}
                      className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 flex items-center justify-center transition-all"
                      title="Delete session"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
