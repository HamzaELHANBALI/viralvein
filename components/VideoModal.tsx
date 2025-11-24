'use client';

import type { Video } from '@/lib/types';
import { formatNumber, timeAgo } from '@/lib/viralScore';
import ScoreBadge from './ScoreBadge';
import { useState, useEffect } from 'react';

interface VideoModalProps {
    video: Video | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, notes?: string) => void;
}

export default function VideoModal({ video, isOpen, onClose, onSave }: VideoModalProps) {
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (video?.notes) {
            setNotes(video.notes);
        } else {
            setNotes('');
        }
    }, [video]);

    if (!isOpen || !video) return null;

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(video.id, notes);
        setIsSaving(false);
    };

    // Extract TikTok video ID for embedding
    const getTikTokEmbedUrl = (url: string): string => {
        // TikTok URLs are typically: https://www.tiktok.com/@user/video/1234567890
        const match = url.match(/\/video\/(\d+)/);
        if (match) {
            return `https://www.tiktok.com/embed/v2/${match[1]}`;
        }
        return url;
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors duration-200 z-10"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="grid md:grid-cols-2 gap-6 p-6">
                    {/* Left: Video Player */}
                    <div>
                        <div className="aspect-[9/16] bg-[#12121a] rounded-lg overflow-hidden">
                            <iframe
                                src={getTikTokEmbedUrl(video.url)}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>

                    {/* Right: Video Details */}
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <ScoreBadge score={video.viral_score} />
                        </div>

                        <h3 className="text-xl font-bold mb-4">Video Details</h3>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-[#12121a] rounded-lg p-4">
                                <div className="text-sm text-[var(--foreground-secondary)] mb-1">Views</div>
                                <div className="text-2xl font-bold">{formatNumber(video.view_count)}</div>
                            </div>

                            <div className="bg-[#12121a] rounded-lg p-4">
                                <div className="text-sm text-[var(--foreground-secondary)] mb-1">Likes</div>
                                <div className="text-2xl font-bold">{formatNumber(video.like_count)}</div>
                            </div>

                            <div className="bg-[#12121a] rounded-lg p-4">
                                <div className="text-sm text-[var(--foreground-secondary)] mb-1">Followers</div>
                                <div className="text-2xl font-bold">{formatNumber(video.creator_followers)}</div>
                            </div>

                            <div className="bg-[#12121a] rounded-lg p-4">
                                <div className="text-sm text-[var(--foreground-secondary)] mb-1">Posted</div>
                                <div className="text-lg font-semibold">{timeAgo(video.upload_date)}</div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-[var(--foreground-secondary)] mb-2">Description</h4>
                            <p className="text-sm">{video.description || 'No description'}</p>
                        </div>

                        {/* Notes Section */}
                        <div className="flex-1 flex flex-col">
                            <h4 className="text-sm font-semibold text-[var(--foreground-secondary)] mb-2">
                                {video.is_saved ? 'Your Notes' : 'Add Notes (saves video)'}
                            </h4>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Why is this video interesting? What can you learn from it?"
                                className="flex-1 min-h-[100px] resize-none mb-4"
                            />

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 btn-primary disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : video.is_saved ? 'Update Notes' : 'Save to Swipe File'}
                                </button>

                                <a
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Open
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
