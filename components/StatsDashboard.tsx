'use client';

import type { Video, TrackedTag } from '@/lib/types';

interface StatsDashboardProps {
  videos: Video[];
  tags: TrackedTag[];
}

export default function StatsDashboard({ videos, tags }: StatsDashboardProps) {
  // Calculate stats
  const totalVideos = videos.length;
  const savedVideos = videos.filter(v => v.is_saved).length;
  const avgViralScore = videos.length > 0
    ? videos.reduce((sum, v) => sum + v.viral_score, 0) / videos.length
    : 0;
  const activeTags = tags.filter(t => t.status === 'active').length;
  const topVideo = videos.length > 0
    ? videos.reduce((max, v) => v.viral_score > max.viral_score ? v : max, videos[0])
    : null;

  const stats = [
    {
      label: 'Total Videos',
      value: totalVideos.toLocaleString(),
      icon: '🎬',
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-500/10',
      description: 'Videos discovered'
    },
    {
      label: 'Active Hashtags',
      value: activeTags.toString(),
      icon: '#️⃣',
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-500/10',
      description: 'Being tracked'
    },
    {
      label: 'Saved Videos',
      value: savedVideos.toString(),
      icon: '💾',
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-pink-500/10',
      description: 'In swipe file'
    },
    {
      label: 'Avg Viral Score',
      value: avgViralScore > 0 ? `${avgViralScore.toFixed(1)}x` : '—',
      icon: '⚡',
      color: 'from-yellow-400 to-orange-600',
      bgColor: 'bg-yellow-500/10',
      description: 'Average performance'
    },
  ];

  return (
    <div className="mb-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="glass-card p-6 relative overflow-hidden group"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

            {/* Content */}
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {stat.label}
                </p>
                <p className="text-xs text-[var(--foreground-secondary)]">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performer Banner */}
      {topVideo && (
        <div className="glass-card p-4 border-l-4 border-yellow-500">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🏆</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-400 mb-1">Top Performer</p>
              <p className="text-sm text-[var(--foreground-secondary)] line-clamp-1">
                {topVideo.description || 'No description'}
                <span className="ml-2 font-bold text-yellow-400">
                  {topVideo.viral_score.toFixed(1)}x viral score
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
