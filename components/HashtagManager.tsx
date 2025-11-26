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
        <div className="glass-card p-6 mb-8 relative overflow-hidden group">
            {/* Gradient Glow Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Tracked Hashtags
                    </h2>
                    <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                        Manage the hashtags you want to monitor
                    </p>
                </div>
                <button
                    onClick={onScrape}
                    disabled={isScraping || tags.length === 0}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto relative overflow-hidden"
                >
                    {isScraping ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Scraping...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Run Scrape Now
                        </span>
                    )}
                </button>
            </div>

            {/* Add Hashtag Form */}
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--foreground-secondary)]">
                                #
                            </div>
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Enter hashtag"
                                className="w-full pl-8 bg-[rgba(18,18,26,0.8)] border border-white/10 rounded-xl focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                                disabled={isAdding}
                            />
                        </div>

                        <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value as 'tiktok' | 'instagram')}
                            className="px-4 py-3 rounded-xl cursor-pointer bg-[rgba(18,18,26,0.8)] border border-white/10 text-white focus:border-[var(--accent-primary)] focus:outline-none transition-all appearance-none min-w-[140px]"
                            disabled={isAdding}
                            style={{ backgroundImage: 'none' }} // Remove default arrow
                        >
                            <option value="tiktok">🎵 TikTok</option>
                            <option value="instagram">📷 Instagram</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isAdding || !keyword.trim()}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2"
                    >
                        {isAdding ? (
                            'Adding...'
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Tag
                            </>
                        )}
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
