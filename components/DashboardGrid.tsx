'use client';

import type { Video } from '@/lib/types';
import VideoCard from './VideoCard';

interface DashboardGridProps {
    videos: Video[];
    onVideoClick: (video: Video) => void;
    onSaveToggle: (id: string, isSaved: boolean) => void;
}

export default function DashboardGrid({ videos, onVideoClick, onSaveToggle }: DashboardGridProps) {
    if (videos.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2">No videos found</h3>
                <p className="text-[var(--foreground-secondary)]">
                    Add a hashtag above and run a scrape to discover viral content!
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
                <VideoCard
                    key={video.id}
                    video={video}
                    onSaveToggle={onSaveToggle}
                    onClick={() => onVideoClick(video)}
                />
            ))}
        </div>
    );
}
