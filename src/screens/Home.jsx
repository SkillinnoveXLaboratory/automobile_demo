import { useMemo, useState } from 'react'
import {
  ArrowRight, BadgeCheck, BadgePercent, BookOpen, Cog, Download, Headset, Mail, MessageCircle, Package,
  Phone, Search, ShoppingCart, SquarePlay, Store, Wrench, X,
} from 'lucide-react'
import { LogoInline, Sheet } from '../components/ui'
import { CarArt, EvArt, MotorbikeArt, TruckArt } from '../components/vehicleIcons'
import { A, BRANDS, CATALOGUE, inr } from '../data'
import { useCartCount, useNav, useStore, useToast } from '../store'

const SERVICES = [
  { id: 'catalogue', label: ['Parts', 'Catalogue'], icon: Cog, tone: 'navy' },
  { id: 'service', label: ['Service &', 'Repair'], icon: Wrench, tone: 'navy' },
  { id: 'videos', label: ['Installation', 'Videos'], icon: SquarePlay, tone: 'navy' },
  { id: 'manuals', label: ['OEM', 'Manuals'], icon: BookOpen, tone: 'navy' },
  { id: 'market', label: ['Marketplace', '(Buy / Sell)'], icon: Store, tone: 'orange' },
  { id: 'fitment', label: ['Fitment', 'Check'], icon: BadgeCheck, tone: 'green' },
  { id: 'offers', label: ['Offers'], icon: BadgePercent, tone: 'orange' },
  { id: 'support', label: ['Support'], icon: Headset, tone: 'blue' },
]
const CATS = [
  { label: 'Engine', img: A('cat-engine'), sys: 'Engine' },
  { label: 'Brake', img: A('cat-brake'), sys: 'Brake' },
  { label: 'Suspension', img: A('cat-suspension'), sys: 'Suspension' },
  { label: 'Electrical', img: A('cat-electrical'), sys: 'Electrical' },
]

export function Home() {
  const nav = useNav()
  const { dispatch } = useStore()
  const { showToast } = useToast()
  const count = useCartCount()
  const [sheet, setSheet] = useState(null)

  const pickType = (type) => { dispatch({ type: 'setVehicle', data: { type } }); nav.push('vehicle') }
  const service = (id) => {
    if (id === 'catalogue') return nav.switchTab('explore')
    if (id === 'service') return nav.push('install')
    if (id === 'videos') return nav.push('video')
    if (id === 'fitment') return nav.push('vehicle')
    setSheet(id)
  }

  return (
    <div className="content home">
      <div className="home-top">
        <div className="home-bar">
          <LogoInline mark={42} word={23} />
          <button className="cart-btn" onClick={() => nav.switchTab('cart')} aria-label="Cart">
            <ShoppingCart size={26} strokeWidth={1.8} />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>
        </div>
        <button className="search-bar" onClick={() => nav.switchTab('explore')}>
          <Search size={19} strokeWidth={2.2} />
          <span>Search parts, vehicle, or OEM no.</span>
        </button>
        <div className="vtypes">
          <button className="vtype" onClick={() => pickType('two')}><span className="vt-ico"><MotorbikeArt /></span><span>Two-Wheeler</span></button>
          <button className="vtype" onClick={() => pickType('four')}><span className="vt-ico"><CarArt /></span><span>Four-Wheeler</span></button>
          <button className="vtype" onClick={() => showToast('Commercial vehicles – coming soon')}><span className="vt-ico"><TruckArt /></span><span>Commercial</span></button>
          <button className="vtype" onClick={() => showToast('EV catalogue – coming soon')}><span className="vt-ico"><EvArt /></span><span>EV</span></button>
        </div>
        <div className="banner">
          <div className="banner-text">
            <h2>Explore Vehicles in Interactive 3D Anatomy</h2>
            <button className="btn-orange btn-sm" onClick={() => nav.push('vehicle')}>Explore Now <ArrowRight size={15} strokeWidth={2.6} /></button>
          </div>
          <img src={A('home-engine')} alt="Engine anatomy" className="banner-img" />
        </div>
      </div>

      <div className="home-light">
        <div className="svc-grid">
          {SERVICES.map((s) => (
            <button key={s.id} className="svc" onClick={() => service(s.id)}>
              <s.icon size={27} strokeWidth={1.6} className={`c-${s.tone}`} />
              <span>{s.label[0]}{s.label[1] && <><br />{s.label[1]}</>}</span>
            </button>
          ))}
        </div>
        <h3 className="sec-title">Shop by Category</h3>
        <div className="cat-row">
          {CATS.map((c) => (
            <button key={c.label} className="cat" onClick={() => { try { sessionStorage.setItem('ax-filter', c.sys) } catch { /* ignore */ } nav.switchTab('explore') }}>
              <img src={c.img} alt="" />
              <span>{c.label}</span>
            </button>
          ))}
        </div>
        <h3 className="sec-title">Popular Brands</h3>
        <div className="brand-row">
          {BRANDS.slice(0, 6).map((b) => <span key={b.name} className="brand-chip"><img src={b.img} alt={b.name} /></span>)}
        </div>
        <h3 className="sec-title">Recently Viewed</h3>
        <button className="recent" onClick={() => nav.push('part', { id: 'headlamp' })}>
          <img src={A('headlamp')} alt="" />
          <span className="recent-body"><b>Headlamp Assembly</b><small>Hero Splendor Plus BS6 · 33100-KCC-900</small><em>{inr(849)}</em></span>
          <ArrowRight size={18} />
        </button>
      </div>

      <HomeSheets sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  )
}

function HomeSheets({ sheet, onClose }) {
  const { showToast } = useToast()
  const nav = useNav()
  if (!sheet) return null
  if (sheet === 'manuals') return (
    <Sheet open title="OEM Manuals" onClose={onClose}>
      {['Splendor Plus BS6 – Owner\'s Manual', 'Splendor Plus BS6 – Service Manual', 'Electrical Wiring Diagram'].map((m) => (
        <button key={m} className="sheet-row" onClick={() => { showToast('Manual downloaded (PDF)'); onClose() }}>
          <BookOpen size={20} /> <span>{m}</span> <Download size={18} className="c-orange" />
        </button>
      ))}
    </Sheet>
  )
  if (sheet === 'market') return (
    <Sheet open title="Marketplace (Buy / Sell)" onClose={onClose}>
      {[['Used Headlamp – Splendor', '₹ 420 · Kolkata'], ['Alloy Wheel Set – Pulsar', '₹ 3,200 · Howrah'], ['Rear Shock Pair – Activa', '₹ 950 · Salt Lake']].map(([t, s]) => (
        <button key={t} className="sheet-row" onClick={() => { showToast('Seller contacted'); onClose() }}>
          <Package size={20} /> <span>{t}<small>{s}</small></span> <MessageCircle size={18} className="c-orange" />
        </button>
      ))}
      <button className="btn-orange btn-block mt-12" onClick={() => { showToast('Listing form opened'); onClose() }}>Sell a Part</button>
    </Sheet>
  )
  if (sheet === 'offers') return (
    <Sheet open title="Offers" onClose={onClose}>
      {[['AXFIRST', '10% off on your first order'], ['FREESHIP', 'Free delivery above ₹ 499'], ['GENUINE5', 'Extra 5% on genuine Hero parts']].map(([c, t]) => (
        <button key={c} className="sheet-row" onClick={() => { try { navigator.clipboard?.writeText(c) } catch { /* ignore */ } showToast(`Code ${c} copied`); onClose() }}>
          <BadgePercent size={20} className="c-orange" /> <span>{t}<small>Code: {c}</small></span> <b className="c-orange">COPY</b>
        </button>
      ))}
    </Sheet>
  )
  if (sheet === 'support') return (
    <Sheet open title="Support" onClose={onClose}>
      <a className="sheet-row" href="tel:+918001234567"><Phone size={20} /> <span>Call us<small>1800-123-4567 · 9 AM – 9 PM</small></span></a>
      <a className="sheet-row" href="mailto:support@autorynx.com"><Mail size={20} /> <span>Email<small>support@autorynx.com</small></span></a>
      <button className="sheet-row" onClick={() => { onClose(); nav.push('video') }}><SquarePlay size={20} /> <span>Watch how-to videos<small>Step-by-step installation help</small></span></button>
    </Sheet>
  )
  return null
}

/* ── Explore / search tab ─────────────────────────────── */
const FILTERS = ['All', 'Engine', 'Brake', 'Suspension', 'Electrical', 'Body Parts']
export function Explore() {
  const nav = useNav()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState(() => { try { const f = sessionStorage.getItem('ax-filter'); sessionStorage.removeItem('ax-filter'); return f || 'All' } catch { return 'All' } })
  const list = useMemo(() => CATALOGUE.filter((p) => (filter === 'All' || p.sys === filter) && (!q.trim() || `${p.name} ${p.partNo} ${p.sys}`.toLowerCase().includes(q.trim().toLowerCase()))), [q, filter])
  return (
    <div className="content">
      <header className="tab-header">
        <h1>Explore Parts</h1>
        <label className="search-bar is-input">
          <Search size={19} strokeWidth={2.2} />
          <input autoFocus placeholder="Search parts, vehicle, or OEM no." value={q} onChange={(e) => setQ(e.target.value)} />
          {q && <button onClick={() => setQ('')} aria-label="Clear"><X size={17} /></button>}
        </label>
      </header>
      <div className="light-body">
        <div className="chips">
          {FILTERS.map((f) => <button key={f} className={`chip ${filter === f ? 'is-on' : ''}`} onClick={() => setFilter(f)}>{f}</button>)}
        </div>
        <p className="result-meta">Showing parts for <b>Hero Splendor Plus (BS6)</b> · {list.length} result{list.length === 1 ? '' : 's'}</p>
        <div className="plist">
          {list.map((p) => (
            <button key={p.id} className="pitem" onClick={() => nav.push('part', { id: p.id })}>
              <span className="pitem-img">{p.img ? <img src={p.img} alt="" /> : <Cog size={26} />}</span>
              <span className="pitem-body"><b>{p.name}</b><small>{p.partNo} · {p.sys}</small><em>{inr(p.price)} <s>MRP {inr(p.mrp)}</s></em></span>
              <ArrowRight size={18} className="c-orange" />
            </button>
          ))}
          {!list.length && <div className="empty"><Search size={28} /><b>No parts found</b><span>Try another keyword or category.</span></div>}
        </div>
      </div>
    </div>
  )
}
