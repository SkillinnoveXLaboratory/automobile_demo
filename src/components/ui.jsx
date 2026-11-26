import { useId } from 'react'
import { ArrowLeft, Check, ChevronDown, ClipboardList, House, Search, ShoppingCart, User, X } from 'lucide-react'
import { useCartCount, useNav } from '../store'

/* ── Status bar (matches reference: 10:24 + signal/wifi/battery) ── */
export function StatusBar({ tone = 'dark' }) {
  return (
    <div className={`statusbar statusbar-${tone}`}>
      <span>10:24</span>
      <span className="statusbar-icons" aria-hidden>
        <svg width="17" height="11" viewBox="0 0 17 11"><path d="M1 10h2.4V7H1zm4.3 0h2.4V5H5.3zm4.3 0h2.4V2.8H9.6zm4.3 0h2.4V.5h-2.4z" fill="currentColor" /></svg>
        <svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 2.2c2 0 3.8.8 5.2 2l1.2-1.3A9.2 9.2 0 0 0 7.5.4 9.2 9.2 0 0 0 1.1 2.9l1.2 1.3a7.4 7.4 0 0 1 5.2-2zm0 3.4c1.1 0 2.1.4 2.9 1.1l1.2-1.3a6 6 0 0 0-8.2 0l1.2 1.3a4.2 4.2 0 0 1 2.9-1.1zm0 3.3 1.7-1.7a2.4 2.4 0 0 0-3.4 0z" fill="currentColor" /></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3" fill="none" stroke="currentColor" opacity=".5" /><rect x="2" y="2" width="18" height="8" rx="1.8" fill="currentColor" /><rect x="22.6" y="4" width="1.8" height="4" rx=".8" fill="currentColor" opacity=".5" /></svg>
      </span>
    </div>
  )
}

/* ── AUTORYNX logo (vector rebuild of the client mark) ── */
export function LogoMark({ size = 90 }) {
  // Unique gradient id per instance: a shared id breaks when the first logo is inside a hidden element
  const gid = 'lgO' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const cx = 60, cy = 47, r = 33
  const pt = (deg, rad = r) => [cx + rad * Math.cos((deg * Math.PI) / 180), cy + rad * Math.sin((deg * Math.PI) / 180)]
  const arc = (a1, a2, rad = r) => { const [x1, y1] = pt(a1, rad), [x2, y2] = pt(a2, rad); return `M${x1} ${y1} A${rad} ${rad} 0 0 1 ${x2} ${y2}` }
  const teeth = [200, 222, 244, 266, 288, 310, 332]
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 120 94" aria-label="AUTORYNX">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFA23A" /><stop offset="1" stopColor="#F26B0F" /></linearGradient>
      </defs>
      {teeth.map((d) => { const [x, y] = pt(d, r + 6); return <rect key={d} x={x - 4.5} y={y - 4.5} width="9" height="9" rx="1.6" fill={`url(#${gid})`} transform={`rotate(${d + 90} ${x} ${y})`} /> })}
      <path d={arc(165, 345)} stroke={`url(#${gid})`} strokeWidth="9" fill="none" />
      <path d={arc(352, 62)} stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M60 17 L87 79 H73.5 L68.6 66.5 H51.4 L46.5 79 H33 Z M55.4 55.5 H64.6 L60 42.5 Z" fill="#fff" fillRule="evenodd" />
      <path d="M4 80 C 26 66, 48 60, 74 55 L 70 62 C 46 66, 26 72, 4 80 Z" fill={`url(#${gid})`} />
    </svg>
  )
}

export function Wordmark({ size = 34, tm = true }) {
  return (
    <span className="wordmark" style={{ fontSize: size }}>
      AUTOR<span className="wm-o">YN</span>X{tm && <sup>™</sup>}
    </span>
  )
}

export function LogoStacked({ mark = 92, word = 34 }) {
  return (
    <div className="logo-stacked">
      <LogoMark size={mark} />
      <Wordmark size={word} />
    </div>
  )
}

export function LogoInline({ mark = 40, word = 22 }) {
  return (
    <div className="logo-inline">
      <LogoMark size={mark} />
      <Wordmark size={word} />
    </div>
  )
}

/* ── Navy header with back arrow (inner screens) ── */
export function NavHeader({ title, sub, center, right, onBack }) {
  const nav = useNav()
  return (
    <header className={`nav-header ${center ? 'is-center' : ''}`}>
      <button className="back-btn" onClick={onBack || nav.back} aria-label="Back"><ArrowLeft size={22} strokeWidth={2.2} /></button>
      <div className="nav-title">
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      <div className="nav-right">{right}</div>
    </header>
  )
}

/* ── Bottom navigation (Home / Explore / Cart / Orders / Profile) ── */
const TABS = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'explore', label: 'Explore', icon: Search },
  { id: 'cart', label: 'Cart', icon: ShoppingCart },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'profile', label: 'Profile', icon: User },
]
export function BottomNav() {
  const nav = useNav()
  const count = useCartCount()
  return (
    <nav className="bottom-nav">
      {TABS.map((t) => {
        const active = nav.tab === t.id && !nav.stack.length
        return (
          <button key={t.id} className={`bn ${active ? 'is-active' : ''}`} onClick={() => nav.switchTab(t.id)} aria-label={t.label}>
            <span className="bn-ico">
              <t.icon size={22} strokeWidth={1.8} />
              {t.id === 'cart' && count > 0 && <span className="bn-badge">{count}</span>}
            </span>
            <span className="bn-label">{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

/* ── Bottom sheet + select ── */
export function Sheet({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="sheet-handle" />
        <div className="sheet-head">
          <h3>{title}</h3>
          <button className="sheet-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}

export function OptionList({ options, value, onPick }) {
  return (
    <div className="opt-list">
      {options.map((o) => (
        <button key={o.value} className={`opt ${o.value === value ? 'is-sel' : ''} ${o.disabled ? 'is-disabled' : ''}`} onClick={() => !o.disabled && onPick(o.value)} disabled={o.disabled}>
          {o.icon && <img src={o.icon} alt="" className="opt-ico" />}
          <span className="opt-label">{o.label}</span>
          {o.note && <span className="opt-note">{o.note}</span>}
          {o.value === value && <Check size={18} className="opt-check" />}
        </button>
      ))}
    </div>
  )
}

export function SelectBox({ label, children, onClick }) {
  return (
    <div className="sel-field">
      <span className="sel-label">{label}</span>
      <button className="sel-box" onClick={onClick}>
        <span className="sel-value">{children}</span>
        <ChevronDown size={18} strokeWidth={2.4} />
      </button>
    </div>
  )
}

/* ── Social marks for "or continue with" ── */
export const GoogleIcon = () => (
  <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
)
export const AppleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden><path fill="#111" d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1zM13.9 5c.7-.9 1.2-2 1-3.2-1 0-2.2.7-3 1.5-.6.7-1.2 1.9-1 3.1 1.1.1 2.3-.6 3-1.4z" /></svg>
)
export const FacebookIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="11" fill="#1877F2" /><path fill="#fff" d="M13.4 19.5v-6.2h2.1l.3-2.5h-2.4V9.3c0-.7.2-1.2 1.2-1.2h1.3V5.9c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.3v1.8H8.7v2.5h2.1v6.2z" /></svg>
)
