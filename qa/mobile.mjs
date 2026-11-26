// Real-phone viewport check: screenshots key screens at common phone sizes and flags cut-off content.
// Usage (from qa/): node mobile.mjs out/mobile   (app served at BASE, default http://localhost:4174/)
import puppeteer from 'puppeteer-core'
import fs from 'fs'
const OUT = process.argv[2] || 'out/mobile'
fs.mkdirSync(OUT, { recursive: true })
const BASE = process.env.BASE || 'http://localhost:4174/'
const SIZES = [[360, 640], [375, 667], [390, 700], [412, 780]]
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
let problems = 0
for (const [w, h] of SIZES) {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'networkidle0' }); await wait(500)
  const click = (sel, text) => page.evaluate((sel, text) => { const el = [...document.querySelectorAll(sel)].find((e) => !text || e.innerText.includes(text)); el?.click(); return !!el }, sel, text).then(() => wait(450))
  // Is an element fully reachable: visible in viewport, or reachable by scrolling its scroll container?
  // mustSee = element must be fully visible on first paint (no scrolling allowed).
  // Otherwise it must be visible, or inside an ancestor the USER can scroll (overflow-y auto/scroll).
  const reachable = (sel, mustSee = false) => page.evaluate((sel, mustSee) => {
    const el = document.querySelector(sel); if (!el) return 'missing'
    const r = el.getBoundingClientRect()
    const inView = r.bottom <= window.innerHeight + 1 && r.top >= -1
    if (inView) return 'ok'
    if (mustSee) return `cut on first view (bottom ${Math.round(r.bottom)} > ${window.innerHeight})`
    for (let p = el.parentElement; p; p = p.parentElement) {
      const oy = getComputedStyle(p).overflowY
      if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight) return 'ok'
    }
    return `cut and not scrollable (bottom ${Math.round(r.bottom)} > ${window.innerHeight})`
  }, sel, mustSee)
  const checks = []
  const shot = async (name) => { await wait(250); await page.screenshot({ path: `${OUT}/${w}x${h}-${name}.png` }) }
  await shot('splash'); checks.push(['splash Get Started visible', await reachable('.splash-cta', true)])
  checks.push(['logo orange gear renders', await page.evaluate(() => { const svg = document.querySelector('.splash-logo svg'); const rect = svg?.querySelector('rect'); if (!rect) return 'missing'; const id = rect.getAttribute('fill').match(/#([^)]+)/)[1]; const g = document.getElementById(id); return g && g.closest('svg') === svg ? 'ok' : 'gradient not in same svg' })])
  checks.push(['no floating switch over app', await page.evaluate(() => { const b = document.querySelector('.m-switch'); return !b || getComputedStyle(b).display === 'none' ? 'ok' : 'visible' })])
  await click('.splash-cta'); await shot('login'); checks.push(['login button visible', await reachable('.auth-content > .btn-orange', true)]); checks.push(['login Sign Up link', await reachable('.auth-foot')])
  await click('.btn-orange', 'Login'); await wait(700); await shot('home'); checks.push(['home bottom nav visible', await reachable('.bottom-nav', true)])
  await click('.vtype', 'Two-Wheeler'); await shot('vehicle'); checks.push(['vehicle Explore button', await reachable('.vs-card .btn-orange')])
  await click('.btn-orange', 'Explore Anatomy'); await shot('anatomy'); checks.push(['anatomy systems', await reachable('.sys-grid')])
  await click('.sys', 'Electrical'); await click('.sheet-row', 'Headlamp'); await shot('exploded'); checks.push(['exploded list', await reachable('.exp-list')])
  await click('.exp-row', 'Lens'); await click('.exp-bar .btn-orange'); await shot('part'); checks.push(['part accordions', await reachable('.acc')])
  await page.evaluate(() => { const c = [...document.querySelectorAll('.content')].pop(); if (c) c.scrollTop = 0 })
  await click('.acc-row', 'Video'); await shot('video'); checks.push(['video list', await reachable('.pv-list')])
  const hscroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  checks.push(['no horizontal scroll', hscroll ? 'HSCROLL' : 'ok'])
  for (const [n, r] of checks) { if (r !== 'ok') problems++; console.log(`${w}x${h}  ${r === 'ok' ? 'OK  ' : 'FAIL'} ${n}${r === 'ok' ? '' : ' → ' + r}`) }
  await page.close()
}
console.log(problems ? `${problems} problem(s)` : 'ALL MOBILE CHECKS OK')
await browser.close()
