import { useEffect, useLayoutEffect, useState } from 'react'
import { Monitor, Smartphone } from 'lucide-react'
import { BottomNav, LogoInline, StatusBar } from './components/ui'
import { AppProvider, useNav, useStore, useToast } from './store'
import { Forgot, Login, Signup, Splash } from './screens/Auth'
import { Explore, Home } from './screens/Home'
import { Anatomy, Exploded, VehicleSelect } from './screens/Vehicle'
import { Install, NutBolt, PartDetails, Video } from './screens/Parts'
import { Cart, Checkout, OrderDone, Orders, Profile } from './screens/Shop'
import Website from './screens/Website'

const AUTH = { splash: Splash, login: Login, signup: Signup, forgot: Forgot }
const PUSHED = {
  vehicle: VehicleSelect, anatomy: Anatomy, exploded: Exploded, part: PartDetails, bolts: NutBolt,
  install: Install, video: Video, checkout: Checkout, orderDone: OrderDone,
}
const TABS = { home: Home, explore: Explore, cart: Cart, orders: Orders, profile: Profile }

function PhoneApp() {
  const { state } = useStore()
  const nav = useNav()
  const { toast } = useToast()
  const loggedIn = !!state.user

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !document.querySelector('.sheet, .fullview')) nav.back() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nav])

  let body, key
  if (!loggedIn) {
    const top = nav.authStack[nav.authStack.length - 1]
    const C = AUTH[top.name] || Splash
    key = `a-${nav.authStack.length}-${top.name}`
    body = <C params={top.params || {}} />
  } else if (nav.stack.length) {
    const top = nav.stack[nav.stack.length - 1]
    const C = PUSHED[top.name] || Home
    key = `p-${nav.stack.length}-${top.name}`
    body = <C params={top.params || {}} />
  } else {
    const C = TABS[nav.tab] || Home
    key = `t-${nav.tab}`
    body = <div className="screen tabbed"><C /><BottomNav /></div>
  }

  return (
    <div className="phone">
      <StatusBar />
      <div className="viewport">
        <div key={key} className={`page page-${nav.dir}`}>{body}</div>
      </div>
      {toast && <div key={toast.key} className="toast">{toast.msg}</div>}
    </div>
  )
}

function Guide({ view, setView }) {
  const { state, dispatch } = useStore()
  const { showToast } = useToast()
  return (
    <aside className="guide">
      <LogoInline mark={46} word={26} />
      <p className="guide-tag">THE COMPLETE AUTOMOTIVE ECOSYSTEM · Prototype</p>
      <div className="guide-switch">
        <button className={view === 'app' ? 'is-on' : ''} onClick={() => setView('app')}><Smartphone size={16} /> Mobile App</button>
        <button className={view === 'web' ? 'is-on' : ''} onClick={() => setView('web')}><Monitor size={16} /> Website</button>
      </div>
      <div className="guide-box">
        <span className="guide-label">Demo login</span>
        <p><b>Email:</b> demo@autorynx.com</p>
        <p><b>Password:</b> demo@123</p>
        <p className="guide-hint">The login form is pre-filled with these details. Just tap <b>Login</b>.</p>
      </div>
      <div className="guide-box">
        <span className="guide-label">Client walkthrough</span>
        <ol>
          <li>Splash → Get Started → Login</li>
          <li>Home → Two-Wheeler → Hero · Splendor Plus · BS6</li>
          <li>Explore Anatomy → rotate / zoom / tap hotspots</li>
          <li>Electrical → Headlamp exploded view → View Part</li>
          <li>Part details → Nut &amp; Bolt · Install guide · Video</li>
          <li>Add to Cart / Buy Now → Checkout → Order</li>
        </ol>
      </div>
      <div className="guide-foot">
        <span>{state.user ? `Signed in: ${state.user.name}` : 'Not signed in'}</span>
        <button onClick={() => { dispatch({ type: 'reset' }); showToast('Demo data reset') }}>Reset demo</button>
      </div>
    </aside>
  )
}

function Stage() {
  const nav = useNav()
  const { state, dispatch } = useStore()
  const { toast, showToast } = useToast()
  const [view, setView] = useState(() => (new URLSearchParams(location.search).has('web') ? 'web' : 'app'))
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 36) / 884))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  const openApp = (route) => {
    setView('app')
    if (!state.user) { nav.toLogin(); if (route !== 'login') showToast('Please log in to continue'); return }
    if (route === 'login') return showToast(`Already logged in as ${state.user.name}`)
    if (route === 'vehicle' || route === 'vehicle-four') {
      if (route === 'vehicle-four') dispatch({ type: 'setVehicle', data: { type: 'four', brand: 'maruti', model: 'swift', variant: '2024 – Present' } })
      else dispatch({ type: 'setVehicle', data: { type: 'two', brand: 'hero', model: 'splendor', variant: 'BS6 (2019 – Present)' } })
      return nav.goTab('home', 'vehicle')
    }
    if (route === 'install') return nav.goTab('home', 'install')
    if (route === 'part') return nav.goTab('explore', 'part', { id: 'headlamp' })
    nav.switchTab(route)
  }

  return (
    <div className={`stage is-${view}`}>
      <Guide view={view} setView={setView} />
      {view === 'web' ? (
        <div className="web-wrap">
          <Website openApp={openApp} />
          {toast && <div key={toast.key} className="toast web-toast">{toast.msg}</div>}
        </div>
      ) : (
        <div className="device-wrap" style={{ '--scale': scale }}>
          <div className="device">
            <span className="dbtn dbtn-p" /><span className="dbtn dbtn-v" />
            <div className="device-inner"><span className="punch" /><PhoneApp /></div>
          </div>
        </div>
      )}
      <button className="m-switch" onClick={() => setView(view === 'web' ? 'app' : 'web')}>{view === 'web' ? <><Smartphone size={15} /> App</> : <><Monitor size={15} /> Website</>}</button>
    </div>
  )
}

export default function App() {
  return <AppProvider><Stage /></AppProvider>
}
