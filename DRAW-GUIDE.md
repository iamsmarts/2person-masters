# QGC Masters Draw - How To Guide

This guide walks you through running the live draw show for the QGC 2-Person Masters tournament.

---

## Pre-Show Setup

### 1. Database Setup (First Time Only)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run** to create tables and seed data

### 2. Verify Environment

Make sure your `.env` file has:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_SECRET=qgc-masters-2026-draw-admin-k7x9m2
```

### 3. Start the App

```bash
npm run dev
```

### 4. Open Browser Windows

- **OBS Capture Window:** `http://localhost:5173/pairing-draw`
  - This is the clean view for streaming (no admin controls)

- **Admin Control Window:** `http://localhost:5173/pairing-draw?admin=qgc-masters-2026-draw-admin-k7x9m2`
  - This shows the admin panel at the bottom
  - Keep this on a separate monitor or minimized from stream

---

## Running the Draw

### Phase 1: Team Pairing (T1 + T3)

The first 2 teams pair Tier 1 players with Tier 3 players.

1. Click **Start Draw**
   - Creates 10 empty team slots
   - Left bucket shows "Tier 1" (Adam, Alonso)
   - Right bucket shows "Tier 3" (Jeffery, Kevin)

2. Click **Reveal Left Player**
   - Randomly selects from Tier 1
   - Player highlights in yellow, then appears in Team 1's left column

3. Click **Reveal Right Player**
   - Randomly selects from Tier 3
   - Player highlights, then appears in Team 1's right column
   - Team 1 is now complete!

4. Repeat for Team 2
   - Click **Reveal Left Player** (remaining T1 player)
   - Click **Reveal Right Player** (remaining T3 player)

### Phase 2: Team Pairing (T2A + T2B)

After Team 2 is complete, the app automatically switches to Tier 2 pairings.

- Left bucket now shows "Tier 2 Group A" (8 players)
- Right bucket now shows "Tier 2 Group B" (8 players)

5. For Teams 3-10, repeat the pattern:
   - **Reveal Left Player** → **Reveal Right Player**
   - 8 teams total in this phase

6. After Team 10's right player is revealed:
   - Status changes to "PAIRINGS_DONE"
   - Message: "All teams have been drawn!"

### Phase 3: Tee Time Assignment

7. Click **Generate Tee Times**
   - Randomly assigns 2 teams to each of the 5 tee times
   - Creates random reveal order (1-10)
   - View switches to tee time sheet

8. Click **Reveal Next Tee Slot** (10 times)
   - Each click reveals one team's tee time assignment
   - Team highlights in yellow when revealed
   - Continue until all 10 teams are shown

9. After the 10th reveal:
   - Status changes to "TEE_TIMES_DONE"
   - Message: "All tee times have been revealed!"

---

## Pacing Tips for the Show

- **Build suspense:** Pause between reveals, add commentary
- **Left then right:** Always reveal left player first, then right
- **Tier transitions:** When switching from T1/T3 to T2A/T2B, acknowledge the change
- **Tee times:** Consider revealing from last tee time to first for drama

---

## Wiping Data (Reset for Test Runs)

### Option 1: In-App Reset (Quick)

1. Go to admin view: `/pairing-draw?admin=qgc-masters-2026-draw-admin-k7x9m2`
2. In the admin panel, type `RESET` in the text field
3. Click the **Reset** button
4. This clears all teams and tee assignments, resets draw state to NOT_STARTED

### Option 2: SQL Reset (Complete Wipe)

Run this in Supabase SQL Editor for a full reset:

```sql
-- Delete all tee assignments
DELETE FROM tee_assignments;

-- Delete all teams
DELETE FROM teams;

-- Reset draw state
UPDATE draw_state SET
  status = 'NOT_STARTED',
  current_team_number = NULL,
  currently_filling_side = NULL,
  current_tee_reveal_index = NULL,
  updated_at = now();
```

### Option 3: Nuclear Reset (Full Database Rebuild)

If you need to completely start over (including changing players or tee times):

```sql
-- Drop everything
DROP TABLE IF EXISTS tee_assignments;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS tee_times;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS draw_state;

-- Then re-run the full migration script
-- (copy from supabase/migrations/001_initial_schema.sql)
```

---

## Troubleshooting

### "No draw state found"
- Database wasn't set up properly
- Run the migration SQL in Supabase

### Buttons are disabled
- Check the status in the admin panel
- Make sure you're clicking in the right order (left before right)

### Players not showing in buckets
- Verify players were seeded in database
- Check Supabase table viewer for `players` table

### Page not updating
- App polls every 2 seconds automatically
- Hard refresh (Cmd+Shift+R) if needed

### Reset button not working
- Must type exactly `RESET` (all caps) in the text field first

---

## Pre-Show Checklist

- [ ] Database migration run in Supabase
- [ ] App running locally (`npm run dev`)
- [ ] Admin URL tested and working
- [ ] OBS capture window set up
- [ ] Run through complete test draw
- [ ] Reset data after test
- [ ] Verify home page shows "Teams will be drawn live..."

---

## URLs Reference

| Purpose | URL |
|---------|-----|
| Home Page | `http://localhost:5173/` |
| Draw View (OBS) | `http://localhost:5173/pairing-draw` |
| Draw Admin | `http://localhost:5173/pairing-draw?admin=qgc-masters-2026-draw-admin-k7x9m2` |

---

## Day-Of Quick Reference

1. Start app: `npm run dev`
2. Open OBS window: `/pairing-draw`
3. Open admin window: `/pairing-draw?admin=qgc-masters-2026-draw-admin-k7x9m2`
4. Click: **Start Draw**
5. Alternate: **Reveal Left** → **Reveal Right** (20 times total)
6. Click: **Generate Tee Times**
7. Click: **Reveal Next Tee Slot** (10 times)
8. Done!

---

## Deployment Checklist (Vercel + Cloudflare)

### Step 1: Prepare Repository

- [ ] Push code to GitHub
  ```bash
  git add .
  git commit -m "Initial QGC Masters Draw app"
  git push origin main
  ```

- [ ] Verify `.gitignore` includes `.env` (it does)
- [ ] Verify no secrets in committed code

---

### Step 2: Deploy to Vercel

1. **Create Project**
   - [ ] Go to [vercel.com](https://vercel.com) and sign in
   - [ ] Click **Add New** → **Project**
   - [ ] Import your GitHub repository
   - [ ] Select the `2person-masters` repo

2. **Configure Build Settings**
   - [ ] Framework Preset: **Vite**
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `dist`
   - [ ] Install Command: `npm install`

3. **Add Environment Variables**
   - [ ] Click **Environment Variables**
   - [ ] Add each variable:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://okvbrcmtiaxvjubfqlec.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` (your full key) |
   | `VITE_ADMIN_SECRET` | `qgc-masters-2026-draw-admin-k7x9m2` |

   - [ ] Set all to: **Production**, **Preview**, **Development**

4. **Deploy**
   - [ ] Click **Deploy**
   - [ ] Wait for build to complete
   - [ ] Note your Vercel URL (e.g., `qgc-masters-draw.vercel.app`)

5. **Test Deployment**
   - [ ] Visit Vercel URL
   - [ ] Verify home page loads
   - [ ] Verify `/pairing-draw` works
   - [ ] Verify admin panel with `?admin=...` query param

---

### Step 3: Configure Custom Domain in Vercel

1. **Add Domain**
   - [ ] Go to Project Settings → **Domains**
   - [ ] Add domain: `masters.quasargolf.club`
   - [ ] Vercel will show DNS configuration needed

2. **Note the Vercel DNS Target**
   - Usually: `cname.vercel-dns.com`
   - Or an A record IP address

---

### Step 4: Configure Cloudflare DNS

1. **Log into Cloudflare**
   - [ ] Go to [cloudflare.com](https://cloudflare.com)
   - [ ] Select the `quasargolf.club` domain

2. **Add DNS Record**
   - [ ] Go to **DNS** → **Records**
   - [ ] Click **Add Record**

   **Option A: CNAME (Recommended)**
   | Field | Value |
   |-------|-------|
   | Type | `CNAME` |
   | Name | `masters` |
   | Target | `cname.vercel-dns.com` |
   | Proxy status | **DNS only** (gray cloud) |
   | TTL | Auto |

   **Option B: A Record (if Vercel provides IP)**
   | Field | Value |
   |-------|-------|
   | Type | `A` |
   | Name | `masters` |
   | IPv4 address | `76.76.21.21` (Vercel's IP) |
   | Proxy status | **DNS only** (gray cloud) |
   | TTL | Auto |

3. **Important: Proxy Status**
   - [ ] Set to **DNS only** (gray cloud) initially
   - [ ] This lets Vercel handle SSL
   - [ ] Can enable proxy (orange cloud) later if needed

---

### Step 5: Verify Domain in Vercel

1. **Check Domain Status**
   - [ ] Go back to Vercel → Project Settings → Domains
   - [ ] Wait for domain to show **Valid Configuration**
   - [ ] SSL certificate will auto-provision (may take a few minutes)

2. **Test Live Site**
   - [ ] Visit `https://masters.quasargolf.club`
   - [ ] Verify HTTPS works (padlock icon)
   - [ ] Test all pages:
     - [ ] Home page: `https://masters.quasargolf.club/`
     - [ ] Draw page: `https://masters.quasargolf.club/pairing-draw`
     - [ ] Admin: `https://masters.quasargolf.club/pairing-draw?admin=qgc-masters-2026-draw-admin-k7x9m2`

---

### Step 6: Final Production Checks

- [ ] Run full draw test on production
- [ ] Reset data after test
- [ ] Verify Supabase RLS policies work from production domain
- [ ] Test on mobile device
- [ ] Share admin URL only with trusted people

---

### Troubleshooting Deployment

**"Environment variable not found"**
- Rebuild after adding env vars: Vercel → Deployments → Redeploy

**Domain not working**
- DNS propagation can take up to 48 hours (usually 5-30 min)
- Check with: `dig masters.quasargolf.club`
- Verify Cloudflare proxy is OFF (gray cloud)

**SSL Certificate Error**
- Wait 5-10 minutes for Vercel to provision
- Verify domain is set to "DNS only" in Cloudflare

**CORS Errors**
- Add your domain to Supabase allowed origins:
  - Supabase → Settings → API → Additional allowed origins
  - Add: `https://masters.quasargolf.club`

**Build Fails**
- Check Vercel build logs
- Ensure all env vars are set
- Test build locally: `npm run build`

---

### Post-Deploy Checklist

- [ ] Production URL works: `https://masters.quasargolf.club`
- [ ] SSL certificate valid
- [ ] Home page loads data from Supabase
- [ ] Draw page works
- [ ] Admin controls work
- [ ] Reset function works
- [ ] Data persists after page refresh
- [ ] Site works on mobile

---

### Quick Deploy Commands

```bash
# Push updates to trigger Vercel rebuild
git add .
git commit -m "Update description"
git push origin main

# Vercel auto-deploys on push to main
```

---

### Production URLs

| Purpose | URL |
|---------|-----|
| Home Page | `https://masters.quasargolf.club/` |
| Draw View (OBS) | `https://masters.quasargolf.club/pairing-draw` |
| Draw Admin | `https://masters.quasargolf.club/pairing-draw?admin=qgc-masters-2026-draw-admin-k7x9m2` |
