import { createClient } from '@supabase/supabase-js';
import type { TrackedTag, Video, ScrapeSession } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations

// ==================== SCRAPE SESSIONS ====================

export async function createScrapeSession(
    name: string,
    description?: string,
    hashtagsScraped: string[] = []
): Promise<ScrapeSession | null> {
    const { data, error } = await supabase
        .from('scrape_sessions')
        .insert([
            {
                name,
                description,
                video_count: 0,
                hashtags_scraped: hashtagsScraped,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error('Error creating scrape session:', error);
        return null;
    }

    return data;
}

export async function getScrapeSessions(): Promise<ScrapeSession[]> {
    const { data, error } = await supabase
        .from('scrape_sessions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching scrape sessions:', error);
        return [];
    }

    return data || [];
}

export async function getMostRecentSession(): Promise<ScrapeSession | null> {
    const { data, error } = await supabase
        .from('scrape_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching most recent session:', error);
        return null;
    }

    return data;
}

export async function updateSessionVideoCount(sessionId: string, count: number): Promise<boolean> {
    const { error } = await supabase
        .from('scrape_sessions')
        .update({ video_count: count })
        .eq('id', sessionId);

    if (error) {
        console.error('Error updating session video count:', error);
        return false;
    }

    return true;
}

export async function deleteSession(sessionId: string): Promise<boolean> {
    const { error } = await supabase
        .from('scrape_sessions')
        .delete()
        .eq('id', sessionId);

    if (error) {
        console.error('Error deleting session:', error);
        return false;
    }

    return true;
}

// ==================== TRACKED TAGS ====================

export async function getTrackedTags(): Promise<TrackedTag[]> {
    const { data, error } = await supabase
        .from('tracked_tags')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tracked tags:', error);
        return [];
    }

    return data || [];
}

export async function getActiveTrackedTags(): Promise<TrackedTag[]> {
    const { data, error } = await supabase
        .from('tracked_tags')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching active tags:', error);
        return [];
    }

    return data || [];
}

export async function addTrackedTag(
    keyword: string,
    platform: 'tiktok' | 'instagram'
): Promise<TrackedTag | null> {
    const { data, error } = await supabase
        .from('tracked_tags')
        .insert([
            {
                keyword,
                platform,
                status: 'active',
                last_scraped: null,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error('Error adding tracked tag:', error);
        return null;
    }

    return data;
}

export async function updateTagStatus(
    id: string,
    status: 'active' | 'paused'
): Promise<boolean> {
    const { error } = await supabase
        .from('tracked_tags')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('Error updating tag status:', error);
        return false;
    }

    return true;
}

export async function deleteTrackedTag(id: string): Promise<boolean> {
    const { error } = await supabase.from('tracked_tags').delete().eq('id', id);

    if (error) {
        console.error('Error deleting tag:', error);
        return false;
    }

    return true;
}

export async function updateLastScraped(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('tracked_tags')
        .update({ last_scraped: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error('Error updating last_scraped:', error);
        return false;
    }

    return true;
}

export async function getVideos(limit = 100, sessionId?: string): Promise<Video[]> {
    let query = supabase
        .from('videos')
        .select('*');

    // Filter by session if provided
    if (sessionId) {
        query = query.eq('scrape_session_id', sessionId);
    }

    query = query
        .order('viral_score', { ascending: false })
        .limit(limit);

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching videos:', error);
        return [];
    }

    return data || [];
}

export async function getVideosBySession(sessionId: string): Promise<Video[]> {
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('scrape_session_id', sessionId)
        .order('viral_score', { ascending: false });

    if (error) {
        console.error('Error fetching videos by session:', error);
        return [];
    }

    return data || [];
}

export async function getSavedVideos(): Promise<Video[]> {
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('is_saved', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching saved videos:', error);
        return [];
    }

    return data || [];
}

export async function saveVideo(id: string, notes?: string): Promise<boolean> {
    const updateData: { is_saved: boolean; notes?: string } = { is_saved: true };
    if (notes !== undefined) {
        updateData.notes = notes;
    }

    const { error } = await supabase
        .from('videos')
        .update(updateData)
        .eq('id', id);

    if (error) {
        console.error('Error saving video:', error);
        return false;
    }

    return true;
}

export async function unsaveVideo(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('videos')
        .update({ is_saved: false })
        .eq('id', id);

    if (error) {
        console.error('Error unsaving video:', error);
        return false;
    }

    return true;
}

export async function updateVideoNotes(
    id: string,
    notes: string
): Promise<boolean> {
    const { error } = await supabase
        .from('videos')
        .update({ notes })
        .eq('id', id);

    if (error) {
        console.error('Error updating video notes:', error);
        return false;
    }

    return true;
}

export async function insertVideos(videos: Omit<Video, 'id' | 'created_at'>[]): Promise<boolean> {
    if (videos.length === 0) return true;

    const { error } = await supabase.from('videos').insert(videos);

    if (error) {
        console.error('Error inserting videos:', error);
        return false;
    }

    return true;
}

export async function videoExists(platformId: string, sessionId?: string): Promise<boolean> {
    let query = supabase
        .from('videos')
        .select('id')
        .eq('platform_id', platformId);

    // Check within specific session if provided
    if (sessionId) {
        query = query.eq('scrape_session_id', sessionId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" which is expected
        console.error('Error checking video existence:', error);
    }

    return !!data;
}
