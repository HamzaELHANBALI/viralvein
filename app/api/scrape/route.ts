import { NextRequest, NextResponse } from 'next/server';
import { getActiveTrackedTags, insertVideos, updateLastScraped, videoExists, createScrapeSession, updateSessionVideoCount } from '@/lib/supabase';
import { scrapeTikTokHashtag } from '@/lib/apify';
import { filterVideos } from '@/lib/viralScore';
import type { Video } from '@/lib/types';
import { DEFAULT_FILTERS } from '@/lib/types';

export const maxDuration = 300; // 5 minutes max for scraping

// POST - Manual scrape trigger
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tagId, platform, sessionName, sessionDescription } = body;

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

        // Create a new scrape session
        const now = new Date();
        const defaultSessionName = sessionName || `Scrape ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        const hashtagKeywords = tagsToScrape.map(tag => tag.keyword);

        const session = await createScrapeSession(
            defaultSessionName,
            sessionDescription || `Scraped ${tagsToScrape.length} hashtags`,
            hashtagKeywords
        );

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Failed to create scrape session' },
                { status: 500 }
            );
        }

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
                    // Check if video already exists in this session
                    const exists = await videoExists(video.platform_id!, session.id);
                    if (!exists) {
                        // Add scrape_session_id to the video
                        videosToInsert.push({
                            ...video,
                            scrape_session_id: session.id,
                        } as Omit<Video, 'id' | 'created_at'>);
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

        // Update the session's video count
        await updateSessionVideoCount(session.id, stats.saved);

        return NextResponse.json({
            success: true,
            message: `Scraping completed for ${tagsToScrape.length} tags`,
            stats,
            videosFound: stats.saved,
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
