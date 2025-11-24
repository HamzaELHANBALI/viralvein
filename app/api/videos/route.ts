import { NextRequest, NextResponse } from 'next/server';
import {
    getVideos,
    getSavedVideos,
    saveVideo,
    unsaveVideo,
    updateVideoNotes,
} from '@/lib/supabase';

// GET - Fetch videos (all or saved only)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const savedOnly = searchParams.get('saved') === 'true';
        const limit = parseInt(searchParams.get('limit') || '100');

        const videos = savedOnly ? await getSavedVideos() : await getVideos(limit);

        return NextResponse.json({ success: true, data: videos });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error ? error.message : 'Failed to fetch videos',
            },
            { status: 500 }
        );
    }
}

// PATCH - Update video (save/unsave, add notes)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, is_saved, notes } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Video ID is required' },
                { status: 400 }
            );
        }

        // Handle save/unsave
        if (is_saved !== undefined) {
            const success = is_saved
                ? await saveVideo(id, notes)
                : await unsaveVideo(id);

            if (!success) {
                return NextResponse.json(
                    { success: false, error: 'Failed to update video' },
                    { status: 500 }
                );
            }
        }

        // Handle notes update (if video is already saved)
        if (notes !== undefined && is_saved === undefined) {
            const success = await updateVideoNotes(id, notes);

            if (!success) {
                return NextResponse.json(
                    { success: false, error: 'Failed to update notes' },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update video',
            },
            { status: 500 }
        );
    }
}
