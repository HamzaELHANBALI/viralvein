'use client';

import { useState } from 'react';

interface ScrapeNamingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, description?: string) => void;
  isScraping: boolean;
}

export default function ScrapeNamingModal({
  isOpen,
  onClose,
  onConfirm,
  isScraping,
}: ScrapeNamingModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
    }
  };

  const handleSkip = () => {
    onConfirm('', undefined); // Empty name means use default
    setName('');
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card max-w-md w-full p-6 animate-fadeIn">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Name Your Scrape
        </h2>

        <p className="text-sm text-[var(--foreground-secondary)] mb-6">
          Give this scrape session a memorable name to easily find it later. You can also skip to use an auto-generated name.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Session Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Trends, Week 1 Research"
              className="w-full"
              disabled={isScraping}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this scrape session..."
              className="w-full min-h-[80px] resize-y"
              disabled={isScraping}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isScraping}
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors font-medium disabled:opacity-50"
            >
              Skip & Use Default
            </button>
            <button
              type="submit"
              disabled={isScraping}
              className="flex-1 btn-primary"
            >
              {isScraping ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Scraping...
                </span>
              ) : (
                'Start Scrape'
              )}
            </button>
          </div>

          {!isScraping && (
            <button
              type="button"
              onClick={onClose}
              className="w-full text-sm text-[var(--foreground-secondary)] hover:text-white transition-colors mt-2"
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
