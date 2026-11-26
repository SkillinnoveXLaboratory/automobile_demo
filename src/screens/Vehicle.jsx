import { useRef, useState } from 'react'
import { ArrowRight, Maximize, Minimize, Move, RotateCw, ScanEye, ShoppingCart, ZoomIn } from 'lucide-react'
import { NavHeader, OptionList, SelectBox, Sheet } from '../components/ui'
import { A, CATALOGUE, EXPLODED, HEADLAMP, SYSTEMS, VEHICLES, inr } from '../data'
import { useNav, useStore, useToast } from '../store'

export const vehicleInfo = (v) => {
  const brand = VEHICLES[v.type].brands.find((b) => b.id === v.brand) || VEHICLES[v.type].brands[0]
  const model = brand.models.find((m) => m.id === v.model) || brand.models[0]
  const variant = model.variants.includes(v.variant) ? v.variant : model.variants[0]
  return { brand, model, variant }
}

/* ── 4. Vehicle selection ─────────────────────────────── */
export function VehicleSelect() {
  const nav = useNav()
  const { state, dispatch } = useStore()
  const { showToast } = useToast()
  const v = state.vehicle
  const { brand, model, variant } = vehicleInfo(v)
  const [sheet, setSheet] = useState(null)
  const isTwo = v.type === 'two'
  const set = (data) => dispatch({ type: 'setVehicle', data })

  const switchType = (type) => {
    if (type === v.type) return
    const b = VEHICLES[type].brands[0]
    set({ type, brand: b.id, model: b.models[0].id, variant: b.models[0].variants[0] })
  }
  const explore = () => {
    if (!model.available) return showToast(`3D anatomy for ${brand.name} ${model.name} is coming soon`)
    set({ brand: brand.id, model: model.id, variant })
    nav.push('anatomy')
  }

  return (
    <div className="screen navy">
      <NavHeader title="Select Vehicle" />
      <div className="seg">
        <button className={`seg-btn ${isTwo ? 'is-on' : ''}`} onClick={() => switchType('two')}>Two-Wheeler</button>
        <button className={`seg-btn ${!isTwo ? 'is-on' : ''}`} onClick={() => switchType('four')}>Four-Wheeler</button>
      </div>
      <div className="content">
        <div className="vs-card">
          <SelectBox label="Select Brand" onClick={() => setSheet('brand')}>
            <img src={brand.id === 'hero' ? A('hero-logo') : brand.logo} alt="" className={brand.id === 'hero' ? 'vs-brand-mark' : 'vs-brand-logo'} />
            <b className="vs-brand">{brand.name}</b>
          </SelectBox>
          <SelectBox label="Select Model" onClick={() => setSheet('model')}>
            <img src={isTwo ? A('select-bike') : A('select-car')} alt="" className="vs-model-thumb" />
            <b className="vs-model">{model.name}</b>
          </SelectBox>
          <SelectBox label="Select Variant" onClick={() => setSheet('variant')}>
            <span className="vs-variant"><b>{variant.split(' ')[0]}</b>&nbsp;&nbsp;{variant.split(' ').slice(1).join(' ')}</span>
          </SelectBox>
          <div className="vs-visual">
            <img src={isTwo ? A('select-bike') : A('select-car')} alt={`${brand.name} ${model.name}`} className={isTwo ? '' : 'is-car'} />
          </div>
          <button className={`btn-orange btn-block ${model.available ? '' : 'is-soon'}`} onClick={explore}>
            {model.available ? <>Explore Anatomy <ArrowRight size={18} strokeWidth={2.4} /></> : '3D Model Coming Soon'}
          </button>
        </div>
      </div>

      <Sheet open={sheet === 'brand'} title="Select Brand" onClose={() => setSheet(null)}>
        <OptionList value={brand.id} onPick={(id) => { const b = VEHICLES[v.type].brands.find((x) => x.id === id); set({ brand: id, model: b.models[0].id, variant: b.models[0].variants[0] }); setSheet(null) }}
          options={VEHICLES[v.type].brands.map((b) => ({ value: b.id, label: b.name, icon: b.logo }))} />
      </Sheet>
      <Sheet open={sheet === 'model'} title="Select Model" onClose={() => setSheet(null)}>
        <OptionList value={model.id} onPick={(id) => { const m = brand.models.find((x) => x.id === id); set({ model: id, variant: m.variants[0] }); setSheet(null) }}
          options={brand.models.map((m) => ({ value: m.id, label: m.name, note: m.available ? '3D ready' : 'Coming soon' }))} />
      </Sheet>
      <Sheet open={sheet === 'variant'} title="Select Variant" onClose={() => setSheet(null)}>
        <OptionList value={variant} onPick={(val) => { set({ variant: val }); setSheet(null) }} options={model.variants.map((x) => ({ value: x, label: x }))} />
      </Sheet>
    </div>
  )
}

/* ── 5. 3D vehicle anatomy ────────────────────────────── */
const HOTSPOTS = [
  { id: 'seat', label: 'Seat Assembly', x: 23.4, y: 35.8, part: 'seat' },
  { id: 'exhaust', label: 'Exhaust Muffler', x: 14.7, y: 69.9 },
  { id: 'headlamp', label: 'Headlamp Assembly', x: 81, y: 37, exploded: true },
]

export function Anatomy() {
  const nav = useNav()
  const { state } = useStore()
  const { showToast } = useToast()
  const { brand, model, variant } = vehicleInfo(state.vehicle)
  const [rot, setRot] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [pan, setPan] = useState({ on: false, x: 0, y: 0 })
  const [auto, setAuto] = useState(false)
  const [hot, setHot] = useState(null)
  const [sys, setSys] = useState(null)
  const drag = useRef(null)

  const down = (e) => { setAuto(false); drag.current = { x: e.clientX, y: e.clientY, rot, px: pan.x, py: pan.y }; e.currentTarget.setPointerCapture?.(e.pointerId) }
  const move = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y
    if (pan.on) setPan((p) => ({ ...p, x: Math.max(-90, Math.min(90, drag.current.px + dx)), y: Math.max(-60, Math.min(60, drag.current.py + dy)) }))
    else setRot(Math.max(-35, Math.min(35, drag.current.rot + dx * 0.25)))
  }
  const up = () => { drag.current = null }

  const openHot = (h) => {
    if (hot === h.id) {
      if (h.exploded) return nav.push('exploded')
      if (h.part) return nav.push('part', { id: h.part })
      return showToast(`${h.label}: detailed 3D model coming soon`)
    }
    setHot(h.id)
  }
  const pickPart = (name) => {
    setSys(null)
    if (name === 'Headlamp Assembly') return nav.push('exploded')
    const p = CATALOGUE.find((c) => name.startsWith(c.name.split(' (')[0]) || c.name.startsWith(name.split(' (')[0]))
    if (p) return nav.push('part', { id: p.id })
    showToast(`${name}: coming soon in this demo`)
  }

  const tf = `translate(${pan.x}px, ${pan.y}px) perspective(900px) rotateY(${rot}deg) scale(${zoom ? 1.38 : 1})`
  const system = SYSTEMS.find((s) => s.id === sys)

  return (
    <div className="screen navy anatomy">
      <NavHeader title={`${brand.name} ${model.name} (${variant.split(' ')[0]})`} sub="3D Anatomy" />
      <div className="content">
        <div className={`stage3d ${pan.on ? 'is-pan' : ''}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <div className={`model ${auto ? 'is-auto' : ''}`} style={auto ? undefined : { transform: tf }}>
            <img src={A('anatomy-bike')} alt="3D model" draggable={false} />
            {HOTSPOTS.map((h) => (
              <button key={h.id} className={`hotspot ${hot === h.id ? 'is-on' : ''}`} style={{ left: `${h.x}%`, top: `${h.y}%` }}
                onPointerDown={(e) => e.stopPropagation()} onClick={() => openHot(h)} aria-label={h.label}>
                <span className="hs-dot" />
                {hot === h.id && <span className="hs-tip">{h.label} <ArrowRight size={12} strokeWidth={3} /></span>}
              </button>
            ))}
          </div>
        </div>
        <div className="tools">
          <button className={`tool ${auto ? 'is-on' : ''}`} onClick={() => { setAuto(!auto); setRot(0) }}><RotateCw size={15} strokeWidth={2.2} />Rotate</button>
          <button className={`tool ${zoom ? 'is-on' : ''}`} onClick={() => setZoom(!zoom)}><ZoomIn size={15} strokeWidth={2.2} />Zoom</button>
          <button className={`tool ${pan.on ? 'is-on' : ''}`} onClick={() => setPan((p) => (p.on ? { on: false, x: 0, y: 0 } : { ...p, on: true }))}><Move size={15} strokeWidth={2.2} />Pan</button>
          <button className="tool" onClick={() => showToast('AR view opens the camera on a real device')}><ScanEye size={15} strokeWidth={2.2} />AR</button>
        </div>
        <h3 className="sys-title">Major Systems</h3>
        <div className="sys-grid">
          {SYSTEMS.map((s) => (
            <button key={s.id} className="sys" onClick={() => setSys(s.id)}>
              <img src={s.img} alt="" />
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>
      <Sheet open={!!system} title={system ? `${system.name} Parts` : ''} onClose={() => setSys(null)}>
        {system?.parts.map((p) => (
          <button key={p} className="sheet-row" onClick={() => pickPart(p)}>
            <img src={system.img} alt="" className="sheet-thumb" /> <span>{p}<small>{brand.name} {model.name}</small></span> <ArrowRight size={18} className="c-orange" />
          </button>
        ))}
      </Sheet>
    </div>
  )
}

/* ── 6. Exploded view ─────────────────────────────────── */
const MARKERS = [
  { n: 1, x: 14.1, y: 21.6 }, { n: 2, x: 34.7, y: 11.4 }, { n: 3, x: 80.5, y: 6.8 },
  { n: 6, x: 42.2, y: 94 }, { n: 6, x: 58.4, y: 91.5 }, { n: 6, x: 74.2, y: 81 },
]
const GHOST = { 4: { x: 58, y: 44 }, 5: { x: 92, y: 50 } } // parts without a printed marker

export function Exploded() {
  const nav = useNav()
  const { dispatch } = useStore()
  const { showToast } = useToast()
  const [sel, setSel] = useState(null)
  const [full, setFull] = useState(false)
  const view = (
    <div className="exp-img">
      <img src={A('exploded')} alt="Headlamp exploded view" draggable={false} />
      {MARKERS.map((m, i) => (
        <button key={i} className={`exp-hit ${sel === m.n ? 'is-on' : ''}`} style={{ left: `${m.x}%`, top: `${m.y}%` }} onClick={() => setSel(m.n)} aria-label={`Part ${m.n}`} />
      ))}
      {GHOST[sel] && <span className="exp-ghost" style={{ left: `${GHOST[sel].x}%`, top: `${GHOST[sel].y}%` }}>{sel}</span>}
    </div>
  )
  return (
    <div className="screen navy exploded">
      <NavHeader center title="Headlamp Assembly" sub="(Exploded View)"
        right={<button className="icon-plain" onClick={() => setFull(true)} aria-label="Full screen"><Maximize size={22} strokeWidth={1.8} /></button>} />
      <div className="content">
        {view}
        <div className="exp-list">
          {EXPLODED.map((p) => (
            <button key={p.n} className={`exp-row ${sel === p.n ? 'is-on' : ''}`} onClick={() => setSel(sel === p.n ? null : p.n)}>
              <span className="num">{p.n}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>
      {sel && (
        <div className="exp-bar">
          <span><b>{HEADLAMP.name}</b><small>Includes part {sel} · {inr(HEADLAMP.price)}</small></span>
          <button className="exp-bar-cart" onClick={() => { dispatch({ type: 'addToCart', id: 'headlamp', qty: 1 }); showToast('Added to cart') }} aria-label="Add to cart"><ShoppingCart size={18} /></button>
          <button className="btn-orange btn-sm" onClick={() => nav.push('part', { id: 'headlamp' })}>View Part</button>
        </div>
      )}
      {full && (
        <div className="fullview" onClick={() => setFull(false)}>
          <button className="fullview-close" aria-label="Exit full screen"><Minimize size={22} /></button>
          <div className="fullview-inner" onClick={(e) => e.stopPropagation()}>{view}</div>
        </div>
      )}
    </div>
  )
}
