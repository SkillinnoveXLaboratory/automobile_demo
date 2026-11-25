# skills.md — AmpCare Prototype QA & Cross-Check Skill

Use this file as a **repeatable review skill** before every client demo or Vercel deploy.
It can be followed by a person or handed to an AI assistant ("Run skills.md on this project").
Go section by section and tick each item. Anything that fails → fix → re-run the full list.

---

## 0. How to run the check

```bash
npm install
npm run build        # must finish with no errors or warnings about missing exports
npm run preview      # open http://localhost:4173
```

Check at three sizes:

| Size | How | What should happen |
|---|---|---|
| Desktop (≥ 961px) | normal browser | Android phone frame centered + demo guide panel on the left |
| Tablet (601–960px) | resize window | Phone frame only, guide panel hidden |
| Phone (≤ 600px) | DevTools → 390×844, or open on a real phone | Full-screen app, no fake frame, no fake status bar, no gesture bar |

Clear old data before each run: Profile → Settings → **Reset demo data** (or `localStorage.clear()`).

---

## 1. Design consistency (must match the reference style)

- [ ] Only one accent colour: crimson `--primary #E5194A`. Lavender is only for secondary cards (promo, leaderboard, demo note).
- [ ] No hard-coded colours outside `:root` tokens, except battery illustrations and gradients.
- [ ] Font is **Poppins** everywhere (check the Network tab: the font loads, with no fallback flash on titles).
- [ ] Compact type scale: page titles 23.5px/700, section titles 14.5px/600, body 12.5–13.5px, captions 10.5–11.5px. No other random sizes.
- [ ] Corner radii come from the scale only: 12 / 14 / 18 / 22px, pills 999px.
- [ ] Screen side padding is **24px** on every screen (`--gutter`). Nothing touches the phone edge.
- [ ] **Every logged-in header is red** (`--header-bg`): tab headers, the Home/Dealer greeting header, and back-button app bars. The status bar is red too, with no colour seam between them. Auth screens (Welcome/Login/OTP/Sign up) stay white.
- [ ] Header text and icons are white; header icon buttons use the translucent white style; the unread dot is yellow on red.
- [ ] The Home hero card is **white** and overlaps the bottom of the red header (never red on red).
- [ ] Profile follows the reference: curved double-wave red header, centred avatar with white ring and edit badge, name + subtitle + stat chips, icon menu rows (no cards), badges on the right, centred muted Logout.
- [ ] Cards use a 1px `--line` border (inset shadow), not mixed borders and drop shadows.
- [ ] Icons come from lucide-react only, at size 18–22 in lists and buttons, with consistent stroke.

## 2. Buttons & touch targets

- [ ] Primary buttons are **48px high**, full width, radius 14, crimson, white 15px/600 text.
- [ ] Secondary = light grey, Outline = crimson border, Danger = soft red. No other variants.
- [ ] Every tap target is ≥ 40×40px (icon buttons, chips 36px high plus spacing, qty steppers 32px plus gap).
- [ ] Two buttons side by side use `row-2` (equal grid) or the footer `1fr 1.4fr`. Never mismatched widths.
- [ ] Disabled buttons look disabled (45% opacity) and do nothing.
- [ ] Primary action sits in the **sticky footer** (`footer-actions`) on form/detail screens, not inside the scroll area.
- [ ] No button text wraps onto 2 lines at 390px width.

## 3. Alignment & spacing

- [ ] App bar: back button left, title centred, right slot balanced (spacer when empty), so the title is truly centred.
- [ ] List rows: icon (40px) → text (flex) → value/pill → chevron, all vertically centred.
- [ ] Long text (dealer names, vehicles, select values) **truncates with an ellipsis** instead of breaking the layout.
- [ ] Key-value rows: label left (muted), value right (ink), dashed divider, no divider after the last row.
- [ ] Bottom nav: 5 equal items, active item has crimson icon + soft pill background + bold label.
- [ ] Toasts appear at the **top** and never cover the sticky footer button.
- [ ] Bottom sheets cover the bottom nav, have a drag handle, title, close (X) button and close on backdrop tap.
- [ ] Content never hides behind the bottom nav or footer (check by scrolling to the very bottom of every screen).

## 4. Functional workflow checks (end-to-end)

### Customer (98765 43210 · OTP 1234)
- [ ] Welcome → Sign up → form validation (bad phone shows error) → OTP → Home.
- [ ] Welcome → Log in → Send OTP → OTP auto-fills → Verify → Home. A wrong OTP shows an error.
- [ ] Home hero shows the first **active** warranty, and the progress bar matches the remaining time.
- [ ] Register battery: Continue with empty fields shows errors → **Scan** fills serial and model → step 2 → step 3 summary → Generate → success screen with QR.
- [ ] A duplicate serial is rejected ("already registered").
- [ ] The new registration appears in the Warranty tab, Home count, and Profile stats.
- [ ] Warranty card: **PDF** opens a printable certificate (Save as PDF). **Share** uses the native share sheet or copies the text.
- [ ] An expired warranty shows the "Expired" pill and a **Find replacement** button (no Raise claim).
- [ ] Find battery: type → brand → model → fuel (each select is disabled until the previous one is chosen) → recommendation → product detail.
- [ ] Inverter calculator: changing quantities or hours updates load, VA, Ah and the recommendation live.
- [ ] Dealers: search by name, area or PIN filters the list; the "No dealers" empty state shows. **Call** = `tel:` link, **Directions** opens Google Maps.
- [ ] Raise claim: only active-warranty batteries without an open claim are listed → submit → claim screen with green banner.
- [ ] Notifications: unread dot on the bell, **Read all** clears it, and only customer notifications are listed.
- [ ] Profile menu: My Profile edits and saves name/email/city; My Vehicles → Add vehicle validates and saves; Settings toggles work; Logout returns to Welcome.

### Dealer (DL-1024 · demo@123)
- [ ] A wrong ID or password shows field errors.
- [ ] Dashboard counts match the Stock, Claims and Registrations data.
- [ ] Claims: open the claim the customer raised → Start review → Start testing → Record decision (Approve/Reject sheet) → Mark completed.
- [ ] Log back in as the customer: the claim timeline and status pill show the same stage, and the customer got a notification.
- [ ] Issue loaner battery appears on both dealer and customer claim screens.
- [ ] Add stock: Scan generates a serial; duplicate or invalid serials are rejected; the new item shows "In stock".
- [ ] Register a customer warranty with phone 9876543210 → +50 points, inventory item becomes "Sold", and the warranty shows in the customer app.
- [ ] Rewards: All-Time / This month switch re-ranks correctly; "You" is highlighted; Redeem is disabled when points are too low.
- [ ] Verify warranty by serial or certificate ID shows Valid/Expired or a "not found" banner.

## 5. Data mismatch checks

- [ ] Status labels are identical everywhere: claim pill (list) = claim pill (detail) = timeline stage = home card.
- [ ] Dates use one format: `25 Nov 2026` (`fmtDate`). No ISO strings visible in the UI.
- [ ] Phone numbers are shown as `+91 98765 43210` (`fmtPhone`).
- [ ] Prices are shown as `₹7,890` (`inr`). Warranty is in months (`48m` / `48-month`), consistently.
- [ ] Counts on Home/Profile/Dealer dashboard come from state and are never hard-coded.
- [ ] Customer never sees dealer-only data (points, inventory, dealer notifications), and vice versa.
- [ ] Product names, capacities and warranty periods match `src/data.js` on every screen.

## 6. Android-native feel

- [ ] Android-style status bar (time left, punch-hole centre, signal/wifi/battery right) and a gesture pill at the bottom (desktop frame only).
- [ ] Material-style bottom navigation with an active indicator pill.
- [ ] Screen push/back slide animations; tab switches fade (no slide).
- [ ] Back arrow and **Esc** key both go back. On step 2/3 of a form, the app-bar back arrow goes to the previous step, not out of the form.
- [ ] Bottom sheets are used for pickers instead of browser `<select>` dropdowns.
- [ ] There is no text selection highlight or blue tap flash on buttons.

## 7. Bad-looking things to hunt for

- [ ] Text overlapping, clipped, or touching card edges.
- [ ] Two different greys or reds that look "almost the same".
- [ ] Empty states without an icon and a helpful action.
- [ ] Huge empty gaps on short screens (forms should keep actions in the footer).
- [ ] Horizontal scrollbars anywhere (except intentional chip rows, which hide the scrollbar).
- [ ] Console errors or React key warnings in DevTools.
- [ ] Images or illustrations stretched or blurry.

## 8. Deploy check (Vercel)

- [ ] `npm run build` passes locally.
- [ ] `vercel.json` rewrites all routes to `/` (SPA).
- [ ] Framework preset **Vite**, build command `npm run build`, output dir `dist`, root dir = this folder.
- [ ] After deploy, open the URL on a real Android phone and re-run section 4 quickly.

---

### Issue log template

| # | Screen | Problem (design / function / mismatch) | Severity | Fixed? |
|---|---|---|---|---|
| 1 | | | High / Med / Low | ☐ |
