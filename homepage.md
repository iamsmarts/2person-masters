# QGC Masters – Home Page Content & Layout Spec

---

## 1. UI Layout & Component Recommendations

### 1.1 Overall Layout

- Use a centered column layout:
  - `max-w-4xl mx-auto px-4 py-10`
- Vertical spacing between sections:
  - Use consistent spacing (e.g., `space-y-10` between major sections).
- Background:
  - Light neutral body background (e.g., `bg-slate-50`) with white cards (`bg-white`) and soft borders/shadows.

---

### 1.2 Hero Section

**Goal:** Quickly tell visitors what this event is, when/where it is, and give them a “this is official” vibe.

**UI:**

- Full-width hero with green background (QGC / Masters vibe).
- Centered content, stacked vertically:
  - Tournament name (large)
  - Subtitle (format)
  - Date + Course
  - Optional small “Presented by Quasar Golf Club” line
- Primary CTA row (under the text):
  - Button: “Event Overview” (scrolls down)
  - Secondary button (if desired): “Watch Live Draw” → `/pairing-draw` (can be disabled until showtime).

---

### 1.3 Event Overview Section

**Goal:** Give a concise, skimmable explanation of the event.

**UI:**

- Single card with:
  - Section title: “Event Overview”
  - 2–3 short paragraphs
  - A simple 2-column “Quick Facts” list for:
    - Format
    - Teams
    - Field size
    - Course
    - Date

---

### 1.4 Player Tiers Section (with Collapsibles)

**Goal:** Show how tiers work and who’s in each tier without overwhelming the page.

**UI:**

- Section title: “Player Tiers”
- Short intro sentence.
- Four collapsible panels / accordions inside a card:

  1. **Tier 1 – Top Tier**
     - Contains: Adam, Alonso
  2. **Tier 2 – Group A (Balanced A)**
     - Contains: Cisco, Will, Manny, Rudy, Jessy, Ericka, Jaime, Memo
  3. **Tier 2 – Group B (Balanced B)**
     - Contains: Richie, Che, Jose, Xilos, Herb, Jorge, Dereck, Tony
  4. **Tier 3 – Bonus Strokes Crew**
     - Alternative label ideas if you want to test:
       - “Tier 3 – Net Boost”
       - “Tier 3 – Bonus Tier”
     - Contains: Jeffery, Kevin

- Each accordion header:
  - Tier label on the left
  - Short one-line description on the right (subtle text).

---

### 1.5 Rules & Format Section

**Goal:** Put all need-to-know rules in one place, but grouped logically.

**UI:**

- Section title: “Rules & Format”
- Subsections within a single card (or use subcards):

  1. **How Scoring Works**
  2. **Teeing Off & Order of Play**
  3. **Penalties & Drops**
  4. **On the Green**
  5. **Scorekeeping**
  6. **Pace of Play**
  7. **Contest Holes**

- On desktop, you can use a 2-column layout for these subsections; on mobile they stack.

---

### 1.6 Teams Section

**Goal:** Before draw → explain; after draw → show pairings.

**UI:**

- Section title: “Teams”
- Before draw:
  - Single card with centered text explaining that teams will be drawn live during the show.
- After draw:
  - Replace the placeholder card with a table:
    - Columns: Team #, Player 1, Player 2, Tier pairing (e.g., “Tier 1 + Tier 3” or “Tier 2A + Tier 2B”).
  - Pull from the same data source as the draw app.

---

### 1.7 Tee Times Section

**Goal:** Provide a clear schedule once tee times are generated.

**UI:**

- Section title: “Tee Times”
- Before draw:
  - Card with placeholder text explaining tee times are revealed after the draw.
- After draw:
  - Table:
    - Columns: Time, Group #, Team, Notes (optional).
  - Sorted by tee time ascending.

---

### 1.8 Sponsors Section

**Goal:** Give a home to sponsor messaging now and later.

**UI:**

- Section title: “Sponsors”
- Card with:
  - Short line about sponsor info coming soon (for now).
  - Space reserved for future sponsor logos and descriptions.
- Optional subtle gradient or border to visually separate it from the rest of the content.

---

### 1.9 Footer

**Goal:** Provide navigation back to QGC + social/community touchpoints.

**UI:**

- Simple footer bar:
  - Links:
    - “Quasar Golf Club”
    - “Instagram”
    - “Discord”
    - “Contact”
- Small font, muted color, centered.

---

### 1.10 Optional Additional Pages (Future)

Not required now, but easy to plug into nav later:

- `/rules` – Full rules page (if the card gets too long).
- `/results` – Event recap and leaderboard after the tournament.
- `/gallery` – Photos and highlights.

---

## 2. Copy by Section

You can drop this directly into components and tweak tone as needed.

---

### 2.1 Hero

**Title:**
`Quasar GC Masters`

**Subtitle:**
`2-Person Combined Stroke Play Tournament`

**Body Lines:**

- `January 2nd, 2026 • Diamond Bar Golf Course`
- `20 players, 10 teams, one Masters champion.`

**Buttons (optional labels):**

- Primary: `View Event Details`
- Secondary: `Watch Live Draw`

---

### 2.2 Event Overview

**Section Title:**
`Event Overview`

**Body Copy:**

> The Quasar GC Masters is a 2-person combined stroke play tournament at Diamond Bar Golf Course on January 2nd, 2026.
>
> We’ve got 20 players split into skill-based tiers. Once the live draw starts, we’ll pair everyone into 10 teams and send them out over 5 tee times. Every stroke counts, and the team with the lowest combined score at the end of the round takes the title.
>
> Teams are formed using a tiered random draw:
> – Tier 1 players are paired with Tier 3 players
> – Tier 2 Group A players are paired with Tier 2 Group B players

**Quick Facts (example labels):**

- `Format: 2-Person Combined Stroke Play`
- `Field: 20 Players (10 Teams)`
- `Course: Diamond Bar GC`
- `Date: January 2nd, 2026`
- `Pairings: Live random draw using Wheel of Names`

---

### 2.3 Player Tiers

**Section Title:**
`Player Tiers`

**Intro Copy:**

> To keep things competitive and fun, everyone is placed into one of four tiers based on current form and general chaos factor. Teams are created by pairing players across tiers, so every group has a mix of firepower and vibes.

#### Accordion 1 – Tier 1

**Header Label:**
`Tier 1 – Top Tier`

**Header Subline:**
`Our current top two players.`

**Body Copy:**

> **Players:** Adam, Alonso
>
> These are the heavy hitters. Tier 1 players are paired with Tier 3 players to balance out the field while still rewarding good play.

---

#### Accordion 2 – Tier 2 Group A

**Header Label:**
`Tier 2 – Group A (Balanced A)`

**Header Subline:**
`Solid games, trending up.`

**Body Copy:**

> **Players:** Cisco, Will, Manny, Rudy, Jessy, Ericka, Jaime, Memo
>
> Tier 2 Group A players are part of the middle pack with steady games and a mix of experience. During the draw, each Group A player will be paired with someone from Group B.

---

#### Accordion 3 – Tier 2 Group B

**Header Label:**
`Tier 2 – Group B (Balanced B)`

**Header Subline:**
`Wildcard energy with scoring potential.`

**Body Copy:**

> **Players:** Richie, Che, Jose, Xilos, Herb, Jorge, Dereck, Tony
>
> Group B brings the creativity, volatility, and occasional heaters. These players are paired with Group A to create balanced, unpredictable teams.

---

#### Accordion 4 – Tier 3

**Header Label:**
`Tier 3 – Bonus Strokes Crew`

**Header Subline:**
`Getting a little help on the card.`

**Body Copy:**

> **Players:** Jeffery, Kevin
>
> Tier 3 players get a 6-stroke bonus applied at the end of the round. They still play their own ball all day — the bonus just levels things out and keeps every team in the hunt.

*(If you’d rather change the label later, you can swap “Bonus Strokes Crew” for “Net Boost” or “Bonus Tier” without changing the copy.)*

---

### 2.4 Rules & Format

**Section Title:**
`Rules & Format`

#### Subsection: How Scoring Works

> This is a 2-person combined stroke play event.
>
> – Each player plays their own ball for the entire round.
> – Every stroke counts toward your individual score.
> – Your team score for the round is the sum of both players’ total strokes.
> – Tier 3 players receive a 6-stroke bonus that is applied at the end of the round.
> – The team with the lowest adjusted combined score wins the Quasar GC Masters.

---

#### Subsection: Teeing Off & Order of Play

> – Players tee off from their assigned tee times and groupings.
> – Men play from the white tees. Women may play from the red tees.
> – On the first tee, the group can decide the order.
> – After tee shots, the player farthest from the hole plays first.
> – Use ready golf whenever it’s safe to keep things moving.

---

#### Subsection: Penalties & Drops

> **Lost Ball / Out of Bounds**
> – You have up to 3 minutes to search for your ball.
> – If the ball is lost or out of bounds, take stroke-and-distance:
>   – Add 1 penalty stroke.
>   – Replay from the spot of your previous stroke.
>
> **Penalty Areas (Hazards)**
> – Marked by yellow or red stakes/lines.
> – Yellow penalty areas: replay from the previous spot, or drop behind the hazard keeping the point of entry between you and the flag.
> – Red penalty areas: same options as yellow, plus lateral relief within two club lengths from where the ball last crossed the margin (no closer to the hole).
>
> **Unplayable Lies**
> – You can declare your ball unplayable anywhere except in a penalty area.
> – Add 1 penalty stroke, then choose:
>   – Replay from the previous spot, or
>   – Drop within two club lengths no closer to the hole, or
>   – Drop back on a line from the flag through where the ball lies.

*(You can tighten or loosen this depending on how rules-intense you want to be.)*

---

#### Subsection: On the Green

> – Mark and lift your ball as needed to avoid other players’ lines.
> – Repair your ball marks and any you see nearby.
> – If you accidentally move your ball on the green while marking or aligning, just replace it with no penalty in most casual situations.
> – You may putt with the flagstick in or out.
> – All putts must be holed out — no gimmies for this event.

---

#### Subsection: Scorekeeping

> – Each team is responsible for keeping their own card and acting as a marker for one other team.
> – At the end of the round, compare cards and confirm hole-by-hole.
> – Once scores are agreed on, sign the card and turn in **one official scorecard per team**.
> – If there’s a mistake:
>   – A higher score than what was actually shot must stand.
>   – A lower score than what was actually shot results in disqualification.

---

#### Subsection: Pace of Play

> – Keep up with the group in front of you, not just the group behind you.
> – Limit ball searches to 3 minutes.
> – Play ready golf whenever it’s safe to do so.
> – **Maximum score** is double par on any hole. Once you’ve reached double par, pick up and move on to keep the group on pace.

---

#### Subsection: Contest Holes

> We’ll have fun side games running during the round:
>
> **Longest Drive (hole TBD)**
> – Drive must finish in the fairway to qualify.
> – Balls ending in rough, bunkers, or penalty areas do not count.
>
> **Closest to the Pin (hole TBD)**
> – Tee shot must finish on the green to qualify.
> – Balls on the fringe or in the rough do not count.

---

### 2.5 Teams

**Section Title:**
`Teams`

**Before Draw Copy:**

> Teams will be drawn live during the Quasar GC Masters Draw Show.
>
> Once the draw is complete, this section will update with all 10 teams and their tier pairings.

**After Draw Copy (table header labels):**

- `Team`
- `Player 1`
- `Player 2`
- `Tier Pairing`

*(The table rows are generated from your Supabase data.)*

---

### 2.6 Tee Times

**Section Title:**
`Tee Times`

**Before Draw Copy:**

> Tee times will be assigned and revealed after the live draw.
>
> Check back here after the show for your exact group and start time.

**After Draw Copy (table header labels):**

- `Time`
- `Group`
- `Team`
- `Notes` (optional, e.g., “First group out”, “Final group”)

---

### 2.7 Sponsors

**Section Title:**
`Sponsors`

**Initial Copy:**

> Sponsor information for the Quasar GC Masters is coming soon.
>
> If you’re interested in supporting future QGC events, reach out to the committee and we’ll share available packages and opportunities.

*(Later you can swap this for logos + short blurbs per sponsor.)*

---

### 2.8 Footer

**Footer Copy (example):**

> `© 2026 Quasar Golf Club • All rights reserved.`

**Footer Links (labels):**

- `Quasar Golf Club`
- `Instagram`
- `Discord`
- `Contact`

---

# QGC Masters — Homepage Color Guide
*Inspired by the provided palette screenshot*

This guide gives you a clean, reusable color system for the homepage that matches the tones in your image: soft neutrals, warm golds, and a deep navy anchor. You can drop these into Tailwind (custom theme) or use them as CSS variables.

---

## 🎨 Core Palette

| Role | Color | Hex | Notes |
|------|-------|------|-------|
| **Primary Light** | ![#D9DFE4](https://via.placeholder.com/20/D9DFE4/000000?text=+) | `#D9DFE4` | Soft cool gray/blue. Great for subtle backgrounds. |
| **Primary Gold** | ![#E8C732](https://via.placeholder.com/20/E8C732/000000?text=+) | `#E8C732` | Bright “Galaxy yellow.” Ideal for accents + tier badges. |
| **Secondary Gold** | ![#D38C22](https://via.placeholder.com/20/D38C22/000000?text=+) | `#D38C22` | Rich warm orange-gold for hover states, borders, or highlight text. |
| **Warm Neutral** | ![#F4E9C9](https://via.placeholder.com/20/F4E9C9/000000?text=+) | `#F4E9C9` | Warm sandy cream. Perfect card backgrounds. |
| **Deep Navy** | ![#1D3661](https://via.placeholder.com/20/1D3661/FFFFFF?text=+) | `#1D3661` | Strong anchor color—headings, nav, buttons, emphasis. |

---

## 🌤️ Recommended Usage for Homepage

### **Page Background**
- `#F4E9C9` (Warm Neutral)
Creates a clean, soft, almost parchment-like base. Matches the palette perfectly.

### **Section Cards**
- Background: white `#FFFFFF` or `#FDFBF6` (near-white warm)
- Border: `#D9DFE4` Primary Light
- Shadow: subtle slate (`shadow-sm`, not heavy)

### **Hero Banner**
- Background: **Deep Navy** `#1D3661`
- Text: white
- Accent underline / divider: `#E8C732` Primary Gold

### **Tier Badges**
- Tier 1 → `#E8C732` (bright gold)
- Tier 2 Group A → `#D9DFE4` (cool light gray-blue)
- Tier 2 Group B → `#F4E9C9` (warm neutral)
- Tier 3 → `#D38C22` (warm gold-orange)

### **Buttons**
**Primary Button (Call to Action)**
- Background: `#1D3661` deep navy
- Text: white
- Hover: `#D38C22` (secondary gold)

**Secondary Button**
- Outline: deep navy
- Text: deep navy
- Hover background: `#E8C732` (bright gold)

---

## ✨ Supporting Neutrals

These help tie the palette together:

| Name | Hex | Use |
|------|------|------|
| **Soft Off-White** | `#FCFAF4` | Use sparingly for section dividers or lighter card backgrounds. |
| **Muted Gray Text** | `#6A747D` | Subheadings, rules descriptions, body copy. |
| **Slate Divider** | `#CBD2D8` | Thin horizontal rules between sections. |

---

## 🖌️ Example CSS Variables

```css
:root {
  --qgc-light: #D9DFE4;
  --qgc-gold: #E8C732;
  --qgc-gold-dark: #D38C22;
  --qgc-neutral: #F4E9C9;
  --qgc-navy: #1D3661;

  --qgc-text-main: #1A1A1A;
  --qgc-text-muted: #6A747D;
  --qgc-background: #F4E9C9;
}