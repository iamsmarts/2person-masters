# QGC Masters Draw App

Live random draw app for the Quasar Golf Club 2-Person Masters tournament. Built for streaming via OBS with real-time state persistence.

**Live site:** https://masters.quasargolf.club

## Features

- **Live Pairing Draw** - Randomly pairs 20 players into 10 teams across tiers
- **Tee Time Assignment** - Randomly assigns teams to 5 tee times with dramatic reveals
- **OBS-Ready UI** - Clean 16:9 layout optimized for stream capture
- **Admin Controls** - Hidden panel for controlling the draw flow
- **Real-time Sync** - All state persisted in Supabase, survives page refreshes

## Tech Stack

- **Frontend:** Vite + React + TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Routing:** React Router
- **Hosting:** Vercel

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Create a `.env` file:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_SECRET=your-secret-string
```

### 3. Set Up Database

Run the migration in Supabase SQL Editor:

```bash
# Copy contents of:
supabase/migrations/001_initial_schema.sql
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Open the App

- **Home Page:** http://localhost:5173/
- **Draw Page:** http://localhost:5173/pairing-draw
- **Admin View:** http://localhost:5173/pairing-draw?admin=YOUR_SECRET

## Project Structure

```
src/
  lib/
    supabaseClient.ts   # Supabase configuration
    types.ts            # TypeScript interfaces
    drawService.ts      # Draw logic & API calls
    random.ts           # Fisher-Yates shuffle
  routes/
    HomePage.tsx        # Public tournament info
    PairingDrawPage.tsx # Live draw interface
  components/
    ScorecardTable.tsx  # 10-team pairing table
    BucketColumn.tsx    # Remaining players list
    TeeSheet.tsx        # Tee time assignments
    AdminPanel.tsx      # Draw control buttons
```

## Documentation

See **[DRAW-GUIDE.md](./DRAW-GUIDE.md)** for:

- Step-by-step draw instructions
- Deployment checklist (Vercel + Cloudflare)
- How to reset/wipe test data
- Troubleshooting guide

## Tournament Format

**20 players across 4 tiers:**
- Tier 1 (2 players) + Tier 3 (2 players) → 2 teams
- Tier 2A (8 players) + Tier 2B (8 players) → 8 teams

**Draw Flow:**
1. Start draw
2. Reveal left/right players alternately (20 reveals)
3. Generate tee times
4. Reveal tee assignments (10 reveals)

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## License

Private - Quasar Golf Club
