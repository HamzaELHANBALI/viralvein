// Cron job for automated scraping
// This can be deployed to Vercel Cron, AWS Lambda, or run as a standalone Node service

import { getActiveTrackedTags, insertVideos, updateLastScraped, videoExists, createScrapeSession, updateSessionVideoCount } from '../lib/supabase';
import { scrapeTikTokHashtag } from '../lib/apify';
import { filterVideos } from '../lib/viralScore';
import type { Video } from '../lib/types';
import { DEFAULT_FILTERS } from '../lib/types';

/**
 * Main scraping job function
 * Run this every 12 hours via cron
 */
export async function runScrapeJob() {
    console.log('=== Starting scheduled scrape job ===');
    const startTime = Date.now();

    try {
        const tagsToScrape = await getActiveTrackedTags();

        if (tagsToScrape.length === 0) {
            console.log('No active tags to scrape');
            return { success: true, stats: { scraped: 0, filtered: 0, saved: 0 } };
        }

        console.log(`Found ${tagsToScrape.length} active tags to scrape`);

        // Create a scrape session for this cron run
        const now = new Date();
        const sessionName = `Scheduled Scrape ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        const hashtagKeywords = tagsToScrape.map(tag => tag.keyword);

        const session = await createScrapeSession(
            sessionName,
            `Automated scrape of ${tagsToScrape.length} hashtags`,
            hashtagKeywords
        );

        if (!session) {
            console.error('Failed to create scrape session');
            return { success: false, error: 'Failed to create scrape session' };
        }

        console.log(`Created session: ${session.name} (${session.id})`);

        const stats = {
            scraped: 0,
            filtered: 0,
            saved: 0,
            errors: [] as string[],
            sessionId: session.id,
            sessionName: session.name,
        };

        // Scrape each tag
        for (const tag of tagsToScrape) {
            try {
                console.log(`\n--- Scraping ${tag.platform} hashtag: #${tag.keyword} ---`);

                let rawVideos: any[] = [];

                if (tag.platform === 'tiktok') {
                    rawVideos = await scrapeTikTokHashtag({
                        hashtag: tag.keyword,
                        maxResults: 100, // Cost control
                    });
                } else {
                    console.log('Instagram scraping not yet implemented');
                    continue;
                }

                stats.scraped += rawVideos.length;
                console.log(`Scraped ${rawVideos.length} raw videos`);

                // Apply filtering logic
                const filteredVideos = filterVideos(rawVideos, DEFAULT_FILTERS);
                stats.filtered += filteredVideos.length;
                console.log(`${filteredVideos.length} videos passed filters`);

                // Check for duplicates and prepare for insertion
                const videosToInsert: Omit<Video, 'id' | 'created_at'>[] = [];

                for (const video of filteredVideos) {
                    // Check if video already exists in this session
                    const exists = await videoExists(video.platform_id!, session.id);
                    if (!exists) {
                        videosToInsert.push({
                            ...video,
                            scrape_session_id: session.id,
                        } as Omit<Video, 'id' | 'created_at'>);
                    }
                }

                console.log(`${videosToInsert.length} new videos to save`);

                // Insert new videos
                if (videosToInsert.length > 0) {
                    const success = await insertVideos(videosToInsert);
                    if (success) {
                        stats.saved += videosToInsert.length;
                        console.log(`✓ Successfully saved ${videosToInsert.length} videos`);
                    } else {
                        console.error('✗ Failed to save videos');
                    }
                }

                // Update last_scraped timestamp
                await updateLastScraped(tag.id);
            } catch (error) {
                const errorMsg = `Error scraping ${tag.keyword}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                console.error(errorMsg);
                stats.errors.push(errorMsg);
            }
        }

        // Update the session's video count
        await updateSessionVideoCount(session.id, stats.saved);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n=== Scrape job completed in ${duration}s ===`);
        console.log(`Stats: ${stats.scraped} scraped, ${stats.filtered} filtered, ${stats.saved} saved`);
        if (stats.errors.length > 0) {
            console.log(`Errors: ${stats.errors.length}`);
        }

        return { success: true, stats };
    } catch (error) {
        console.error('Fatal error in scrape job:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// For Vercel Cron: export as API route
export async function GET() {
    const result = await runScrapeJob();
    return Response.json(result);
}

// For standalone execution
if (require.main === module) {
    runScrapeJob()
        .then((result) => {
            console.log('Job finished:', result);
            process.exit(0);
        })
        .catch((error) => {
            console.error('Job failed:', error);
            process.exit(1);
        });
}
