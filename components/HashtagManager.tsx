'use client';

import { useState } from 'react';
import type { TrackedTag } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface HashtagManagerProps {
    tags: TrackedTag[];
    onAdd: (keyword: string, platform: 'tiktok' | 'instagram') => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, status: 'active' | 'paused') => void;
    onScrape: () => void;
    isScraping: boolean;
}

export default function HashtagManager({
    tags,
    onAdd,
    onDelete,
    onToggleStatus,
    onScrape,
    isScraping,
}: HashtagManagerProps) {
    const [keyword, setKeyword] = useState('');
    const [platform, setPlatform] = useState<'tiktok' | 'instagram'>('tiktok');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setIsAdding(true);
        await onAdd(keyword.trim(), platform);
        setKeyword('');
        setIsAdding(false);
    };

    return (
        <div className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Tracked Hashtags</h2>
                <button
                    onClick={onScrape}
                    disabled={isScraping || tags.length === 0}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isScraping ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Scraping...
                        </span>
                    ) : (
                        'Run Scrape Now'
                    )}
                </button>
            </div>

            {/* Add Hashtag Form */}
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex gap-3">
                    <div className="flex-1 flex gap-3">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Enter hashtag (without #)"
                            className="flex-1"
                            disabled={isAdding}
                        />

                        <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value as 'tiktok' | 'instagram')}
                            className="px-4 rounded-lg cursor-pointer"
                            disabled={isAdding}
                        >
                            <option value="tiktok">TikTok</option>
                            <option value="instagram">Instagram</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isAdding || !keyword.trim()}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {isAdding ? 'Adding...' : 'Add Tag'}
                    </button>
                </div>
            </form>

            {/* Tags List */}
            {tags.length === 0 ? (
                <div className="text-center py-8 text-[var(--foreground-secondary)]">
                    No hashtags tracked yet. Add one above to get started!
                </div>
            ) : (
                <div className="space-y-3">
                    {tags.map((tag) => (
                        <div
                            key={tag.id}
                            className="flex items-center gap-4 p-4 bg-[#12121a] rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                        >
                            {/* Platform Icon */}
                            <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center">
                                {tag.platform === 'tiktok' ? (
                                    <span className="text-xl">🎵</span>
                                ) : (
                                    <span className="text-xl">📷</span>
                                )}
                            </div>

                            {/* Tag Info */}
                            <div className="flex-1">
                                <div className="font-semibold">#{tag.keyword}</div>
                                <div className="text-sm text-[var(--foreground-secondary)]">
                                    {tag.platform} • {tag.status}
                                    {tag.last_scraped && (
                                        <span> • Last scraped {formatDistanceToNow(new Date(tag.last_scraped), { addSuffix: true })}</span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onToggleStatus(tag.id, tag.status === 'active' ? 'paused' : 'active')}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${tag.status === 'active'
                                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                                        }`}
                                >
                                    {tag.status === 'active' ? 'Active' : 'Paused'}
                                </button>

                                <button
                                    onClick={() => onDelete(tag.id)}
                                    className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                                    title="Delete tag"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
