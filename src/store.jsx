import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { CLAIM_STAGES, dealerById, nowStamp, productById, rid, seedState, todayISO } from './data'

const KEY = 'ampcare-demo-v2'
const DEMO_DEALER_ID = 'd1'

const load = () => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...seedState(), ...JSON.parse(raw) }
  } catch { /* storage unavailable – fall back to seed */ }
  return seedState()
}

// Each notification belongs to one audience: 'customer' or 'dealer'
const note = (to, title, body, kind = 'info') => ({ id: rid('n'), to, title, body, at: todayISO(), read: false, kind })
const notify = (s, ...notes) => [...notes.filter(Boolean), ...s.notifications]

function reducer(s, a) {
  switch (a.type) {
    case 'login':
      return { ...s, session: { role: a.role } }
    case 'logout':
      return { ...s, session: null }
    case 'signup':
      return { ...s, customer: { ...s.customer, ...a.data } }
    case 'updateSettings':
      return { ...s, settings: { ...s.settings, ...a.data } }
    case 'addVehicle':
      return { ...s, vehicles: [...s.vehicles, { id: rid('v'), ...a.data }] }
    case 'readAll':
      return { ...s, notifications: s.notifications.map((n) => (n.to === a.role ? { ...n, read: true } : n)) }

    case 'addRegistration': {
      const reg = a.reg
      const inv = s.inventory.map((i) => (i.serial === reg.serial ? { ...i, status: 'Sold' } : i))
      const isDemoDealer = reg.dealerId === DEMO_DEALER_ID
      const points = isDemoDealer
        ? { balance: s.points.balance + 50, history: [{ id: rid('p'), label: `Verified registration · ${reg.id}`, at: todayISO(), pts: 50 }, ...s.points.history] }
        : s.points
      return {
        ...s,
        registrations: [reg, ...s.registrations],
        inventory: inv,
        points,
        notifications: notify(
          s,
          reg.ownerPhone === s.customer.phone && note('customer', 'Warranty registered', `${productById(reg.productId).name} · Certificate ${reg.id} is ready.`, 'warranty'),
          isDemoDealer && note('dealer', `New registration · ${reg.id}`, `${reg.owner} · ${productById(reg.productId).name}. +50 points credited.`, 'warranty'),
        ),
      }
    }

    case 'addClaim': {
      const reg = s.registrations.find((r) => r.id === a.claim.regId)
      return {
        ...s,
        claims: [a.claim, ...s.claims],
        notifications: notify(
          s,
          note('customer', `Claim ${a.claim.id} submitted`, `Sent to ${dealerById(a.claim.dealerId).name} for review.`, 'claim'),
          a.claim.dealerId === DEMO_DEALER_ID && note('dealer', `New claim ${a.claim.id}`, `${reg?.owner} · ${a.claim.issue}. Please review.`, 'claim'),
        ),
      }
    }

    case 'advanceClaim': {
      let title = ''
      const claims = s.claims.map((c) => {
        if (c.id !== a.id) return c
        const next = Math.min(c.stage + 1, CLAIM_STAGES.length - 1)
        const decision = next === 3 ? a.decision : c.decision
        const label = next === 3 ? (decision === 'approved' ? 'Replacement Approved' : 'Claim Rejected') : CLAIM_STAGES[next]
        title = `Claim ${c.id}: ${label}`
        return {
          ...c,
          stage: next,
          decision,
          history: [...c.history, { stage: next, at: nowStamp(), note: a.note || label }],
          loaner: next === 4 && c.loaner ? { ...c.loaner, returned: true } : c.loaner,
        }
      })
      return { ...s, claims, notifications: notify(s, note('customer', title, 'Open Claims to view the latest status.', 'claim')) }
    }

    case 'issueLoaner':
      return {
        ...s,
        claims: s.claims.map((c) => (c.id === a.id ? { ...c, loaner: { model: a.model, issued: todayISO(), due: a.due, returned: false } } : c)),
      }

    case 'addInventory':
      return { ...s, inventory: [{ serial: a.serial, productId: a.productId, addedOn: todayISO(), status: 'In stock' }, ...s.inventory] }

    case 'redeem':
      return {
        ...s,
        points: { balance: s.points.balance - a.pts, history: [{ id: rid('p'), label: `Redeemed · ${a.label}`, at: todayISO(), pts: -a.pts }, ...s.points.history] },
      }

    case 'reset':
      return { ...seedState(), session: s.session }
    default:
      return s
  }
}

const StoreCtx = createContext(null)
const NavCtx = createContext(null)
const ToastCtx = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  // ── Navigation: tab roots + a push stack (Android-style back) ──
  const role = state.session?.role
  const [authStack, setAuthStack] = useState([{ name: 'welcome' }])
  const [tab, setTab] = useState('home')
  const [stack, setStack] = useState([])
  const [dir, setDir] = useState('fwd')

  const nav = useMemo(() => ({
    tab,
    stack,
    authStack,
    dir,
    push: (name, params = {}) => { setDir('fwd'); if (!role) setAuthStack((st) => [...st, { name, params }]); else setStack((st) => [...st, { name, params }]) },
    replace: (name, params = {}) => { setDir('fwd'); if (!role) setAuthStack((st) => [...st.slice(0, -1), { name, params }]); else setStack((st) => [...st.slice(0, -1), { name, params }]) },
    back: () => { setDir('back'); if (!role) setAuthStack((st) => (st.length > 1 ? st.slice(0, -1) : st)); else setStack((st) => st.slice(0, -1)) },
    popToRoot: () => { setDir('back'); setStack([]) },
    switchTab: (t) => { setDir('none'); setStack([]); setTab(t) },
    resetAuth: () => { setDir('back'); setAuthStack([{ name: 'welcome' }]) },
    goTab: (t, name, params = {}) => { setDir('fwd'); setTab(t); setStack(name ? [{ name, params }] : []) },
  }), [tab, stack, authStack, dir, role])

  // reset navigation when the session changes
  const prevRole = useRef(role)
  useEffect(() => {
    if (prevRole.current !== role) {
      setStack([])
      setTab('home')
      setAuthStack([{ name: 'welcome' }])
      prevRole.current = role
    }
  }, [role])

  // ── Toast ──
  const [toast, setToast] = useState(null)
  const timer = useRef()
  const showToast = useCallback((msg, kind = 'ok') => {
    clearTimeout(timer.current)
    setToast({ msg, kind, key: Date.now() })
    timer.current = setTimeout(() => setToast(null), 2000)
  }, [])

  return (
    <StoreCtx.Provider value={{ state, dispatch }}>
      <NavCtx.Provider value={nav}>
        <ToastCtx.Provider value={{ toast, showToast }}>{children}</ToastCtx.Provider>
      </NavCtx.Provider>
    </StoreCtx.Provider>
  )
}

export const useStore = () => useContext(StoreCtx)
export const useNav = () => useContext(NavCtx)
export const useToast = () => useContext(ToastCtx)
export { DEMO_DEALER_ID }
