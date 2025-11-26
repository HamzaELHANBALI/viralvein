'use client';

import { useState, useEffect } from 'react';
import type { Video, TrackedTag } from '@/lib/types';
import HashtagManager from '@/components/HashtagManager';
import DashboardGrid from '@/components/DashboardGrid';
import VideoModal from '@/components/VideoModal';

export default function HomePage() {
  const [tags, setTags] = useState<TrackedTag[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tags and videos on mount
  useEffect(() => {
    fetchTags();
    fetchVideos();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/hashtags');
      const data = await res.json();
      if (data.success) {
        setTags(data.data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/videos?limit=100');
      const data = await res.json();
      if (data.success) {
        setVideos(data.data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = async (keyword: string, platform: 'tiktok' | 'instagram') => {
    try {
      const res = await fetch('/api/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, platform }),
      });
      const data = await res.json();
      if (data.success) {
        setTags([...tags, data.data]);
      }
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      const res = await fetch(`/api/hashtags?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setTags(tags.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const handleToggleStatus = async (id: string, status: 'active' | 'paused') => {
    try {
      const res = await fetch('/api/hashtags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setTags(tags.map((t) => (t.id === id ? { ...t, status } : t)));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleScrape = async () => {
    try {
      setIsScraping(true);
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      console.log('Scrape result:', data);

      // Refresh videos after scraping
      await fetchVideos();
      await fetchTags(); // Update last_scraped timestamps
    } catch (error) {
      console.error('Error scraping:', error);
    } finally {
      setIsScraping(false);
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
        setVideos(videos.map((v) => (v.id === id ? { ...v, is_saved: isSaved } : v)));
        if (selectedVideo?.id === id) {
          setSelectedVideo({ ...selectedVideo, is_saved: isSaved });
        }
      }
    } catch (error) {
      console.error('Error saving video:', error);
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
        setVideos(videos.map((v) => (v.id === id ? { ...v, is_saved: true, notes } : v)));
        if (selectedVideo?.id === id) {
          setSelectedVideo({ ...selectedVideo, is_saved: true, notes });
        }
      }
    } catch (error) {
      console.error('Error saving video with notes:', error)
    }
  };

  return (
    <div className="min-h-screen p-8 relative">
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-600/20 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            ViralVein
          </h1>
          <p className="text-lg text-[var(--foreground-secondary)]">
            Discover viral content from smaller creators before it hits mainstream
          </p>
        </div>

        {/* Hashtag Manager */}
        <HashtagManager
          tags={tags}
          onAdd={handleAddTag}
          onDelete={handleDeleteTag}
          onToggleStatus={handleToggleStatus}
          onScrape={handleScrape}
          isScraping={isScraping}
        />

        {/* Videos Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <div className="aspect-[9/16] skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-4 skeleton w-3/4" />
                  <div className="h-3 skeleton w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DashboardGrid
            videos={videos}
            onVideoClick={handleVideoClick}
            onSaveToggle={handleSaveToggle}
          />
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
