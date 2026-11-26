# AUTORYNX — The Complete Automotive Ecosystem (Prototype)

A clickable prototype of the AUTORYNX Android app plus its desktop website. It is built with React and Vite to match the client reference (`qa/reference.png`, 11 screens).
On desktop the app shows inside a phone frame, and a **Mobile App / Website** switch shows screen 11. On a real phone it opens full-screen.

## Demo login
- **Email:** `demo@autorynx.com` · **Password:** `demo@123`
- The login form is **pre-filled** with these credentials, so the client just taps **Login**. Clearing the fields and tapping Login also signs in to the demo account.

## Screens
Splash · Login / Sign Up / Forgot · Home Dashboard · Vehicle Selection · 3D Vehicle Anatomy · Exploded View · Part Details & Buy · Nut & Bolt · Installation Steps · Video Tutorial · Website Home. There are also Explore, Cart, Checkout, Order Placed, Orders and Profile screens in the same theme.

## Run
```bash
npm install
npm run dev        # http://localhost:5173  (add ?web to open the website view)
npm run build
```

## Deploy (Vercel)
Import the repo, choose Framework **Vite** (build `npm run build`, output `dist`). `vercel.json` already contains the SPA rewrite. The `qa/` folder is not part of the build.

## QA
Follow [skills.md](skills.md). `qa/compare.mjs` builds side-by-side reference/app images, `qa/functest.mjs` runs 70 functional checks, and `qa/mobile.mjs` checks 4 real phone sizes for cut-off content.

## Notes
- Photos in `public/assets/` are cropped from the client reference, **AI-upscaled 4× with two ESRGAN models** (clean + GAN detail, blended), then dehazed and sharpened and saved as high-quality WebP. For production, replace them with the client's original HD renders using the same file names (`.webp`).
- Brand logos are shown only as vehicle-compatibility references.
