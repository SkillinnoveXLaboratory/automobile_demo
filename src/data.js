// ─────────────────────────────────────────────────────────────
// Demo data for the AmpCare prototype. Everything here is fictional.
// ─────────────────────────────────────────────────────────────

export const DEMO = {
  customer: { phone: '9876543210', otp: '1234', name: 'Arjun Mehta', email: 'arjun.mehta@example.com' },
  dealer: { id: 'DL-1024', password: 'demo@123' },
}

// Battery catalogue
export const PRODUCTS = [
  { id: 'AC-2W-5',   name: 'Ride 5Ah',        series: 'Ride',        ah: 5,   volt: 12, warranty: 36, mrp: 1450,  cca: 80,  color: '#7C5CFF', use: 'Scooters & commuter bikes' },
  { id: 'AC-2W-9',   name: 'Ride 9Ah',        series: 'Ride',        ah: 9,   volt: 12, warranty: 36, mrp: 2190,  cca: 135, color: '#7C5CFF', use: 'Premium bikes & cruisers' },
  { id: 'AC-CAR-35', name: 'Drive 35Ah',      series: 'Drive',       ah: 35,  volt: 12, warranty: 48, mrp: 4299,  cca: 300, color: '#E5194A', use: 'Small petrol hatchbacks' },
  { id: 'AC-CAR-45', name: 'Drive 45Ah',      series: 'Drive',       ah: 45,  volt: 12, warranty: 48, mrp: 5490,  cca: 370, color: '#E5194A', use: 'Hatchbacks & sedans' },
  { id: 'AC-CAR-65', name: 'Drive Plus 65Ah', series: 'Drive Plus',  ah: 65,  volt: 12, warranty: 60, mrp: 7890,  cca: 540, color: '#C3123C', use: 'Diesel cars & SUVs' },
  { id: 'AC-CV-80',  name: 'Haul 80Ah',       series: 'Haul',        ah: 80,  volt: 12, warranty: 36, mrp: 8650,  cca: 600, color: '#1F2937', use: 'Pickups & LCVs' },
  { id: 'AC-CV-100', name: 'Haul 100Ah',      series: 'Haul',        ah: 100, volt: 12, warranty: 36, mrp: 10450, cca: 720, color: '#1F2937', use: 'Commercial vans' },
  { id: 'AC-HD-150', name: 'HeavyDuty 150Ah', series: 'HeavyDuty',   ah: 150, volt: 12, warranty: 30, mrp: 14990, cca: 950, color: '#0F172A', use: 'Trucks & buses' },
  { id: 'AC-TR-88',  name: 'Farm 88Ah',       series: 'Farm',        ah: 88,  volt: 12, warranty: 36, mrp: 9290,  cca: 640, color: '#15803D', use: 'Tractors & farm equipment' },
  { id: 'AC-INV-150', name: 'Home 150Ah Tubular', series: 'Home',    ah: 150, volt: 12, warranty: 60, mrp: 13490, cca: null, color: '#F59E0B', use: 'Home inverters' },
  { id: 'AC-INV-200', name: 'Home 200Ah Tubular', series: 'Home',    ah: 200, volt: 12, warranty: 60, mrp: 16990, cca: null, color: '#F59E0B', use: 'Large homes & offices' },
]
export const productById = (id) => PRODUCTS.find((p) => p.id === id)

// Vehicle fitment map: type → brand → models (with variants & recommended product)
export const VEHICLE_TYPES = [
  { id: '2w',      label: 'Two-Wheeler', short: '2W' },
  { id: 'car',     label: 'Car',         short: 'Car' },
  { id: 'lcv',     label: 'LCV',         short: 'LCV' },
  { id: 'truck',   label: 'Truck',       short: 'Truck' },
  { id: 'bus',     label: 'Bus',         short: 'Bus' },
  { id: 'tractor', label: 'Tractor',     short: 'Tractor' },
]

export const FITMENT = {
  '2w': {
    Honda:        { 'Activa 6G': { Petrol: 'AC-2W-5' }, 'Shine 125': { Petrol: 'AC-2W-5' }, 'Unicorn': { Petrol: 'AC-2W-9' } },
    'Hero':       { 'Splendor+': { Petrol: 'AC-2W-5' }, 'Xtreme 160R': { Petrol: 'AC-2W-9' } },
    'TVS':        { 'Jupiter': { Petrol: 'AC-2W-5' }, 'Apache RTR 160': { Petrol: 'AC-2W-9' } },
    'Royal Enfield': { 'Classic 350': { Petrol: 'AC-2W-9' }, 'Hunter 350': { Petrol: 'AC-2W-9' } },
  },
  car: {
    'Maruti Suzuki': { 'Swift': { Petrol: 'AC-CAR-35', CNG: 'AC-CAR-35' }, 'Baleno': { Petrol: 'AC-CAR-35' }, 'Brezza': { Petrol: 'AC-CAR-45' }, 'Ertiga': { Petrol: 'AC-CAR-45', CNG: 'AC-CAR-45' } },
    Hyundai:         { 'i20': { Petrol: 'AC-CAR-45', Diesel: 'AC-CAR-65' }, 'Creta': { Petrol: 'AC-CAR-45', Diesel: 'AC-CAR-65' }, 'Venue': { Petrol: 'AC-CAR-45' } },
    Tata:            { 'Nexon': { Petrol: 'AC-CAR-45', Diesel: 'AC-CAR-65' }, 'Punch': { Petrol: 'AC-CAR-35' }, 'Harrier': { Diesel: 'AC-CAR-65' } },
    Mahindra:        { 'XUV700': { Petrol: 'AC-CAR-65', Diesel: 'AC-CAR-65' }, 'Scorpio-N': { Diesel: 'AC-CAR-65' }, 'Thar': { Petrol: 'AC-CAR-65', Diesel: 'AC-CAR-65' } },
    Toyota:          { 'Innova Crysta': { Diesel: 'AC-CAR-65' }, 'Glanza': { Petrol: 'AC-CAR-35' } },
  },
  lcv: {
    Tata:     { 'Ace Gold': { Diesel: 'AC-CV-80', CNG: 'AC-CV-80' }, 'Intra V30': { Diesel: 'AC-CV-80' } },
    Mahindra: { 'Bolero Pik-Up': { Diesel: 'AC-CV-80' }, 'Supro': { Diesel: 'AC-CV-80' } },
    'Ashok Leyland': { 'Dost+': { Diesel: 'AC-CV-100' } },
  },
  truck: {
    Tata:            { 'LPT 1613': { Diesel: 'AC-HD-150' }, 'Signa 4825': { Diesel: 'AC-HD-150' } },
    'Ashok Leyland': { 'Ecomet 1615': { Diesel: 'AC-HD-150' } },
    'BharatBenz':    { '1617R': { Diesel: 'AC-HD-150' } },
  },
  bus: {
    Tata:            { 'Starbus': { Diesel: 'AC-HD-150' } },
    'Ashok Leyland': { 'Viking': { Diesel: 'AC-HD-150' } },
  },
  tractor: {
    Mahindra:  { '575 DI': { Diesel: 'AC-TR-88' }, 'Arjun 605': { Diesel: 'AC-TR-88' } },
    Swaraj:    { '744 FE': { Diesel: 'AC-TR-88' } },
    Sonalika:  { 'DI 745': { Diesel: 'AC-TR-88' } },
  },
}

export const DEALERS = [
  { id: 'd1', name: 'Shree Auto Batteries',    kind: 'Dealer + Service', area: 'Salt Lake Sector V', city: 'Kolkata', pin: '700091', km: 1.2, phone: '9830012345', rating: 4.8, hours: '9:00 AM – 8:30 PM', open: true },
  { id: 'd2', name: 'Power Point Motors',      kind: 'Dealer',           area: 'Park Street',        city: 'Kolkata', pin: '700016', km: 4.6, phone: '9830054321', rating: 4.6, hours: '10:00 AM – 8:00 PM', open: true },
  { id: 'd3', name: 'New Town Battery Care',   kind: 'Service Center',   area: 'New Town Action Area I', city: 'Kolkata', pin: '700156', km: 5.9, phone: '9831122334', rating: 4.7, hours: '9:30 AM – 7:30 PM', open: true },
  { id: 'd4', name: 'Barasat Battery House',   kind: 'Dealer + Service', area: 'Barasat Station Road', city: 'Barasat', pin: '700124', km: 18.4, phone: '9874455667', rating: 4.5, hours: '9:00 AM – 9:00 PM', open: false },
  { id: 'd5', name: 'Howrah Auto Electricals', kind: 'Dealer',           area: 'G.T. Road, Howrah',  city: 'Howrah',  pin: '711101', km: 9.8, phone: '9836677889', rating: 4.4, hours: '10:00 AM – 7:00 PM', open: true },
]
export const dealerById = (id) => DEALERS.find((d) => d.id === id)

export const CLAIM_STAGES = ['Submitted', 'Under Review', 'Technical Testing', 'Decision', 'Completed']

export const ISSUE_TYPES = ['Not holding charge', 'Vehicle not starting', 'Swelling / leakage', 'Drains overnight', 'Low backup', 'Other']

export const INVERTER_APPLIANCES = [
  { id: 'bulb',   label: 'LED Bulb',  watt: 10 },
  { id: 'fan',    label: 'Ceiling Fan', watt: 75 },
  { id: 'tv',     label: 'LED TV',    watt: 100 },
  { id: 'router', label: 'Wi-Fi Router', watt: 15 },
  { id: 'laptop', label: 'Laptop',    watt: 65 },
  { id: 'fridge', label: 'Refrigerator', watt: 150 },
]

// ─── Seed state (customer + dealer share one demo database) ───
export const seedState = () => ({
  session: null, // { role: 'customer' | 'dealer' }
  customer: { name: DEMO.customer.name, phone: DEMO.customer.phone, email: DEMO.customer.email, city: 'Kolkata' },
  vehicles: [
    { id: 'v1', type: 'car', label: 'Hyundai i20', reg: 'WB 02 AK 4471', fuel: 'Petrol' },
    { id: 'v2', type: '2w',  label: 'Honda Activa 6G', reg: 'WB 06 R 2290', fuel: 'Petrol' },
  ],
  registrations: [
    { id: 'W-24A71', serial: 'AC45K2503118', productId: 'AC-CAR-45', vehicle: 'Hyundai i20 · WB 02 AK 4471', purchaseDate: '2025-03-14', dealerId: 'd1', owner: 'Arjun Mehta', ownerPhone: '9876543210', proof: true },
    { id: 'W-31H09', serial: 'ACINV2406207', productId: 'AC-INV-150', vehicle: 'Home Inverter · Salt Lake', purchaseDate: '2024-06-20', dealerId: 'd3', owner: 'Arjun Mehta', ownerPhone: '9876543210', proof: true },
    { id: 'W-19C02', serial: 'AC2W2208334', productId: 'AC-2W-9', vehicle: 'Honda Activa 6G · WB 06 R 2290', purchaseDate: '2022-08-05', dealerId: 'd2', owner: 'Arjun Mehta', ownerPhone: '9876543210', proof: false },
    { id: 'W-40D55', serial: 'AC65K2509871', productId: 'AC-CAR-65', vehicle: 'Tata Nexon · WB 20 C 1182', purchaseDate: '2025-09-02', dealerId: 'd1', owner: 'Priya Sen', ownerPhone: '9831000111', proof: true },
  ],
  claims: [
    {
      id: 'CLM-58210', regId: 'W-24A71', issue: 'Drains overnight', note: 'Car does not start in the morning after 1–2 days parked.',
      dealerId: 'd1', stage: 2, decision: null, createdAt: '2026-11-18', photos: 2,
      history: [
        { stage: 0, at: '2026-11-18 10:42', note: 'Claim raised from app' },
        { stage: 1, at: '2026-11-18 16:05', note: 'Documents verified by Shree Auto Batteries' },
        { stage: 2, at: '2026-11-19 11:30', note: 'Battery under load & discharge test' },
      ],
      loaner: { model: 'Drive 35Ah', issued: '2026-11-19', due: '2026-11-29', returned: false },
    },
  ],
  inventory: [
    { serial: 'AC45K2511402', productId: 'AC-CAR-45', addedOn: '2026-11-20', status: 'In stock' },
    { serial: 'AC45K2511403', productId: 'AC-CAR-45', addedOn: '2026-11-20', status: 'In stock' },
    { serial: 'AC65K2511118', productId: 'AC-CAR-65', addedOn: '2026-11-17', status: 'In stock' },
    { serial: 'AC2W52511021', productId: 'AC-2W-5',   addedOn: '2026-11-12', status: 'In stock' },
    { serial: 'ACINV2511310', productId: 'AC-INV-150', addedOn: '2026-11-10', status: 'In stock' },
    { serial: 'AC65K2509871', productId: 'AC-CAR-65', addedOn: '2026-08-28', status: 'Sold' },
    { serial: 'AC45K2503118', productId: 'AC-CAR-45', addedOn: '2025-03-01', status: 'Sold' },
  ],
  points: {
    balance: 2450,
    history: [
      { id: 'p1', label: 'Verified registration · W-40D55', at: '2025-09-02', pts: 50 },
      { id: 'p2', label: 'Monthly target bonus · Oct', at: '2026-11-01', pts: 500 },
      { id: 'p3', label: 'Redeemed · Gift voucher', at: '2026-10-12', pts: -1000 },
      { id: 'p4', label: 'Verified registration · W-24A71', at: '2025-03-14', pts: 50 },
    ],
  },
  notifications: [
    { id: 'n1', to: 'customer', title: 'Claim CLM-58210 moved to Technical Testing', body: 'Your Drive 45Ah is being tested at Shree Auto Batteries.', at: '2026-11-19', read: false, kind: 'claim' },
    { id: 'n2', to: 'customer', title: 'Warranty expired', body: 'Ride 9Ah (Honda Activa) warranty ended on 05 Aug 2025. Find a replacement.', at: '2025-08-05', read: false, kind: 'warranty' },
    { id: 'n3', to: 'customer', title: 'Loaner battery issued', body: 'Keep the loaner Drive 35Ah until your claim is completed.', at: '2026-11-19', read: true, kind: 'claim' },
    { id: 'n4', to: 'dealer', title: 'Claim CLM-58210 awaiting test result', body: 'Arjun Mehta · Drive 45Ah. Record the test decision.', at: '2026-11-19', read: false, kind: 'claim' },
    { id: 'n5', to: 'dealer', title: 'Monthly target bonus credited', body: '+500 points for October registrations.', at: '2026-11-01', read: true, kind: 'info' },
  ],
  settings: { push: true, whatsapp: true, language: 'English' },
})

// ─── Helpers ───
export const addMonths = (iso, m) => {
  const d = new Date(iso + 'T00:00:00')
  d.setMonth(d.getMonth() + m)
  return d
}
export const fmtDate = (v) => {
  const d = v instanceof Date ? v : new Date(String(v).length <= 10 ? v + 'T00:00:00' : v.replace(' ', 'T'))
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
export const todayISO = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
export const nowStamp = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${todayISO()} ${p(d.getHours())}:${p(d.getMinutes())}`
}
export const inr = (n) => '₹' + n.toLocaleString('en-IN')
export const fmtPhone = (p) => (p ? `+91 ${p.slice(0, 5)} ${p.slice(5)}` : '')

export const warrantyInfo = (reg) => {
  const p = productById(reg.productId)
  const start = new Date(reg.purchaseDate + 'T00:00:00')
  const end = addMonths(reg.purchaseDate, p.warranty)
  const now = new Date()
  const total = end - start
  const left = Math.max(0, end - now)
  const active = end > now
  const monthsLeft = Math.max(0, Math.round(left / (1000 * 60 * 60 * 24 * 30.44)))
  const leftLabel = !active
    ? 'Expired'
    : monthsLeft >= 12
      ? `${Math.floor(monthsLeft / 12)} yr ${monthsLeft % 12} mo left`
      : `${monthsLeft} mo left`
  return { product: p, start, end, active, pct: Math.min(100, Math.round(((total - left) / total) * 100)), leftLabel }
}

export const rid = (prefix, len = 5) => prefix + Math.random().toString(36).slice(2, 2 + len).toUpperCase()
