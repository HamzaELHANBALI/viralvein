import type { Video, FilterCriteria, ViralScoreCalc } from './types';
import { DEFAULT_FILTERS } from './types';

/**
 * Calculate the viral score for a video
 * Formula: Views / Followers
 */
export function calculateViralScore(
    views: number,
    followers: number
): ViralScoreCalc {
    if (followers === 0) {
        return {
            views,
            followers,
            score: 0,
            passesThreshold: false,
        };
    }

    const score = views / followers;

    return {
        views,
        followers,
        score: parseFloat(score.toFixed(2)),
        passesThreshold: score >= 1.5,
    };
}

/**
 * Apply all filtering rules to determine if a video should be saved
 * The Filtering Logic (4 stages):
 * 1. Date Filter: Discard if older than 30 days
 * 2. Whale Filter: Discard if creator has >500k followers
 * 3. Minimum Viability: Discard if <5k views
 * 4. Gold Threshold: Discard if viral score <1.5x
 */
export function applyFilters(
    video: {
        upload_date: string;
        view_count: number;
        creator_followers: number;
        viral_score: number;
    },
    criteria: FilterCriteria = DEFAULT_FILTERS
): { passes: boolean; reason?: string } {
    // 1. Date Filter
    const uploadDate = new Date(video.upload_date);
    const now = new Date();
    const daysSinceUpload =
        (now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceUpload > criteria.maxAge) {
        return {
            passes: false,
            reason: `Too old: ${Math.floor(daysSinceUpload)} days (max ${criteria.maxAge})`,
        };
    }

    // 2. Whale Filter
    if (video.creator_followers > criteria.maxFollowers) {
        return {
            passes: false,
            reason: `Too many followers: ${video.creator_followers.toLocaleString()} (max ${criteria.maxFollowers.toLocaleString()})`,
        };
    }

    // 3. Minimum Viability
    if (video.view_count < criteria.minViews) {
        return {
            passes: false,
            reason: `Not enough views: ${video.view_count.toLocaleString()} (min ${criteria.minViews.toLocaleString()})`,
        };
    }

    // 4. Gold Threshold
    if (video.viral_score < criteria.minViralScore) {
        return {
            passes: false,
            reason: `Viral score too low: ${video.viral_score}x (min ${criteria.minViralScore}x)`,
        };
    }

    return { passes: true };
}

/**
 * Process and filter an array of videos
 * Returns only videos that pass all filters
 */
export function filterVideos(
    videos: Partial<Video>[],
    criteria: FilterCriteria = DEFAULT_FILTERS
): Partial<Video>[] {
    return videos.filter((video) => {
        if (
            !video.upload_date ||
            video.view_count === undefined ||
            video.creator_followers === undefined ||
            video.viral_score === undefined
        ) {
            return false;
        }

        const result = applyFilters(
            {
                upload_date: video.upload_date,
                view_count: video.view_count,
                creator_followers: video.creator_followers,
                viral_score: video.viral_score,
            },
            criteria
        );

        return result.passes;
    });
}

/**
 * Format a number with appropriate suffix (K, M)
 */
export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
}

/**
 * Calculate time ago from a date string
 */
export function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }

    return 'just now';
}
