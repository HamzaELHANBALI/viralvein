'use client';

import { useState } from 'react';
import type { TrackedTag } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import ScrapeNamingModal from '@/components/ScrapeNamingModal';

interface HashtagManagerProps {
    tags: TrackedTag[];
    onAdd: (keyword: string, platform: 'tiktok' | 'instagram') => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, status: 'active' | 'paused') => void;
    onScrape: (sessionName?: string, sessionDescription?: string) => void;
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
    const [isExpanded, setIsExpanded] = useState(true);
    const [showNamingModal, setShowNamingModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setIsAdding(true);
        await onAdd(keyword.trim(), platform);
        setKeyword('');
        setIsAdding(false);
    };

    const handleScrapeClick = () => {
        setShowNamingModal(true);
    };

    const handleConfirmScrape = (name: string, description?: string) => {
        onScrape(name || undefined, description);
    };

    const activeTags = tags.filter(t => t.status === 'active');
    const pausedTags = tags.filter(t => t.status === 'paused');

    return (
        <div className="glass-card p-6 mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Hashtag Tracker</h2>
                        <p className="text-sm text-[var(--foreground-secondary)]">
                            {tags.length === 0 ? 'No hashtags yet' : `${activeTags.length} active, ${pausedTags.length} paused`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-sm font-medium"
                        title={isExpanded ? "Collapse" : "Expand"}
                    >
                        <svg
                            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={handleScrapeClick}
                        disabled={isScraping || tags.length === 0}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        title={tags.length === 0 ? "Add hashtags first" : "Scrape all active hashtags"}
                    >
                        {isScraping ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Scraping...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Run Scrape
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Add Hashtag Form */}
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                        <form onSubmit={handleSubmit}>
                            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                                <div className="flex-1 min-w-[200px]">
                                    <input
                                        type="text"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        placeholder="Enter hashtag (e.g., contentcreator)"
                                        className="w-full"
                                        disabled={isAdding}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <select
                                        value={platform}
                                        onChange={(e) => setPlatform(e.target.value as 'tiktok' | 'instagram')}
                                        className="px-4 py-2 rounded-lg cursor-pointer bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                                        disabled={isAdding}
                                    >
                                        <option value="tiktok">🎵 TikTok</option>
                                        <option value="instagram">📷 Instagram</option>
                                    </select>

                                    <button
                                        type="submit"
                                        disabled={isAdding || !keyword.trim()}
                                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap px-6"
                                    >
                                        {isAdding ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Adding...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Tags List */}
                    {tags.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                            <div className="text-5xl mb-3">🏷️</div>
                            <h3 className="text-lg font-semibold mb-2">No hashtags tracked yet</h3>
                            <p className="text-sm text-[var(--foreground-secondary)]">
                                Add your first hashtag above to start discovering viral content!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tags.map((tag) => (
                                <div
                                    key={tag.id}
                                    className="flex items-center gap-4 p-4 bg-[#12121a] rounded-xl border border-white/5 hover:border-white/10 transition-all group"
                                >
                                    {/* Platform Icon */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-semibold ${
                                        tag.platform === 'tiktok'
                                            ? 'bg-gradient-to-br from-cyan-500/20 to-pink-500/20 border border-cyan-500/30'
                                            : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                                    }`}>
                                        <span className="text-2xl">
                                            {tag.platform === 'tiktok' ? '🎵' : '📷'}
                                        </span>
                                    </div>

                                    {/* Tag Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-lg">#{tag.keyword}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                tag.platform === 'tiktok'
                                                    ? 'bg-cyan-500/20 text-cyan-400'
                                                    : 'bg-purple-500/20 text-purple-400'
                                            }`}>
                                                {tag.platform}
                                            </span>
                                        </div>
                                        <div className="text-sm text-[var(--foreground-secondary)] flex items-center gap-2 flex-wrap">
                                            {tag.last_scraped ? (
                                                <>
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Last scraped {formatDistanceToNow(new Date(tag.last_scraped), { addSuffix: true })}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-yellow-400">Never scraped</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onToggleStatus(tag.id, tag.status === 'active' ? 'paused' : 'active')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                                tag.status === 'active'
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30'
                                            }`}
                                            title={tag.status === 'active' ? 'Click to pause' : 'Click to activate'}
                                        >
                                            {tag.status === 'active' ? (
                                                <>
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Active
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                                    </svg>
                                                    Paused
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => onDelete(tag.id)}
                                            className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 flex items-center justify-center transition-all"
                                            title="Delete hashtag"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Scrape Naming Modal */}
            <ScrapeNamingModal
                isOpen={showNamingModal}
                onClose={() => setShowNamingModal(false)}
                onConfirm={handleConfirmScrape}
                isScraping={isScraping}
            />
        </div>
    );
}
