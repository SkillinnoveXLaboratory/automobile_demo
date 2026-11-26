import { useEffect, useState } from 'react'
import {
  Check, ChevronDown, CircleDollarSign, Cog, Captions, Maximize, Minimize, Minus, Nut, Pause, Play, Plus, RefreshCcw, Settings,
  ShieldCheck, ShoppingCart, SquarePlay, Star, Zap,
} from 'lucide-react'
import { NavHeader, OptionList, Sheet } from '../components/ui'
import { CATALOGUE, FASTENERS, FASTENER_ICONS, HEADLAMP, STEPS, VIDEOS, fmtTime, inr } from '../data'
import { useNav, useStore, useToast } from '../store'

const product = (id) => {
  const p = CATALOGUE.find((c) => c.id === id) || CATALOGUE[0]
  return { brand: HEADLAMP.brand, compat: HEADLAMP.compat, compatYears: HEADLAMP.compatYears, rating: 4.5, reviews: 118, ...p }
}

/* ── 7. Part details & buy ────────────────────────────── */
export function PartDetails({ params }) {
  const nav = useNav()
  const { dispatch } = useStore()
  const { showToast } = useToast()
  const p = product(params.id)
  const [qty, setQty] = useState(1)
  const off = Math.round(((p.mrp - p.price) / p.mrp) * 100)
  const isHeadlamp = p.id === 'headlamp'

  return (
    <div className="screen navy">
      <NavHeader title="Part Details" />
      <div className="panel content">
        <div className="pd-top">
          <div className="pd-img">{p.img ? <img src={p.img} alt={p.name} /> : <Cog size={46} />}</div>
          <div className="pd-info">
            <h2>{p.name}</h2>
            <dl>
              <dt>Part No.</dt><dd>: {p.partNo}</dd>
              <dt>Brand</dt><dd>: {p.brand}</dd>
              <dt>Compatibility</dt><dd>: {p.compat}<br /><span>{p.compatYears}</span></dd>
            </dl>
            <p className="pd-rating"><Star size={13} fill="#1E9E3E" strokeWidth={0} /> <b>{p.rating}</b> ({p.reviews} Reviews)</p>
          </div>
        </div>
        <div className="pd-price">
          <span className="price">{inr(p.price, true)}</span>
          <span className="mrp">MRP {inr(p.mrp, true)}</span>
          <span className="off">{off}% OFF</span>
        </div>
        <p className="stock"><Check size={18} strokeWidth={3} /> In Stock</p>
        <div className="qty-row">
          <span>Qty:</span>
          <div className="qty">
            <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Minus size={16} strokeWidth={2.6} /></button>
            <span>{qty}</span>
            <button onClick={() => setQty(Math.min(10, qty + 1))} aria-label="Increase"><Plus size={16} strokeWidth={2.6} /></button>
          </div>
        </div>
        <button className="btn-orange btn-block" onClick={() => { dispatch({ type: 'addToCart', id: p.id, qty }); showToast(`${qty} × ${p.name} added to cart`) }}>
          <ShoppingCart size={20} strokeWidth={2} /> Add to Cart
        </button>
        <button className="btn-outline-o btn-block" onClick={() => nav.push('checkout', { items: [{ id: p.id, qty }] })}>
          <Zap size={20} fill="#E8262B" strokeWidth={0} /> Buy Now
        </button>
        <div className="perks">
          <div><ShieldCheck size={26} strokeWidth={1.6} /><span>Warranty<br />6 Months</span></div>
          <div><CircleDollarSign size={26} strokeWidth={1.6} /><span>COD<br />Available</span></div>
          <div><RefreshCcw size={26} strokeWidth={1.6} /><span>Easy Return<br />7 Days</span></div>
        </div>
        {isHeadlamp && (
          <div className="acc">
            <button className="acc-row" onClick={() => nav.push('bolts')}><Nut size={17} strokeWidth={2} /><span>Nut &amp; Bolt Details</span><ChevronDown size={18} strokeWidth={2.4} /></button>
            <button className="acc-row" onClick={() => nav.push('install')}><SquarePlay size={17} strokeWidth={2} /><span>Installation Guide</span><ChevronDown size={18} strokeWidth={2.4} /></button>
            <button className="acc-row" onClick={() => nav.push('video')}><Play size={17} strokeWidth={2} /><span>Video Tutorial</span><ChevronDown size={18} strokeWidth={2.4} /></button>
          </div>
        )}
        <div className="pad-bottom" />
      </div>
    </div>
  )
}

/* ── 8. Nut & bolt information ────────────────────────── */
export function NutBolt() {
  return (
    <div className="screen navy">
      <NavHeader title="Nut & Bolt Details" />
      <div className="panel content">
        <div className="nb-head">
          <img src={HEADLAMP.img} alt="" />
          <h2>{HEADLAMP.name}<br />({HEADLAMP.partNo})</h2>
        </div>
        <div className="table-wrap">
          <table className="nb-table">
            <thead><tr><th>S.No.</th><th>Fastener</th><th>Size</th><th>Qty</th><th>Torque</th></tr></thead>
            <tbody>
              {FASTENERS.map((f) => (
                <tr key={f.sn}><td>{f.sn}</td><td>{f.name}</td><td>{f.size}</td><td>{f.qty}</td><td>{f.torque}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="fast-row">
          {FASTENER_ICONS.map((f) => (
            <div key={f.label.join()} className="fast">
              <img src={f.img} alt="" />
              <span>{f.label[0]}<br />{f.label[1]}</span>
            </div>
          ))}
        </div>
        <div className="note">
          <b>Note:</b>
          <ul>
            <li>Use genuine fasteners for proper fitment.</li>
            <li>Tighten to recommended torque.</li>
            <li>Apply small amount of thread locker (if required).</li>
          </ul>
        </div>
        <div className="pad-bottom" />
      </div>
    </div>
  )
}

/* ── 9. Installation steps ────────────────────────────── */
export function Install() {
  const nav = useNav()
  const { state, dispatch } = useStore()
  const done = state.doneSteps
  return (
    <div className="screen navy">
      <NavHeader title="Installation Guide" />
      <div className="panel content">
        <div className="tabs2">
          <button className="tab2 is-on">Step by Step</button>
          <button className="tab2" onClick={() => nav.replace('video')}>Video</button>
        </div>
        <div className="steps">
          {STEPS.map((s, i) => (
            <button key={i} className={`step ${done.includes(i) ? 'is-done' : ''}`} onClick={() => dispatch({ type: 'toggleStep', i })}>
              <span className="step-num">{done.includes(i) ? <Check size={15} strokeWidth={3.4} /> : i + 1}</span>
              <span className="step-text">{s.text}</span>
              <img src={s.img} alt="" />
            </button>
          ))}
        </div>
        {done.length > 0 && <p className="steps-meta">{done.length} of {STEPS.length} steps completed</p>}
        <div className="pad-bottom" />
      </div>
    </div>
  )
}

/* ── 10. Video tutorial ───────────────────────────────── */
const CAPTIONS = ['Remove the front cowl screws first.', 'Unplug the headlamp wiring connector.', 'Take out the two mounting bolts.', 'Fit the new headlamp on the bracket.', 'Tighten to 8 – 10 N·m and reconnect.']

export function Video() {
  const nav = useNav()
  const [vid, setVid] = useState(VIDEOS[0])
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [cc, setCc] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [sheet, setSheet] = useState(false)
  const [full, setFull] = useState(false)

  useEffect(() => {
    if (!playing) return
    const iv = setInterval(() => setT((x) => {
      const n = x + speed
      if (n >= vid.dur) { setPlaying(false); return vid.dur }
      return n
    }), 1000)
    return () => clearInterval(iv)
  }, [playing, speed, vid])

  const load = (v) => { setVid(v); setT(0); setPlaying(true) }
  const seek = (e) => { const r = e.currentTarget.getBoundingClientRect(); setT(Math.round(((e.clientX - r.left) / r.width) * vid.dur)) }
  const toggle = () => { if (t >= vid.dur) setT(0); setPlaying(!playing) }
  const pct = (t / vid.dur) * 100

  const player = (
    <div className={`player ${vid.id !== 'main' ? 'is-alt' : ''} ${playing ? 'is-playing' : ''}`}>
      <img src={vid.img} alt={vid.title} className="player-img" />
      {vid.id !== 'main' && (
        <div className="player-title"><b>Hero Splendor Plus</b><mark>{vid.title}</mark></div>
      )}
      <button className="player-big" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? <Pause size={26} fill="#fff" strokeWidth={0} /> : vid.id === 'v3' ? <Play size={26} fill="#fff" strokeWidth={0} /> : null}
      </button>
      {cc && playing && <div className="cc-line">{CAPTIONS[Math.min(4, Math.floor((t / vid.dur) * 5))]}</div>}
      <div className="player-ctrl">
        <div className="seek" onClick={seek}><span style={{ width: `${pct}%` }} /><i style={{ left: `${pct}%` }} /></div>
        <div className="ctrl-row">
          <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause size={18} fill="#fff" strokeWidth={0} /> : <Play size={18} fill="#fff" strokeWidth={0} />}</button>
          <span className="ctrl-time">{fmtTime(t)} / {fmtTime(vid.dur)}</span>
          <button onClick={() => setCc(!cc)} className={cc ? 'is-on' : ''} aria-label="Captions"><Captions size={19} /></button>
          <button onClick={() => setSheet(true)} aria-label="Settings"><Settings size={18} /></button>
          <button onClick={() => setFull(!full)} aria-label="Full screen">{full ? <Minimize size={18} /> : <Maximize size={18} />}</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="screen navy">
      <NavHeader title="Installation Video" />
      <div className="panel content">
        {!full && player}
        <h3 className="pv-title">Popular Videos</h3>
        <div className="pv-list">
          {VIDEOS.slice(1).map((v) => (
            <button key={v.id} className={`pv ${vid.id === v.id ? 'is-on' : ''}`} onClick={() => load(v)}>
              <img src={v.img} alt="" />
              <b>{v.title}</b>
              <span>({fmtTime(v.dur)})</span>
            </button>
          ))}
          {vid.id !== 'main' && (
            <button className="pv" onClick={() => load(VIDEOS[0])}>
              <img src={VIDEOS[0].img} alt="" />
              <b>Headlamp Remove &amp; Install</b>
              <span>({fmtTime(VIDEOS[0].dur)})</span>
            </button>
          )}
        </div>
        <div className="pad-bottom" />
      </div>
      {full && <div className="fullview is-video">{player}</div>}
      <Sheet open={sheet} title="Playback speed" onClose={() => setSheet(false)}>
        <OptionList value={speed} onPick={(v) => { setSpeed(v); setSheet(false) }} options={[0.5, 1, 1.5, 2].map((s) => ({ value: s, label: s === 1 ? 'Normal' : `${s}×` }))} />
      </Sheet>
    </div>
  )
}
