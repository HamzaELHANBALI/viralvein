import { ApifyClient } from 'apify-client';
import type { ApifyVideoResult } from './types';
import { calculateViralScore } from './viralScore';

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN || '',
});

const TIKTOK_ACTOR_ID = process.env.APIFY_TIKTOK_ACTOR_ID || 'clockworks~free-tiktok-scraper';

export interface ScrapeTikTokOptions {
    hashtag: string;
    maxResults?: number;
}

/**
 * Scrape TikTok videos for a specific hashtag using Apify
 * Returns processed video data ready for filtering
 */
export async function scrapeTikTokHashtag(
    options: ScrapeTikTokOptions
): Promise<any[]> {
    const { hashtag, maxResults = 100 } = options;

    try {
        console.log(`Starting Apify scrape for hashtag: #${hashtag}`);

        // Run the Apify actor
        const run = await client.actor(TIKTOK_ACTOR_ID).call({
            hashtags: [hashtag],
            resultsPerPage: maxResults,
            shouldDownloadVideos: false,
            shouldDownloadCovers: false,
            shouldDownloadSubtitles: false,
            shouldDownloadSlideshowImages: false,
        });

        console.log(`Apify run completed. Status: ${run.status}`);

        // Fetch results from the dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        console.log(`Retrieved ${items.length} items from Apify`);

        // Transform Apify results to our Video format
        const videos = (items as ApifyVideoResult[]).map((item) => {
            const views = item.playCount || 0;
            const followers = item.authorMeta?.fans || 0;
            const viralScoreCalc = calculateViralScore(views, followers);

            return {
                platform_id: item.id,
                url: item.webVideoUrl,
                thumbnail: item.videoMeta?.coverUrl || '',
                description: item.text || '',
                view_count: views,
                like_count: item.diggCount || 0,
                creator_followers: followers,
                viral_score: viralScoreCalc.score,
                upload_date: item.createTimeISO || new Date().toISOString(),
                is_saved: false,
                notes: null,
                hashtag_keyword: hashtag,
            };
        });

        console.log(`Processed ${videos.length} videos`);
        return videos;
    } catch (error) {
        console.error('Error scraping TikTok with Apify:', error);
        throw error;
    }
}

/**
 * Scrape Instagram hashtag (placeholder for future implementation)
 */
export async function scrapeInstagramHashtag(
    hashtag: string,
    maxResults = 100
): Promise<any[]> {
    // TODO: Implement Instagram scraping when needed
    console.log('Instagram scraping not yet implemented');
    return [];
}

/**
 * Check Apify account status and remaining credits
 */
export async function checkApifyStatus(): Promise<{
    success: boolean;
    user?: any;
    error?: string;
}> {
    try {
        const user = await client.user().get();
        return {
            success: true,
            user,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
