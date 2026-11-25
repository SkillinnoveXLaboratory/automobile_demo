import { useEffect, useRef, useState } from 'react'
import { BatteryCharging, Bike, Car, Eye, EyeOff, Lock, ShieldCheck, Smartphone, Store, Tractor, Truck, User, Zap } from 'lucide-react'
import { AppBar, Button, Field, Segmented, Select } from '../components/ui'
import { DEMO, VEHICLE_TYPES, fmtPhone } from '../data'
import { useNav, useStore, useToast } from '../store'

export function Logo({ size = 44 }) {
  return (
    <span className="logo" style={{ width: size, height: size }}>
      <Zap size={size * 0.52} fill="#fff" strokeWidth={0} />
    </span>
  )
}

/* ── Welcome (onboarding) ───────────────────────────── */
export function Welcome() {
  const nav = useNav()
  return (
    <div className="screen welcome">
      <div className="welcome-art" aria-hidden>
        <span className="bubble b1"><BatteryCharging size={54} strokeWidth={1.6} /></span>
        <span className="bubble b2"><Car size={30} strokeWidth={1.8} /></span>
        <span className="bubble b3"><ShieldCheck size={40} strokeWidth={1.6} /></span>
        <span className="bubble b4" />
        <span className="bubble b5"><Bike size={22} /></span>
        <span className="bubble b6"><Truck size={26} strokeWidth={1.8} /></span>
        <span className="bubble b7"><Tractor size={20} /></span>
      </div>
      <div className="welcome-logo"><Logo /></div>
      <div className="welcome-body">
        <span className="eyebrow">AMPCARE</span>
        <h1 className="welcome-title">Power that<br />lasts.</h1>
        <p className="welcome-text">Register batteries, keep digital warranty cards and track claims, all in one app.</p>
        <div className="stack-12">
          <Button onClick={() => nav.push('signup')}>Sign up</Button>
          <Button variant="secondary" onClick={() => nav.push('login')}>Log in</Button>
        </div>
      </div>
    </div>
  )
}

/* ── Login (customer OTP / dealer ID) ───────────────── */
export function Login() {
  const nav = useNav()
  const { dispatch } = useStore()
  const { showToast } = useToast()
  const [role, setRole] = useState('customer')
  const [phone, setPhone] = useState(DEMO.customer.phone)
  const [dealerId, setDealerId] = useState(DEMO.dealer.id)
  const [pwd, setPwd] = useState(DEMO.dealer.password)
  const [show, setShow] = useState(false)
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)

  const submit = () => {
    if (role === 'customer') {
      if (!/^[6-9]\d{9}$/.test(phone)) return setErr({ phone: 'Enter a valid 10-digit mobile number' })
      setErr({})
      setBusy(true)
      setTimeout(() => { setBusy(false); nav.push('otp', { phone }) ; showToast(`OTP sent to ${fmtPhone(phone)}`) }, 600)
    } else {
      const e = {}
      if (dealerId.trim().toUpperCase() !== DEMO.dealer.id) e.dealerId = 'Dealer ID not found. Try DL-1024'
      if (pwd !== DEMO.dealer.password) e.pwd = 'Incorrect password'
      setErr(e)
      if (Object.keys(e).length) return
      setBusy(true)
      setTimeout(() => { dispatch({ type: 'login', role: 'dealer' }); showToast('Welcome back, Shree Auto Batteries') }, 600)
    }
  }

  return (
    <div className="screen">
      <AppBar title="" transparent />
      <div className="content pad">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Log in to manage your batteries and warranties.</p>

        <Segmented
          value={role}
          onChange={(v) => { setRole(v); setErr({}) }}
          items={[{ value: 'customer', label: 'Customer', icon: User }, { value: 'dealer', label: 'Dealer', icon: Store }]}
        />

        <div className="stack-16 mt-24">
          {role === 'customer' ? (
            <Field
              label="Mobile number"
              prefix="+91"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              error={err.phone}
              hint="We'll send a 4-digit OTP to this number"
            />
          ) : (
            <>
              <Field label="Dealer ID" value={dealerId} onChange={(e) => setDealerId(e.target.value)} error={err.dealerId} prefix={<Store size={18} />} />
              <Field
                label="Password"
                type={show ? 'text' : 'password'}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                error={err.pwd}
                prefix={<Lock size={18} />}
                suffix={<button type="button" className="field-suffix-btn" onClick={() => setShow(!show)} aria-label="Show password">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
              />
            </>
          )}
        </div>

        <div className="demo-note">
          <Smartphone size={16} />
          <span>{role === 'customer' ? <>Demo: <b>98765 43210</b> · OTP <b>1234</b></> : <>Demo: <b>DL-1024</b> · <b>demo@123</b></>}</span>
        </div>
      </div>
      <div className="footer-actions">
        <Button onClick={submit} disabled={busy}>{busy ? 'Please wait…' : role === 'customer' ? 'Send OTP' : 'Log in'}</Button>
        <p className="footer-link">New here? <button className="text-link" onClick={() => nav.replace('signup')}>Create an account</button></p>
      </div>
    </div>
  )
}

/* ── OTP ────────────────────────────────────────────── */
export function Otp({ params }) {
  const nav = useNav()
  const { dispatch } = useStore()
  const { showToast } = useToast()
  const [code, setCode] = useState(['', '', '', ''])
  const [err, setErr] = useState('')
  const [secs, setSecs] = useState(30)
  const refs = useRef([])

  // auto-fill demo OTP like Android SMS retriever
  useEffect(() => {
    const t = setTimeout(() => setCode(DEMO.customer.otp.split('')), 900)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    if (secs <= 0) return
    const t = setTimeout(() => setSecs(secs - 1), 1000)
    return () => clearTimeout(t)
  }, [secs])

  const setDigit = (i, v) => {
    const d = v.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[i] = d
    setCode(next)
    setErr('')
    if (d && i < 3) refs.current[i + 1]?.focus()
  }

  const verify = () => {
    if (code.join('') !== DEMO.customer.otp) return setErr('Incorrect OTP. Use 1234 for the demo.')
    if (params.signup) dispatch({ type: 'signup', data: params.signup })
    dispatch({ type: 'login', role: 'customer' })
    showToast('Logged in successfully')
  }

  return (
    <div className="screen">
      <AppBar title="" transparent />
      <div className="content pad">
        <span className="auth-icon"><Smartphone size={26} /></span>
        <h1 className="auth-title">Verify your number</h1>
        <p className="auth-sub">Enter the 4-digit code sent to <b className="ink">{fmtPhone(params.phone)}</b></p>
        <div className="otp">
          {code.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              className={`otp-box ${d ? 'is-filled' : ''} ${err ? 'is-error' : ''}`}
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => e.key === 'Backspace' && !d && i > 0 && refs.current[i - 1]?.focus()}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>
        {err && <p className="field-error center">{err}</p>}
        <p className="resend">
          {secs > 0 ? <>Resend code in <b>00:{String(secs).padStart(2, '0')}</b></> : <button className="text-link" onClick={() => { setSecs(30); showToast('OTP re-sent') }}>Resend code</button>}
        </p>
      </div>
      <div className="footer-actions">
        <Button onClick={verify} disabled={code.join('').length < 4}>Verify & continue</Button>
        <p className="footer-link"><button className="text-link" onClick={nav.back}>Change number</button></p>
      </div>
    </div>
  )
}

/* ── Sign up ────────────────────────────────────────── */
export function Signup() {
  const nav = useNav()
  const { showToast } = useToast()
  const [f, setF] = useState({ name: 'Arjun Mehta', phone: DEMO.customer.phone, email: DEMO.customer.email, vehicle: 'car' })
  const [err, setErr] = useState({})
  const set = (k) => (e) => setF({ ...f, [k]: k === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value })

  const submit = () => {
    const e = {}
    if (f.name.trim().length < 3) e.name = 'Enter your full name'
    if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone = 'Enter a valid 10-digit mobile number'
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email'
    setErr(e)
    if (Object.keys(e).length) return
    nav.push('otp', { phone: f.phone, signup: { name: f.name.trim(), phone: f.phone, email: f.email } })
    showToast(`OTP sent to ${fmtPhone(f.phone)}`)
  }

  return (
    <div className="screen">
      <AppBar title="" transparent />
      <div className="content pad">
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">It takes less than a minute.</p>
        <div className="stack-16">
          <Field label="Full name" value={f.name} onChange={set('name')} error={err.name} />
          <Field label="Mobile number" prefix="+91" inputMode="numeric" maxLength={10} value={f.phone} onChange={set('phone')} error={err.phone} />
          <Field label="Email (optional)" type="email" value={f.email} onChange={set('email')} error={err.email} />
          <Select label="Primary vehicle" value={f.vehicle} onChange={(v) => setF({ ...f, vehicle: v })} options={VEHICLE_TYPES.map((t) => ({ value: t.id, label: t.label })).concat({ value: 'inverter', label: 'Home Inverter' })} />
        </div>
        <p className="legal">By continuing you agree to the Terms of Service and Privacy Policy.</p>
      </div>
      <div className="footer-actions">
        <Button onClick={submit}>Continue</Button>
        <p className="footer-link">Already registered? <button className="text-link" onClick={() => nav.replace('login')}>Log in</button></p>
      </div>
    </div>
  )
}
