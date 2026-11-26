// AUTORYNX prototype data — content mirrors the client reference screens.
// Images are AI-upscaled (ESRGAN 4x) from the client reference and stored as high-quality WebP
export const A = (name) => `/assets/${name}.webp`

export const DEMO = { email: 'demo@autorynx.com', mobile: '9876543210', password: 'demo@123', name: 'Rahul Verma' }

export const VEHICLES = {
  two: {
    brands: [
      { id: 'hero', name: 'Hero', logo: A('brand-hero'), models: [
        { id: 'splendor', name: 'Splendor Plus', available: true, variants: ['BS6 (2019 – Present)', 'BS4 (2015 – 2019)'] },
        { id: 'hf', name: 'HF Deluxe', available: false, variants: ['BS6 (2020 – Present)'] },
        { id: 'glamour', name: 'Glamour', available: false, variants: ['BS6 (2020 – Present)'] },
      ] },
      { id: 'honda', name: 'Honda', logo: A('brand-honda'), models: [
        { id: 'shine', name: 'Shine 125', available: false, variants: ['BS6 (2020 – Present)'] },
        { id: 'activa', name: 'Activa 6G', available: false, variants: ['BS6 (2020 – Present)'] },
      ] },
      { id: 'bajaj', name: 'Bajaj', logo: A('brand-bajaj'), models: [{ id: 'pulsar', name: 'Pulsar 150', available: false, variants: ['BS6 (2020 – Present)'] }] },
      { id: 'tvs', name: 'TVS', logo: A('brand-tvs'), models: [{ id: 'apache', name: 'Apache RTR 160', available: false, variants: ['BS6 (2020 – Present)'] }] },
      { id: 're', name: 'Royal Enfield', logo: A('brand-re'), models: [{ id: 'classic', name: 'Classic 350', available: false, variants: ['J-Series (2021 – Present)'] }] },
    ],
  },
  four: {
    brands: [
      { id: 'maruti', name: 'Maruti Suzuki', logo: A('brand-maruti'), models: [{ id: 'swift', name: 'Swift', available: false, variants: ['2024 – Present'] }] },
      { id: 'hyundai', name: 'Hyundai', logo: A('brand-hyundai'), models: [{ id: 'creta', name: 'Creta', available: false, variants: ['2024 – Present'] }] },
      { id: 'tata', name: 'Tata', logo: A('brand-tata'), models: [{ id: 'nexon', name: 'Nexon', available: false, variants: ['2023 – Present'] }] },
      { id: 'mahindra', name: 'Mahindra', logo: A('brand-mahindra'), models: [{ id: 'xuv700', name: 'XUV700', available: false, variants: ['2021 – Present'] }] },
    ],
  },
}

export const SYSTEMS = [
  { id: 'engine', name: 'Engine', img: A('sys-engine'), parts: ['Cylinder Head', 'Piston Kit', 'Clutch Plate Set', 'Spark Plug'] },
  { id: 'transmission', name: 'Transmission', img: A('sys-transmission'), parts: ['Drive Chain Kit', 'Gear Shift Lever', 'Sprocket Set'] },
  { id: 'brake', name: 'Brake', img: A('sys-brake'), parts: ['Brake Shoe (Front)', 'Brake Shoe (Rear)', 'Brake Cable'] },
  { id: 'electrical', name: 'Electrical', img: A('sys-electrical'), parts: ['Headlamp Assembly', 'Tail Lamp Assembly', 'Battery 12V 3Ah', 'Horn'] },
  { id: 'suspension', name: 'Suspension', img: A('sys-suspension'), parts: ['Front Fork Assembly', 'Rear Shock Absorber'] },
  { id: 'body', name: 'Body Parts', img: A('sys-body'), parts: ['Front Mudguard', 'Side Panel Set', 'Fuel Tank'] },
]

export const HEADLAMP = {
  id: 'headlamp',
  name: 'Headlamp Assembly',
  partNo: '33100-KCC-900',
  brand: 'Hero (Genuine)',
  compat: 'Splendor Plus BS6',
  compatYears: '(2019 – Present)',
  rating: 4.7,
  reviews: 325,
  price: 849,
  mrp: 940,
  img: A('headlamp'),
}

export const EXPLODED = [
  { n: 1, label: 'Lens (33101-KCC-900)', x: 12, y: 24 },
  { n: 2, label: 'Reflector (33120-KCC-900)', x: 33, y: 11 },
  { n: 3, label: 'Bulb (12V 35/35W)', x: 82, y: 6 },
  { n: 4, label: 'Housing (33110-KCC-900)', x: 56, y: 40 },
  { n: 5, label: 'Mounting Bracket', x: 76, y: 52 },
  { n: 6, label: 'Screw (M6 x 20, 2 Nos.)', x: 41, y: 93 },
]

export const FASTENERS = [
  { sn: 1, name: 'Mounting Bolt', size: 'M6 x 20', qty: 2, torque: '8 – 10 N·m' },
  { sn: 2, name: 'Adjuster Screw', size: 'M5 x 12', qty: 1, torque: '3 – 4 N·m' },
  { sn: 3, name: 'Ground Screw', size: 'M6 x 16', qty: 1, torque: '6 – 8 N·m' },
  { sn: 4, name: 'Ground Screw', size: 'M6 x 16', qty: 3, torque: '6 – 8 N·m' },
]
export const FASTENER_ICONS = [
  { img: A('fast-1'), label: ['M6 x 20', 'Bolt'] },
  { img: A('fast-2'), label: ['M5 x 12', 'Screw'] },
  { img: A('fast-3'), label: ['M6 x 16', 'Bolt'] },
  { img: A('fast-4'), label: ['Plain', 'Washer'] },
  { img: A('fast-5'), label: ['Spring', 'Washer'] },
]

export const STEPS = [
  { text: 'Remove front cowl screws (M6 x 20) and take out cowl.', img: A('step-1') },
  { text: 'Disconnect headlamp wiring connector.', img: A('step-2') },
  { text: 'Remove old headlamp assembly (2 bolts).', img: A('step-3') },
  { text: 'Install new headlamp and align with bracket.', img: A('step-4') },
  { text: 'Tighten bolts to 8 – 10 N·m and reconnect wiring.', img: A('step-5') },
]

export const VIDEOS = [
  { id: 'main', title: 'Headlamp Assembly – Remove & Install', dur: 381, img: A('video-main') },
  { id: 'v1', title: 'Headlamp Bulb Change', dur: 138, img: A('vid-1') },
  { id: 'v2', title: 'Front Cowl Removal', dur: 245, img: A('vid-2') },
  { id: 'v3', title: 'Wiring Connection Guide', dur: 321, img: A('vid-3') },
  { id: 'v4', title: 'Headlamp Adjustment', dur: 197, img: A('vid-4') },
]

export const BRANDS = [
  { name: 'Hero', img: A('brand-hero') }, { name: 'Honda', img: A('brand-honda') }, { name: 'Bajaj', img: A('brand-bajaj') },
  { name: 'TVS', img: A('brand-tvs') }, { name: 'Yamaha', img: A('brand-yamaha') }, { name: 'Royal Enfield', img: A('brand-re') },
  { name: 'Maruti Suzuki', img: A('brand-maruti') }, { name: 'Hyundai', img: A('brand-hyundai') }, { name: 'Tata', img: A('brand-tata') },
  { name: 'Mahindra', img: A('brand-mahindra') },
]

// Catalogue used by search / explore
export const CATALOGUE = [
  { ...HEADLAMP, sys: 'Electrical' },
  { id: 'tail', name: 'Tail Lamp Assembly', partNo: '33700-KCC-900', price: 612, mrp: 680, sys: 'Electrical', img: null },
  { id: 'brake-shoe', name: 'Brake Shoe Set (Front)', partNo: '06450-KCC-900', price: 289, mrp: 320, sys: 'Brake', img: A('sys-brake') },
  { id: 'shock', name: 'Rear Shock Absorber', partNo: '52400-KCC-900', price: 1450, mrp: 1610, sys: 'Suspension', img: A('sys-suspension') },
  { id: 'seat', name: 'Seat Assembly', partNo: '77200-KCC-900', price: 1180, mrp: 1310, sys: 'Body Parts', img: A('sys-transmission') },
]

export const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
export const inr = (n, dec = false) => '₹ ' + n.toLocaleString('en-IN', dec ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {})

export const seed = () => ({
  user: null, // { name, email }
  remember: true,
  cart: [{ id: 'headlamp', qty: 1 }, { id: 'brake-shoe', qty: 1 }, { id: 'shock', qty: 1 }],
  orders: [
    { id: 'AX-240518', date: '18 Nov 2026', items: 'Brake Shoe Set (Front) × 1', total: 289, status: 'Delivered' },
    { id: 'AX-240611', date: '22 Nov 2026', items: 'Rear Shock Absorber × 1', total: 1450, status: 'Shipped' },
  ],
  vehicle: { type: 'two', brand: 'hero', model: 'splendor', variant: 'BS6 (2019 – Present)' },
  doneSteps: [],
})
