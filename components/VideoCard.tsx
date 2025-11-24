'use client';

import type { Video } from '@/lib/types';
import { formatNumber, timeAgo } from '@/lib/viralScore';
import ScoreBadge from '@/components/ScoreBadge';
import { useState } from 'react';

interface VideoCardProps {
    video: Video;
    onSaveToggle: (id: string, isSaved: boolean) => void;
    onClick: () => void;
}

export default function VideoCard({ video, onSaveToggle, onClick }: VideoCardProps) {
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveClick = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        setIsSaving(true);
        await onSaveToggle(video.id, !video.is_saved);
        setIsSaving(false);
    };

    return (
        <div
            className="glass-card cursor-pointer overflow-hidden group relative animate-fadeIn"
            onClick={onClick}
        >
            {/* Thumbnail */}
            <div className="relative overflow-hidden aspect-[9/16] bg-[#12121a]">
                <img
                    src={video.thumbnail || '/placeholder-video.png'}
                    alt={video.description?.slice(0, 50) || 'Video thumbnail'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />

                {/* Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                    </div>
                </div>

                {/* Viral Score Badge */}
                <div className="absolute top-3 left-3">
                    <ScoreBadge score={video.viral_score} />
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSaveClick}
                    disabled={isSaving}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors duration-200"
                    title={video.is_saved ? 'Unsave' : 'Save to Swipe File'}
                >
                    <svg
                        className={`w-5 h-5 ${video.is_saved ? 'text-pink-400 fill-current' : 'text-white'}`}
                        fill={video.is_saved ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                    </svg>
                </button>
            </div>

            {/* Card Info */}
            <div className="p-4">
                {/* Stats Row */}
                <div className="flex items-center gap-3 text-sm mb-2">
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-[var(--foreground-secondary)]">{formatNumber(video.view_count)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[var(--foreground-secondary)]">{formatNumber(video.like_count)}</span>
                    </div>
                </div>

                {/* Views vs Followers */}
                <div className="text-xs text-[var(--foreground-secondary)] mb-2">
                    <span className="font-semibold text-green-400">{formatNumber(video.view_count)}</span> views /
                    <span className="font-semibold text-blue-400"> {formatNumber(video.creator_followers)}</span> followers
                </div>

                {/* Description */}
                <p className="text-sm text-[var(--foreground)] line-clamp-2 mb-2">
                    {video.description || 'No description'}
                </p>

                {/* Time Ago */}
                <div className="text-xs text-[var(--foreground-secondary)]">
                    {timeAgo(video.upload_date)}
                </div>
            </div>
        </div>
    );
}
