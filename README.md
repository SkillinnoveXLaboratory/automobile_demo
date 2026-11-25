# AmpCare — Automotive Battery & Warranty App (Prototype)

A clickable, Android-style prototype of the **Automotive Battery & Warranty Management Platform**. It is built with React and Vite.
On desktop it renders inside an Android phone frame. On a real phone it runs full-screen like a native app.

## Demo logins

| Role | Login |
|---|---|
| Customer | Mobile `98765 43210`, OTP `1234` |
| Dealer | Dealer ID `DL-1024`, password `demo@123` |

Both roles share one demo database stored in the browser's localStorage, so a claim raised by the customer can be processed by the dealer.
To restore the sample data, go to Profile → Settings → **Reset demo data**.

## Modules covered

- **Customer:** OTP login and sign-up, digital warranty registration (3 steps plus scan), QR warranty card and PDF download, battery finder by vehicle fitment, inverter backup calculator, warranty claims with live tracking, loaner battery, dealer and service locator (call or directions), notifications, profile, vehicles and settings.
- **Dealer:** dashboard, serial or inventory registration, customer warranty registration, claim processing (review → test → approve/reject → complete), loaner issue, warranty verification, loyalty points leaderboard and redemption.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
```

## Deploy on Vercel

1. Push this folder to GitHub, or run `npx vercel` from inside it.
2. Use these settings: Framework **Vite**, Build `npm run build`, Output `dist`.
3. `vercel.json` already contains the SPA rewrite.

## QA

Before every demo, run the checklist in [skills.md](skills.md).

## Structure

```
src/
  data.js            demo catalogue, fitment map, dealers, seed data, helpers
  store.jsx          state (reducer + localStorage), navigation stack, toasts
  styles.css         design tokens + all component styles
  App.jsx            phone frame, routing, bottom nav, demo guide panel
  components/ui.jsx  StatusBar, AppBar, Button, Field, Select (bottom sheet), Chips, Tabs, Pill, QR, BatteryArt…
  screens/
    Auth.jsx         Welcome, Login, OTP, Sign up
    Customer.jsx     Home, Warranty list/card, Claims, New claim, Notifications, Profile
    Shared.jsx       Finder, Product, Inverter, Dealers, Register warranty, Claim tracking
    Dealer.jsx       Dealer home, Inventory, Add stock, Verify, Claims, Rewards, Profile
```
