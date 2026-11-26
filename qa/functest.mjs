// Functional end-to-end test of the AUTORYNX prototype. Prints PASS/FAIL per check.
import puppeteer from 'puppeteer-core'
import fs from 'fs'
const OUT = process.argv[2] || 'ft'
fs.mkdirSync(OUT, { recursive: true })
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1400, height: 900 })
const errors = []
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
let pass = 0, fail = 0
const check = (name, ok) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + name) }
const click = async (sel, text) => {
  const ok = await page.evaluate((sel, text) => {
    const els = [...document.querySelectorAll(sel)]
    const el = text ? els.find((e) => (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').includes(text)) : els[0]
    if (!el) return false
    el.click(); return true
  }, sel, text)
  if (!ok) errors.push(`CLICK FAIL ${sel} ${text || ''}`)
  await wait(420)
  return ok
}
const has = (sel, text) => page.evaluate((sel, text) => [...document.querySelectorAll(sel)].some((e) => !text || e.innerText.includes(text)), sel, text)
const txt = (sel) => page.evaluate((sel) => document.querySelector(sel)?.innerText || '', sel)
const type = async (sel, value, idx = 0) => {
  await page.evaluate((sel, idx) => { const el = document.querySelectorAll(sel)[idx]; el.focus(); el.select?.() }, sel, idx)
  const el = (await page.$$(sel))[idx]
  await el.click({ clickCount: 3 }); await page.keyboard.press('Backspace'); await el.type(value); await wait(150)
}
const toast = () => txt('.toast')

await page.goto('' + (process.env.BASE || 'http://localhost:4174/') + '', { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' }); await wait(600)

// Splash
check('splash shows 4 dots', (await page.$$('.dot')).length === 4)
await click('.dot', ''); await page.evaluate(() => document.querySelectorAll('.dot')[2].click()); await wait(200)
check('dot click changes slide', await page.evaluate(() => document.querySelectorAll('.dot')[2].classList.contains('is-on')))
await click('.splash-cta')
check('Get Started opens login', await has('.auth-title', 'Welcome Back'))

// Login validation
await type('.auth-field input', 'wrong@x.com', 0); await type('.auth-field input', 'abc', 1)
await click('.btn-orange', 'Login')
check('unknown account shows error', await has('.auth-err', 'Account not found'))
await type('.auth-field input', 'demo@autorynx.com', 0); await type('.auth-field input', 'bad', 1)
await click('.btn-orange', 'Login')
check('wrong password shows error', await has('.auth-err', 'Incorrect password'))
await click('.eye'); check('eye toggles password visibility', await page.evaluate(() => document.querySelectorAll('.auth-field input')[1].type === 'text'))
await click('.link-u', 'Forgot')
check('forgot password screen', await has('.auth-title', 'Reset Password'))
await type('.auth-field input', 'demo@autorynx.com'); await click('.btn-orange', 'Send')
check('reset link sent state', await has('.sent-box', 'reset link'))
await click('.link-o', 'Back to Login')
await click('.link-o', 'Sign Up')
check('sign up screen', await has('.auth-title', 'Create Account'))
await click('.btn-orange', 'Sign Up')
check('sign up validation', await has('.auth-err', 'full name'))
await click('.link-o', 'Login')
await type('.auth-field input', 'demo@autorynx.com', 0); await type('.auth-field input', 'demo@123', 1)
await click('.btn-orange', 'Login'); await wait(700)
check('valid login reaches home', await has('.search-bar', 'Search parts'))
check('cart badge shows 3', (await txt('.cart-badge')) === '3')

// Home interactions
await click('.vtype', 'Commercial'); check('commercial coming-soon toast', (await toast()).includes('Commercial'))
await click('.svc', 'OEM'); check('OEM manuals sheet', await has('.sheet-head', 'OEM Manuals'))
await click('.sheet-row', 'Owner'); check('manual download toast', (await toast()).includes('downloaded'))
await click('.svc', 'Offers'); check('offers sheet', await has('.sheet-head', 'Offers')); await click('.sheet-close')
await click('.svc', 'Support'); check('support sheet', await has('.sheet-head', 'Support')); await click('.sheet-close')
await click('.cat', 'Brake'); check('category opens Explore filtered', (await txt('.chip.is-on')) === 'Brake')
await click('.chip', 'All'); await type('.search-bar input', 'shock'); check('explore search filters', await has('.pitem', 'Rear Shock'))
await type('.search-bar input', 'zzz'); check('explore empty state', await has('.empty', 'No parts found'))
await click('.bn', 'Home')

// Vehicle selection
await click('.vtype', 'Two-Wheeler')
check('vehicle select opens', await has('.nav-title h1', 'Select Vehicle'))
await click('.sel-box', 'Hero'); check('brand sheet opens', await has('.sheet-head', 'Select Brand'))
await click('.opt', 'Honda'); check('brand changed to Honda', await has('.vs-brand', 'Honda'))
check('unavailable model shows coming soon', await has('.btn-orange', 'Coming Soon'))
await click('.sel-box', 'Honda'); await click('.opt', 'Hero')
await click('.seg-btn', 'Four-Wheeler'); check('four-wheeler tab shows car brands', await has('.vs-brand', 'Maruti'))
await click('.seg-btn', 'Two-Wheeler')
await click('.sel-box', 'BS6'); await click('.opt', 'BS4'); check('variant changes', await has('.vs-variant', 'BS4'))
await click('.sel-box', 'BS4'); await click('.opt', 'BS6')
await click('.btn-orange', 'Explore Anatomy')
check('anatomy title', (await txt('.nav-title h1')) === 'Hero Splendor Plus (BS6)')

// Anatomy tools
await click('.tool', 'Zoom'); check('zoom scales model', (await page.evaluate(() => document.querySelector('.model').style.transform)).includes('scale(1.38)'))
await click('.tool', 'Zoom')
await click('.tool', 'Rotate'); check('rotate animates', await page.evaluate(() => document.querySelector('.model').classList.contains('is-auto'))); await click('.tool', 'Rotate')
const box = await (await page.$('.stage3d')).boundingBox()
await page.mouse.move(box.x + 100, box.y + 150); await page.mouse.down(); await page.mouse.move(box.x + 220, box.y + 150, { steps: 6 }); await page.mouse.up(); await wait(200)
check('drag rotates model', (await page.evaluate(() => document.querySelector('.model').style.transform)).includes('rotateY(30deg)'))
await click('.tool', 'AR'); check('AR toast', (await toast()).includes('AR'))
await click('.hotspot', 'Seat'); check('hotspot shows tooltip', await has('.hs-tip', 'Seat'))
await click('.sys', 'Brake'); check('system sheet', await has('.sheet-head', 'Brake Parts')); await click('.sheet-close')
await click('.hotspot', 'Headlamp'); await click('.hotspot', 'Headlamp')
check('headlamp hotspot opens exploded view', await has('.nav-title h1', 'Headlamp Assembly'))

// Exploded
await click('.exp-row', 'Reflector'); check('row select highlights', await has('.exp-row.is-on', 'Reflector'))
check('marker highlighted', (await page.$$('.exp-hit.is-on')).length === 1)
await click('.exp-row', 'Housing'); check('ghost marker for part 4', await has('.exp-ghost', '4'))
await click('.icon-plain'); check('fullscreen opens', !!(await page.$('.fullview'))); await click('.fullview'); check('fullscreen closes', !(await page.$('.fullview')))
await click('.exp-bar-cart'); check('add to cart from exploded', (await toast()).includes('Added'))
await click('.exp-bar .btn-orange')

// Part details
check('part details', await has('.pd-info h2', 'Headlamp Assembly'))
await click('.qty button', 'Increase'); await page.evaluate(() => [...document.querySelectorAll('.qty button')].find((b) => b.getAttribute('aria-label') === 'Increase').click()); await wait(150)
check('qty increments to 3', (await txt('.qty span')) === '3')
await page.evaluate(() => [...document.querySelectorAll('.qty button')].find((b) => b.getAttribute('aria-label') === 'Decrease').click()); await wait(150)
check('qty decrements to 2', (await txt('.qty span')) === '2')
await click('.btn-orange', 'Add to Cart'); check('add to cart toast', (await toast()).includes('2 × Headlamp'))
await click('.acc-row', 'Nut'); check('nut & bolt opens', await has('.nb-table', 'Mounting Bolt')); await click('.back-btn')
await click('.acc-row', 'Installation'); check('install opens', (await page.$$('.step')).length === 5)
await click('.step', 'Disconnect'); check('step toggles done', await has('.step.is-done', 'Disconnect'))
await click('.tab2', 'Video'); check('Video tab opens player', !!(await page.$('.player')))
await click('.player-big'); await wait(2300); const t1 = await txt('.ctrl-time'); check('video plays (time advances)', !t1.startsWith('0:00'))
await click('.ctrl-row button', 'Captions'); check('captions show', !!(await page.$('.cc-line')))
await click('.ctrl-row button', 'Settings'); await click('.opt', '2×'); check('speed set to 2x', true)
await click('.pv', 'Front Cowl'); check('switch video loads title', await has('.player-title', 'Front Cowl'))
await click('.ctrl-row button', 'Full screen'); check('video fullscreen', !!(await page.$('.fullview.is-video'))); await click('.fullview .ctrl-row button', 'Full screen')
await click('.back-btn')
await click('.btn-outline-o', 'Buy Now'); check('buy now opens checkout', await has('.nav-title h1', 'Checkout'))
await click('.pay', 'Cash on Delivery'); check('payment select', await has('.pay.is-on', 'Cash'))
await click('.btn-orange', 'Place Order'); await wait(900)
check('order placed screen', await has('.done h2', 'Order Placed'))
await click('.btn-orange', 'Track Order'); check('orders tab lists new order', await has('.order', 'Confirmed'))

// Cart
await click('.bn', 'Cart')
const before = await txt('.summary .total')
await page.evaluate(() => [...document.querySelectorAll('.cart-item .qty button')].find((b) => b.getAttribute('aria-label') === 'Increase').click()); await wait(200)
check('cart qty changes total', (await txt('.summary .total')) !== before)
const n1 = (await page.$$('.cart-item')).length
await click('.ci-del'); check('remove item', (await page.$$('.cart-item')).length === n1 - 1)
await click('.btn-orange', 'Proceed to Checkout'); await click('.btn-orange', 'Place Order'); await wait(900)
await click('.btn-ghost', 'Continue Shopping'); check('cart emptied after order', (await page.$('.cart-badge')) === null)

// Profile
await click('.bn', 'Profile'); check('profile shows user', await has('.profile-head', 'Rahul Verma'))
await click('.garage'); check('garage opens vehicle select', await has('.nav-title h1', 'Select Vehicle')); await click('.back-btn')
await page.screenshot({ path: `${OUT}/profile.png` })

// Website
await click('.guide-switch button', 'Website'); check('website renders', await has('.wh-text h1', 'Explore Every Part'))
await click('.wf', 'Service Manuals'); check('website manual toast', (await toast()).includes('manual'))
await click('.web-brands-head button'); check('view all brands', await has('.wb-text', 'Ather'))
await click('.wh-text .btn-orange'); check('Select Your Vehicle opens app vehicle screen', await has('.nav-title h1', 'Select Vehicle'))

// Logout
await click('.back-btn'); await click('.bn', 'Profile')
await page.evaluate(() => document.querySelector('.logout')?.click()); await wait(600)
check('logout returns to login', await has('.auth-title', 'Welcome Back'))
await click('.btn-orange', 'Login'); await wait(700)
check('one-tap demo login', await has('.search-bar', 'Search parts'))

// Mobile viewport
await page.setViewport({ width: 390, height: 844 }); await wait(400)
await page.screenshot({ path: `${OUT}/mobile.png` })
check('mobile: no fake status bar', await page.evaluate(() => getComputedStyle(document.querySelector('.statusbar')).display === 'none'))
check('mobile: no horizontal scroll', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))

console.log(`\n${pass} passed, ${fail} failed`)
console.log(errors.length ? errors.join('\n') : 'NO CONSOLE ERRORS')
await browser.close()
