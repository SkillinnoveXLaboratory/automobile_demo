import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { CATALOGUE, seed } from './data'

const KEY = 'autorynx-demo-v1'
const load = () => {
  try { const raw = localStorage.getItem(KEY); if (raw) return { ...seed(), ...JSON.parse(raw) } } catch { /* ignore */ }
  return seed()
}

function reducer(s, a) {
  switch (a.type) {
    case 'login': return { ...s, user: a.user, remember: a.remember ?? s.remember }
    case 'logout': return { ...s, user: null }
    case 'setVehicle': return { ...s, vehicle: { ...s.vehicle, ...a.data } }
    case 'addToCart': {
      const ex = s.cart.find((c) => c.id === a.id)
      return { ...s, cart: ex ? s.cart.map((c) => (c.id === a.id ? { ...c, qty: c.qty + a.qty } : c)) : [...s.cart, { id: a.id, qty: a.qty }] }
    }
    case 'setQty': return { ...s, cart: s.cart.map((c) => (c.id === a.id ? { ...c, qty: Math.max(1, a.qty) } : c)) }
    case 'removeItem': return { ...s, cart: s.cart.filter((c) => c.id !== a.id) }
    case 'placeOrder': {
      const items = a.items.map((c) => `${CATALOGUE.find((p) => p.id === c.id).name} × ${c.qty}`).join(', ')
      const order = { id: 'AX-' + Math.floor(240700 + Math.random() * 9000), date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), items, total: a.total, status: 'Confirmed' }
      return { ...s, orders: [order, ...s.orders], cart: a.fromCart ? [] : s.cart, lastOrder: order }
    }
    case 'toggleStep': return { ...s, doneSteps: s.doneSteps.includes(a.i) ? s.doneSteps.filter((x) => x !== a.i) : [...s.doneSteps, a.i] }
    case 'reset': return { ...seed(), user: s.user }
    default: return s
  }
}

const StoreCtx = createContext(null)
const NavCtx = createContext(null)
const ToastCtx = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ } }, [state])

  const loggedIn = !!state.user
  const [authStack, setAuthStack] = useState([{ name: 'splash' }])
  const [tab, setTab] = useState('home')
  const [stack, setStack] = useState([])
  const [dir, setDir] = useState('none')

  const nav = useMemo(() => {
    const set = loggedIn ? setStack : setAuthStack
    return {
      tab, stack, authStack, dir,
      push: (name, params = {}) => { setDir('fwd'); set((st) => [...st, { name, params }]) },
      replace: (name, params = {}) => { setDir('fwd'); set((st) => [...st.slice(0, -1), { name, params }]) },
      back: () => { setDir('back'); set((st) => (loggedIn ? st.slice(0, -1) : st.length > 1 ? st.slice(0, -1) : st)) },
      switchTab: (t) => { setDir('none'); setStack([]); setTab(t) },
      goTab: (t, name, params = {}) => { setDir('fwd'); setTab(t); setStack(name ? [{ name, params }] : []) },
      resetTo: (list) => { setDir('fwd'); setStack(list) },
      toLogin: () => { setDir('fwd'); setAuthStack([{ name: 'splash' }, { name: 'login' }]) },
    }
  }, [tab, stack, authStack, dir, loggedIn])

  const prev = useRef(loggedIn)
  useEffect(() => {
    if (prev.current !== loggedIn) {
      setStack([]); setTab('home'); setAuthStack(loggedIn ? [{ name: 'splash' }] : [{ name: 'login' }]); setDir('fwd')
      prev.current = loggedIn
    }
  }, [loggedIn])

  const [toast, setToast] = useState(null)
  const timer = useRef()
  const showToast = useCallback((msg) => {
    clearTimeout(timer.current)
    setToast({ msg, key: Date.now() })
    timer.current = setTimeout(() => setToast(null), 1900)
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
export const useCartCount = () => { const { state } = useStore(); return state.cart.reduce((t, c) => t + c.qty, 0) }
