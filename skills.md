# skills.md — AUTORYNX Reference-Match QA Skill

Goal: the prototype must look **≥ 95 % identical** to the client reference (`qa/reference.png`, 11 screens) and every feature must work without glitches.
Run this full skill before every client demo and every Vercel deploy. Repeat the loop until every box is ticked.

---

## 0. Setup (once)

```bash
npm install            # app
npm run build
npm run preview -- --port 4174        # keep running in a second terminal
cd qa && npm install                  # QA tools (puppeteer-core + sharp, not deployed)
```
If Chrome isn't at the default Windows path, set `CHROME=<path to chrome or msedge>`.

## 1. The loop (repeat until ≥ 95 %)

1. `cd qa && npm run compare` writes `qa/out/compare/s1-…png … s11-web.png`. Each image shows the **reference on the left and the app on the right** at the same size (390 × 768).
2. Open each image and score it with section 3. Write every difference in the issue log (section 7).
3. Fix in `src/styles.css` (spacing and colors) or the screen file (content). Prefer changing a token or measurement over adding new rules.
4. `npm run build`, run the compare again, and re-score.
5. When every screen is ≥ 95 %, run `npm run test` (section 4). It must show **70 passed, 0 failed, NO CONSOLE ERRORS**.

> Scoring rule per screen: start at 100. Subtract **5** for each wrong color or missing element, **3** for each element misplaced by more than 10 px, and **1** for each size or weight that looks off. A screen passes at ≥ 95.

## 2. Screen ↔ code map

| # | Reference screen | Code | Route / how to reach |
|---|---|---|---|
| 1 | Splash Screen | `screens/Auth.jsx › Splash` | app start |
| 2 | Login / Sign Up | `Auth.jsx › Login, Signup, Forgot` | Get Started |
| 3 | Home Dashboard | `screens/Home.jsx › Home` | after login |
| 4 | Vehicle Selection | `screens/Vehicle.jsx › VehicleSelect` | Two-Wheeler tile / Explore Now |
| 5 | 3D Vehicle Anatomy | `Vehicle.jsx › Anatomy` | Explore Anatomy |
| 6 | Exploded View | `Vehicle.jsx › Exploded` | Electrical → Headlamp, or headlamp hotspot (tap twice) |
| 7 | Part Details & Buy | `screens/Parts.jsx › PartDetails` | View Part / Recently Viewed |
| 8 | Nut & Bolt Information | `Parts.jsx › NutBolt` | Part → Nut & Bolt Details |
| 9 | Installation Steps | `Parts.jsx › Install` | Part → Installation Guide |
| 10 | Video Tutorial | `Parts.jsx › Video` | Part → Video Tutorial / Video tab |
| 11 | Website Home (Desktop) | `screens/Website.jsx` | "Website" switch (or `/?web`) |
| – | Explore, Cart, Checkout, Orders, Profile | `Home.jsx › Explore`, `screens/Shop.jsx` | bottom nav (not in the reference; must use the same theme) |

## 3. Visual checklist (compare against the reference)

### Theme tokens (sampled from the reference pixels; do not invent new colors)
- [ ] Navy backgrounds `#001329` / `#021B31` / tiles `#0D2843`; anatomy center glow `#2D3F58`.
- [ ] Orange gradient `#FF9A2E → #F7811F → #EE6F12` on **every** primary button, the active segment, the active bottom-nav tab and number badges.
- [ ] Light panels `#F1F3F5`, tiles white→`#EEF1F5`, borders `#D9DFE8`.
- [ ] Price red `#D42A2A`, in-stock / off-badge green `#1F9D3C`, note box peach `#FDF0E0`, website link blue `#1E6FD9`.
- [ ] Fonts: Open Sans for UI; logo wordmark in Montserrat 900 italic with **YN in orange**, plus ™.
- [ ] Status bar shows **10:24** with signal, wifi and battery (desktop frame only).

### Per screen (key measurements at 390 px width)
- [ ] **1 Splash**: logo centered (~108 px mark, 39 px wordmark), 2-line caps tagline, vehicles photo full width (~280 px tall), 4 feature icons with thin dividers, 4 dots (first white), "Get Started →" 252 × 48 orange pill.
- [ ] **2 Login**: logo, "Welcome Back" 27 px bold, 2 light fields (52 px, radius 13, icons), Remember me with white checkbox + underlined Forgot Password, full-width Login, "or continue with" lines, 3 white 56 px social circles, orange underlined Sign Up. Light streaks at top-right (blue) and right-middle (orange) only.
- [ ] **3 Home**: logo + cart with red badge, white search bar, 4 dark vehicle tiles (orange bike, white car, white truck, green EV), banner with border and engine image and orange "Explore Now →", 4 × 2 light service tiles (Marketplace and Offers orange, Fitment green, Support blue), Shop by Category (4 photo tiles), white bottom nav with an **orange filled Home block**.
- [ ] **4 Vehicle Selection**: back + title, segmented control (Two-Wheeler orange), light card with 3 selects (Hero logo + **bold 23 px "Hero"**, bike thumbnail + Splendor Plus, **BS6** (2019 – Present)), large bike photo with no visible box edges, orange "Explore Anatomy →".
- [ ] **5 Anatomy**: title "Hero Splendor Plus (BS6)" + "3D Anatomy" in light blue, bike with blue hotspots and the **360° ring fully visible**, 4 outline pills (Rotate/Zoom/Pan/AR), "Major Systems" + 3 × 2 light tiles.
- [ ] **6 Exploded**: centered 2-line title, full-screen icon, exploded photo with orange numbers, white list of 6 rows with orange number circles.
- [ ] **7 Part Details**: navy header, white panel with 18 px top radius, image left + info right, ★ 4.7 (325 Reviews), **₹ 849.00** red, MRP struck through, green **10% OFF**, ✓ In Stock, qty stepper, orange Add to Cart, white Buy Now with red text and red ⚡, 3 perks with dividers, 3 accordion rows.
- [ ] **8 Nut & Bolt**: headlamp + 2-line title, 5-column table (S.No / Fastener / Size / Qty / Torque), 5 fastener tiles, peach Note box with 3 bullets.
- [ ] **9 Install**: Step by Step (light orange) / Video tabs, 5 steps with orange circles on an orange vertical line, photos on the right, thin separators.
- [ ] **10 Video**: player with title badges, red progress bar, controls (play, 0:00 / 6:21, CC, gear, full screen), "Popular Videos" + 4 rows (thumbnail, bold title, duration).
- [ ] **11 Website**: navy nav (logo, 6 links, user icon), wide search with orange button, cart badge 3, Login / Sign Up, hero "Explore Every Part in Interactive 3D" + orange "Select Your Vehicle →", car and bike visual on the right, 6-feature white strip, Popular Brands row (10 logos) + blue "View All →".

### Graphics rules
- [ ] Image pipeline (if re-cropping): native 1× crop from `qa/reference.png` (no phone-border pixels) → two AI upscales ×4 (ESRGAN-thick for clean structure + ESRGAN GANs for detail) → blend 60 % GAN for photos / clean-only for icons smaller than 40 px → dehaze (CLAHE local contrast, black-point lift) + two-radius sharpen → WebP q93. Tiny icons must not look speckled.
- [ ] Every logo SVG uses its own gradient id (`useId`). A shared id makes the orange gear vanish on phones.
- [ ] Photos come only from `public/assets/*.webp` (cropped from the client reference and **AI-upscaled 4× with ESRGAN**). They must look crisp with no haze, blocky edges or halos at 2× zoom. No stretched or distorted image (check `object-fit`).
- [ ] No visible rectangle around a photo on a light or dark card (use the edge masks already in CSS).
- [ ] Icons are line icons at a consistent stroke; colored icons only where the reference colors them.

### Deliberate fixes of reference typos (keep them fixed)
- "Populad Videos" → **Popular Videos**
- Note bullet "(if (if required)." → **(if required).**
- Fastener table row 4 S.No "3" → **4** (duplicate number)

## 4. Functional checklist (`cd qa && npm run test` automates all of it)

- [ ] Splash dots and swipe change slides; Get Started → Login.
- [ ] Login: fields are **pre-filled** with demo@autorynx.com / demo@123 and Login works in one tap (an empty form also logs in to the demo account); wrong email or password shows field errors; eye toggles; Forgot Password sends a link; Sign Up validates and creates the account; social buttons log in.
- [ ] Home: every tile does something. Two/Four-Wheeler → Vehicle Select; Commercial/EV → "coming soon"; Parts Catalogue → Explore; Service & Repair → Install; Installation Videos → Video; OEM Manuals / Marketplace / Offers / Support open sheets; categories open Explore filtered; search bar → Explore.
- [ ] Vehicle Select: brand / model / variant sheets work; models that aren't 3D-ready show "3D Model Coming Soon" (no broken screen); Four-Wheeler tab switches brands and image.
- [ ] Anatomy: drag rotates, Rotate animates, Zoom scales, Pan moves, AR toast; hotspots show a label and a second tap opens a part or the exploded view; Major Systems open parts sheets.
- [ ] Exploded: row ↔ marker highlight both ways; parts 4 and 5 show a ghost marker; full screen opens and closes; bottom bar adds to cart and opens Part.
- [ ] Part: qty 1–10, Add to Cart updates the badge, Buy Now → Checkout → Place Order → Order Placed → Orders list.
- [ ] Install: steps toggle done; Video tab switches. Video: play/pause, time moves, seek, CC, speed sheet, full screen, playlist switching.
- [ ] Cart: qty changes the total, remove works, free delivery ≥ ₹499, checkout empties the cart.
- [ ] Profile: My Garage → Vehicle Select; Reset Demo Data; Logout → Login.
- [ ] Website: search / Select Your Vehicle / features / brands open the right app screen; AI Part Search accepts an image; toasts are visible on the website.
- [ ] Real phone (≤ 600 px): full screen, no fake frame or status bar, no horizontal scroll.
- [ ] **Phone sizes** (`cd qa && node mobile.mjs out/mobile`). It checks 360×640, 375×667, 390×700 and 412×780 and must print **ALL MOBILE CHECKS OK**:
  - Splash **Get Started visible without scrolling** (the vehicle photo shrinks on short screens); the logo's orange gear renders; no floating Website button over the app.
  - Login button visible on first view; Home bottom nav visible; every other screen's lower content reachable by scrolling.
  - Open `out/mobile/360x640-splash.png` and confirm nothing is cut at the bottom.

## 5. Glitch hunt (manual, 2 minutes)
- [ ] Rapidly tap back / forward: no blank page, no double animation.
- [ ] Open a sheet and press Esc or tap the backdrop: it closes; Esc elsewhere = back.
- [ ] No text overflowing a pill, button or card at 390 px width.
- [ ] Toasts never hide a primary button for more than 2 s.
- [ ] Refreshing the page keeps the login, cart, orders and vehicle (localStorage).

## 6. Deploy check
- [ ] `npm run build` passes; `vercel.json` SPA rewrite present; Vercel framework **Vite**, output `dist`.
- [ ] After deploy, open the live URL on a real Android phone and repeat section 4 quickly.

## 7. Issue log

| # | Screen | Difference / bug | Score impact | Fixed? |
|---|---|---|---|---|
| 1 | | | | ☐ |

### Last run (this build)
| Screen | Score | Notes |
|---|---|---|
| 1 Splash | 97 | Logo is a vector rebuild (sharper than the reference raster) |
| 2 Login | 96 | Light streaks approximated with CSS |
| 3 Home | 96 | Vehicle-type icons are line icons (reference: filled illustrations) |
| 4 Vehicle Select | 95 | Photo upscaled from the reference (soft) |
| 5 Anatomy | 96 | Extra blue hotspot on the headlamp (needed for the exploded-view flow) |
| 6 Exploded | 97 | – |
| 7 Part Details | 97 | – |
| 8 Nut & Bolt | 97 | Reference typos corrected |
| 9 Install | 97 | – |
| 10 Video | 97 | "Popular" typo corrected |
| 11 Website | 95 | Browser chrome is a generic bar |
| Functional | 70 / 70 | 0 console errors |
