# QGC Masters Draw App – Implementation Spec

> **Goal:** Build a small Vite + React app backed by Supabase to run a *live random draw show* for the Quasar Golf Club 2-Person Masters, and then reveal tee times. This file is written for an AI code agent / dev to implement the app.

---

## 1. High-Level Overview

We are building a micro-app served at:

- `https://masters.quasargolf.club`

The app has **two main responsibilities**:

1. **Public-facing site (`/`)**
   - Show tournament info.
   - Show player tiers.
   - Show final teams and tee times once the draw is done.

2. **Live draw page (`/pairing-draw`)**
   - Used during a live YouTube stream (captured via OBS).
   - Provides a **name-by-name random draw** for forming 10 teams:
     - 2 teams made from **Tier 1 + Tier 3**.
     - 8 teams made from **Tier 2 Group A + Tier 2 Group B**.
   - Shows a “scorecard” table of pairings while drawing.
   - Shows two side “buckets” for remaining players on each side.
   - After all teams are formed, randomly assigns teams to 5 tee times (2 teams per tee time) and reveals them one slot at a time.

All state (players, teams, draw progress, tee times, assignments) must be **persisted in Supabase** so reloading the page does not change results once revealed.

---

## 2. Tech Stack & Project Setup

### 2.1. Stack

- **Frontend:** Vite + React + TypeScript
- **Routing:** React Router
- **Backend / DB:** Supabase (Postgres)
- **State fetching:** Supabase JS client (and optionally Supabase Realtime)
- **Styling:** Any reasonable lightweight approach (e.g., Tailwind or CSS Modules). Prioritize clarity over fanciness.

### 2.2. Environment

Create a `.env` (or `.env.local`) file with:

- `VITE_SUPABASE_URL=...`
- `VITE_SUPABASE_ANON_KEY=...`
- `VITE_ADMIN_SECRET=some-long-random-string`
  Used as `?admin=<secret>` on the draw page to unlock admin controls.

Implement a `src/lib/supabaseClient.ts` that exports a configured Supabase client using the above env vars.

---

## 3. Data Model (Supabase Schema)

Implement the following tables in Supabase. Migration can be SQL or via Supabase UI; SQL is preferred.

### 3.1. `players`

The full player list (seeded once).

Columns:

- `id` – `uuid` (primary key, default `gen_random_uuid()`)
- `display_name` – `text` (e.g., "Adam")
- `tier` – `text` enum-like with these values:
  - `'T1'`, `'T2A'`, `'T2B'`, `'T3'`
- `active` – `boolean` default `true`
- `created_at` – `timestamptz` default `now()`

**Initial data** (seed):

- **Tier 1:** Adam, Alonso
- **Tier 3:** Jeffery, Kevin
- **Tier 2 Group A:** Cisco, Will, Manny, Rudy, Jessy, Ericka, Jaime, Memo
- **Tier 2 Group B:** Richie, Che, Jose, Xilos, Herb, Jorge, Dereck, Tony

### 3.2. `teams`

Represents the 10 2-person teams formed during the draw.

Columns:

- `id` – `uuid` primary key
- `team_number` – `integer` (1–10)
  This corresponds to the scorecard row and team order.
- `left_player_id` – `uuid` (nullable, fk → `players.id`)
- `right_player_id` – `uuid` (nullable, fk → `players.id`)
- `created_at` – `timestamptz` default `now()`

### 3.3. `tee_times`

Represents the 5 tee times for the event.

Columns:

- `id` – `uuid` primary key
- `label` – `text` (e.g., `"7:30 AM"`)
- `slot_index` – `integer` (1–5, ordered earliest to latest)
- `created_at` – `timestamptz` default `now()`

Seed this table manually with 5 tee times (exact labels can be filled in later).

### 3.4. `tee_assignments`

Represents the mapping of teams to tee times.

Columns:

- `id` – `uuid` primary key
- `tee_time_id` – `uuid` fk → `tee_times.id`
- `team_id` – `uuid` fk → `teams.id`
- `slot_in_foursome` – `integer` (1 or 2)
- `reveal_order` – `integer` (1–10)
- `revealed` – `boolean` default `false`
- `created_at` – `timestamptz` default `now()`

### 3.5. `draw_state`

Global state for this tournament’s draw.

Columns:

- `id` – `uuid` primary key
  There will be exactly one row in this table.
- `status` – `text`
  Possible values:
  - `'NOT_STARTED'`
  - `'PAIRING_T1_T3'` (pairing Tier1 vs Tier3)
  - `'PAIRING_T2_TIERS'` (pairing Tier2A vs Tier2B)
  - `'PAIRINGS_DONE'`
  - `'TEE_TIMES_READY'`
  - `'TEE_TIMES_DONE'`
- `current_team_number` – `integer` (1–10, nullable if not started)
- `currently_filling_side` – `text` (`'left'` or `'right'`, nullable)
- `current_tee_reveal_index` – `integer` (1–10, nullable)
- `created_at` – `timestamptz` default `now()`
- `updated_at` – `timestamptz` default `now()`

Use a trigger or application logic to keep `updated_at` in sync.

---

## 4. Draw Rules & Logic

### 4.1. Team Formation Rules

We have 20 players split into tiers:

- **Tier 1 (T1):** 2 players (strongest)
- **Tier 3 (T3):** 2 players (weakest)
- **Tier 2 Group A (T2A):** 8 players
- **Tier 2 Group B (T2B):** 8 players

We must form **10 teams** total:

1. **2 teams** formed by pairing:
   - **Left bucket:** Tier 1
   - **Right bucket:** Tier 3

2. **8 teams** formed by pairing:
   - **Left bucket:** Tier 2 Group A
   - **Right bucket:** Tier 2 Group B

Each player is used exactly once.

### 4.2. Pairing Mechanism

On the **Pairing Draw page**, we display:

- A **center scorecard table**:
  - Header row: `Team`, `Left Player`, `Right Player`
  - Rows 1–10: Team 1 through Team 10.
- A **Left bucket column**:
  - Dropdown label for current left bucket:
    - Stage 1: “Tier 1”
    - Stage 2: “Tier 2 Group A”
  - Button: “Reveal left player”
  - List of remaining players in the current left bucket.
- A **Right bucket column**:
  - Dropdown label for current right bucket:
    - Stage 1: “Tier 3”
    - Stage 2: “Tier 2 Group B”
  - Button: “Reveal right player”
  - List of remaining players in the current right bucket.

**Admin flows:**

1. At the start, admin clicks a “Start Draw” button:
   - Create 10 rows in `teams` with `team_number = 1..10` and `left/right_player_id = null`.
   - Set `draw_state`:
     - `status = 'PAIRING_T1_T3'`
     - `current_team_number = 1`
     - `currently_filling_side = 'left'`
     - `current_tee_reveal_index = null`

2. When admin clicks **“Reveal left player”**:
   - Backend:
     - Determine active left bucket:
       - If `status = 'PAIRING_T1_T3'` → left tier is `'T1'`.
       - If `status = 'PAIRING_T2_TIERS'` → left tier is `'T2A'`.
     - Compute remaining players in that tier who are not already assigned to any team:
       - A player is “used” if their `id` appears in any `teams.left_player_id` or `teams.right_player_id`.
     - Randomly select one player from that set.
     - Update `teams` row where `team_number = current_team_number`:
       - Set `left_player_id = chosenPlayerId`.
     - Update `draw_state.currently_filling_side = 'right'`.

3. When admin clicks **“Reveal right player”**:
   - Backend:
     - Determine active right bucket:
       - If `status = 'PAIRING_T1_T3'` → right tier is `'T3'`.
       - If `status = 'PAIRING_T2_TIERS'` → right tier is `'T2B'`.
     - Compute remaining players in that tier who are not already used.
     - Randomly select one player.
     - Update `teams` row where `team_number = current_team_number`:
       - Set `right_player_id = chosenPlayerId`.
     - If `current_team_number < 10`:
       - `current_team_number += 1`
       - `currently_filling_side = 'left'`
     - Else if `current_team_number == 10` and this is the final pairing:
       - Set `status = 'PAIRINGS_DONE'`
       - Set `currently_filling_side = null`

4. **Stage switching (T1/T3 → T2A/T2B):**
   - Stage 1 uses tiers T1 and T3.
   - After both T1 and T3 are exhausted, automatically flip:
     - `status = 'PAIRING_T2_TIERS'`
   - The frontend can derive which labels to show in each bucket from `status`.

5. **Name reveal animation (frontend-only):**
   - The backend only decides the chosen player.
   - The frontend is responsible for:
     - Showing the list of remaining players in that bucket.
     - Animating a “shuffle” and then highlighting the chosen name.
     - Updating the scorecard table with the chosen name.

The frontend must never override or randomly pick players locally; all official draws must come from Supabase to keep state authoritative and persistent.

---

## 5. Tee Time Assignment & Reveal

After all 10 teams are formed:

1. Admin clicks **“Generate Tee Times”**:
   - Preconditions:
     - `draw_state.status` is `'PAIRINGS_DONE'`.
   - Backend procedure:
     1. Fetch all `teams` (10 rows).
     2. Shuffle the array of teams.
     3. Fetch `tee_times` ordered by `slot_index` (5 rows).
     4. Assign 2 teams per tee time, in order:
        - `tee_times[0]` → teams 1 & 2
        - `tee_times[1]` → teams 3 & 4
        - …
        - `tee_times[4]` → teams 9 & 10
     5. Create a `tee_assignments` row for each assignment:
        - `tee_time_id`
        - `team_id`
        - `slot_in_foursome` (1 or 2)
     6. Generate a random `reveal_order` 1–10:
        - Shuffle an array of indexes `[0..9]` and map them to `reveal_order`.
     7. Set `revealed = false` for all assignments.
     8. Update `draw_state`:
        - `status = 'TEE_TIMES_READY'`
        - `current_tee_reveal_index = 1`

2. Admin clicks **“Reveal next tee time slot”**:
   - Backend:
     - Read `draw_state.current_tee_reveal_index`.
     - Find `tee_assignments` row with `reveal_order = current_tee_reveal_index`.
     - Set `revealed = true`.
     - If `current_tee_reveal_index < 10`:
       - Increment `current_tee_reveal_index`.
       - Keep `status = 'TEE_TIMES_READY'`.
     - Else:
       - Set `status = 'TEE_TIMES_DONE'`.

3. Frontend:
   - For each revealed tee assignment:
     - Show the team under the appropriate tee time row.
     - Add some animation (fade in / slide, etc.).
   - Once all 10 are revealed, the tee sheet is complete.

---

## 6. App Routes & UI Requirements

### 6.1. `/` – Home Page (Public)

**Purpose:** Public informational page for the event.

Sections:

1. **Hero**
   - Title, e.g. “Quasar GC Masters – 2-Person Combined Stroke Play”
   - Date: January 2nd, 2026
   - Location: Diamond Bar Golf Course
   - Short blurb (placeholder text is fine; can be tweaked later).

2. **Player Tiers**
   - Four columns or grouped sections:
     - Tier 1
     - Tier 2 Group A
     - Tier 2 Group B
     - Tier 3
   - Names pulled from `players` table, grouped by `tier`, `active = true`.

3. **Teams Table**
   - If `draw_state.status` is before `'PAIRINGS_DONE'`:
     - Show a message like “Teams will be drawn live during the Quasar GC Masters Draw Show.”
   - If `draw_state.status` is `'PAIRINGS_DONE'` or beyond:
     - Render a table:
       - `Team #`, `Left Player`, `Right Player`
       - Use `teams.team_number` and join to `players` for names.

4. **Tee Times Table**
   - If `draw_state.status` is before `'TEE_TIMES_READY'`:
     - Placeholder message like “Tee times to be revealed after the draw.”
   - If `'TEE_TIMES_READY'` or `'TEE_TIMES_DONE'`:
     - Show tee sheet:
       - Columns: `Tee Time`, `Team 1`, `Team 2`
       - For each `tee_times` row:
         - Join to `tee_assignments` where `tee_assignments.tee_time_id` matches.
         - Only show team names for `tee_assignments.revealed = true`.
         - If `TEE_TIMES_DONE`, all will be revealed.

5. **Sponsors**
   - Simple section listing sponsor logos or placeholder text.

The home page should be read-only and never perform any mutations.

### 6.2. `/pairing-draw` – Live Draw Page

This page has **two layers**:

1. **Stage View** (designed to be captured by OBS):
   - Center scorecard table:
     - 10 rows (Team 1–10).
     - Two columns: `Left Player`, `Right Player`.
   - Left bucket:
     - Title: current left bucket label (`Tier 1` or `Tier 2 Group A`).
     - Vertical list of remaining player names.
   - Right bucket:
     - Title: current right bucket label (`Tier 3` or `Tier 2 Group B`).
     - Vertical list of remaining player names.
   - Basic animations when revealing a new player:
     - e.g. highlight the bucket, animate a “spin” or “shuffle” among remaining names, then highlight chosen name.
   - Once team is fully filled:
     - Highlight the next team row (Team N+1).

2. **Admin Panel** (visible only if `?admin=<VITE_ADMIN_SECRET>` is present in URL):
   - Small control area (it can be fixed at the bottom or off to the side):
     - Displays current `draw_state`:
       - `status`
       - `current_team_number`
       - `currently_filling_side`
       - `current_tee_reveal_index`
     - Buttons:
       - `Start Draw` (disabled once started or if state is beyond NOT_STARTED)
       - `Reveal left player`
       - `Reveal right player`
       - `Generate tee times`
       - `Reveal next tee time slot`
       - `Reset draw` (for testing; should be clearly marked and ideally guarded).

**Reset behavior (for testing only):**

- Clear all rows from `teams` and `tee_assignments`.
- Reset `draw_state` to:
  - `status = 'NOT_STARTED'`
  - other fields null.
- Do **not** delete players or tee_times.

Gate the reset button behind an additional confirmation (e.g., type “RESET” or a modal).

---

## 7. Implementation Notes

### 7.1. Randomness

- Implement a proper Fisher–Yates shuffle in a small utility.
- For each reveal:
  - Backend should determine the chosen player/team.
  - Frontend should never pick randomly on its own.
- For now, no need for deterministic seeds, but avoid brittle random APIs.

### 7.2. Data Fetching & Realtime Updates

- Use Supabase client in React to fetch:
  - `draw_state` (single row).
  - `players`.
  - `teams`.
  - `tee_times`.
  - `tee_assignments`.
- If feasible, set up Supabase Realtime subscriptions on:
  - `draw_state`
  - `teams`
  - `tee_assignments`
- Alternatively, polling every 1–2 seconds is acceptable.

### 7.3. Types & Structure (Suggested)

Create TypeScript interfaces that mirror database schema:

- `Player`
- `Team`
- `TeeTime`
- `TeeAssignment`
- `DrawState`

Consider organizing code under:

```txt
src/
  main.tsx
  App.tsx
  routes/
    HomePage.tsx
    PairingDrawPage.tsx
  components/
    ScorecardTable.tsx
    BucketColumn.tsx
    TeeSheet.tsx
    AdminPanel.tsx
  lib/
    supabaseClient.ts
    drawService.ts    // abstraction around Supabase calls
    random.ts
```
## 7.4. Security

- This app is not highly sensitive, but:
  - Only show admin controls if `?admin=<VITE_ADMIN_SECRET>` matches.
  - Don’t expose any service role keys in the frontend.
  - Use only the Supabase anon key on the client.

---

## 8. Tasks / Checklist for the Agent

### 1. Scaffold project
- Create a Vite + React + TypeScript project.
- Add React Router for `/` and `/pairing-draw`.
- Add Supabase JS client and environment variables.

### 2. Implement Supabase schema
- Create tables: `players`, `teams`, `tee_times`, `tee_assignments`, `draw_state`.
- Seed `players` and `tee_times`.
- Insert an initial `draw_state` row with `status = 'NOT_STARTED'`.

### 3. Create Supabase client + draw service
- `supabaseClient.ts`
- `drawService.ts` with functions:
  - `startDraw()`
  - `revealLeftPlayer()`
  - `revealRightPlayer()`
  - `generateTeeTimes()`
  - `revealNextTeeSlot()`
  - `resetDraw()` (testing only)
- Each function should:
  - Read current `draw_state`.
  - Perform necessary queries and updates.
  - Handle error cases (no remaining players, invalid state, etc.).

### 4. Build `/` HomePage
- Fetch and render:
  - Tournament static info (hard-coded for now).
  - Player tiers from `players`.
  - Teams table (when available).
  - Tee times & assignments (when generated).
- Show appropriate messages based on `draw_state.status`.

### 5. Build `/pairing-draw` Page
- Fetch state and render:
  - Scorecard table with 10 rows, showing teams and player names.
  - Left and right bucket lists based on current stage and remaining players.
- Implement reveal animations (basic but clear).
- Implement `AdminPanel`:
  - Show state.
  - Show control buttons that call `drawService` functions.
  - Only render if `admin` query param matches `VITE_ADMIN_SECRET`.

### 6. Add styling
- Make the stage area look like a simple digital scorecard:
  - Clear typography.
  - QGC branding colors can be added later.
- Ensure layout works nicely at **16:9 viewport** (optimized for OBS capture).

### 7. Manual testing
- Run through full flow multiple times with `resetDraw()`:
  - Start draw.
  - Reveal all left/right players for 10 teams.
  - Verify no player is reused.
  - Generate tee times.
  - Reveal all tee slots.
  - Verify each team appears exactly once and tee sheet looks correct.
- Refresh pages at various points to confirm state persistence.

---

## 9. Acceptance Criteria

- Home page loads correctly and shows:
  - Player tiers from DB.
  - Team & tee time info when available.
- Pairing draw page:
  - Shows 10-row scorecard table.
  - Shows correct players in buckets for each stage.
  - Each click of **Reveal left/right**:
    - Picks a new player from the correct bucket.
    - Fills the correct table cell.
    - Removes that player from bucket lists.
  - After all pairings:
    - **Generate tee times** assigns 2 teams per tee time.
  - Each click of **Reveal next tee time slot**:
    - Reveals one team into the tee sheet.
    - Stops after 10 reveals.
- All state persists via Supabase:
  - Reloading the browser does not change existing assignments.
- Admin controls are only visible with a valid `?admin=<secret>` query param.

Once all of the above is working, the app is ready to be wired to the real domain and used for the live draw show.