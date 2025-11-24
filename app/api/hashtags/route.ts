import { NextRequest, NextResponse } from 'next/server';
import {
    getTrackedTags,
    addTrackedTag,
    updateTagStatus,
    deleteTrackedTag,
} from '@/lib/supabase';

// GET - List all tracked hashtags
export async function GET() {
    try {
        const tags = await getTrackedTags();
        return NextResponse.json({ success: true, data: tags });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch tags',
            },
            { status: 500 }
        );
    }
}

// POST - Add a new tracked hashtag
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { keyword, platform } = body;

        if (!keyword || !platform) {
            return NextResponse.json(
                { success: false, error: 'Keyword and platform are required' },
                { status: 400 }
            );
        }

        if (platform !== 'tiktok' && platform !== 'instagram') {
            return NextResponse.json(
                { success: false, error: 'Platform must be tiktok or instagram' },
                { status: 400 }
            );
        }

        // Remove # if user included it
        const cleanKeyword = keyword.replace(/^#/, '').trim();

        const tag = await addTrackedTag(cleanKeyword, platform);

        if (!tag) {
            return NextResponse.json(
                { success: false, error: 'Failed to add tag' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data: tag }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to add tag',
            },
            { status: 500 }
        );
    }
}

// PATCH - Update hashtag status (active/paused)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json(
                { success: false, error: 'ID and status are required' },
                { status: 400 }
            );
        }

        if (status !== 'active' && status !== 'paused') {
            return NextResponse.json(
                { success: false, error: 'Status must be active or paused' },
                { status: 400 }
            );
        }

        const success = await updateTagStatus(id, status);

        if (!success) {
            return NextResponse.json(
                { success: false, error: 'Failed to update tag' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update tag',
            },
            { status: 500 }
        );
    }
}

// DELETE - Remove a tracked hashtag
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID is required' },
                { status: 400 }
            );
        }

        const success = await deleteTrackedTag(id);

        if (!success) {
            return NextResponse.json(
                { success: false, error: 'Failed to delete tag' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete tag',
            },
            { status: 500 }
        );
    }
}
