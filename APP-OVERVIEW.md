# QGC Masters Draw App - Overview

## What Is This?

A web app for running the live random draw show for the Quasar Golf Club 2-Person Masters tournament. It pairs 20 players into 10 teams, assigns tee times, and looks good on a YouTube stream.

---

## Tech Stack (Simple Version)

- **React** - Makes the buttons work and pages update
- **Tailwind CSS** - Makes it look nice
- **Supabase** - Stores all the data (players, teams, tee times)
- **Vite** - Bundles everything together
- **Vercel** - Hosts the website

---

## What We Built

### Two Pages

1. **Home Page** (`/`)
   - Tournament info (date, location)
   - Player tiers list
   - Teams table (after draw)
   - Tee times (after reveal)

2. **Draw Page** (`/pairing-draw`)
   - Live draw interface for streaming
   - Scorecard showing 10 teams
   - Player buckets on left and right
   - Admin controls (hidden unless you have the secret)

### Key Features

- **Random Pairing** - Tier 1 pairs with Tier 3, Tier 2A pairs with Tier 2B
- **One-by-One Reveals** - Click to reveal each player with animations
- **Tee Time Assignment** - Randomly assigns teams to 5 tee times
- **Paid Resets** - Players can donate to reset the draw (max 3 times)
- **Persistent Data** - Everything saves to database, survives page refresh

---

## How To Use

### Before the Show

1. **Set up the database**
   - Go to Supabase
   - Run the SQL files in `supabase/migrations/`

2. **Deploy the app**
   - Push to GitHub
   - Connect to Vercel
   - Add environment variables
   - Set up domain in Cloudflare

### Running the Draw

1. **Open two browser windows:**
   - OBS capture: `https://masters.quasargolf.club/pairing-draw`
   - Admin control: `https://masters.quasargolf.club/pairing-draw?admin=YOUR_SECRET`

2. **Start the draw:**
   - Click **Start Draw**

3. **Reveal players:**
   - Click **Reveal Left Player** → **Reveal Right Player**
   - Repeat for all 10 teams (20 total clicks)

4. **If someone wants to reset:**
   - They send money via Zelle/Apple Pay
   - Select their name, enter amount, click **Paid Reset**
   - Click **Start Draw** again

5. **Assign tee times:**
   - Click **Generate Tee Times**
   - Click **Reveal Next Tee Slot** (10 times)

6. **Done!**

### Testing

- Use **Full Reset** (type "RESET" + Enter) to wipe everything and start over
- This clears all data including paid reset history

---

## URLs

| What | URL |
|------|-----|
| Home Page | `https://masters.quasargolf.club/` |
| Draw (for OBS) | `https://masters.quasargolf.club/pairing-draw` |
| Draw (admin) | `https://masters.quasargolf.club/pairing-draw?admin=YOUR_SECRET` |

---

## Files That Matter

```
src/
  routes/
    HomePage.tsx        ← Public info page
    PairingDrawPage.tsx ← The draw show page
  components/
    AdminPanel.tsx      ← All the control buttons
    ScorecardTable.tsx  ← The 10-team table
    BucketColumn.tsx    ← Remaining players list
  lib/
    drawService.ts      ← All the draw logic

supabase/
  migrations/
    001_initial_schema.sql    ← Database setup
    002_add_reset_tracking.sql ← Paid reset feature
```

---

## The Paid Reset Feature

Mid-draw, if someone hates their partner, they can pay to reset:

1. First reset: any amount (e.g., $20)
2. Second reset: must beat first (e.g., $35)
3. Third reset: must beat second (e.g., $50)

The app shows who triggered each reset with escalating emojis:
- ☠️ Latest reset
- 😵 Second
- 😭 Third (oldest)

All money goes to the prize pool!

---

## Need Help?

Check the detailed guides:
- `DRAW-GUIDE.md` - Step-by-step instructions
- `README.md` - Technical setup
