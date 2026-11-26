// Screenshots each AUTORYNX screen and builds side-by-side comparisons with the client reference.
// Usage (from qa/): npm install && node compare.mjs out-folder   — app must be served (npm run preview -- --port 4174)
// Env: BASE=http://localhost:4174/  CHROME=<path to chrome/edge>
import puppeteer from 'puppeteer-core'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import fs from 'fs'

const OUT = process.argv[2] || 'cmp'
fs.mkdirSync(OUT, { recursive: true })
const REF = fileURLToPath(new URL('./reference.png', import.meta.url))
const boxes = {
  s1: [3, 3, 166, 327], s2: [174, 3, 166, 327], s3: [345, 3, 166, 327], s4: [515, 3, 166, 327], s5: [685, 3, 166, 327], s6: [856, 3, 162, 327],
  s7: [3, 360, 148, 298], s8: [155, 360, 155, 298], s9: [315, 360, 155, 298], s10: [473, 360, 158, 298], s11: [636, 358, 382, 300],
}
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const click = async (sel, text) => {
  const ok = await page.evaluate((sel, text) => {
    const els = [...document.querySelectorAll(sel)]
    const el = text ? els.find((e) => e.innerText.trim().replace(/\s+/g, ' ').includes(text)) : els[0]
    if (!el) return false
    el.click(); return true
  }, sel, text)
  if (!ok) errors.push(`CLICK FAIL ${sel} ${text || ''}`)
  await wait(450)
}
async function snap(name, refKey) {
  await wait(350)
  const el = await page.$('.device-inner')
  const mine = await el.screenshot()
  const W = 390, H = 768
  const m = await sharp(mine).resize(W, H, { fit: 'cover', position: 'top' }).png().toBuffer()
  const [l, t, w, h] = boxes[refKey]
  const r = await sharp(REF).extract({ left: l, top: t, width: w, height: h }).resize(W, H, { fit: 'fill', kernel: 'lanczos3' }).png().toBuffer()
  await sharp({ create: { width: W * 2 + 20, height: H, channels: 3, background: '#ffffff' } })
    .composite([{ input: r, left: 0, top: 0 }, { input: m, left: W + 20, top: 0 }]).png().toFile(`${OUT}/${refKey}-${name}.png`)
}

await page.goto('' + (process.env.BASE || 'http://localhost:4174/') + '', { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })
await wait(800)
await snap('splash', 's1')
await click('.splash-cta')
await snap('login', 's2')
await click('.btn-orange', 'Login')
await wait(900)
await snap('home', 's3')
await click('.vtype', 'Two-Wheeler')
await snap('vehicle', 's4')
await click('.btn-orange', 'Explore Anatomy')
await snap('anatomy', 's5')
await click('.sys', 'Electrical')
await click('.sheet-row', 'Headlamp')
await snap('exploded', 's6')
await click('.exp-row', 'Lens')
await click('.exp-bar .btn-orange')
await snap('part', 's7')
await click('.acc-row', 'Nut')
await snap('bolts', 's8')
await click('.back-btn')
await click('.acc-row', 'Installation')
await snap('install', 's9')
await click('.back-btn')
await click('.acc-row', 'Video')
await snap('video', 's10')

// website
await click('.guide-switch button', 'Website')
await wait(500)
const web = await page.$('.web')
const wb = await web.screenshot()
const [l, t, w, h] = boxes.s11
const WW = 1100, WH = Math.round(WW * h / w)
const r = await sharp(REF).extract({ left: l, top: t, width: w, height: h }).resize(WW, WH, { kernel: 'lanczos3' }).png().toBuffer()
const m = await sharp(wb).resize(WW, null).png().toBuffer()
const mh = (await sharp(m).metadata()).height
await sharp({ create: { width: WW, height: WH + mh + 20, channels: 3, background: '#ffffff' } })
  .composite([{ input: r, left: 0, top: 0 }, { input: m, left: 0, top: WH + 20 }]).png().toFile(`${OUT}/s11-web.png`)

console.log(errors.length ? errors.join('\n') : 'NO ERRORS')
await browser.close()
