import { useState } from 'react'
import {
  Banknote, Check, ChevronRight, ClipboardList, Cog, CreditCard, Headset, LogOut, MapPin, Minus, Motorbike, Package, Plus, RefreshCcw,
  ShoppingCart, Trash, Wallet,
} from 'lucide-react'
import { NavHeader } from '../components/ui'
import { CATALOGUE, inr } from '../data'
import { useNav, useStore, useToast } from '../store'
import { vehicleInfo } from './Vehicle'

const byId = (id) => CATALOGUE.find((p) => p.id === id)
const totals = (items) => {
  const sub = items.reduce((t, c) => t + byId(c.id).price * c.qty, 0)
  const ship = sub >= 499 || sub === 0 ? 0 : 49
  return { sub, ship, total: sub + ship }
}

/* ── Cart tab ─────────────────────────────────────────── */
export function Cart() {
  const nav = useNav()
  const { state, dispatch } = useStore()
  const { showToast } = useToast()
  const { sub, ship, total } = totals(state.cart)
  return (
    <div className="content">
      <header className="tab-header"><h1>My Cart</h1><p>{state.cart.length} item{state.cart.length === 1 ? '' : 's'}</p></header>
      <div className="light-body">
        {state.cart.length === 0 ? (
          <div className="empty"><ShoppingCart size={30} /><b>Your cart is empty</b><span>Find genuine parts for your vehicle.</span>
            <button className="btn-orange btn-sm" onClick={() => nav.switchTab('explore')}>Browse Parts</button></div>
        ) : (
          <>
            <div className="plist">
              {state.cart.map((c) => {
                const p = byId(c.id)
                return (
                  <div key={c.id} className="cart-item">
                    <span className="pitem-img" onClick={() => nav.push('part', { id: p.id })}>{p.img ? <img src={p.img} alt="" /> : <Cog size={26} />}</span>
                    <div className="ci-body">
                      <b>{p.name}</b>
                      <small>{p.partNo}</small>
                      <em>{inr(p.price * c.qty)}</em>
                    </div>
                    <div className="ci-side">
                      <button className="ci-del" onClick={() => { dispatch({ type: 'removeItem', id: c.id }); showToast('Item removed') }} aria-label="Remove"><Trash size={16} /></button>
                      <div className="qty sm">
                        <button onClick={() => dispatch({ type: 'setQty', id: c.id, qty: c.qty - 1 })} disabled={c.qty <= 1} aria-label="Decrease"><Minus size={14} strokeWidth={2.6} /></button>
                        <span>{c.qty}</span>
                        <button onClick={() => dispatch({ type: 'setQty', id: c.id, qty: Math.min(10, c.qty + 1) })} aria-label="Increase"><Plus size={14} strokeWidth={2.6} /></button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="summary">
              <p><span>Subtotal</span><span>{inr(sub)}</span></p>
              <p><span>Delivery</span><span className={ship ? '' : 'c-green'}>{ship ? inr(ship) : 'FREE'}</span></p>
              <p className="total"><span>Total</span><span>{inr(total)}</span></p>
            </div>
            <button className="btn-orange btn-block" onClick={() => nav.push('checkout', { items: state.cart, fromCart: true })}>Proceed to Checkout</button>
          </>
        )}
        <div className="pad-bottom" />
      </div>
    </div>
  )
}

/* ── Checkout ─────────────────────────────────────────── */
const PAY = [
  { id: 'upi', label: 'UPI', sub: 'GPay, PhonePe, Paytm', icon: Wallet },
  { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when it arrives', icon: Banknote },
]
export function Checkout({ params }) {
  const nav = useNav()
  const { dispatch } = useStore()
  const items = params.items || []
  const { sub, ship, total } = totals(items)
  const [pay, setPay] = useState('upi')
  const [busy, setBusy] = useState(false)
  const place = () => {
    setBusy(true)
    setTimeout(() => { dispatch({ type: 'placeOrder', items, total, fromCart: !!params.fromCart }); nav.replace('orderDone') }, 700)
  }
  return (
    <div className="screen navy">
      <NavHeader title="Checkout" />
      <div className="panel content">
        <h3 className="sec-title">Delivery Address</h3>
        <div className="addr"><MapPin size={20} className="c-orange" /><div><b>Rahul Verma</b><span>12B, Sector V, Salt Lake, Kolkata 700091</span><span>+91 98765 43210</span></div></div>
        <h3 className="sec-title">Payment Method</h3>
        <div className="pay-list">
          {PAY.map((p) => (
            <button key={p.id} className={`pay ${pay === p.id ? 'is-on' : ''}`} onClick={() => setPay(p.id)}>
              <p.icon size={20} /><span><b>{p.label}</b><small>{p.sub}</small></span><i className="radio" />
            </button>
          ))}
        </div>
        <h3 className="sec-title">Order Summary</h3>
        <div className="summary">
          {items.map((c) => <p key={c.id}><span>{byId(c.id).name} × {c.qty}</span><span>{inr(byId(c.id).price * c.qty)}</span></p>)}
          <p><span>Delivery</span><span className={ship ? '' : 'c-green'}>{ship ? inr(ship) : 'FREE'}</span></p>
          <p className="total"><span>Total</span><span>{inr(total)}</span></p>
        </div>
        <button className="btn-orange btn-block" onClick={place} disabled={busy || !items.length}>{busy ? 'Placing order…' : `Place Order · ${inr(total)}`}</button>
        <div className="pad-bottom" />
      </div>
    </div>
  )
}

export function OrderDone() {
  const nav = useNav()
  const { state } = useStore()
  const o = state.lastOrder
  return (
    <div className="screen navy">
      <div className="panel content done">
        <span className="done-ico"><Check size={40} strokeWidth={3} /></span>
        <h2>Order Placed!</h2>
        <p>Order <b>{o?.id}</b> confirmed. You'll receive updates on SMS &amp; email.</p>
        <div className="summary"><p><span>Items</span><span>{o?.items}</span></p><p className="total"><span>Paid</span><span>{o && inr(o.total)}</span></p></div>
        <button className="btn-orange btn-block" onClick={() => nav.goTab('orders')}>Track Order</button>
        <button className="btn-ghost btn-block" onClick={() => nav.goTab('home')}>Continue Shopping</button>
      </div>
    </div>
  )
}

/* ── Orders tab ───────────────────────────────────────── */
export function Orders() {
  const { state } = useStore()
  const { showToast } = useToast()
  return (
    <div className="content">
      <header className="tab-header"><h1>My Orders</h1><p>{state.orders.length} orders</p></header>
      <div className="light-body">
        {state.orders.length === 0 ? <div className="empty"><ClipboardList size={30} /><b>No orders yet</b></div> : (
          <div className="plist">
            {state.orders.map((o) => (
              <button key={o.id} className="order" onClick={() => showToast(`${o.id}: ${o.status}`)}>
                <span className="order-ico"><Package size={22} /></span>
                <span className="order-body"><b>{o.id}</b><small>{o.items}</small><small>{o.date} · {inr(o.total)}</small></span>
                <span className={`status s-${o.status.toLowerCase()}`}>{o.status}</span>
              </button>
            ))}
          </div>
        )}
        <div className="pad-bottom" />
      </div>
    </div>
  )
}

/* ── Profile tab ──────────────────────────────────────── */
export function Profile() {
  const nav = useNav()
  const { state, dispatch } = useStore()
  const { showToast } = useToast()
  const { brand, model, variant } = vehicleInfo(state.vehicle)
  const u = state.user || { name: 'Guest', email: '' }
  const initials = u.name.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="content">
      <header className="tab-header profile-head">
        <span className="avatar">{initials}</span>
        <h1>{u.name}</h1>
        <p>{u.email}</p>
      </header>
      <div className="light-body">
        <button className="garage" onClick={() => nav.push('vehicle')}>
          <Motorbike size={26} className="c-orange" />
          <span><small>My Garage</small><b>{brand.name} {model.name}</b><small>{variant}</small></span>
          <em>Change</em>
        </button>
        <div className="menu">
          <button onClick={() => nav.switchTab('orders')}><ClipboardList size={20} /><span>My Orders</span><ChevronRight size={18} /></button>
          <button onClick={() => nav.switchTab('cart')}><ShoppingCart size={20} /><span>My Cart</span><ChevronRight size={18} /></button>
          <button onClick={() => showToast('Saved address: Salt Lake, Kolkata')}><MapPin size={20} /><span>Saved Addresses</span><ChevronRight size={18} /></button>
          <button onClick={() => nav.push('video')}><Headset size={20} /><span>Help &amp; Tutorials</span><ChevronRight size={18} /></button>
          <button onClick={() => { dispatch({ type: 'reset' }); showToast('Demo data reset') }}><RefreshCcw size={20} /><span>Reset Demo Data</span><ChevronRight size={18} /></button>
        </div>
        <button className="logout" onClick={() => { dispatch({ type: 'logout' }); showToast('Logged out') }}><LogOut size={18} /> Logout</button>
        <p className="version">AUTORYNX v1.0 · Prototype</p>
      </div>
    </div>
  )
}
