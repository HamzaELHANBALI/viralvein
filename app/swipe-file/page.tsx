'use client';

import { useState, useEffect } from 'react';
import type { Video } from '@/lib/types';
import VideoCard from '@/components/VideoCard';
import VideoModal from '@/components/VideoModal';

export default function SwipeFilePage() {
    const [savedVideos, setSavedVideos] = useState<Video[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSavedVideos();
    }, []);

    const fetchSavedVideos = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/videos?saved=true');
            const data = await res.json();
            if (data.success) {
                setSavedVideos(data.data);
            }
        } catch (error) {
            console.error('Error fetching saved videos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVideoClick = (video: Video) => {
        setSelectedVideo(video);
    };

    const handleSaveToggle = async (id: string, isSaved: boolean) => {
        try {
            const res = await fetch('/api/videos', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_saved: isSaved }),
            });
            const data = await res.json();
            if (data.success) {
                // Remove from list if unsaved
                if (!isSaved) {
                    setSavedVideos(savedVideos.filter((v) => v.id !== id));
                    if (selectedVideo?.id === id) {
                        setSelectedVideo(null);
                    }
                }
            }
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    const handleSaveWithNotes = async (id: string, notes?: string) => {
        try {
            const res = await fetch('/api/videos', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_saved: true, notes }),
            });
            const data = await res.json();
            if (data.success) {
                setSavedVideos(savedVideos.map((v) => (v.id === id ? { ...v, notes } : v)));
                if (selectedVideo?.id === id) {
                    setSelectedVideo({ ...selectedVideo, notes });
                }
            }
        } catch (error) {
            console.error('Error updating notes:', error);
        }
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                        Swipe File
                    </h1>
                    <p className="text-lg text-[var(--foreground-secondary)]">
                        Your saved viral content inspiration
                    </p>
                </div>

                {/* Saved Videos Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="glass-card overflow-hidden">
                                <div className="aspect-[9/16] skeleton" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 skeleton w-3/4" />
                                    <div className="h-3 skeleton w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : savedVideos.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📑</div>
                        <h3 className="text-2xl font-bold mb-2">No saved videos yet</h3>
                        <p className="text-[var(--foreground-secondary)] mb-6">
                            Start saving videos from the dashboard to build your swipe file!
                        </p>
                        <a
                            href="/"
                            className="btn-primary inline-block"
                        >
                            Go to Dashboard
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {savedVideos.map((video) => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                onSaveToggle={handleSaveToggle}
                                onClick={() => handleVideoClick(video)}
                            />
                        ))}
                    </div>
                )}

                {/* Video Modal */}
                <VideoModal
                    video={selectedVideo}
                    isOpen={!!selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                    onSave={handleSaveWithNotes}
                />
            </div>
        </div>
    );
}
