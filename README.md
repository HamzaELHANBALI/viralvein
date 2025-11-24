# ViralVein - SaaS-Ready MVP

> Discover viral content from smaller creators before it hits mainstream

A web application that tracks TikTok/Instagram hashtags to identify "outlier" content—videos with high view counts relative to the creator's follower count—helping you discover viral formats early.

## 🎯 Core Features

- **Hashtag Tracking**: Monitor multiple TikTok/Instagram hashtags
- **Smart Filtering**: 4-stage algorithm filters videos by:
  - Date (< 30 days old)
  - Creator size (< 500k followers)
  - Minimum views (> 5k views)
  - Viral score threshold (>  1.5x)
- **Viral Score**: Automatically calculates `Views / Followers` ratio
- **Manual & Automated Scraping**: Run scrapes on-demand or schedule via cron
- **Swipe File**: Save and annotate videos for inspiration
- **Premium UI**: Dark mode with glassmorphism, gradients, and smooth animations

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Scraping**: Apify API (TikTok Scraper)
- **Styling**: Custom CSS with Inter font

## 📋 Prerequisites

Before you begin, you need:

1. **Node.js** 18+ installed
2. **Supabase Account** (free tier)
   - Create a project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key
3. **Apify Account** (free tier)
   - Create account at [apify.com](https://apify.com)
   - Get your API token

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd viralvein
npm install
```

### 2. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the schema from `supabase-schema.sql`:

```sql
-- Copy and paste the entire contents of supabase-schema.sql
-- This creates the tracked_tags and videos tables
```

### 3. Configure Environment Variables

Copy the example environment template:

```bash
# Create .env.local file
cp ENV_TEMPLATE.md .env.local
```

Edit `.env.local` with your actual credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Apify Configuration
APIFY_API_TOKEN=your_apify_token_here

# TikTok Scraper Actor ID
APIFY_TIKTOK_ACTOR_ID=clockworks~free-tiktok-scraper
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### Adding a Hashtag

1. Enter a hashtag (without the #) in the input field
2. Select platform (TikTok or Instagram)
3. Click **Add Tag**

### Running a Scrape

1. Click **Run Scrape Now** button
2. The system will fetch up to 100 videos per active hashtag
3. Videos are automatically filtered using the 4-stage algorithm
4. Results appear in the dashboard sorted by viral score

### Saving to Swipe File

1. Click the bookmark icon on any video card
2. Or open the video modal and add notes before saving
3. Access saved videos via the **Swipe File** nav link

### Managing Hashtags

- **Pause/Activate**: Click the status badge to toggle
- **Delete**: Click the trash icon to remove a hashtag
- **View Last Scraped**: Shows timestamp of last scrape run

## 🧠 The Algorithm

The viral score calculation and filtering logic:

```typescript
// 1. Calculate Viral Score
viral_score = view_count / creator_followers

// 2. Apply 4-Stage Filter
- Date Filter: upload_date < 30 days old
- Whale Filter: creator_followers < 500,000
- Minimum Viability: view_count > 5,000
- Gold Threshold: viral_score > 1.5
```

Only videos passing **all 4 stages** are saved to the database.

## 📂 Project Structure

```
viralvein/
├── app/
│   ├── api/                    # API routes
│   │   ├── hashtags/          # CRUD for tracked tags
│   │   ├── videos/            # Video data endpoints
│   │   └── scrape/            # Manual scrape trigger
│   ├── swipe-file/            # Saved videos page
│   ├── page.tsx               # Main dashboard
│   ├── layout.tsx             # Root layout + nav
│   └── globals.css            # Design system
├── components/
│   ├── VideoCard.tsx          # Video grid item
│   ├── VideoModal.tsx         # Video player modal
│   ├── ScoreBadge.tsx         # Viral score display
│   ├── HashtagManager.tsx     # Tag management UI
│   └── DashboardGrid.tsx      # Video grid layout
├── lib/
│   ├── supabase.ts            # DB client + helpers
│   ├── apify.ts               # Scraping integration
│   ├── viralScore.ts          # Algorithm logic
│   └── types.ts               # TypeScript types
├── cron/
│   └── scrape-job.ts          # Automated scraping
└── supabase-schema.sql        # Database schema
```

## ⚙️ Automated Scraping (Optional)

To run scrapes automatically every 12 hours:

### Option 1: Vercel Cron (Recommended)

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/scrape",
    "schedule": "0 */12 * * *"
  }]
}
```

### Option 2: Standalone Node Script

```bash
node cron/scrape-job.ts
```

Schedule with system cron or task scheduler.

## 💰 Cost Management

- **Apify Free Tier**: Includes $5/month credit
- Each scrape run costs ~$0.01-0.05 (100 videos)
- Default limit: 100 videos per hashtag per run
- Monitor usage in Apify dashboard

## 🎨 Design System

The app features a modern dark theme with:

- **Glassmorphism**: Frosted glass cards with backdrop blur
- **Gradients**: Purple/pink accents throughout
- **Micro-animations**: Hover effects, loading states
- **Inter Font**: Clean, modern typography
- **Color-Coded Scores**: Green (5x+), Orange (2-5x), Yellow (1.5-2x)

## 🔒 Future Enhancements (SaaS Features)

The architecture is ready for:

- **Authentication**: Add Supabase Auth
- **User Accounts**: Multi-user support (already using UUIDs)
- **Stripe Integration**: Subscription paywall
- **Team Workspaces**: Shared hashtags and swipe files
- **Advanced Filters**: Custom scoring thresholds
- **Export Features**: CSV/PDF report generation

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `APIFY_API_TOKEN` | Apify API authentication token | `apify_api_xxx` |
| `APIFY_TIKTOK_ACTOR_ID` | TikTok scraper actor ID | `clockworks~free-tiktok-scraper` |

## 🐛 Troubleshooting

### "Failed to fetch" errors
- Check that `.env.local` exists and has valid credentials
- Verify Supabase project is active
- Check browser network tab for specific error

### No videos appear after scraping
- Verify hashtag has recent content
- Check Apify dashboard for scrape success
- Review browser console for filtering logs
- Ensure database tables were created correctly

### TikTok embed not loading
- Some videos may have embedding disabled
- Try clicking "Open" to view on TikTok directly

## 📜 License

This project is provided as-is for educational and commercial use.

## 🙋 Support

For issues or questions:
- Check the code comments in each file
- Review the SQL schema for database structure
- Inspect browser console for debugging info

---

**Built with ❤️ using Next.js, Supabase, and Apify**
