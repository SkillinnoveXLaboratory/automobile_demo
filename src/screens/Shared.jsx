import { useMemo, useState } from 'react'
import {
  BatteryCharging, Bike, Bus, Calculator, Car, Check, CircleCheck, ClipboardList, Clock, Home as HomeIcon,
  ImagePlus, MapPin, Minus, Navigation, Phone, Plus, ScanLine, Search, ShieldCheck, Star, Store, Tractor, Truck, X,
} from 'lucide-react'
import {
  AppBar, BatteryArt, Button, Chips, Empty, Field, KV, PageHeader, Pill, QR, Row, SectionTitle, Select, Sheet, Stepper, TextArea,
} from '../components/ui'
import {
  CLAIM_STAGES, DEALERS, FITMENT, INVERTER_APPLIANCES, PRODUCTS, VEHICLE_TYPES, dealerById, fmtDate, fmtPhone, inr,
  productById, todayISO, warrantyInfo,
} from '../data'
import { DEMO_DEALER_ID, useNav, useStore, useToast } from '../store'
import { claimLabel, claimTone, DEALER_OPTIONS } from './Customer'

const TYPE_ICONS = { '2w': Bike, car: Car, lcv: Truck, truck: Truck, bus: Bus, tractor: Tractor }

/* ── Battery finder (tab) ───────────────────────────── */
export function Finder() {
  const nav = useNav()
  const [type, setType] = useState('car')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [fuel, setFuel] = useState('')
  const [result, setResult] = useState(null)

  const brands = Object.keys(FITMENT[type] || {})
  const models = brand ? Object.keys(FITMENT[type][brand]) : []
  const fuels = brand && model ? Object.keys(FITMENT[type][brand][model]) : []

  const pickType = (t) => { setType(t); setBrand(''); setModel(''); setFuel(''); setResult(null) }
  const pickBrand = (b) => { setBrand(b); setModel(''); setFuel(''); setResult(null) }
  const pickModel = (m) => { setModel(m); const f = Object.keys(FITMENT[type][brand][m]); setFuel(f.length === 1 ? f[0] : ''); setResult(null) }
  const find = () => setResult(productById(FITMENT[type][brand][model][fuel]))

  return (
    <div className="content">
      <PageHeader title="Find battery" subtitle="The right fit for your vehicle" />
      <div className="pad-x">
        <div className="type-grid">
          {VEHICLE_TYPES.map((t) => {
            const Icon = TYPE_ICONS[t.id]
            return (
              <button key={t.id} className={`type-tile ${type === t.id ? 'is-active' : ''}`} onClick={() => pickType(t.id)}>
                <Icon size={22} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        <div className="card stack-16 mt-16">
          <Select label="Manufacturer" value={brand} placeholder="Select brand" options={brands} onChange={pickBrand} />
          <Select label="Model" value={model} placeholder={brand ? 'Select model' : 'Select brand first'} options={models} onChange={pickModel} disabled={!brand} />
          <Select label="Fuel / variant" value={fuel} placeholder={model ? 'Select variant' : 'Select model first'} options={fuels} onChange={(v) => { setFuel(v); setResult(null) }} disabled={!model} />
          <Button icon={Search} onClick={find} disabled={!fuel}>Find my battery</Button>
        </div>

        {result && (
          <div className="mt-16 fade-in">
            <SectionTitle>Recommended for {brand} {model}</SectionTitle>
            <button className="product-card" onClick={() => nav.push('product', { id: result.id, fit: `${brand} ${model} · ${fuel}` })}>
              <div className="product-art" style={{ background: result.color + '14' }}><BatteryArt color={result.color} size={84} label={`${result.ah}Ah`} /></div>
              <div className="product-info">
                <Pill tone="primary">Best fit</Pill>
                <h3>{result.name}</h3>
                <p className="muted small">{result.use}</p>
                <div className="spec-row">
                  <span><b>{result.ah}Ah</b> Capacity</span>
                  <span><b>{result.warranty}m</b> Warranty</span>
                </div>
                <strong className="price">{inr(result.mrp)} <span className="muted xsmall">MRP</span></strong>
              </div>
            </button>
          </div>
        )}

        <button className="promo mt-16" onClick={() => nav.push('inverter')}>
          <span className="promo-icon"><HomeIcon size={22} /></span>
          <span className="promo-body">
            <strong>Need a home inverter battery?</strong>
            <span>Use the backup calculator</span>
          </span>
          <Calculator size={18} />
        </button>

        <SectionTitle>All batteries</SectionTitle>
        <div className="product-grid">
          {PRODUCTS.map((p) => (
            <button key={p.id} className="product-tile" onClick={() => nav.push('product', { id: p.id })}>
              <span className="product-tile-art" style={{ background: p.color + '14' }}><BatteryArt color={p.color} size={56} /></span>
              <strong>{p.name}</strong>
              <span className="muted xsmall">{p.ah}Ah · {p.warranty}m warranty</span>
              <span className="price-sm">{inr(p.mrp)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="bottom-space" />
    </div>
  )
}

/* ── Product detail ─────────────────────────────────── */
export function ProductDetail({ params }) {
  const nav = useNav()
  const p = productById(params.id)
  const near = DEALERS.filter((d) => d.open).slice(0, 3)
  return (
    <div className="screen">
      <AppBar title="Battery details" />
      <div className="content">
        <div className="product-hero" style={{ background: `linear-gradient(160deg, ${p.color}22, ${p.color}08)` }}>
          <BatteryArt color={p.color} size={150} label={`${p.volt}V ${p.ah}Ah`} />
        </div>
        <div className="pad">
          <span className="eyebrow product-eyebrow">{p.series} series</span>
          <h2 className="h2">{p.name}</h2>
          <p className="muted">{p.use}{params.fit ? ` · fits ${params.fit}` : ''}</p>
          <div className="spec-grid">
            <div className="stat"><span>Capacity</span><strong>{p.ah}Ah</strong></div>
            <div className="stat"><span>Voltage</span><strong>{p.volt}V</strong></div>
            <div className="stat"><span>{p.cca ? 'CCA' : 'Type'}</span><strong>{p.cca ?? 'Tubular'}</strong></div>
            <div className="stat"><span>Warranty</span><strong>{p.warranty}m</strong></div>
          </div>
          <div className="price-line">
            <div><span className="muted small">MRP (incl. GST)</span><strong className="price-lg">{inr(p.mrp)}</strong></div>
            <Pill tone="success">In stock nearby</Pill>
          </div>
          <SectionTitle action="All dealers" onAction={() => nav.push('dealers')}>Available at</SectionTitle>
          <div className="list-card">
            {near.map((d) => (
              <Row key={d.id} icon={Store} title={d.name} sub={`${d.area} · ${d.km} km`}
                right={<a className="icon-btn icon-btn-primary" href={`tel:+91${d.phone}`} aria-label={`Call ${d.name}`} onClick={(e) => e.stopPropagation()}><Phone size={17} /></a>} />
            ))}
          </div>
        </div>
        <div className="bottom-space" />
      </div>
      <div className="footer-actions row-2">
        <Button variant="secondary" icon={MapPin} onClick={() => nav.push('dealers')}>Dealers</Button>
        <a className="btn btn-primary btn-block" href={`tel:+91${near[0].phone}`}><Phone size={18} /><span>Call dealer</span></a>
      </div>
    </div>
  )
}

/* ── Inverter calculator ────────────────────────────── */
export function Inverter() {
  const nav = useNav()
  const [qty, setQty] = useState({ bulb: 4, fan: 2, tv: 1, router: 1, laptop: 0, fridge: 0 })
  const [hours, setHours] = useState(4)
  const load = INVERTER_APPLIANCES.reduce((s, a) => s + a.watt * qty[a.id], 0)
  const va = Math.ceil(load / 0.8 / 100) * 100 || 0
  const ah = Math.ceil((load * hours) / (12 * 0.8))
  const rec = ah <= 0 ? null : ah <= 150 ? productById('AC-INV-150') : productById('AC-INV-200')
  const count = rec ? Math.max(1, Math.ceil(ah / rec.ah)) : 0
  const step = (id, d) => setQty({ ...qty, [id]: Math.max(0, Math.min(20, qty[id] + d)) })

  return (
    <div className="screen">
      <AppBar title="Inverter calculator" />
      <div className="content pad">
        <SectionTitle>Appliances to run</SectionTitle>
        <div className="list-card">
          {INVERTER_APPLIANCES.map((a) => (
            <div key={a.id} className="row">
              <span className="row-body">
                <span className="row-title">{a.label}</span>
                <span className="row-sub">{a.watt} W each</span>
              </span>
              <div className="qty">
                <button onClick={() => step(a.id, -1)} aria-label={`Fewer ${a.label}`} disabled={!qty[a.id]}><Minus size={16} /></button>
                <span>{qty[a.id]}</span>
                <button onClick={() => step(a.id, 1)} aria-label={`More ${a.label}`}><Plus size={16} /></button>
              </div>
            </div>
          ))}
        </div>
        <SectionTitle>Backup needed</SectionTitle>
        <Chips items={[2, 3, 4, 6, 8].map((h) => ({ value: h, label: `${h} hrs` }))} value={hours} onChange={setHours} fill />

        <div className="calc-result">
          <div className="calc-stats">
            <div><span>Total load</span><strong>{load} W</strong></div>
            <div><span>Inverter</span><strong>{va} VA</strong></div>
            <div><span>Battery</span><strong>{ah} Ah</strong></div>
          </div>
          {rec ? (
            <button className="calc-rec" onClick={() => nav.push('product', { id: rec.id })}>
              <BatteryArt color={rec.color} size={48} />
              <span>
                <span className="xsmall">Recommended</span>
                <strong>{count} × {rec.name}</strong>
              </span>
              <span className="calc-rec-go">View</span>
            </button>
          ) : <p className="small">Add at least one appliance.</p>}
        </div>
        <p className="xsmall muted mt-8">Estimate assumes 12V system and 80% efficiency. Actual backup varies with usage.</p>
      </div>
    </div>
  )
}

/* ── Dealer & service locator ───────────────────────── */
export function Dealers() {
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('All')
  const list = DEALERS.filter((d) => {
    const t = q.trim().toLowerCase()
    const match = !t || [d.name, d.area, d.city, d.pin].some((x) => x.toLowerCase().includes(t))
    const k = kind === 'All' || (kind === 'Dealers' ? d.kind.includes('Dealer') : d.kind.includes('Service'))
    return match && k
  }).sort((a, b) => a.km - b.km)

  return (
    <div className="screen">
      <AppBar title="Dealers & service" />
      <div className="content pad">
        <Field placeholder="Search city, area or PIN code" value={q} onChange={(e) => setQ(e.target.value)} prefix={<Search size={18} />}
          suffix={q ? <button className="field-suffix-btn" onClick={() => setQ('')} aria-label="Clear"><X size={16} /></button> : null} />
        <div className="mt-12"><Chips items={['All', 'Dealers', 'Service centers']} value={kind} onChange={setKind} scroll={false} /></div>
        <div className="map-strip">
          <MapPin size={16} /> <span>Showing {list.length} near <b>Salt Lake, Kolkata</b></span>
        </div>
        <div className="stack-12">
          {list.length ? list.map((d) => (
            <div key={d.id} className="card dealer-card">
              <div className="row-between">
                <div className="dealer-title">
                  <strong>{d.name}</strong>
                  <span className="muted small">{d.area}, {d.city} {d.pin}</span>
                </div>
                <span className="dealer-km">{d.km} km</span>
              </div>
              <div className="dealer-meta">
                <Pill tone="primary">{d.kind}</Pill>
                <span className="meta"><Star size={13} fill="#F59E0B" strokeWidth={0} /> {d.rating}</span>
                <span className={`meta ${d.open ? 'text-success' : 'text-danger'}`}><Clock size={13} /> {d.open ? 'Open now' : 'Closed'}</span>
              </div>
              <div className="row-2 mt-12">
                <a className="btn btn-secondary btn-sm btn-block" href={`tel:+91${d.phone}`}><Phone size={16} /><span>Call</span></a>
                <a className="btn btn-primary btn-sm btn-block" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.name} ${d.area} ${d.city} ${d.pin}`)}`}><Navigation size={16} /><span>Directions</span></a>
              </div>
            </div>
          )) : <Empty icon={MapPin} title="No dealers found" text="Try another city, area or PIN code." />}
        </div>
      </div>
    </div>
  )
}

/* ── Warranty registration (customer + dealer) ──────── */
export function RegisterWarranty() {
  const { state, dispatch } = useStore()
  const nav = useNav()
  const { showToast } = useToast()
  const isDealer = state.session?.role === 'dealer'
  const [step, setStep] = useState(0)
  const [f, setF] = useState({
    serial: '', productId: '', purchaseDate: todayISO(),
    vehicleId: state.vehicles[0]?.id || '', vehicleText: '', dealerId: isDealer ? DEMO_DEALER_ID : '',
    owner: isDealer ? '' : state.customer.name, ownerPhone: isDealer ? '' : state.customer.phone,
  })
  const [proof, setProof] = useState(null)
  const [err, setErr] = useState({})
  const set = (k, v) => { setF((x) => ({ ...x, [k]: v })); setErr((e) => ({ ...e, [k]: undefined })) }
  const stock = state.inventory.filter((i) => i.status === 'In stock')

  const scan = () => {
    const item = stock[0]
    if (!item) return showToast('No in-stock serials left. Add stock as dealer.', 'error')
    setF((x) => ({ ...x, serial: item.serial, productId: item.productId }))
    setErr({})
    showToast('Serial scanned from battery label')
  }

  const vehicleLabel = () => {
    if (isDealer) return f.vehicleText.trim()
    if (f.vehicleId === 'other') return f.vehicleText.trim()
    const v = state.vehicles.find((x) => x.id === f.vehicleId)
    return v ? `${v.label} · ${v.reg}` : ''
  }

  const validate = (s) => {
    const e = {}
    if (s === 0) {
      const serial = f.serial.trim().toUpperCase()
      if (!/^AC[A-Z0-9]{8,12}$/.test(serial)) e.serial = 'Serial should look like AC45K2511402'
      else if (state.registrations.some((r) => r.serial === serial)) e.serial = 'This serial is already registered'
      if (!f.productId) e.productId = 'Select battery model'
      if (!f.purchaseDate || f.purchaseDate > todayISO()) e.purchaseDate = 'Enter a valid purchase date'
    }
    if (s === 1) {
      if (isDealer) {
        if (f.owner.trim().length < 3) e.owner = 'Enter customer name'
        if (!/^[6-9]\d{9}$/.test(f.ownerPhone)) e.ownerPhone = 'Enter a valid 10-digit number'
      }
      if (!vehicleLabel()) e.vehicle = 'Enter vehicle / usage details'
      if (!f.dealerId) e.dealerId = 'Select the dealer'
    }
    setErr(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate(step)) setStep(step + 1) }
  const submit = () => {
    const id = 'W-' + Math.random().toString(36).slice(2, 7).toUpperCase()
    dispatch({
      type: 'addRegistration',
      reg: { id, serial: f.serial.trim().toUpperCase(), productId: f.productId, vehicle: vehicleLabel(), purchaseDate: f.purchaseDate, dealerId: f.dealerId, owner: f.owner.trim(), ownerPhone: f.ownerPhone, proof: !!proof },
    })
    nav.replace('registered', { id })
  }

  const p = productById(f.productId)
  const vehicleOptions = state.vehicles.map((v) => ({ value: v.id, label: `${v.label} · ${v.reg}` })).concat({ value: 'other', label: 'Other vehicle / inverter' })

  return (
    <div className="screen">
      <AppBar title={isDealer ? 'Customer registration' : 'Register battery'} onBack={step ? () => setStep(step - 1) : undefined} />
      <div className="content pad">
        <Stepper steps={['Battery', isDealer ? 'Customer' : 'Vehicle', 'Confirm']} current={step} />

        {step === 0 && (
          <div className="stack-16 fade-in">
            <Field label="Battery serial number" placeholder="e.g. AC45K2511402" value={f.serial}
              onChange={(e) => set('serial', e.target.value.toUpperCase().replace(/\s/g, ''))} error={err.serial}
              hint="Printed on the battery label, below the barcode"
              suffix={<button type="button" className="field-scan" onClick={scan}><ScanLine size={16} /> Scan</button>} />
            <Select label="Battery model" value={f.productId} placeholder="Select model" onChange={(v) => set('productId', v)} error={err.productId}
              options={PRODUCTS.map((x) => ({ value: x.id, label: `${x.name} · ${x.warranty}m warranty` }))} />
            <Field label="Purchase date" type="date" max={todayISO()} value={f.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} error={err.purchaseDate} />
          </div>
        )}

        {step === 1 && (
          <div className="stack-16 fade-in">
            {isDealer && (
              <>
                <Field label="Customer name" value={f.owner} onChange={(e) => set('owner', e.target.value)} error={err.owner} placeholder="Full name" />
                <Field label="Customer mobile" prefix="+91" inputMode="numeric" maxLength={10} value={f.ownerPhone} onChange={(e) => set('ownerPhone', e.target.value.replace(/\D/g, ''))} error={err.ownerPhone}
                  hint="Use 9876543210 to see it in the demo customer app" />
              </>
            )}
            {isDealer ? (
              <Field label="Vehicle number / details" placeholder="e.g. Tata Nexon · WB 20 C 1182" value={f.vehicleText} onChange={(e) => set('vehicleText', e.target.value)} error={err.vehicle} />
            ) : (
              <>
                <Select label="Vehicle" value={f.vehicleId} onChange={(v) => set('vehicleId', v)} options={vehicleOptions} error={f.vehicleId !== 'other' ? err.vehicle : undefined} />
                {f.vehicleId === 'other' && <Field label="Vehicle number / usage" placeholder="e.g. Home Inverter · New Town" value={f.vehicleText} onChange={(e) => set('vehicleText', e.target.value)} error={err.vehicle} />}
              </>
            )}
            {isDealer
              ? <Field label="Dealer" value={dealerById(DEMO_DEALER_ID).name} readOnly prefix={<Store size={18} />} />
              : <Select label="Purchased from (dealer)" value={f.dealerId} placeholder="Select dealer" onChange={(v) => set('dealerId', v)} error={err.dealerId} options={DEALER_OPTIONS} />}
            <div className="field">
              <span className="field-label">Purchase proof (invoice photo)</span>
              {proof ? (
                <div className="proof">
                  <img src={proof} alt="Invoice" />
                  <span className="proof-body"><strong>invoice.jpg</strong><span className="xsmall text-success">Uploaded</span></span>
                  <button className="icon-btn icon-btn-soft" onClick={() => setProof(null)} aria-label="Remove"><X size={16} /></button>
                </div>
              ) : (
                <label className="upload">
                  <ImagePlus size={24} />
                  <strong>Upload invoice</strong>
                  <span className="xsmall muted">JPG or PNG · optional for demo</span>
                  <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && setProof(URL.createObjectURL(e.target.files[0]))} />
                </label>
              )}
            </div>
          </div>
        )}

        {step === 2 && p && (
          <div className="fade-in">
            <div className="confirm-head">
              <BatteryArt color={p.color} size={64} />
              <div>
                <h3>{p.name}</h3>
                <p className="muted small">{p.warranty}-month warranty · {p.volt}V {p.ah}Ah</p>
              </div>
            </div>
            <div className="card">
              <KV label="Serial number" value={f.serial} />
              <KV label="Purchase date" value={fmtDate(f.purchaseDate)} />
              <KV label="Warranty till" value={fmtDate(warrantyInfo({ productId: f.productId, purchaseDate: f.purchaseDate }).end)} />
              <KV label="Owner" value={`${f.owner} · ${fmtPhone(f.ownerPhone)}`} />
              <KV label="Vehicle" value={vehicleLabel()} />
              <KV label="Dealer" value={dealerById(f.dealerId)?.name} />
              <KV label="Purchase proof" value={proof ? 'Attached' : 'Not attached'} />
            </div>
            <p className="xsmall muted mt-12">By submitting, you confirm the details are correct. A digital warranty card with QR code will be generated instantly.</p>
          </div>
        )}
      </div>
      <div className="footer-actions">
        {step < 2 ? <Button onClick={next}>Continue</Button> : <Button icon={ShieldCheck} onClick={submit}>Generate warranty card</Button>}
      </div>
    </div>
  )
}

export function Registered({ params }) {
  const { state } = useStore()
  const nav = useNav()
  const reg = state.registrations.find((r) => r.id === params.id)
  const isDealer = state.session?.role === 'dealer'
  if (!reg) return null
  const w = warrantyInfo(reg)
  return (
    <div className="screen">
      <div className="content pad success-screen">
        <span className="success-badge"><Check size={34} strokeWidth={3} /></span>
        <h1 className="auth-title center">Warranty activated!</h1>
        <p className="auth-sub center">{w.product.name} is covered till <b className="ink">{fmtDate(w.end)}</b>.</p>
        <div className="card center">
          <QR value={reg.id + reg.serial} size={128} />
          <p className="small mt-8"><b>{reg.id}</b> · {reg.serial}</p>
          {isDealer && <Pill tone="success">+50 reward points credited</Pill>}
        </div>
      </div>
      <div className="footer-actions">
        {isDealer
          ? <Button onClick={() => nav.popToRoot()}>Back to dashboard</Button>
          : <Button onClick={() => nav.replace('warranty', { id: reg.id })}>View warranty card</Button>}
        <Button variant="ghost" onClick={() => nav.switchTab('home')}>{isDealer ? 'Done' : 'Go to home'}</Button>
      </div>
    </div>
  )
}

/* ── Claim detail + tracking (customer view / dealer actions) ── */
export function ClaimDetail({ params }) {
  const { state, dispatch } = useStore()
  const nav = useNav()
  const { showToast } = useToast()
  const isDealer = state.session?.role === 'dealer'
  const claim = state.claims.find((c) => c.id === params.id)
  const [decide, setDecide] = useState(false)
  const [remark, setRemark] = useState('')
  const [loanerOpen, setLoanerOpen] = useState(false)
  const reg = claim && state.registrations.find((r) => r.id === claim.regId)
  const timeline = useMemo(() => {
    if (!claim) return []
    return CLAIM_STAGES.map((s, i) => {
      const h = claim.history.filter((x) => x.stage === i).pop()
      let label = s
      if (i === 3) label = claim.stage >= 3 ? (claim.decision === 'rejected' ? 'Claim Rejected' : 'Replacement Approved') : 'Replacement Decision'
      return { label, h, done: i <= claim.stage, current: i === claim.stage, rejected: i >= 3 && claim.decision === 'rejected' && i <= claim.stage }
    })
  }, [claim])
  if (!claim) return <div className="screen"><AppBar title="Claim" /><Empty icon={ClipboardList} title="Claim not found" /></div>
  const p = productById(reg.productId)
  const dealer = dealerById(claim.dealerId)

  const advance = (decision, note) => {
    dispatch({ type: 'advanceClaim', id: claim.id, decision, note })
    showToast('Claim status updated')
  }
  const nextLabel = ['Start review', 'Start technical testing', null, 'Mark completed'][claim.stage]
  const nextNote = ['Documents verified by dealer', 'Battery under load & discharge test', null, claim.decision === 'rejected' ? 'Battery returned to customer' : 'Replacement battery handed over'][claim.stage]

  return (
    <div className="screen">
      <AppBar title="Claim status" />
      <div className="content pad">
        {params.fresh && (
          <div className="banner banner-success"><CircleCheck size={18} /><span>Claim submitted. We'll notify you on every update.</span></div>
        )}
        <div className="card">
          <div className="row-between">
            <div>
              <span className="muted xsmall">Claim ID</span>
              <h3 className="claim-big">{claim.id}</h3>
            </div>
            <Pill tone={claimTone(claim)}>{claimLabel(claim)}</Pill>
          </div>
          <div className="claim-main mt-12">
            <BatteryArt color={p.color} size={44} />
            <div>
              <strong className="ink">{p.name}</strong>
              <p className="muted small">{reg.vehicle}</p>
            </div>
          </div>
        </div>

        <SectionTitle>Tracking</SectionTitle>
        <div className="card timeline">
          {timeline.map((t, i) => (
            <div key={i} className={`tl-item ${t.done ? 'is-done' : ''} ${t.current ? 'is-current' : ''} ${t.rejected ? 'is-rejected' : ''}`}>
              <span className="tl-dot">{t.done ? (t.rejected ? <X size={12} strokeWidth={3} /> : <Check size={12} strokeWidth={3} />) : null}</span>
              <div className="tl-body">
                <strong>{t.label}</strong>
                {t.h ? <span className="xsmall muted">{t.h.note} · {fmtDate(t.h.at)}</span> : <span className="xsmall muted">Pending</span>}
              </div>
            </div>
          ))}
        </div>

        {claim.loaner && (
          <>
            <SectionTitle>Standby battery</SectionTitle>
            <div className="card loaner">
              <span className="row-icon row-icon-warning"><BatteryCharging size={19} /></span>
              <div className="row-body">
                <span className="row-title">{claim.loaner.model} (loaner)</span>
                <span className="row-sub">Issued {fmtDate(claim.loaner.issued)}</span>
                <span className="row-sub">Return by {fmtDate(claim.loaner.due)}</span>
              </div>
              <Pill tone={claim.loaner.returned ? 'success' : 'warning'}>{claim.loaner.returned ? 'Returned' : 'With customer'}</Pill>
            </div>
          </>
        )}

        <SectionTitle>Details</SectionTitle>
        <div className="card">
          <KV label="Problem" value={claim.issue} />
          {claim.note && <KV label="Description" value={claim.note} />}
          <KV label="Photos" value={`${claim.photos} attached`} />
          <KV label="Raised on" value={fmtDate(claim.createdAt)} />
          {isDealer ? <KV label="Customer" value={`${reg.owner} · ${fmtPhone(reg.ownerPhone)}`} /> : <KV label="Service at" value={dealer.name} />}
          <KV label="Serial" value={reg.serial} />
        </div>

        {!isDealer && (
          <div className="mt-16">
            <a className="btn btn-secondary btn-block" href={`tel:+91${dealer.phone}`}><Phone size={18} /><span>Call {dealer.name}</span></a>
            {claim.stage < 4 && <p className="xsmall muted center mt-12">Demo tip: log in as Dealer (DL-1024) to move this claim forward.</p>}
          </div>
        )}
        <div className="bottom-space" />
      </div>

      {isDealer && claim.stage < 4 && (
        <div className="footer-actions">
          {!claim.loaner && claim.stage >= 1 && claim.stage < 4 && (
            <Button variant="secondary" icon={BatteryCharging} onClick={() => setLoanerOpen(true)}>Issue loaner battery</Button>
          )}
          {claim.stage === 2
            ? <Button onClick={() => setDecide(true)}>Record test decision</Button>
            : <Button onClick={() => advance(null, nextNote)}>{nextLabel}</Button>}
        </div>
      )}

      <Sheet open={decide} onClose={() => setDecide(false)} title="Test decision">
        <div className="stack-16">
          <TextArea label="Remarks" placeholder="e.g. Cell 4 dead, replacement approved" value={remark} onChange={(e) => setRemark(e.target.value)} />
          <div className="row-2">
            <Button variant="danger-soft" onClick={() => { advance('rejected', remark || 'Battery found healthy, misuse detected'); setDecide(false) }}>Reject</Button>
            <Button onClick={() => { advance('approved', remark || 'Manufacturing defect found'); setDecide(false) }}>Approve</Button>
          </div>
        </div>
      </Sheet>

      <Sheet open={loanerOpen} onClose={() => setLoanerOpen(false)} title="Issue loaner battery">
        <div className="stack-16">
          <p className="small muted">A standby battery will be recorded against this claim with a return date of 10 days.</p>
          <Button onClick={() => {
            const due = new Date(); due.setDate(due.getDate() + 10)
            dispatch({ type: 'issueLoaner', id: claim.id, model: 'Drive 35Ah', due: due.toISOString().slice(0, 10) })
            setLoanerOpen(false); showToast('Loaner battery issued')
          }}>Issue Drive 35Ah</Button>
        </div>
      </Sheet>
    </div>
  )
}
