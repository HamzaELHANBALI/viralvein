# Scrape Session Integration Guide

## ✅ What's Been Implemented (Backend & Components)

### Database Schema
- ✅ `scrape_sessions` table created
- ✅ `scrape_session_id` added to videos table
- ✅ Migration SQL provided for existing databases (`supabase-migration.sql`)

### Backend API
- ✅ `/api/sessions` - GET/POST/DELETE endpoints
- ✅ `/api/scrape` - Creates new session for each scrape
- ✅ `/api/videos` - Supports `session_id` query parameter

### Components
- ✅ `ScrapeNamingModal` - Modal to name scrapes before running
- ✅ `SessionSelector` - Dropdown to view/switch/delete sessions
- ✅ `HashtagManager` - Updated with naming modal integration

## 🔧 Manual Integration Steps Needed

### 1. Update `app/page.tsx`

Add these imports:
```typescript
import type { Video, TrackedTag, ScrapeSession } from '@/lib/types';
import SessionSelector from '@/components/SessionSelector';
```

Add state variables:
```typescript
const [sessions, setSessions] = useState<ScrapeSession[]>([]);
const [selectedSession, setSelectedSession] = useState<ScrapeSession | null>(null);
```

Add fetch sessions function:
```typescript
const fetchSessions = async () => {
  try {
    const res = await fetch('/api/sessions');
    const data = await res.json();
    if (data.success) {
      setSessions(data.data);
      // Set most recent session as default
      if (data.data.length > 0 && !selectedSession) {
        setSelectedSession(data.data[0]);
      }
    }
  } catch (error) {
    console.error('Error fetching sessions:', error);
    showToast('Failed to fetch sessions', 'error');
  }
};
```

Update fetchVideos to filter by session:
```typescript
const fetchVideos = async (sessionId?: string) => {
  try {
    setIsLoading(true);
    const url = sessionId
      ? `/api/videos?limit=100&session_id=${sessionId}`
      : '/api/videos?limit=100';
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      setVideos(data.data);
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
    showToast('Failed to fetch videos', 'error');
  } finally {
    setIsLoading(false);
  }
};
```

Update useEffect to fetch sessions:
```typescript
useEffect(() => {
  fetchTags();
  fetchSessions();
}, []);

// Re-fetch videos when session changes
useEffect(() => {
  if (sessions.length > 0) {
    fetchVideos(selectedSession?.id);
  }
}, [selectedSession]);
```

Update handleScrape signature:
```typescript
const handleScrape = async (sessionName?: string, sessionDescription?: string) => {
  try {
    setIsScraping(true);
    showToast('Starting scrape...', 'info');
    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionName, sessionDescription }),
    });
    const data = await res.json();

    if (data.success) {
      showToast(`Scrape completed! Found ${data.videosFound || 0} new videos`, 'success');
      // Refresh sessions and videos
      await fetchSessions();
      await fetchVideos(data.stats.sessionId);
      await fetchTags();
    } else {
      showToast(data.error || 'Scrape failed', 'error');
    }
  } catch (error) {
    console.error('Error scraping:', error);
    showToast('Scrape failed', 'error');
  } finally {
    setIsScraping(false);
  }
};
```

Add session handlers:
```typescript
const handleSessionChange = (session: ScrapeSession | null) => {
  setSelectedSession(session);
};

const handleDeleteSession = async (sessionId: string) => {
  try {
    const res = await fetch(`/api/sessions?id=${sessionId}`, {
      method: 'DELETE',
    });
    const data = await res.json();

    if (data.success) {
      showToast('Session deleted successfully', 'success');
      await fetchSessions();
      // If deleted session was selected, clear selection
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
      await fetchVideos();
    } else {
      showToast(data.error || 'Failed to delete session', 'error');
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    showToast('Failed to delete session', 'error');
  }
};
```

### 2. Add SessionSelector to UI

In the return statement, add SessionSelector before the video filters:

```tsx
{/* Session Selector */}
{sessions.length > 0 && (
  <div className="mb-6">
    <SessionSelector
      sessions={sessions}
      selectedSession={selectedSession}
      onSessionChange={handleSessionChange}
      onDeleteSession={handleDeleteSession}
    />
  </div>
)}

{/* Video Filters */}
{videos.length > 0 && (
  <VideoFilters
    // ... existing props
  />
)}
```

## 📝 Database Migration

Before using the new system, run the migration SQL in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Run the contents of `supabase-migration.sql`
3. This will:
   - Create the `scrape_sessions` table
   - Add `scrape_session_id` column to videos
   - Create a "Legacy Scrape" session for existing videos
   - Update constraints

## 🎯 How It Works

1. **Running a Scrape:**
   - User clicks "Run Scrape" → Naming modal appears
   - User optionally names the scrape (or skips for auto-name)
   - Scrape runs and creates a new session
   - All videos from this scrape are linked to this session

2. **Viewing Scrapes:**
   - SessionSelector dropdown shows all past scrapes
   - Click to switch between scrapes
   - Default view shows most recent scrape
   - Can view "All Sessions" to see all videos

3. **Managing Scrapes:**
   - Each session shows video count, timestamp, hashtags
   - Delete old sessions via trash icon
   - Deleting a session removes its videos (cascade)

## 🎨 Benefits

- ✅ Each scrape is isolated and named
- ✅ Compare different scraping sessions easily
- ✅ Keep dashboard clean (only show latest scrape by default)
- ✅ Track scraping history over time
- ✅ Delete old scrapes when no longer needed

## 🐛 Troubleshooting

If you get errors about missing columns:
- Make sure you ran the migration SQL
- Check Supabase logs for specific errors
- Verify all environment variables are set

If sessions don't appear:
- Check browser console for API errors
- Verify `/api/sessions` endpoint is working
- Check that scrapes are completing successfully
