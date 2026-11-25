import { useEffect, useLayoutEffect, useState } from 'react'
import { ClipboardList, House, Package, Search, ShieldCheck, Trophy, User } from 'lucide-react'
import { StatusBar } from './components/ui'
import { AppProvider, useNav, useStore, useToast } from './store'
import { Login, Logo, Otp, Signup, Welcome } from './screens/Auth'
import { Account, Claims, Home, MyVehicles, NewClaim, Notifications, Profile, SettingsScreen, WarrantyDetail, Warranties } from './screens/Customer'
import { ClaimDetail, Dealers, Finder, Inverter, ProductDetail, RegisterWarranty, Registered } from './screens/Shared'
import { AddStock, DealerClaims, DealerHome, DealerProfile, Inventory, Rewards, Verify } from './screens/Dealer'

const AUTH = { welcome: Welcome, login: Login, otp: Otp, signup: Signup }
const PUSHED = {
  register: RegisterWarranty, registered: Registered, warranty: WarrantyDetail, newClaim: NewClaim, claim: ClaimDetail,
  notifications: Notifications, dealers: Dealers, product: ProductDetail, inverter: Inverter, addStock: AddStock, verify: Verify,
  account: Account, vehicles: MyVehicles, settings: SettingsScreen,
}
const TABS = {
  customer: [
    { id: 'home', label: 'Home', icon: House, C: Home },
    { id: 'warranty', label: 'Warranty', icon: ShieldCheck, C: Warranties },
    { id: 'finder', label: 'Find', icon: Search, C: Finder },
    { id: 'claims', label: 'Claims', icon: ClipboardList, C: Claims },
    { id: 'profile', label: 'Profile', icon: User, C: Profile },
  ],
  dealer: [
    { id: 'home', label: 'Home', icon: House, C: DealerHome },
    { id: 'inventory', label: 'Stock', icon: Package, C: Inventory },
    { id: 'claims', label: 'Claims', icon: ClipboardList, C: DealerClaims },
    { id: 'rewards', label: 'Rewards', icon: Trophy, C: Rewards },
    { id: 'profile', label: 'Profile', icon: User, C: DealerProfile },
  ],
}

function PhoneApp() {
  const { state } = useStore()
  const nav = useNav()
  const { toast } = useToast()
  const role = state.session?.role

  // Escape key acts like the Android back gesture
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !document.querySelector('.sheet')) nav.back() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nav])

  let body
  let key
  if (!role) {
    const top = nav.authStack[nav.authStack.length - 1]
    const C = AUTH[top.name] || Welcome
    key = `auth-${nav.authStack.length}-${top.name}`
    body = <C params={top.params || {}} />
  } else if (nav.stack.length) {
    const top = nav.stack[nav.stack.length - 1]
    const C = PUSHED[top.name]
    key = `push-${nav.stack.length}-${top.name}-${top.params?.id || ''}`
    body = C ? <C params={top.params || {}} /> : null
  } else {
    const tabs = TABS[role]
    const t = tabs.find((x) => x.id === nav.tab) || tabs[0]
    key = `tab-${role}-${t.id}`
    body = (
      <div className="screen">
        <t.C />
        <nav className="bottom-nav">
          {tabs.map((x) => (
            <button key={x.id} className={`bn-item ${x.id === t.id ? 'is-active' : ''}`} onClick={() => nav.switchTab(x.id)} aria-label={x.label}>
              <span className="bn-icon"><x.icon size={22} strokeWidth={x.id === t.id ? 2.3 : 1.9} /></span>
              <span className="bn-label">{x.label}</span>
            </button>
          ))}
        </nav>
      </div>
    )
  }

  return (
    <div className="phone-screen">
      <StatusBar tone={role ? 'red' : 'light'} />
      <div className="viewport">
        <div key={key} className={`page page-${nav.dir}`}>{body}</div>
      </div>
      <div className="gesture-bar"><span /></div>
      {toast && <div key={toast.key} className={`toast toast-${toast.kind}`}>{toast.msg}</div>}
    </div>
  )
}

function DemoGuide() {
  const { state, dispatch } = useStore()
  const { showToast } = useToast()
  return (
    <aside className="guide">
      <div className="guide-brand"><Logo size={40} /><div><strong>AmpCare</strong><span>Battery & Warranty App · Prototype</span></div></div>
      <h2>Clickable Android prototype</h2>
      <p>Customer app and dealer partner app, sharing one demo database. Actions in one role show up in the other.</p>
      <div className="guide-box">
        <span className="guide-label">Demo logins</span>
        <div className="guide-cred"><b>Customer</b><span>98765 43210 · OTP 1234</span></div>
        <div className="guide-cred"><b>Dealer</b><span>DL-1024 · demo@123</span></div>
      </div>
      <div className="guide-box">
        <span className="guide-label">Suggested walkthrough</span>
        <ol>
          <li>Customer: log in → <b>Register</b> → Scan → generate warranty card + QR</li>
          <li>Customer: <b>Find</b> a battery for your vehicle, try the inverter calculator</li>
          <li>Customer: raise a <b>Claim</b> at Shree Auto Batteries</li>
          <li>Log out → Dealer: open <b>Claims</b> → review → test → approve</li>
          <li>Dealer: register a customer warranty → earn <b>+50 points</b></li>
        </ol>
      </div>
      <div className="guide-foot">
        <span>Signed in as: <b>{state.session ? (state.session.role === 'dealer' ? 'Dealer' : 'Customer') : '—'}</b></span>
        <button className="text-link" onClick={() => { dispatch({ type: 'reset' }); showToast('Demo data reset') }}>Reset demo data</button>
      </div>
    </aside>
  )
}

function Device() {
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 40) / 880))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return (
    <div className="stage">
      <DemoGuide />
      <div className="device-wrap" style={{ '--scale': scale }}>
        <div className="device">
          <span className="device-btn device-btn-power" />
          <span className="device-btn device-btn-vol" />
          <div className="device-inner">
            <span className="punch-hole" />
            <PhoneApp />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Device />
    </AppProvider>
  )
}
