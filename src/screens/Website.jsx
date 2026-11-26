import { useRef, useState } from 'react'
import { ArrowRight, Camera, ChevronDown, Cog, FileText, ImageUp, Lock, Search, ShoppingBag, ShoppingCart, User, X, Wrench } from 'lucide-react'
import { LogoInline } from '../components/ui'
import { A, BRANDS } from '../data'
import { useCartCount, useToast } from '../store'

const FEATS = [
  { icon: Camera, title: '3D Vehicle Anatomy', sub: '360° View', go: 'vehicle' },
  { icon: Cog, title: 'Parts with Fitment', sub: '(OEM & Aftermarket)', go: 'explore' },
  { icon: Wrench, title: 'Installation Guide', sub: 'Step by Step', go: 'install' },
  { icon: FileText, title: 'Service Manuals', sub: '(PDF)', toast: 'Service manual PDF downloaded' },
  { icon: ShoppingBag, title: 'Buy & Sell', sub: 'Marketplace', go: 'explore' },
  { icon: ImageUp, title: 'AI Part Search', sub: '(with Image)', ai: true },
]

export default function Website({ openApp }) {
  const { showToast } = useToast()
  const count = useCartCount()
  const [q, setQ] = useState('')
  const [allBrands, setAllBrands] = useState(false)
  const file = useRef(null)

  const feat = (f) => {
    if (f.ai) return file.current?.click()
    if (f.toast) return showToast(f.toast)
    openApp(f.go)
  }
  const onImage = (e) => {
    if (!e.target.files?.[0]) return
    showToast('AI match: Headlamp Assembly (33100-KCC-900) · 96%')
    setTimeout(() => openApp('part'), 900)
    e.target.value = ''
  }

  return (
    <div className="web">
      <div className="web-chrome">
        <span className="wc-dots"><i /><i /><i /></span>
        <span className="wc-url"><Lock size={11} /> www.autorynx.com</span>
        <span className="wc-tab">AUTORYNX – The Complete Automotive Ecosystem</span>
      </div>
      <div className="web-top">
        <header className="web-nav">
          <LogoInline mark={56} word={30} />
          <nav>
            <button onClick={() => openApp('vehicle')}>Two-Wheeler</button>
            <button onClick={() => openApp('vehicle-four')}>Four-Wheeler</button>
            <button onClick={() => openApp('explore')}>Parts <ChevronDown size={13} /></button>
            <button onClick={() => openApp('install')}>Service Guide</button>
            <button onClick={() => openApp('explore')}>Marketplace</button>
            <button onClick={() => showToast('Seller registration opens soon')}>For Sellers</button>
          </nav>
          <button className="web-user" onClick={() => openApp('profile')} aria-label="Account"><User size={18} /></button>
        </header>
        <div className="web-search-row">
          <form className="web-search" onSubmit={(e) => { e.preventDefault(); openApp('explore') }}>
            <input placeholder="Search by Part, Vehicle, OEM No., or Keyword..." value={q} onChange={(e) => setQ(e.target.value)} />
            {q && <button type="button" className="ws-clear" onClick={() => setQ('')} aria-label="Clear"><X size={15} /></button>}
            <button type="submit" className="ws-go" aria-label="Search"><Search size={19} strokeWidth={2.4} /></button>
          </form>
          <button className="web-cart" onClick={() => openApp('cart')} aria-label="Cart"><ShoppingCart size={26} strokeWidth={1.8} />{count > 0 && <span>{count}</span>}</button>
          <button className="web-login" onClick={() => openApp('login')}><User size={20} fill="#fff" strokeWidth={0} /> Login / Sign Up</button>
        </div>
        <section className="web-hero">
          <div className="wh-text">
            <h1>Explore Every Part<br />in Interactive 3D</h1>
            <p>Two-Wheeler | Four-Wheeler | EV</p>
            <button className="btn-orange" onClick={() => openApp('vehicle')}>Select Your Vehicle <ArrowRight size={18} strokeWidth={2.4} /></button>
          </div>
          <img src={A('web-hero')} alt="Vehicle anatomy" />
        </section>
      </div>
      <div className="web-body">
        <div className="web-feats">
          {FEATS.map((f) => (
            <button key={f.title} className="wf" onClick={() => feat(f)}>
              <f.icon size={42} strokeWidth={1.5} />
              <b>{f.title}</b>
              <span>{f.sub}</span>
            </button>
          ))}
          <input ref={file} type="file" accept="image/*" hidden onChange={onImage} />
        </div>
        <div className="web-brands-head">
          <h3>Popular Brands</h3>
          <button onClick={() => setAllBrands(!allBrands)}>{allBrands ? 'Show Less' : 'View All'} <ArrowRight size={15} /></button>
        </div>
        <div className={`web-brands ${allBrands ? 'is-all' : ''}`}>
          {BRANDS.map((b) => <button key={b.name} className="wb" onClick={() => openApp('vehicle')} title={b.name}><img src={b.img} alt={b.name} /></button>)}
          {allBrands && ['Suzuki', 'Kia', 'Toyota', 'Ather', 'Ola Electric'].map((n) => <span key={n} className="wb wb-text">{n}</span>)}
        </div>
      </div>
    </div>
  )
}
