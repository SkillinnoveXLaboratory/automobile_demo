import { useEffect, useState } from 'react'
import { ArrowLeft, Check, ChevronDown, ChevronRight, Pencil, X } from 'lucide-react'
import { useNav } from '../store'

/* ── Android status bar ─────────────────────────────── */
export function StatusBar({ tone = 'light' }) {
  const [time, setTime] = useState(() => clock())
  useEffect(() => {
    const t = setInterval(() => setTime(clock()), 20000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className={`statusbar ${tone === 'red' ? 'is-red' : ''}`}>
      <span className="statusbar-time">{time}</span>
      <span className="statusbar-icons" aria-hidden>
        <svg width="16" height="12" viewBox="0 0 16 12"><path d="M1 11h2V8H1zm4 0h2V6H5zm4 0h2V3H9zm4 0h2V0h-2z" fill="currentColor" /></svg>
        <svg width="15" height="12" viewBox="0 0 16 12"><path d="M8 11.5 15.5 3.6A10.8 10.8 0 0 0 8 .5 10.8 10.8 0 0 0 .5 3.6z" fill="currentColor" /></svg>
        <svg width="24" height="12" viewBox="0 0 24 12"><rect x=".5" y=".5" width="20" height="11" rx="3" fill="none" stroke="currentColor" opacity=".45" /><rect x="2" y="2" width="15" height="8" rx="1.6" fill="currentColor" /><rect x="21.5" y="4" width="1.8" height="4" rx=".8" fill="currentColor" opacity=".45" /></svg>
      </span>
    </div>
  )
}
const clock = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

/* ── App bars ───────────────────────────────────────── */
export function AppBar({ title, onBack, right, transparent }) {
  const nav = useNav()
  return (
    <header className={`appbar ${transparent ? 'is-transparent' : ''}`}>
      <button className="icon-btn" onClick={onBack || nav.back} aria-label="Back"><ArrowLeft size={20} /></button>
      <h1 className="appbar-title">{title}</h1>
      <div className="appbar-right">{right || <span className="icon-btn-spacer" />}</div>
    </header>
  )
}

export function PageHeader({ title, subtitle, right }) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}

/* ── Buttons ────────────────────────────────────────── */
export function Button({ children, variant = 'primary', icon: Icon, block = true, size, ...rest }) {
  return (
    <button className={`btn btn-${variant} ${block ? 'btn-block' : ''} ${size === 'sm' ? 'btn-sm' : ''}`} {...rest}>
      {Icon && <Icon size={size === 'sm' ? 16 : 18} strokeWidth={2.2} />}
      <span>{children}</span>
    </button>
  )
}

export function IconButton({ icon: Icon, badge, label, onClick, tone }) {
  return (
    <button className={`icon-btn ${tone === 'soft' ? 'icon-btn-soft' : ''}`} onClick={onClick} aria-label={label}>
      <Icon size={20} />
      {badge ? <span className="icon-badge" /> : null}
    </button>
  )
}

/* ── Inputs ─────────────────────────────────────────── */
export function Field({ label, hint, error, prefix, suffix, ...rest }) {
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      {label && <span className="field-label">{label}</span>}
      <span className="field-box">
        {prefix && <span className="field-prefix">{prefix}</span>}
        <input className="field-input" {...rest} />
        {suffix}
      </span>
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  )
}

export function TextArea({ label, error, ...rest }) {
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      {label && <span className="field-label">{label}</span>}
      <textarea className="field-box field-textarea" rows={3} {...rest} />
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

/* Select that opens an Android-style bottom sheet */
export function Select({ label, value, placeholder = 'Select', options, onChange, error, disabled, renderOption }) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => (o.value ?? o) === value)
  const text = current ? current.label ?? current : ''
  return (
    <div className={`field ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
      {label && <span className="field-label">{label}</span>}
      <button type="button" className="field-box field-select" onClick={() => !disabled && setOpen(true)} disabled={disabled}>
        <span className={text ? '' : 'placeholder'}>{text || placeholder}</span>
        <ChevronDown size={18} className="muted" />
      </button>
      {error && <span className="field-error">{error}</span>}
      <Sheet open={open} onClose={() => setOpen(false)} title={label || placeholder}>
        <div className="sheet-list">
          {options.map((o) => {
            const v = o.value ?? o
            const sel = v === value
            return (
              <button key={v} className={`sheet-option ${sel ? 'is-selected' : ''}`} onClick={() => { onChange(v); setOpen(false) }}>
                <span className="sheet-option-main">{renderOption ? renderOption(o) : o.label ?? o}</span>
                {sel && <Check size={18} className="text-primary" />}
              </button>
            )
          })}
        </div>
      </Sheet>
    </div>
  )
}

/* ── Bottom sheet ───────────────────────────────────── */
export function Sheet({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="sheet-handle" />
        <div className="sheet-head">
          <h3>{title}</h3>
          <button className="icon-btn icon-btn-soft" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}

/* ── Chips / tabs ───────────────────────────────────── */
export function Chips({ items, value, onChange, scroll = true, fill = false }) {
  return (
    <div className={`chips ${fill ? 'chips-fill' : scroll ? 'chips-scroll' : ''}`}>
      {items.map((it) => {
        const v = it.value ?? it
        return (
          <button key={v} className={`chip ${v === value ? 'is-active' : ''}`} onClick={() => onChange(v)}>
            {it.icon && <it.icon size={15} />}
            {it.label ?? it}
          </button>
        )
      })}
    </div>
  )
}

export function Tabs({ items, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {items.map((it) => (
        <button key={it} role="tab" className={`tab ${it === value ? 'is-active' : ''}`} onClick={() => onChange(it)}>{it}</button>
      ))}
    </div>
  )
}

export function Segmented({ items, value, onChange }) {
  return (
    <div className="segmented">
      {items.map((it) => (
        <button key={it.value} className={`segmented-item ${it.value === value ? 'is-active' : ''}`} onClick={() => onChange(it.value)}>
          {it.icon && <it.icon size={16} />}
          {it.label}
        </button>
      ))}
    </div>
  )
}

/* ── Display ────────────────────────────────────────── */
export function SectionTitle({ children, action, onAction }) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {action && (
        <button className="link-btn" onClick={onAction}>
          {action}
          <span className="link-btn-icon"><ChevronRight size={14} /></span>
        </button>
      )}
    </div>
  )
}

export function Pill({ tone = 'neutral', children }) {
  return <span className={`pill pill-${tone}`}>{children}</span>
}

export function Progress({ value, tone = 'primary' }) {
  return (
    <div className={`progress progress-${tone}`}>
      <span style={{ width: `${Math.max(3, Math.min(100, value))}%` }} />
    </div>
  )
}

export function Avatar({ name, size = 44, tone = 'primary' }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  return <span className={`avatar avatar-${tone}`} style={{ width: size, height: size, fontSize: size * 0.36 }}>{initials}</span>
}

export function Row({ icon: Icon, iconTone = 'soft', title, sub, right, onClick, chevron = !!onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className={`row ${onClick ? 'is-tappable' : ''}`} onClick={onClick}>
      {Icon && <span className={`row-icon row-icon-${iconTone}`}><Icon size={19} /></span>}
      <span className="row-body">
        <span className="row-title">{title}</span>
        {sub && <span className="row-sub">{sub}</span>}
      </span>
      {right}
      {chevron && <ChevronRight size={18} className="muted" />}
    </Tag>
  )
}

export function KV({ label, value }) {
  return (
    <div className="kv">
      <span className="kv-label">{label}</span>
      <span className="kv-value">{value}</span>
    </div>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button className={`toggle ${checked ? 'is-on' : ''}`} onClick={() => onChange(!checked)} role="switch" aria-checked={checked} aria-label={label}>
      <span />
    </button>
  )
}

export function Empty({ icon: Icon, title, text, action }) {
  return (
    <div className="empty">
      <span className="empty-icon"><Icon size={26} /></span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  )
}

export function Stepper({ steps, current }) {
  return (
    <div className="stepper">
      {steps.map((s, i) => (
        <div key={s} className={`stepper-item ${i < current ? 'is-done' : ''} ${i === current ? 'is-current' : ''}`}>
          <span className="stepper-dot">{i < current ? <Check size={13} strokeWidth={3} /> : i + 1}</span>
          <span className="stepper-label">{s}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Profile header (curved wave) + menu rows ───────── */
export function ProfileHero({ avatar, name, sub, chips, onEdit }) {
  return (
    <div className="profile-hero-wrap">
      <div className="profile-hero">
        <span className="profile-avatar">
          {avatar}
          <button className="profile-edit" onClick={onEdit} aria-label="Edit profile"><Pencil size={11} strokeWidth={2.4} /></button>
        </span>
        <h2>{name}</h2>
        <p>{sub}</p>
        {chips?.length ? <div className="profile-chips">{chips.map((c) => <span key={c}>{c}</span>)}</div> : null}
      </div>
    </div>
  )
}

export function MenuRow({ icon: Icon, label, badge, onClick }) {
  return (
    <button className="menu-row" onClick={onClick}>
      <Icon size={19} strokeWidth={1.8} />
      <span className="menu-label">{label}</span>
      {badge ? <span className="menu-badge">{badge}</span> : null}
    </button>
  )
}

/* ── Battery illustration ───────────────────────────── */
export function BatteryArt({ color = '#E5194A', size = 56, label }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className="battery-art">
      <rect x="14" y="8" width="9" height="7" rx="2" fill="#2A2A33" />
      <rect x="41" y="8" width="9" height="7" rx="2" fill="#2A2A33" />
      <rect x="6" y="13" width="52" height="43" rx="8" fill="#26262E" />
      <rect x="6" y="13" width="52" height="10" rx="8" fill="#34343E" />
      <rect x="6" y="30" width="52" height="16" fill={color} />
      <path d="M33 32.5 27.5 39.5h4.2l-1.4 5 5.7-7.2h-4.2z" fill="#fff" />
      <text x="15.5" y="21" fontSize="7" fontWeight="700" fill="#fff" fontFamily="Poppins, sans-serif">+</text>
      <text x="43.5" y="21" fontSize="8" fontWeight="700" fill="#fff" fontFamily="Poppins, sans-serif">–</text>
      {label && <text x="32" y="53" fontSize="5.5" fontWeight="600" fill="#C9C9D3" textAnchor="middle" fontFamily="Poppins, sans-serif">{label}</text>}
    </svg>
  )
}

/* ── Deterministic QR-style code (prototype) ────────── */
export function qrSvgString(text, size = 160, fg = '#121212') {
  const n = 25
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000 }
  const finder = (r, c) => {
    const inBox = (r0, c0) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7
    const boxes = [[0, 0], [0, n - 7], [n - 7, 0]]
    for (const [r0, c0] of boxes) {
      if (inBox(r0, c0)) {
        const rr = r - r0, cc = c - c0
        return rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4) ? 1 : 0
      }
      if (r >= r0 - 1 && r <= r0 + 7 && c >= c0 - 1 && c <= c0 + 7) return 0
    }
    return -1
  }
  const cell = size / n
  let rects = ''
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const f = finder(r, c)
    const on = f === -1 ? rnd() > 0.52 : f === 1
    if (on) rects += `<rect x="${(c * cell).toFixed(2)}" y="${(r * cell).toFixed(2)}" width="${(cell + 0.3).toFixed(2)}" height="${(cell + 0.3).toFixed(2)}"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="${fg}">${rects}</svg>`
}

export function QR({ value, size = 140 }) {
  return <span className="qr" dangerouslySetInnerHTML={{ __html: qrSvgString(value, size) }} />
}
