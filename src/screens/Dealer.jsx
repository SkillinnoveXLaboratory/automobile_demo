import { useState } from 'react'
import {
  Award, Bell, ClipboardList, Gift, LogOut, Package, Plus, QrCode, ScanLine, Search,
  Settings as SettingsIcon, ShieldCheck, Store, Trophy, UserRound,
} from 'lucide-react'
import {
  AppBar, Avatar, BatteryArt, Button, Chips, Empty, Field, IconButton, KV, MenuRow, PageHeader, Pill, ProfileHero, Row, SectionTitle, Select, Sheet,
} from '../components/ui'
import { PRODUCTS, dealerById, fmtDate, fmtPhone, productById, todayISO, warrantyInfo } from '../data'
import { DEMO_DEALER_ID, useNav, useStore, useToast } from '../store'
import { ClaimCard } from './Customer'

const me = () => dealerById(DEMO_DEALER_ID)
const dealerClaims = (s) => s.claims.filter((c) => c.dealerId === DEMO_DEALER_ID)

// Other dealers on the leaderboard (fictional): all-time and current-month points
const LEADERS = [
  { name: 'Power Point Motors', city: 'Park Street', all: 3120, month: 420 },
  { name: 'Howrah Auto Electricals', city: 'Howrah', all: 2210, month: 260 },
  { name: 'New Town Battery Care', city: 'New Town', all: 1980, month: 180 },
  { name: 'Barasat Battery House', city: 'Barasat', all: 1640, month: 90 },
]
const monthPoints = (s) => s.points.history
  .filter((h) => h.pts > 0 && h.at.slice(0, 7) === todayISO().slice(0, 7))
  .reduce((t, h) => t + h.pts, 0)
const leaderboard = (s, period) => [
  ...LEADERS.map((x) => ({ name: x.name, city: x.city, pts: period === 'This month' ? x.month : x.all })),
  { name: me().name, city: 'Salt Lake', pts: period === 'This month' ? monthPoints(s) : s.points.balance, you: true },
].sort((a, b) => b.pts - a.pts)

/* ── Dealer dashboard ───────────────────────────────── */
export function DealerHome() {
  const { state } = useStore()
  const nav = useNav()
  const d = me()
  const stock = state.inventory.filter((i) => i.status === 'In stock').length
  const regs = state.registrations.filter((r) => r.dealerId === DEMO_DEALER_ID)
  const open = dealerClaims(state).filter((c) => c.stage < 4)
  const loaners = dealerClaims(state).filter((c) => c.loaner && !c.loaner.returned).length
  const rank = leaderboard(state, 'All-Time').findIndex((x) => x.you) + 1
  const unread = state.notifications.some((n) => n.to === 'dealer' && !n.read)

  const actions = [
    { label: 'Register', icon: ShieldCheck, go: () => nav.push('register') },
    { label: 'Add stock', icon: ScanLine, go: () => nav.goTab('inventory', 'addStock') },
    { label: 'Verify', icon: QrCode, go: () => nav.push('verify') },
    { label: 'Claims', icon: ClipboardList, go: () => nav.switchTab('claims') },
  ]

  return (
    <div className="content">
      <header className="home-head">
        <span className="avatar avatar-light" style={{ width: 44, height: 44 }}><Store size={20} /></span>
        <div className="home-hello">
          <span className="small">Dealer · DL-1024</span>
          <strong>{d.name}</strong>
        </div>
        <IconButton icon={Bell} tone="soft" label="Notifications" badge={unread} onClick={() => nav.push('notifications')} />
      </header>

      <div className="pad-x hero-overlap">
        <button className="hero-card hero-light" onClick={() => nav.switchTab('rewards')}>
          <div className="hero-top">
            <div>
              <span className="hero-eyebrow">Reward points</span>
              <h3 className="hero-title hero-points">{state.points.balance.toLocaleString('en-IN')}</h3>
              <span className="hero-sub">Rank #{rank} of {LEADERS.length + 1} dealers in Kolkata</span>
            </div>
            <span className="hero-trophy"><Trophy size={30} /></span>
          </div>
          <span className="hero-cta">View leaderboard</span>
        </button>
      </div>

      <div className="quick-grid pad-x">
        {actions.map((a) => (
          <button key={a.label} className="quick" onClick={a.go}>
            <span className="quick-icon"><a.icon size={22} /></span>
            <span className="quick-label">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="pad-x">
        <SectionTitle>Overview</SectionTitle>
        <div className="stats stats-2">
          <div className="stat"><span>In stock</span><strong>{stock}</strong></div>
          <div className="stat"><span>Registrations</span><strong>{regs.length}</strong></div>
          <div className="stat"><span>Open claims</span><strong>{open.length}</strong></div>
          <div className="stat"><span>Loaners out</span><strong>{loaners}</strong></div>
        </div>
      </div>

      {open.length > 0 && (
        <div className="pad-x">
          <SectionTitle action="See all" onAction={() => nav.switchTab('claims')}>Claims to process</SectionTitle>
          <div className="stack-12">{open.slice(0, 2).map((c) => <ClaimCard key={c.id} claim={c} showOwner />)}</div>
        </div>
      )}

      <div className="pad-x">
        <SectionTitle>Recent registrations</SectionTitle>
        <div className="list-card">
          {regs.slice(0, 4).map((r) => {
            const p = productById(r.productId)
            return <Row key={r.id} icon={UserRound} title={r.owner} sub={`${p.name} · ${fmtDate(r.purchaseDate)}`} right={<Pill tone="success">+50</Pill>} onClick={() => nav.push('warranty', { id: r.id })} />
          })}
        </div>
      </div>
      <div className="bottom-space" />
    </div>
  )
}

/* ── Inventory / serial registration ────────────────── */
export function Inventory() {
  const { state } = useStore()
  const nav = useNav()
  const [filter, setFilter] = useState('All')
  const [q, setQ] = useState('')
  const list = state.inventory
    .filter((i) => filter === 'All' || i.status === filter)
    .filter((i) => !q || i.serial.includes(q.toUpperCase()))
  return (
    <div className="content">
      <PageHeader title="Inventory" subtitle={`${state.inventory.filter((i) => i.status === 'In stock').length} batteries in stock`} right={<IconButton icon={Plus} tone="soft" label="Add stock" onClick={() => nav.push('addStock')} />} />
      <div className="pad-x">
        <Field placeholder="Search serial number" value={q} onChange={(e) => setQ(e.target.value)} prefix={<Search size={18} />} />
        <div className="mt-12"><Chips items={['All', 'In stock', 'Sold']} value={filter} onChange={setFilter} scroll={false} /></div>
      </div>
      <div className="pad-x mt-16">
        {list.length ? (
          <div className="list-card">
            {list.map((i) => {
              const p = productById(i.productId)
              return (
                <div key={i.serial} className="reg-row">
                  <BatteryArt color={p.color} size={42} />
                  <span className="reg-body">
                    <span className="reg-title mono">{i.serial}</span>
                    <span className="reg-sub">{p.name} · added {fmtDate(i.addedOn)}</span>
                  </span>
                  <Pill tone={i.status === 'Sold' ? 'neutral' : 'success'}>{i.status}</Pill>
                </div>
              )
            })}
          </div>
        ) : <Empty icon={Package} title="No batteries found" text="Try another filter or add new stock." />}
      </div>
      <div className="pad-x mt-16"><Button variant="outline" icon={ScanLine} onClick={() => nav.push('addStock')}>Register new serial</Button></div>
      <div className="bottom-space" />
    </div>
  )
}

export function AddStock() {
  const { state, dispatch } = useStore()
  const nav = useNav()
  const { showToast } = useToast()
  const [productId, setProductId] = useState('AC-CAR-45')
  const [serial, setSerial] = useState('')
  const [err, setErr] = useState('')
  const scan = () => {
    const p = productById(productId)
    setSerial(`AC${String(p.ah).padStart(2, '0')}K25${Math.floor(100000 + Math.random() * 899999)}`.slice(0, 14))
    setErr('')
  }
  const save = () => {
    const s = serial.trim().toUpperCase()
    if (!/^AC[A-Z0-9]{8,12}$/.test(s)) return setErr('Serial should look like AC45K2511402')
    if (state.inventory.some((i) => i.serial === s)) return setErr('Serial already in inventory')
    dispatch({ type: 'addInventory', serial: s, productId })
    showToast(`${s} added to stock`)
    nav.back()
  }
  return (
    <div className="screen">
      <AppBar title="Add stock" />
      <div className="content pad">
        <button className="scan-box" onClick={scan}>
          <span className="scan-frame"><ScanLine size={40} /></span>
          <strong>Tap to scan battery barcode</strong>
          <span className="xsmall muted">Camera scanning in the real app · demo generates a serial</span>
        </button>
        <div className="stack-16 mt-24">
          <Select label="Battery model" value={productId} onChange={setProductId} options={PRODUCTS.map((p) => ({ value: p.id, label: p.name }))} />
          <Field label="Serial number" placeholder="AC45K2511402" value={serial} onChange={(e) => { setSerial(e.target.value.toUpperCase().replace(/\s/g, '')); setErr('') }} error={err} />
        </div>
      </div>
      <div className="footer-actions"><Button onClick={save}>Add to inventory</Button></div>
    </div>
  )
}

/* ── Verify warranty by serial / certificate ────────── */
export function Verify() {
  const { state } = useStore()
  const nav = useNav()
  const [q, setQ] = useState('AC45K2503118')
  const [res, setRes] = useState(undefined)
  const check = () => {
    const t = q.trim().toUpperCase()
    setRes(state.registrations.find((r) => r.serial === t || r.id === t) || null)
  }
  const w = res ? warrantyInfo(res) : null
  return (
    <div className="screen">
      <AppBar title="Verify warranty" />
      <div className="content pad">
        <Field label="Serial number or certificate ID" value={q} onChange={(e) => { setQ(e.target.value); setRes(undefined) }} prefix={<QrCode size={18} />} />
        <div className="mt-12"><Button icon={Search} onClick={check} disabled={!q.trim()}>Check warranty</Button></div>
        {res === null && <div className="banner banner-danger mt-16"><span>No registration found for <b>{q.toUpperCase()}</b>.</span></div>}
        {res && (
          <div className="card mt-16 fade-in">
            <div className="row-between">
              <strong className="ink">{w.product.name}</strong>
              <Pill tone={w.active ? 'success' : 'danger'}>{w.active ? 'Valid' : 'Expired'}</Pill>
            </div>
            <KV label="Certificate" value={res.id} />
            <KV label="Owner" value={`${res.owner} · ${fmtPhone(res.ownerPhone)}`} />
            <KV label="Valid till" value={fmtDate(w.end)} />
            <KV label="Dealer" value={dealerById(res.dealerId).name} />
            <div className="mt-12"><Button variant="secondary" onClick={() => nav.push('warranty', { id: res.id })}>Open warranty card</Button></div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Dealer claims ──────────────────────────────────── */
export function DealerClaims() {
  const { state } = useStore()
  const [filter, setFilter] = useState('Open')
  const list = dealerClaims(state).filter((c) => filter === 'All' || (filter === 'Open' ? c.stage < 4 : c.stage === 4))
  return (
    <div className="content">
      <PageHeader title="Claims" subtitle="Customer warranty claims" />
      <div className="pad-x"><Chips items={['Open', 'Closed', 'All']} value={filter} onChange={setFilter} scroll={false} /></div>
      <div className="pad-x mt-16 stack-12">
        {list.length ? list.map((c) => <ClaimCard key={c.id} claim={c} showOwner />) : <Empty icon={ClipboardList} title="Nothing here" text="New customer claims will appear here." />}
      </div>
      <div className="bottom-space" />
    </div>
  )
}

/* ── Rewards / leaderboard (matches reference style) ── */
const REWARDS = [
  { id: 'r1', label: 'Branded T-shirt', pts: 500 },
  { id: 'r2', label: '₹1,000 Gift voucher', pts: 1000 },
  { id: 'r3', label: '₹1,500 Fuel card', pts: 1500 },
]

export function Rewards() {
  const { state, dispatch } = useStore()
  const { showToast } = useToast()
  const [period, setPeriod] = useState('All-Time')
  const [open, setOpen] = useState(false)
  const board = leaderboard(state, period)
  const top = board[0]
  const myRank = board.findIndex((x) => x.you) + 1

  return (
    <div className="content">
      <PageHeader title="Rewards" subtitle="Loyalty points & leaderboard" right={<IconButton icon={Gift} tone="soft" label="Redeem" onClick={() => setOpen(true)} />} />
      <div className="pad-x">
        <Chips items={['All-Time', 'This month']} value={period} onChange={setPeriod} scroll={false} />
        <div className="leader-hero">
          <span className="leader-rank-badge">#1</span>
          <span className="leader-avatar"><Avatar name={top.name} size={64} tone="light" /><Award size={20} className="leader-medal" /></span>
          <div className="leader-hero-meta">
            <span className="leader-pill">{top.pts.toLocaleString('en-IN')} pts</span>
            <span className="leader-pill leader-pill-strong">{top.you ? 'You' : top.name}</span>
          </div>
        </div>

        <div className="board-head"><span>Rank</span><span>Dealer</span><span>Points</span></div>
        <div className="board">
          {board.map((x, i) => (
            <div key={x.name} className={`board-row ${x.you ? 'is-you' : ''}`}>
              <span className={`board-rank ${i === 0 ? 'is-first' : ''}`}>{i + 1}</span>
              <Avatar name={x.name} size={38} tone={x.you ? 'primary' : 'soft'} />
              <span className="board-name">
                <strong>{x.you ? 'You' : x.name}</strong>
                <span className="xsmall muted">{x.city}</span>
              </span>
              <strong className="board-pts">{x.pts.toLocaleString('en-IN')}</strong>
            </div>
          ))}
        </div>
        <p className="xsmall muted center mt-8">You are ranked #{myRank} · {period.toLowerCase()}</p>

        <SectionTitle>Points history</SectionTitle>
        <div className="list-card">
          {state.points.history.map((h) => (
            <Row key={h.id} icon={h.pts > 0 ? Award : Gift} iconTone={h.pts > 0 ? 'success' : 'warning'} title={h.label} sub={fmtDate(h.at)}
              right={<strong className={h.pts > 0 ? 'text-success' : 'text-danger'}>{h.pts > 0 ? '+' : ''}{h.pts}</strong>} />
          ))}
        </div>
        <p className="xsmall muted mt-8">Earn 50 points for every verified warranty registration.</p>
      </div>
      <div className="bottom-space" />

      <Sheet open={open} onClose={() => setOpen(false)} title={`Redeem · ${state.points.balance.toLocaleString('en-IN')} pts`}>
        <div className="list-card">
          {REWARDS.map((r) => {
            const ok = state.points.balance >= r.pts
            return (
              <Row key={r.id} icon={Gift} title={r.label} sub={`${r.pts} points`}
                right={<Button size="sm" block={false} variant={ok ? 'primary' : 'secondary'} disabled={!ok}
                  onClick={() => { dispatch({ type: 'redeem', pts: r.pts, label: r.label }); setOpen(false); showToast(`${r.label} redeemed`) }}>Redeem</Button>} />
            )
          })}
        </div>
      </Sheet>
    </div>
  )
}

/* ── Dealer profile ─────────────────────────────────── */
export function DealerProfile() {
  const { state, dispatch } = useStore()
  const nav = useNav()
  const { showToast } = useToast()
  const d = me()
  const stock = state.inventory.filter((i) => i.status === 'In stock').length
  const rank = leaderboard(state, 'All-Time').findIndex((x) => x.you) + 1
  const unread = state.notifications.filter((n) => n.to === 'dealer' && !n.read).length
  const openClaims = dealerClaims(state).filter((c) => c.stage < 4).length
  return (
    <div className="content">
      <ProfileHero
        avatar={<span className="avatar avatar-light" style={{ width: 84, height: 84 }}><Store size={34} /></span>}
        name={d.name}
        sub={`DL-1024 · ${d.area}`}
        chips={[`${state.points.balance.toLocaleString('en-IN')} pts`, `Rank #${rank}`, `${stock} in stock`]}
        onEdit={() => nav.push('account')}
      />
      <nav className="menu">
        <MenuRow icon={Store} label="Business Details" onClick={() => nav.push('account')} />
        <MenuRow icon={Package} label="Stock & Serials" onClick={() => nav.switchTab('inventory')} />
        <MenuRow icon={ClipboardList} label="Customer Claims" badge={openClaims} onClick={() => nav.switchTab('claims')} />
        <MenuRow icon={Trophy} label="Rewards & Leaderboard" onClick={() => nav.switchTab('rewards')} />
        <MenuRow icon={QrCode} label="Verify Warranty" onClick={() => nav.push('verify')} />
        <MenuRow icon={Bell} label="Notifications" badge={unread} onClick={() => nav.push('notifications')} />
        <MenuRow icon={SettingsIcon} label="Settings" onClick={() => nav.push('settings')} />
      </nav>
      <button className="logout" onClick={() => { dispatch({ type: 'logout' }); showToast('Logged out') }}>
        <LogOut size={16} /> Logout
      </button>
      <p className="version">AmpCare Partner v1.0 · Prototype</p>
    </div>
  )
}
