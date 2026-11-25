import { useState } from 'react'
import {
  Bell, Calculator, Car, ChevronRight, ClipboardList, Download, Globe, Info, LogOut, MapPin,
  MessageCircle, Plus, RefreshCw, Search, Settings as SettingsIcon, Share2, ShieldCheck, User, Wrench, Zap,
} from 'lucide-react'
import {
  AppBar, Avatar, BatteryArt, Button, Chips, Empty, Field, IconButton, KV, MenuRow, PageHeader, Pill, ProfileHero, Progress, QR, Row,
  SectionTitle, Select, Sheet, Toggle, qrSvgString,
} from '../components/ui'
import { CLAIM_STAGES, DEALERS, ISSUE_TYPES, VEHICLE_TYPES, dealerById, fmtDate, fmtPhone, nowStamp, productById, todayISO, warrantyInfo } from '../data'
import { useNav, useStore, useToast } from '../store'

const myRegs = (s) => s.registrations.filter((r) => r.ownerPhone === s.customer.phone)
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }

export const claimTone = (c) => (c.stage === 4 ? (c.decision === 'rejected' ? 'danger' : 'success') : c.stage === 3 ? (c.decision === 'rejected' ? 'danger' : 'success') : 'warning')
export const claimLabel = (c) => (c.stage === 3 || c.stage === 4) && c.decision === 'rejected' ? 'Rejected' : c.stage === 3 ? 'Approved' : CLAIM_STAGES[c.stage]

/* ── Home ───────────────────────────────────────────── */
export function Home() {
  const { state } = useStore()
  const nav = useNav()
  const regs = myRegs(state)
  const active = regs.map((r) => ({ r, w: warrantyInfo(r) })).filter((x) => x.w.active)
  const hero = active[0]
  const openClaim = state.claims.find((c) => c.stage < 4 && regs.some((r) => r.id === c.regId))
  const unread = state.notifications.some((n) => n.to === 'customer' && !n.read)
  const first = state.customer.name.split(' ')[0]

  const actions = [
    { label: 'Register', icon: Plus, go: () => nav.push('register') },
    { label: 'Find battery', icon: Search, go: () => nav.switchTab('finder') },
    { label: 'Claim', icon: Wrench, go: () => nav.push('newClaim') },
    { label: 'Dealers', icon: MapPin, go: () => nav.push('dealers') },
  ]

  return (
    <div className="content">
      <header className="home-head">
        <Avatar name={state.customer.name} size={44} tone="light" />
        <div className="home-hello">
          <span className="small">{greeting()}</span>
          <strong>{first} 👋</strong>
        </div>
        <IconButton icon={Bell} badge={unread} label="Notifications" tone="soft" onClick={() => nav.push('notifications')} />
      </header>

      <div className="pad-x hero-overlap">
        {hero ? (
          <button className="hero-card hero-light" onClick={() => nav.push('warranty', { id: hero.r.id })}>
            <div className="hero-top">
              <div>
                <span className="hero-eyebrow">Active warranty</span>
                <h3 className="hero-title">{hero.w.product.name}</h3>
                <span className="hero-sub">{hero.r.vehicle}</span>
              </div>
              <BatteryArt color={hero.w.product.color} size={58} />
            </div>
            <div className="hero-meta">
              <span>{hero.w.leftLabel}</span>
              <span>Ends {fmtDate(hero.w.end)}</span>
            </div>
            <div className="hero-progress"><span style={{ width: `${hero.w.pct}%` }} /></div>
            <span className="hero-cta">View warranty card <ChevronRight size={16} /></span>
          </button>
        ) : (
          <div className="card center">
            <p className="muted">No active warranty yet.</p>
            <Button onClick={() => nav.push('register')} icon={Plus}>Register a battery</Button>
          </div>
        )}
      </div>

      <div className="quick-grid pad-x">
        {actions.map((a) => (
          <button key={a.label} className="quick" onClick={a.go}>
            <span className="quick-icon"><a.icon size={22} /></span>
            <span className="quick-label">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="stats pad-x">
        <div className="stat"><span>Batteries</span><strong>{regs.length}</strong></div>
        <div className="stat"><span>Active</span><strong>{active.length}</strong></div>
        <div className="stat"><span>Open claims</span><strong>{state.claims.filter((c) => c.stage < 4 && regs.some((r) => r.id === c.regId)).length}</strong></div>
      </div>

      {openClaim && (
        <div className="pad-x">
          <SectionTitle action="See all" onAction={() => nav.switchTab('claims')}>Claim in progress</SectionTitle>
          <button className="card card-tap" onClick={() => nav.push('claim', { id: openClaim.id })}>
            <div className="row-between">
              <div>
                <strong className="ink">{openClaim.id}</strong>
                <p className="muted small">{openClaim.issue}</p>
              </div>
              <Pill tone={claimTone(openClaim)}>{claimLabel(openClaim)}</Pill>
            </div>
            <div className="mini-steps">
              {CLAIM_STAGES.map((s, i) => <span key={s} className={i <= openClaim.stage ? 'is-done' : ''} />)}
            </div>
            <p className="muted xsmall">Step {openClaim.stage + 1} of {CLAIM_STAGES.length} · {CLAIM_STAGES[openClaim.stage]}</p>
          </button>
        </div>
      )}

      <div className="pad-x">
        <button className="promo" onClick={() => nav.push('inverter')}>
          <span className="promo-icon"><Calculator size={22} /></span>
          <span className="promo-body">
            <strong>Inverter backup calculator</strong>
            <span>Find the right battery for your home in 30 sec</span>
          </span>
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="pad-x">
        <SectionTitle action="See all" onAction={() => nav.switchTab('warranty')}>My batteries</SectionTitle>
        <div className="list-card">
          {regs.slice(0, 3).map((r) => <RegRow key={r.id} reg={r} />)}
        </div>
      </div>
      <div className="bottom-space" />
    </div>
  )
}

export function RegRow({ reg, onClick }) {
  const nav = useNav()
  const w = warrantyInfo(reg)
  return (
    <button className="reg-row" onClick={onClick || (() => nav.push('warranty', { id: reg.id }))}>
      <BatteryArt color={w.product.color} size={46} />
      <span className="reg-body">
        <span className="reg-title">{w.product.name}</span>
        <span className="reg-sub">{reg.vehicle}</span>
        <span className="reg-bar"><Progress value={w.pct} tone={w.active ? 'primary' : 'muted'} /></span>
      </span>
      <span className="reg-right">
        <Pill tone={w.active ? 'success' : 'danger'}>{w.active ? 'Active' : 'Expired'}</Pill>
        <span className="xsmall muted">{w.active ? w.leftLabel : fmtDate(w.end)}</span>
      </span>
    </button>
  )
}

/* ── Warranties tab ─────────────────────────────────── */
export function Warranties() {
  const { state } = useStore()
  const nav = useNav()
  const [filter, setFilter] = useState('All')
  const regs = myRegs(state).filter((r) => {
    const a = warrantyInfo(r).active
    return filter === 'All' || (filter === 'Active' ? a : !a)
  })
  return (
    <div className="content">
      <PageHeader title="Warranty" subtitle="Your registered batteries" right={<IconButton icon={Plus} label="Register battery" tone="soft" onClick={() => nav.push('register')} />} />
      <div className="pad-x"><Chips items={['All', 'Active', 'Expired']} value={filter} onChange={setFilter} /></div>
      <div className="pad-x mt-16">
        {regs.length ? (
          <div className="list-card">{regs.map((r) => <RegRow key={r.id} reg={r} />)}</div>
        ) : (
          <Empty icon={ShieldCheck} title={`No ${filter.toLowerCase()} warranties`} text="Register a battery to get a digital warranty card." action={<Button size="sm" block={false} icon={Plus} onClick={() => nav.push('register')}>Register battery</Button>} />
        )}
      </div>
      <div className="pad-x mt-16">
        <Button variant="outline" icon={Plus} onClick={() => nav.push('register')}>Register new battery</Button>
      </div>
      <div className="bottom-space" />
    </div>
  )
}

/* ── Warranty certificate ───────────────────────────── */
export function WarrantyDetail({ params }) {
  const { state } = useStore()
  const nav = useNav()
  const { showToast } = useToast()
  const reg = state.registrations.find((r) => r.id === params.id)
  if (!reg) return <div className="screen"><AppBar title="Warranty" /><Empty icon={ShieldCheck} title="Not found" /></div>
  const w = warrantyInfo(reg)
  const dealer = dealerById(reg.dealerId)
  const claim = state.claims.find((c) => c.regId === reg.id && c.stage < 4)

  const download = () => {
    const win = window.open('', '_blank')
    if (!win) return showToast('Allow pop-ups to download the PDF', 'error')
    win.document.write(certificateHtml(reg, w, dealer))
    win.document.close()
    setTimeout(() => win.print(), 400)
    showToast('Choose "Save as PDF" to download')
  }
  const share = async () => {
    const text = `AmpCare warranty ${reg.id} · ${w.product.name} · valid till ${fmtDate(w.end)}`
    try {
      if (navigator.share) await navigator.share({ title: 'Warranty card', text })
      else { await navigator.clipboard.writeText(text); showToast('Warranty details copied') }
    } catch { /* cancelled */ }
  }

  return (
    <div className="screen">
      <AppBar title="Warranty card" right={<IconButton icon={Share2} label="Share" onClick={share} />} />
      <div className="content pad">
        <div className="cert">
          <div className="cert-head">
            <span className="cert-brand"><Zap size={14} fill="#fff" strokeWidth={0} /> AmpCare</span>
            <Pill tone={w.active ? 'success-solid' : 'danger-solid'}>{w.active ? 'Active' : 'Expired'}</Pill>
          </div>
          <h2 className="cert-title">{w.product.name}</h2>
          <p className="cert-sub">{reg.vehicle}</p>
          <div className="cert-qr">
            <QR value={reg.id + reg.serial} size={132} />
            <span className="xsmall muted">Scan to verify · {reg.id}</span>
          </div>
          <div className="cert-dates">
            <div><span>Start</span><strong>{fmtDate(w.start)}</strong></div>
            <div><span>Valid till</span><strong>{fmtDate(w.end)}</strong></div>
          </div>
          <Progress value={w.pct} tone={w.active ? 'primary' : 'muted'} />
          <p className="xsmall muted mt-8">{w.leftLabel} · {w.product.warranty}-month warranty</p>
        </div>

        <SectionTitle>Registration details</SectionTitle>
        <div className="card">
          <KV label="Serial number" value={reg.serial} />
          <KV label="Model" value={`${w.product.name} · ${w.product.volt}V`} />
          <KV label="Owner" value={reg.owner} />
          <KV label="Purchased from" value={dealer.name} />
          <KV label="Purchase date" value={fmtDate(reg.purchaseDate)} />
          <KV label="Purchase proof" value={reg.proof ? 'Uploaded ✓' : 'Not uploaded'} />
          <KV label="Replacement eligibility" value={w.active ? (claim ? 'Claim in progress' : 'Eligible') : 'Not eligible'} />
        </div>
      </div>
      <div className="footer-actions row-2">
        <Button variant="secondary" icon={Download} onClick={download}>PDF</Button>
        {w.active ? (
          claim
            ? <Button icon={ClipboardList} onClick={() => nav.push('claim', { id: claim.id })}>Track claim</Button>
            : <Button icon={Wrench} onClick={() => nav.push('newClaim', { regId: reg.id })}>Raise claim</Button>
        ) : (
          <Button icon={Search} onClick={() => nav.goTab('finder')}>Find replacement</Button>
        )}
      </div>
    </div>
  )
}

const certificateHtml = (reg, w, dealer) => `<!doctype html><html><head><meta charset="utf-8"><title>Warranty ${reg.id}</title>
<style>body{font-family:Poppins,Arial,sans-serif;color:#121212;margin:0;padding:40px;background:#fff}
.c{max-width:560px;margin:auto;border:2px solid #E5194A;border-radius:20px;padding:32px}
.h{display:flex;justify-content:space-between;align-items:center}.b{color:#E5194A;font-weight:700;font-size:22px}
h1{font-size:26px;margin:24px 0 4px}.s{color:#666;margin:0 0 24px}table{width:100%;border-collapse:collapse;margin-top:16px}
td{padding:10px 0;border-bottom:1px solid #eee;font-size:14px}td:last-child{text-align:right;font-weight:600}
.q{text-align:center;margin:20px 0}.st{display:inline-block;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:600;color:#fff;background:${w.active ? '#16A34A' : '#DC2626'}}
.f{font-size:11px;color:#888;margin-top:24px;text-align:center}</style></head><body><div class="c">
<div class="h"><span class="b">⚡ AmpCare</span><span class="st">${w.active ? 'ACTIVE' : 'EXPIRED'}</span></div>
<h1>Digital Warranty Certificate</h1><p class="s">${w.product.name} · ${w.product.volt}V ${w.product.ah}Ah</p>
<div class="q">${qrSvgString(reg.id + reg.serial, 150)}<div style="font-size:12px;color:#666">Certificate ID ${reg.id}</div></div>
<table><tr><td>Owner</td><td>${reg.owner}</td></tr><tr><td>Vehicle / usage</td><td>${reg.vehicle}</td></tr>
<tr><td>Serial number</td><td>${reg.serial}</td></tr><tr><td>Dealer</td><td>${dealer.name}, ${dealer.area}</td></tr>
<tr><td>Warranty start</td><td>${fmtDate(w.start)}</td></tr><tr><td>Warranty end</td><td>${fmtDate(w.end)}</td></tr>
<tr><td>Warranty period</td><td>${w.product.warranty} months</td></tr></table>
<p class="f">This is a system-generated certificate (prototype). Verify by scanning the QR code.</p></div></body></html>`

/* ── Claims tab (customer) ──────────────────────────── */
export function Claims() {
  const { state } = useStore()
  const nav = useNav()
  const [filter, setFilter] = useState('All')
  const regIds = myRegs(state).map((r) => r.id)
  const list = state.claims
    .filter((c) => regIds.includes(c.regId))
    .filter((c) => filter === 'All' || (filter === 'Open' ? c.stage < 4 : c.stage === 4))
  return (
    <div className="content">
      <PageHeader title="Claims" subtitle="Warranty claims & replacements" right={<IconButton icon={Plus} label="New claim" tone="soft" onClick={() => nav.push('newClaim')} />} />
      <div className="pad-x"><Chips items={['All', 'Open', 'Closed']} value={filter} onChange={setFilter} /></div>
      <div className="pad-x mt-16 stack-12">
        {list.length ? list.map((c) => <ClaimCard key={c.id} claim={c} />) : (
          <Empty icon={ClipboardList} title="No claims here" text="If a battery under warranty has a problem, raise a claim in a few taps." action={<Button size="sm" block={false} icon={Plus} onClick={() => nav.push('newClaim')}>New claim</Button>} />
        )}
      </div>
      <div className="bottom-space" />
    </div>
  )
}

export function ClaimCard({ claim, showOwner }) {
  const { state } = useStore()
  const nav = useNav()
  const reg = state.registrations.find((r) => r.id === claim.regId)
  const p = productById(reg.productId)
  return (
    <button className="card card-tap claim-card" onClick={() => nav.push('claim', { id: claim.id })}>
      <div className="row-between">
        <span className="claim-id">{claim.id}</span>
        <Pill tone={claimTone(claim)}>{claimLabel(claim)}</Pill>
      </div>
      <div className="claim-main">
        <BatteryArt color={p.color} size={40} />
        <div>
          <strong className="ink">{p.name}</strong>
          <p className="muted small">{showOwner ? `${reg.owner} · ` : ''}{claim.issue}</p>
        </div>
      </div>
      <div className="mini-steps">{CLAIM_STAGES.map((s, i) => <span key={s} className={i <= claim.stage ? (claim.decision === 'rejected' && i >= 3 ? 'is-rejected' : 'is-done') : ''} />)}</div>
      <p className="xsmall muted">Raised {fmtDate(claim.createdAt)} · {dealerById(claim.dealerId).name}</p>
    </button>
  )
}

/* ── New claim ──────────────────────────────────────── */
export function NewClaim({ params }) {
  const { state, dispatch } = useStore()
  const nav = useNav()
  const { showToast } = useToast()
  const eligible = myRegs(state).filter((r) => warrantyInfo(r).active && !state.claims.some((c) => c.regId === r.id && c.stage < 4))
  const [regId, setRegId] = useState(params.regId && eligible.some((r) => r.id === params.regId) ? params.regId : '')
  const [issue, setIssue] = useState('')
  const [note, setNote] = useState('')
  const [dealerId, setDealerId] = useState('')
  const [photos, setPhotos] = useState([])
  const [err, setErr] = useState({})

  const pickReg = (v) => { setRegId(v); const r = eligible.find((x) => x.id === v); if (r && !dealerId) setDealerId(r.dealerId) }
  const addPhotos = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 3 - photos.length)
    setPhotos([...photos, ...files.map((f) => URL.createObjectURL(f))])
  }

  const submit = () => {
    const e = {}
    if (!regId) e.regId = 'Select a battery'
    if (!issue) e.issue = 'Select the problem'
    if (!dealerId) e.dealerId = 'Select a dealer / service center'
    setErr(e)
    if (Object.keys(e).length) return
    const id = 'CLM-' + String(Math.floor(10000 + Math.random() * 89999))
    dispatch({
      type: 'addClaim',
      claim: { id, regId, issue, note, dealerId, stage: 0, decision: null, createdAt: todayISO(), photos: photos.length, history: [{ stage: 0, at: nowStamp(), note: 'Claim raised from app' }], loaner: null },
    })
    nav.replace('claim', { id, fresh: true })
  }

  return (
    <div className="screen">
      <AppBar title="Raise a claim" />
      <div className="content pad">
        {eligible.length === 0 ? (
          <Empty icon={ShieldCheck} title="No eligible battery" text="Only batteries with an active warranty and no open claim can be claimed." action={<Button size="sm" block={false} onClick={() => nav.push('register')}>Register battery</Button>} />
        ) : (
          <div className="stack-16">
            <Select
              label="Battery"
              value={regId}
              placeholder="Select registered battery"
              onChange={pickReg}
              error={err.regId}
              options={eligible.map((r) => ({ value: r.id, label: `${productById(r.productId).name} · ${r.vehicle.split(' · ')[0]} · …${r.serial.slice(-4)}` }))}
            />
            <div className="field">
              <span className="field-label">What's the problem?</span>
              <div className="chips chips-wrap">
                {ISSUE_TYPES.map((i) => <button key={i} className={`chip ${issue === i ? 'is-active' : ''}`} onClick={() => setIssue(i)}>{i}</button>)}
              </div>
              {err.issue && <span className="field-error">{err.issue}</span>}
            </div>
            <label className="field">
              <span className="field-label">Describe the issue (optional)</span>
              <textarea className="field-box field-textarea" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="When did it start? Any warning lights?" />
            </label>
            <div className="field">
              <span className="field-label">Battery / test photos ({photos.length}/3)</span>
              <div className="photo-row">
                {photos.map((src) => <img key={src} src={src} alt="" className="photo" />)}
                {photos.length < 3 && (
                  <label className="photo photo-add">
                    <Plus size={20} />
                    <span>Add</span>
                    <input type="file" accept="image/*" multiple hidden onChange={addPhotos} />
                  </label>
                )}
              </div>
            </div>
            <Select label="Dealer / service center" value={dealerId} placeholder="Select dealer" onChange={setDealerId} error={err.dealerId}
              options={DEALER_OPTIONS} />
          </div>
        )}
      </div>
      {eligible.length > 0 && <div className="footer-actions"><Button onClick={submit}>Submit claim</Button></div>}
    </div>
  )
}

export const DEALER_OPTIONS = DEALERS.map((d) => ({ value: d.id, label: `${d.name} · ${d.area}` }))

/* ── Notifications ──────────────────────────────────── */
export function Notifications() {
  const { state, dispatch } = useStore()
  const role = state.session?.role
  const list = state.notifications.filter((n) => n.to === role)
  const hasUnread = list.some((n) => !n.read)
  return (
    <div className="screen">
      <AppBar title="Notifications" right={hasUnread ? <button className="text-link small" onClick={() => dispatch({ type: 'readAll', role })}>Read all</button> : null} />
      <div className="content pad">
        {list.length === 0 ? <Empty icon={Bell} title="You're all caught up" /> : (
          <div className="list-card">
            {list.map((n) => (
              <div key={n.id} className={`notif ${n.read ? '' : 'is-unread'}`}>
                <span className={`row-icon row-icon-${n.kind === 'claim' ? 'warning' : n.kind === 'warranty' ? 'success' : 'soft'}`}>
                  {n.kind === 'claim' ? <Wrench size={18} /> : n.kind === 'warranty' ? <ShieldCheck size={18} /> : <Info size={18} />}
                </span>
                <div className="notif-body">
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                  <span className="xsmall muted">{fmtDate(n.at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Profile (customer) — curved header + menu ─────── */
export function Profile() {
  const { state, dispatch } = useStore()
  const nav = useNav()
  const { showToast } = useToast()
  const regs = myRegs(state)
  const c = state.customer
  const activeCount = regs.filter((r) => warrantyInfo(r).active).length
  const claimCount = state.claims.filter((x) => regs.some((r) => r.id === x.regId)).length
  const unread = state.notifications.filter((n) => n.to === 'customer' && !n.read).length

  return (
    <div className="content">
      <ProfileHero
        avatar={<Avatar name={c.name} size={84} tone="light" />}
        name={c.name}
        sub={`${fmtPhone(c.phone)} · ${c.city}`}
        chips={[`${regs.length} ${regs.length === 1 ? 'Battery' : 'Batteries'}`, `${activeCount} Active`, `${claimCount} ${claimCount === 1 ? 'Claim' : 'Claims'}`]}
        onEdit={() => nav.push('account')}
      />
      <nav className="menu">
        <MenuRow icon={User} label="My Profile" onClick={() => nav.push('account')} />
        <MenuRow icon={Car} label="My Vehicles" badge={state.vehicles.length} onClick={() => nav.push('vehicles')} />
        <MenuRow icon={ShieldCheck} label="Warranty History" onClick={() => nav.switchTab('warranty')} />
        <MenuRow icon={ClipboardList} label="Claim History" onClick={() => nav.switchTab('claims')} />
        <MenuRow icon={Bell} label="Notifications" badge={unread} onClick={() => nav.push('notifications')} />
        <MenuRow icon={MapPin} label="Dealer Locations" onClick={() => nav.push('dealers')} />
        <MenuRow icon={Calculator} label="Inverter Calculator" onClick={() => nav.push('inverter')} />
        <MenuRow icon={SettingsIcon} label="Settings" onClick={() => nav.push('settings')} />
      </nav>
      <button className="logout" onClick={() => { dispatch({ type: 'logout' }); showToast('Logged out') }}>
        <LogOut size={16} /> Logout
      </button>
      <p className="version">AmpCare v1.0 · Prototype</p>
    </div>
  )
}

/* ── My Profile / Business details ──────────────────── */
export function Account() {
  const { state, dispatch } = useStore()
  const { showToast } = useToast()
  const isDealer = state.session?.role === 'dealer'
  const c = state.customer
  const [f, setF] = useState({ name: c.name, email: c.email, city: c.city })
  const [err, setErr] = useState({})

  if (isDealer) {
    const d = dealerById('d1')
    return (
      <div className="screen">
        <AppBar title="Business details" />
        <div className="content pad">
          <div className="card">
            <KV label="Business name" value={d.name} />
            <KV label="Dealer ID" value="DL-1024" />
            <KV label="Type" value={d.kind} />
            <KV label="Address" value={`${d.area}, ${d.city} ${d.pin}`} />
            <KV label="Phone" value={fmtPhone(d.phone)} />
            <KV label="Working hours" value={d.hours} />
            <KV label="Rating" value={`★ ${d.rating}`} />
          </div>
          <p className="xsmall muted center mt-16">Business details are managed by the company admin.</p>
        </div>
      </div>
    )
  }

  const save = () => {
    const e = {}
    if (f.name.trim().length < 3) e.name = 'Enter your full name'
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email'
    if (f.city.trim().length < 2) e.city = 'Enter your city'
    setErr(e)
    if (Object.keys(e).length) return
    dispatch({ type: 'signup', data: { name: f.name.trim(), email: f.email.trim(), city: f.city.trim() } })
    showToast('Profile updated')
  }

  return (
    <div className="screen">
      <AppBar title="My Profile" />
      <div className="content pad">
        <div className="stack-16">
          <Field label="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={err.name} />
          <Field label="Mobile number" prefix="+91" value={c.phone} readOnly hint="Mobile number is verified and can't be changed" />
          <Field label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={err.email} />
          <Field label="City" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} error={err.city} />
        </div>
      </div>
      <div className="footer-actions"><Button onClick={save}>Save changes</Button></div>
    </div>
  )
}

/* ── My vehicles ────────────────────────────────────── */
export function MyVehicles() {
  const { state } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  return (
    <div className="screen">
      <AppBar title="My Vehicles" />
      <div className="content pad">
        {state.vehicles.length ? (
          <div className="list-card">
            {state.vehicles.map((v) => (
              <Row key={v.id} icon={Car} title={v.label} sub={`${v.reg} · ${v.fuel}`} right={<Pill>{VEHICLE_TYPES.find((t) => t.id === v.type)?.short}</Pill>} />
            ))}
          </div>
        ) : <Empty icon={Car} title="No vehicles yet" text="Add a vehicle to register batteries faster." />}
      </div>
      <div className="footer-actions"><Button icon={Plus} onClick={() => setAddOpen(true)}>Add vehicle</Button></div>
      <AddVehicleSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

/* ── Settings (customer + dealer) ───────────────────── */
export function SettingsScreen() {
  const { state, dispatch } = useStore()
  const { showToast } = useToast()
  const isDealer = state.session?.role === 'dealer'
  const nextLang = () => {
    const l = state.settings.language === 'English' ? 'বাংলা' : state.settings.language === 'বাংলা' ? 'हिन्दी' : 'English'
    dispatch({ type: 'updateSettings', data: { language: l } })
    showToast(`Language: ${l}`)
  }
  return (
    <div className="screen">
      <AppBar title="Settings" />
      <div className="content pad">
        <div className="list-card">
          <Row icon={Bell} title="Push notifications" sub={isDealer ? 'New claims & registrations' : 'Claim & warranty updates'}
            right={<Toggle checked={state.settings.push} onChange={(v) => dispatch({ type: 'updateSettings', data: { push: v } })} label="Push notifications" />} />
          {!isDealer && (
            <Row icon={MessageCircle} title="WhatsApp alerts" sub="Get warranty card on WhatsApp"
              right={<Toggle checked={state.settings.whatsapp} onChange={(v) => dispatch({ type: 'updateSettings', data: { whatsapp: v } })} label="WhatsApp alerts" />} />
          )}
          <Row icon={Globe} title="Language" sub={state.settings.language} onClick={nextLang} />
          <Row icon={RefreshCw} title="Reset demo data" sub="Restore the original sample data" onClick={() => { dispatch({ type: 'reset' }); showToast('Demo data reset') }} />
        </div>
        <div className="mt-24">
          <Button variant="danger-soft" icon={LogOut} onClick={() => { dispatch({ type: 'logout' }); showToast('Logged out') }}>Log out</Button>
        </div>
      </div>
    </div>
  )
}

function AddVehicleSheet({ open, onClose }) {
  const { dispatch } = useStore()
  const { showToast } = useToast()
  const [f, setF] = useState({ type: 'car', label: '', reg: '', fuel: 'Petrol' })
  const [err, setErr] = useState({})
  const save = () => {
    const e = {}
    if (f.label.trim().length < 2) e.label = 'Enter vehicle name'
    if (f.reg.trim().length < 6) e.reg = 'Enter registration number'
    setErr(e)
    if (Object.keys(e).length) return
    dispatch({ type: 'addVehicle', data: { ...f, reg: f.reg.toUpperCase() } })
    showToast('Vehicle added')
    setF({ type: 'car', label: '', reg: '', fuel: 'Petrol' })
    onClose()
  }
  return (
    <Sheet open={open} onClose={onClose} title="Add vehicle">
      <div className="stack-16">
        <Select label="Vehicle type" value={f.type} onChange={(v) => setF({ ...f, type: v })} options={VEHICLE_TYPES.map((t) => ({ value: t.id, label: t.label }))} />
        <Field label="Make & model" placeholder="e.g. Tata Nexon" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} error={err.label} />
        <Field label="Registration number" placeholder="WB 02 AB 1234" value={f.reg} onChange={(e) => setF({ ...f, reg: e.target.value })} error={err.reg} />
        <Select label="Fuel" value={f.fuel} onChange={(v) => setF({ ...f, fuel: v })} options={['Petrol', 'Diesel', 'CNG', 'Electric']} />
        <Button onClick={save}>Save vehicle</Button>
      </div>
    </Sheet>
  )
}
