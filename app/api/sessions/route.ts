import { NextRequest, NextResponse } from 'next/server';
import { getScrapeSessions, getMostRecentSession, createScrapeSession, deleteSession } from '@/lib/supabase';

// GET - Fetch all scrape sessions
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const getRecent = searchParams.get('recent');

        if (getRecent === 'true') {
            // Get only the most recent session
            const session = await getMostRecentSession();
            return NextResponse.json({
                success: true,
                data: session,
            });
        }

        // Get all sessions
        const sessions = await getScrapeSessions();
        return NextResponse.json({
            success: true,
            data: sessions,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch sessions',
            },
            { status: 500 }
        );
    }
}

// POST - Create a new scrape session
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, hashtags_scraped } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Session name is required' },
                { status: 400 }
            );
        }

        const session = await createScrapeSession(name, description, hashtags_scraped || []);

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Failed to create session' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: session,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create session',
            },
            { status: 500 }
        );
    }
}

// DELETE - Delete a scrape session
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Session ID is required' },
                { status: 400 }
            );
        }

        const success = await deleteSession(id);

        if (!success) {
            return NextResponse.json(
                { success: false, error: 'Failed to delete session' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Session deleted successfully',
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete session',
            },
            { status: 500 }
        );
    }
}
