import { NextRequest, NextResponse } from 'next/server';
import { getActiveTrackedTags, insertVideos, updateLastScraped, videoExists } from '@/lib/supabase';
import { scrapeTikTokHashtag } from '@/lib/apify';
import { filterVideos, DEFAULT_FILTERS } from '@/lib/viralScore';
import type { Video } from '@/lib/types';

export const maxDuration = 300; // 5 minutes max for scraping

// POST - Manual scrape trigger
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tagId, platform } = body;

        // Get tags to scrape
        let tagsToScrape;
        if (tagId) {
            // Scrape a specific tag (would need a getTagById function)
            return NextResponse.json(
                { success: false, error: 'Specific tag scraping not yet implemented' },
                { status: 501 }
            );
        } else {
            // Scrape all active tags
            tagsToScrape = await getActiveTrackedTags();
        }

        if (tagsToScrape.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No active tags to scrape',
                stats: { scraped: 0, filtered: 0, saved: 0 },
            });
        }

        const stats = {
            scraped: 0,
            filtered: 0,
            saved: 0,
            errors: [] as string[],
        };

        // Scrape each tag
        for (const tag of tagsToScrape) {
            try {
                console.log(`Scraping ${tag.platform} hashtag: ${tag.keyword}`);

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

                // Apply filtering logic
                const filteredVideos = filterVideos(rawVideos, DEFAULT_FILTERS);
                stats.filtered += filteredVideos.length;

                // Check for duplicates and prepare for insertion
                const videosToInsert: Omit<Video, 'id' | 'created_at'>[] = [];

                for (const video of filteredVideos) {
                    // Check if video already exists
                    const exists = await videoExists(video.platform_id!);
                    if (!exists) {
                        videosToInsert.push(video as Omit<Video, 'id' | 'created_at'>);
                    }
                }

                // Insert new videos
                if (videosToInsert.length > 0) {
                    const success = await insertVideos(videosToInsert);
                    if (success) {
                        stats.saved += videosToInsert.length;
                    }
                }

                // Update last_scraped timestamp
                await updateLastScraped(tag.id);

                console.log(
                    `Completed ${tag.keyword}: ${rawVideos.length} scraped, ${filteredVideos.length} passed filters, ${videosToInsert.length} new videos saved`
                );
            } catch (error) {
                const errorMsg = `Error scraping ${tag.keyword}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                console.error(errorMsg);
                stats.errors.push(errorMsg);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Scraping completed for ${tagsToScrape.length} tags`,
            stats,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Scraping failed',
            },
            { status: 500 }
        );
    }
}

// GET - Get scrape status/history (could be expanded later)
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Scrape endpoint is active. Use POST to trigger a scrape.',
    });
}
