import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Box, Check, Eye, EyeOff, Lock, Mail, ScanSearch, ShoppingBag, User, Wrench } from 'lucide-react'
import { AppleIcon, FacebookIcon, GoogleIcon, LogoStacked } from '../components/ui'
import { A, DEMO } from '../data'
import { useNav, useStore, useToast } from '../store'

/* ── 1. Splash / onboarding ───────────────────────────── */
const FEATURES = [
  { label: 'Explore 3D', icon: Box },
  { label: 'Find Parts', icon: ScanSearch },
  { label: 'Learn & Install', icon: Wrench },
  { label: 'Buy & Sell', icon: ShoppingBag },
]

export function Splash() {
  const nav = useNav()
  const [slide, setSlide] = useState(0)
  const touch = useRef(null)
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % 4), 2600)
    return () => clearInterval(t)
  }, [slide])
  const onTouchStart = (e) => { touch.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touch.current == null) return
    const dx = e.changedTouches[0].clientX - touch.current
    if (Math.abs(dx) > 40) setSlide((s) => (dx < 0 ? Math.min(3, s + 1) : Math.max(0, s - 1)))
    touch.current = null
  }
  return (
    <div className="screen splash" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="splash-logo"><LogoStacked mark={108} word={39} /></div>
      <p className="splash-tag">THE COMPLETE<br />AUTOMOTIVE ECOSYSTEM</p>
      <div className="splash-visual"><img src={A('splash-vehicles')} alt="Motorcycle and SUV" /></div>
      <div className="splash-feats">
        {FEATURES.map((f, i) => (
          <button key={f.label} className={`splash-feat ${i === slide ? 'is-on' : ''}`} onClick={() => setSlide(i)}>
            <f.icon size={25} strokeWidth={1.6} />
            <span>{f.label}</span>
          </button>
        ))}
      </div>
      <div className="dots">
        {[0, 1, 2, 3].map((i) => <button key={i} className={`dot ${i === slide ? 'is-on' : ''}`} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} />)}
      </div>
      <button className="btn-orange splash-cta" onClick={() => nav.push('login')}>Get Started <ArrowRight size={18} strokeWidth={2.4} /></button>
    </div>
  )
}

/* ── Shared auth field ── */
function AuthField({ icon: Icon, error, right, ...rest }) {
  return (
    <div className="auth-field-wrap">
      <label className={`auth-field ${error ? 'has-err' : ''}`}>
        <Icon size={20} strokeWidth={1.8} className="auth-ico" />
        <input {...rest} />
        {right}
      </label>
      {error && <span className="auth-err">{error}</span>}
    </div>
  )
}

function Socials() {
  const { dispatch } = useStore()
  const { showToast } = useToast()
  const go = (p) => { dispatch({ type: 'login', user: { name: DEMO.name, email: DEMO.email } }); showToast(`Signed in with ${p}`) }
  return (
    <>
      <div className="or-line"><span>or continue with</span></div>
      <div className="socials">
        <button className="social" onClick={() => go('Google')} aria-label="Continue with Google"><GoogleIcon /></button>
        <button className="social" onClick={() => go('Apple')} aria-label="Continue with Apple"><AppleIcon /></button>
        <button className="social" onClick={() => go('Facebook')} aria-label="Continue with Facebook"><FacebookIcon /></button>
      </div>
    </>
  )
}

/* ── 2. Login ─────────────────────────────────────────── */
export function Login() {
  const nav = useNav()
  const { state, dispatch } = useStore()
  const { showToast } = useToast()
  // Demo credentials are pre-filled so the client can log in with one tap
  const [id, setId] = useState(DEMO.email)
  const [pwd, setPwd] = useState(DEMO.password)
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(state.remember)
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)

  const submit = () => {
    // Empty form = one-tap demo login (keeps the screen identical to the reference)
    const demoTap = !id.trim() && !pwd
    if (!demoTap) {
      const e = {}
      const okId = [DEMO.email, DEMO.mobile].includes(id.trim().toLowerCase())
      if (!id.trim()) e.id = 'Enter email or mobile number'
      else if (!okId) e.id = 'Account not found. Try demo@autorynx.com'
      if (!pwd) e.pwd = 'Enter your password'
      else if (okId && pwd !== DEMO.password) e.pwd = 'Incorrect password'
      setErr(e)
      if (Object.keys(e).length) return
    }
    setBusy(true)
    setTimeout(() => {
      dispatch({ type: 'login', user: { name: DEMO.name, email: DEMO.email }, remember })
      showToast(demoTap ? 'Logged in with demo account' : 'Welcome back!')
    }, 500)
  }

  return (
    <div className="screen auth">
      <div className="auth-glow" aria-hidden />
      <div className="content auth-content">
        <div className="auth-logo"><LogoStacked mark={86} word={33} /></div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">Login to your account</p>
        <div className="auth-form">
          <AuthField icon={Mail} placeholder="Email / Mobile Number" value={id} onChange={(e) => { setId(e.target.value); setErr({}) }} error={err.id} autoComplete="username" />
          <AuthField icon={Lock} type={show ? 'text' : 'password'} placeholder="Password" value={pwd} onChange={(e) => { setPwd(e.target.value); setErr({}) }} error={err.pwd} autoComplete="current-password"
            right={<button type="button" className="eye" onClick={() => setShow(!show)} aria-label="Show password">{show ? <Eye size={20} /> : <EyeOff size={20} />}</button>} />
        </div>
        <div className="auth-row">
          <button className="remember" onClick={() => setRemember(!remember)}>
            <span className={`check ${remember ? 'is-on' : ''}`}>{remember && <Check size={13} strokeWidth={3.4} />}</span>
            Remember me
          </button>
          <button className="link-u" onClick={() => nav.push('forgot')}>Forgot Password?</button>
        </div>
        <button className="btn-orange btn-block" onClick={submit} disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
        <Socials />
        <p className="auth-foot">Don't have an account? <button className="link-o" onClick={() => nav.push('signup')}>Sign Up</button></p>
      </div>
    </div>
  )
}

/* ── Sign up ──────────────────────────────────────────── */
export function Signup() {
  const nav = useNav()
  const { dispatch } = useStore()
  const { showToast } = useToast()
  const [f, setF] = useState({ name: '', id: '', pwd: '', pwd2: '' })
  const [agree, setAgree] = useState(true)
  const [err, setErr] = useState({})
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErr({}) }
  const submit = () => {
    const e = {}
    if (f.name.trim().length < 3) e.name = 'Enter your full name'
    if (!/^\S+@\S+\.\S+$/.test(f.id.trim()) && !/^[6-9]\d{9}$/.test(f.id.trim())) e.id = 'Enter a valid email or 10-digit mobile'
    if (f.pwd.length < 6) e.pwd = 'Minimum 6 characters'
    else if (f.pwd !== f.pwd2) e.pwd2 = 'Passwords do not match'
    if (!agree) e.agree = true
    setErr(e)
    if (Object.keys(e).length) { if (e.agree && Object.keys(e).length === 1) showToast('Please accept the Terms'); return }
    dispatch({ type: 'login', user: { name: f.name.trim(), email: f.id.trim() } })
    showToast('Account created')
  }
  return (
    <div className="screen auth">
      <div className="auth-glow" aria-hidden />
      <div className="content auth-content">
        <div className="auth-logo sm"><LogoStacked mark={64} word={25} /></div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub">Sign up to get started</p>
        <div className="auth-form">
          <AuthField icon={User} placeholder="Full Name" value={f.name} onChange={set('name')} error={err.name} />
          <AuthField icon={Mail} placeholder="Email / Mobile Number" value={f.id} onChange={set('id')} error={err.id} />
          <AuthField icon={Lock} type="password" placeholder="Password" value={f.pwd} onChange={set('pwd')} error={err.pwd} />
          <AuthField icon={Lock} type="password" placeholder="Confirm Password" value={f.pwd2} onChange={set('pwd2')} error={err.pwd2} />
        </div>
        <div className="auth-row">
          <button className="remember" onClick={() => setAgree(!agree)}>
            <span className={`check ${agree ? 'is-on' : ''}`}>{agree && <Check size={13} strokeWidth={3.4} />}</span>
            I agree to Terms & Privacy Policy
          </button>
        </div>
        <button className="btn-orange btn-block" onClick={submit}>Sign Up</button>
        <Socials />
        <p className="auth-foot">Already have an account? <button className="link-o" onClick={() => nav.back()}>Login</button></p>
      </div>
    </div>
  )
}

/* ── Forgot password ──────────────────────────────────── */
export function Forgot() {
  const nav = useNav()
  const [id, setId] = useState('')
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(false)
  const send = () => {
    const v = id.trim()
    if (!/^\S+@\S+\.\S+$/.test(v) && !/^[6-9]\d{9}$/.test(v)) return setErr('Enter a valid email or 10-digit mobile')
    setSent(true)
  }
  return (
    <div className="screen auth">
      <div className="auth-glow" aria-hidden />
      <div className="content auth-content">
        <div className="auth-logo sm"><LogoStacked mark={64} word={25} /></div>
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-sub">{sent ? 'Check your inbox / SMS' : "We'll send you a reset link"}</p>
        {sent ? (
          <div className="sent-box">
            <span className="sent-ico"><Check size={26} strokeWidth={3} /></span>
            <p>A password reset link has been sent to <b>{id.trim()}</b>.</p>
          </div>
        ) : (
          <div className="auth-form">
            <AuthField icon={Mail} placeholder="Email / Mobile Number" value={id} onChange={(e) => { setId(e.target.value); setErr('') }} error={err} />
          </div>
        )}
        {!sent && <button className="btn-orange btn-block mt-20" onClick={send}>Send Reset Link</button>}
        <p className="auth-foot">Remembered it? <button className="link-o" onClick={() => nav.back()}>Back to Login</button></p>
      </div>
    </div>
  )
}
