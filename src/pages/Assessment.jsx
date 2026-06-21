import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check, X, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { log } from '../lib/logger.js'

const STEPS = ['About you', 'Your field', 'Priorities', 'Culture & lifestyle', 'Eligibility', 'Budget & timeline']

const NATIONALITIES = ['Afghan','Albanian','Algerian','American','Argentinian','Australian','Bangladeshi','Brazilian','British','Canadian','Chinese','Colombian','Egyptian','Ethiopian','French','German','Ghanaian','Indian','Indonesian','Iranian','Iraqi','Italian','Japanese','Kenyan','Lebanese','Malaysian','Moroccan','Mexican','Nigerian','Pakistani','Peruvian','Philippino','Polish','Romanian','Russian','Saudi Arabian','Senegalese','Singaporean','Somali','South African','South Korean','Spanish','Sri Lankan','Sudanese','Swedish','Syrian','Taiwanese','Tanzanian','Thai','Turkish','Ugandan','Ukrainian','Venezuelan','Vietnamese','Other']

const FIELDS = [
  'Engineering',
  'Computer Science / AI / Data',
  'Business / MBA',
  'Finance / Economics',
  'Medicine / Biomedical',
  'Law',
  'Architecture / Urban Design',
  'Arts / Design / Fashion',
  'Social Sciences / Psychology',
  'Environmental / Sustainability',
  'Linguistics / Literature',
  'Natural Sciences',
  'Other',
]

const DEGREE_LEVELS = ["Bachelor's", "Master's (MSc/MA)", "MBA", "PhD / Research", "Exchange / Semester abroad"]

const DIMENSION_INFO = [
  { key: 'career',     label: 'Career & visa pathway',     icon: '💼', hint: 'Job market strength, internships, post-grad visa options' },
  { key: 'cost',       label: 'Affordability',             icon: '💰', hint: 'Rent, groceries, transport — lower budget = higher priority' },
  { key: 'safety',     label: 'Safety & inclusion',        icon: '🛡️', hint: 'Personal safety, racism tolerance, LGBTQ+ climate' },
  { key: 'diversity',  label: 'Diversity & representation', icon: '🌍', hint: 'International student community, representation of your background' },
  { key: 'healthcare', label: 'Healthcare access',         icon: '🏥', hint: 'Affordability and quality of medical / mental health support' },
]
// NOTE: 'social' is intentionally NOT a slider here. It's captured more precisely
// by the "social style" selector in Step 3, and its weight is derived from that
// choice (see SOCIAL_STYLE_WEIGHT below). This avoids asking about social life twice.

const RELIGION_OPTIONS = [
  { value: 'none',      label: 'No preference', emoji: '—' },
  { value: 'muslim',    label: 'Muslim',         emoji: '☪️' },
  { value: 'christian', label: 'Christian',      emoji: '✝️' },
  { value: 'hindu',     label: 'Hindu',          emoji: '🕉️' },
  { value: 'buddhist',  label: 'Buddhist',       emoji: '☸️' },
  { value: 'jewish',    label: 'Jewish',         emoji: '✡️' },
  { value: 'other',     label: 'Other',          emoji: '🙏' },
]

const SOCIAL_STYLES = [
  { value: 'quiet',            label: 'Quiet & focused',        desc: 'Home, café, focused study. Social is secondary.' },
  { value: 'community_active', label: 'Community builder',      desc: 'Clubs, events, student organisations. Making real friends.' },
  { value: 'nightlife',        label: 'Nightlife & socialising', desc: 'Bars, parties, exploring the city after dark.' },
  { value: 'outdoors',         label: 'Outdoors & active',      desc: 'Nature, cycling, sport, travel. City is just the base.' },
]

// Derives the 'social' priority weight (1-10) from the chosen social style,
// replacing the removed social slider so we don't ask about social life twice.
const SOCIAL_STYLE_WEIGHT = {
  quiet:            3,
  community_active: 7,
  nightlife:        9,
  outdoors:         5,
}

const ALCOHOL_OPTIONS = [
  { value: 'fine',        label: 'Totally fine with it' },
  { value: 'prefer_none', label: 'I prefer not to, but no strong objection' },
  { value: 'must_avoid',  label: 'I need an alcohol-minimal environment' },
]

const BUDGET_OPTIONS = [
  { value: 'under_1000',  label: 'Under $1,000/mo',    desc: 'Very budget-conscious — Delft / Paris CROUS recommended' },
  { value: '1000_1500',   label: '$1,000–$1,500/mo',   desc: 'Comfortable in NL or Paris; tight in Boston' },
  { value: '1500_2500',   label: '$1,500–$2,500/mo',   desc: 'Comfortable across all three cities' },
  { value: 'above_2500',  label: 'Above $2,500/mo',    desc: 'Full comfort in Boston; living well everywhere' },
]

const TIMELINE_OPTIONS = [
  { value: 'sep_2025', label: 'September 2025' },
  { value: 'jan_2026', label: 'January 2026'  },
  { value: 'sep_2026', label: 'September 2026' },
  { value: 'jan_2027', label: 'January 2027'  },
  { value: 'other',    label: 'Other / TBD'   },
]

const LANGUAGE_TESTS = [
  { value: 'ielts',    label: 'IELTS', placeholder: 'e.g. 7.0 (scale: 1–9)' },
  { value: 'toefl',    label: 'TOEFL iBT', placeholder: 'e.g. 100 (scale: 0–120)' },
  { value: 'delf',     label: 'DELF / DALF (French)', placeholder: 'e.g. B2, C1, C2' },
  { value: 'tcf',      label: 'TCF (French)', placeholder: 'e.g. B2, C1' },
  { value: 'duolingo', label: 'Duolingo English Test', placeholder: 'e.g. 120 (scale: 10–160)' },
  { value: 'none',     label: 'None / in progress', placeholder: '' },
]

const CRIMINAL_OPTIONS = [
  { value: 'none',      label: 'No, I have no criminal record', icon: '✅' },
  { value: 'minor',     label: 'I have a minor / spent conviction', icon: '⚠️' },
  { value: 'yes',       label: 'Yes, I have a prior conviction', icon: '❌' },
  { value: 'undisclosed', label: 'Prefer not to disclose', icon: '🔒' },
]

const DEFAULT_WEIGHTS = { career: 7, cost: 6, safety: 7, social: 5, diversity: 5, healthcare: 5 }

// ── Currency & cost context by nationality ───────────────────────────────────
// Used to show real-world affordability context on sliders
const NATIONALITY_CONTEXT = {
  'Indian':        { symbol: '₹',  rate: 83,    studentMonthly: '₹18,000–35,000', studentMonthlyUSD: 300  },
  'Nigerian':      { symbol: '₦',  rate: 1580,  studentMonthly: '₦80,000–150,000', studentMonthlyUSD: 70  },
  'Pakistani':     { symbol: '₨',  rate: 278,   studentMonthly: '₨30,000–60,000', studentMonthlyUSD: 150  },
  'Bangladeshi':   { symbol: '৳',  rate: 110,   studentMonthly: '৳15,000–30,000', studentMonthlyUSD: 170  },
  'Chinese':       { symbol: '¥',  rate: 7.2,   studentMonthly: '¥3,000–7,000', studentMonthlyUSD: 650    },
  'South Korean':  { symbol: '₩',  rate: 1330,  studentMonthly: '₩600,000–1,200,000', studentMonthlyUSD: 600 },
  'Brazilian':     { symbol: 'R$', rate: 5.1,   studentMonthly: 'R$2,000–4,000', studentMonthlyUSD: 500   },
  'Mexican':       { symbol: '$',  rate: 17.5,  studentMonthly: '$8,000–16,000', studentMonthlyUSD: 600    },
  'Egyptian':      { symbol: 'E£', rate: 48,    studentMonthly: 'E£5,000–10,000', studentMonthlyUSD: 140   },
  'Turkish':       { symbol: '₺',  rate: 32,    studentMonthly: '₺8,000–18,000', studentMonthlyUSD: 400    },
  'Iranian':       { symbol: '﷼', rate: 42000,  studentMonthly: '~$200–500 USD equivalent', studentMonthlyUSD: 300 },
  'Moroccan':      { symbol: 'DH', rate: 10,    studentMonthly: 'DH3,000–6,000', studentMonthlyUSD: 400    },
  'Algerian':      { symbol: 'DA', rate: 135,   studentMonthly: 'DA30,000–60,000', studentMonthlyUSD: 320  },
  'Kenyan':        { symbol: 'KSh',rate: 130,   studentMonthly: 'KSh25,000–50,000', studentMonthlyUSD: 250 },
  'Ghanaian':      { symbol: '₵',  rate: 15.5,  studentMonthly: '₵2,000–5,000', studentMonthlyUSD: 200    },
  'Senegalese':    { symbol: 'CFA',rate: 618,   studentMonthly: 'CFA100,000–200,000', studentMonthlyUSD: 230 },
  'South African': { symbol: 'R',  rate: 18.5,  studentMonthly: 'R4,000–9,000', studentMonthlyUSD: 350    },
  'Indonesian':    { symbol: 'Rp', rate: 15700, studentMonthly: 'Rp3,000,000–6,000,000', studentMonthlyUSD: 270 },
  'Malaysian':     { symbol: 'RM', rate: 4.7,   studentMonthly: 'RM1,500–3,000', studentMonthlyUSD: 450   },
  'Vietnamese':    { symbol: '₫',  rate: 25000, studentMonthly: '₫5,000,000–10,000,000', studentMonthlyUSD: 280 },
  'Thai':          { symbol: '฿',  rate: 35,    studentMonthly: '฿10,000–20,000', studentMonthlyUSD: 400   },
  'Philippino':    { symbol: '₱',  rate: 56,    studentMonthly: '₱15,000–30,000', studentMonthlyUSD: 380  },
  'Sri Lankan':    { symbol: 'Rs', rate: 300,   studentMonthly: 'Rs50,000–100,000', studentMonthlyUSD: 230 },
  'Saudi Arabian': { symbol: 'SR', rate: 3.75,  studentMonthly: 'SR2,000–4,500', studentMonthlyUSD: 850   },
  'Iraqi':         { symbol: 'IQD',rate: 1310,  studentMonthly: 'IQD500,000–900,000', studentMonthlyUSD: 500 },
  'Sudanese':      { symbol: 'SDG',rate: 550,   studentMonthly: '~$150–300 USD equivalent', studentMonthlyUSD: 200 },
  'Somali':        { symbol: 'SOS',rate: 571,   studentMonthly: '~$150–300 USD equivalent', studentMonthlyUSD: 200 },
  'Syrian':        { symbol: 'SYP',rate: 2500,  studentMonthly: '~$100–250 USD equivalent', studentMonthlyUSD: 150 },
  'Lebanese':      { symbol: 'L£', rate: 89500, studentMonthly: '~$300–600 USD equivalent', studentMonthlyUSD: 400 },
  'Afghan':        { symbol: '؋',  rate: 70,    studentMonthly: '~$100–200 USD equivalent', studentMonthlyUSD: 150 },
  'Ugandan':       { symbol: 'USh',rate: 3700,  studentMonthly: 'USh700,000–1,500,000', studentMonthlyUSD: 240 },
  'Tanzanian':     { symbol: 'TSh',rate: 2650,  studentMonthly: 'TSh400,000–800,000', studentMonthlyUSD: 200 },
  'Ethiopian':     { symbol: 'Br', rate: 56,    studentMonthly: 'Br8,000–18,000', studentMonthlyUSD: 200   },
  'German':        { symbol: '€',  rate: 0.92,  studentMonthly: '€700–1,200', studentMonthlyUSD: 1000       },
  'French':        { symbol: '€',  rate: 0.92,  studentMonthly: '€700–1,200', studentMonthlyUSD: 1000       },
  'Italian':       { symbol: '€',  rate: 0.92,  studentMonthly: '€700–1,100', studentMonthlyUSD: 950        },
  'Spanish':       { symbol: '€',  rate: 0.92,  studentMonthly: '€650–1,100', studentMonthlyUSD: 900        },
  'Polish':        { symbol: 'zł', rate: 3.95,  studentMonthly: 'zł2,500–5,000', studentMonthlyUSD: 900     },
  'Romanian':      { symbol: 'lei',rate: 4.6,   studentMonthly: 'lei3,000–6,000', studentMonthlyUSD: 800    },
  'Ukrainian':     { symbol: '₴',  rate: 37,    studentMonthly: '₴15,000–30,000', studentMonthlyUSD: 600    },
  'Russian':       { symbol: '₽',  rate: 88,    studentMonthly: '₽40,000–80,000', studentMonthlyUSD: 700    },
  'American':      { symbol: '$',  rate: 1,     studentMonthly: '$1,200–2,500', studentMonthlyUSD: 1800      },
  'British':       { symbol: '£',  rate: 0.79,  studentMonthly: '£1,000–2,000', studentMonthlyUSD: 1800      },
  'Canadian':      { symbol: 'CA$',rate: 1.36,  studentMonthly: 'CA$1,500–2,800', studentMonthlyUSD: 1500    },
  'Australian':    { symbol: 'A$', rate: 1.52,  studentMonthly: 'A$1,800–3,200', studentMonthlyUSD: 1500     },
  'Japanese':      { symbol: '¥',  rate: 149,   studentMonthly: '¥100,000–200,000', studentMonthlyUSD: 950   },
  'Argentinian':   { symbol: '$',  rate: 870,   studentMonthly: '~$200–500 USD equivalent', studentMonthlyUSD: 300 },
  'Colombian':     { symbol: '$',  rate: 4000,  studentMonthly: '$1,500,000–3,000,000', studentMonthlyUSD: 500 },
  'Peruvian':      { symbol: 'S/', rate: 3.7,   studentMonthly: 'S/1,200–2,500', studentMonthlyUSD: 450      },
  'Venezuelan':    { symbol: 'Bs', rate: 36,    studentMonthly: '~$200–500 USD equivalent', studentMonthlyUSD: 300 },
  'Taiwanese':     { symbol: 'NT$',rate: 31.5,  studentMonthly: 'NT$20,000–40,000', studentMonthlyUSD: 900   },
  'Singaporean':   { symbol: 'S$', rate: 1.35,  studentMonthly: 'S$1,500–3,000', studentMonthlyUSD: 1700     },
  'Swedish':       { symbol: 'kr', rate: 10.5,  studentMonthly: 'kr9,000–18,000', studentMonthlyUSD: 1200    },
}

// Get currency context for a given nationality, with a sensible default
function getCurrencyContext(nationality) {
  return NATIONALITY_CONTEXT[nationality] || { symbol: '$', rate: 1, studentMonthly: '$500–1,200', studentMonthlyUSD: 800 }
}

// Resolve the display currency: prefer the user's explicit choice, but keep the
// nationality-based "studentMonthly" reference text where available.
function resolveDisplayContext(profile) {
  const natCtx = getCurrencyContext(profile.nationality)
  const chosen = CURRENCY_OPTIONS.find(c => c.code === profile.preferredCurrency)
  if (!chosen) return natCtx
  // If the chosen currency matches the nationality's currency, keep the rich context.
  if (chosen.symbol === natCtx.symbol) return natCtx
  // Otherwise use the chosen currency's symbol/rate, drop the nationality studentMonthly text.
  return {
    symbol: chosen.symbol,
    rate: chosen.rate,
    studentMonthly: natCtx.studentMonthly,        // still useful as a home-cost reference
    studentMonthlyUSD: natCtx.studentMonthlyUSD,
  }
}

// Explicit currency list the user can pick from to see all prices in their
// familiar currency (issue: "currency of choice to compare prices").
// rate = how many units of this currency per 1 USD.
const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$',   rate: 1,     label: 'US Dollar' },
  { code: 'EUR', symbol: '€',   rate: 0.92,  label: 'Euro' },
  { code: 'GBP', symbol: '£',   rate: 0.79,  label: 'British Pound' },
  { code: 'INR', symbol: '₹',   rate: 83,    label: 'Indian Rupee' },
  { code: 'NGN', symbol: '₦',   rate: 1580,  label: 'Nigerian Naira' },
  { code: 'PKR', symbol: '₨',   rate: 278,   label: 'Pakistani Rupee' },
  { code: 'CNY', symbol: '¥',   rate: 7.2,   label: 'Chinese Yuan' },
  { code: 'BRL', symbol: 'R$',  rate: 5.1,   label: 'Brazilian Real' },
  { code: 'CAD', symbol: 'CA$', rate: 1.36,  label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$',  rate: 1.52,  label: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥',   rate: 149,   label: 'Japanese Yen' },
  { code: 'KRW', symbol: '₩',   rate: 1330,  label: 'Korean Won' },
  { code: 'ZAR', symbol: 'R',   rate: 18.5,  label: 'South African Rand' },
  { code: 'AED', symbol: 'AED', rate: 3.67,  label: 'UAE Dirham' },
  { code: 'TRY', symbol: '₺',   rate: 32,    label: 'Turkish Lira' },
  { code: 'IDR', symbol: 'Rp',  rate: 15700, label: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM',  rate: 4.7,   label: 'Malaysian Ringgit' },
  { code: 'VND', symbol: '₫',   rate: 25000, label: 'Vietnamese Dong' },
  { code: 'EGP', symbol: 'E£',  rate: 48,    label: 'Egyptian Pound' },
  { code: 'SGD', symbol: 'S$',  rate: 1.35,  label: 'Singapore Dollar' },
]

// Common countries of residence (separate from nationality — a person can be
// an Indian national residing in the UAE, for example).
const RESIDENCE_COUNTRIES = [
  'Same as nationality', 'India', 'Nigeria', 'Pakistan', 'Bangladesh', 'China',
  'United States', 'United Kingdom', 'Canada', 'Australia', 'UAE', 'Saudi Arabia',
  'Qatar', 'Singapore', 'Malaysia', 'Germany', 'France', 'Netherlands', 'Other',
]

// Convert USD to a chosen currency option
function toCurrency(usdAmount, currency) {
  if (!currency || currency.rate === 1) return `$${Math.round(usdAmount).toLocaleString()}`
  return `${currency.symbol}${Math.round(usdAmount * currency.rate).toLocaleString()}`
}

// Convert USD to local currency string
function toLocal(usdAmount, ctx) {
  if (ctx.rate === 1) return `$${usdAmount.toLocaleString()}`
  const local = Math.round(usdAmount * ctx.rate)
  return `${ctx.symbol}${local.toLocaleString()}`
}


export default function Assessment() {
  const navigate = useNavigate()
  const { setProfile: setCtxProfile } = useApp()
  const [step, setStep] = useState(0)
  const [ageError, setAgeError] = useState('')
  const [profile, setProfile] = useState({
    name: '', nationality: '', age: '',
    countryOfResidence: 'Same as nationality', preferredCurrency: 'USD',
    fieldOfStudy: '', degreeLevel: '',
    weights: { ...DEFAULT_WEIGHTS },
    religion: 'none', alcoholComfort: 'fine', socialStyle: 'community_active',
    languageTest: '', languageScore: '', criminalBackground: '',
    budget: '1000_1500', startDate: 'sep_2026',
  })

  const set = (key, val) => setProfile(p => ({ ...p, [key]: val }))
  const setWeight = (dim, val) => setProfile(p => ({ ...p, weights: { ...p.weights, [dim]: val } }))

  const validateAge = (val) => {
    const n = parseInt(val, 10)
    if (!val) { setAgeError('Age is required'); return false }
    if (isNaN(n) || n < 16) { setAgeError('Minimum age is 16 for international study programmes'); return false }
    if (n > 60) { setAgeError('Please enter a valid age'); return false }
    setAgeError('')
    return true
  }

  const canAdvance = () => {
    if (step === 0) {
      const ageOk = parseInt(profile.age, 10) >= 16 && !isNaN(parseInt(profile.age, 10))
      return profile.name.trim() && profile.nationality && ageOk
    }
    if (step === 1) return profile.fieldOfStudy && profile.degreeLevel
    if (step === 4) return profile.criminalBackground !== '' // eligibility step requires declaration
    return true
  }

  const handleSubmit = () => {
    const ageNum = parseInt(profile.age, 10)
    if (!profile.name || !profile.nationality || !profile.fieldOfStudy) {
      log.warn('Profile', 'handleSubmit called with incomplete profile', {
        hasName: !!profile.name,
        hasNationality: !!profile.nationality,
        hasField: !!profile.fieldOfStudy,
      })
    }
    if (isNaN(ageNum) || ageNum < 16) {
      log.warn('Profile', `Invalid age on submit: "${profile.age}"`)
    }
    log.ok('Profile', 'Assessment complete — saving profile and navigating to dashboard', {
      name: profile.name,
      nationality: profile.nationality,
      field: profile.fieldOfStudy,
      budget: profile.budget,
      weights: profile.weights,
    })
    // Derive the social weight from the chosen social style (replaces the removed slider)
    const finalProfile = {
      ...profile,
      weights: {
        ...profile.weights,
        social: SOCIAL_STYLE_WEIGHT[profile.socialStyle] ?? 5,
      },
    }
    setCtxProfile(finalProfile)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-xl tracking-tight">
              <span className="text-gradient">op</span><span className="text-slate-300">olo</span>
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">Step {step + 1} of {STEPS.length}</span>
              {/* Exit button */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-600 rounded-lg px-3 py-1.5 transition-all"
                title="Exit assessment"
              >
                <X className="w-3.5 h-3.5" />
                Exit
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full progress-bar transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <div className="flex mt-2">
            {STEPS.map((s, i) => (
              <div key={i} className={`flex-1 text-center text-xs transition-colors ${i <= step ? 'text-violet-400' : 'text-slate-600'}`}>
                {i < step ? <Check className="w-3 h-3 mx-auto" /> : <span className="hidden md:block">{s}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Step Content ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl animate-fade-in">

          {/* STEP 0: About you */}
          {step === 0 && (
            <div>
              <h2 className="text-3xl font-bold mb-2">Tell us about yourself</h2>
              <p className="text-slate-400 mb-8">This helps us calibrate cultural fit beyond raw statistics.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Your first name</label>
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="e.g. Rohan"
                    value={profile.name}
                    onChange={e => set('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nationality</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
                    value={profile.nationality}
                    onChange={e => set('nationality', e.target.value)}
                  >
                    <option value="">Select nationality…</option>
                    {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
                  <input
                    type="number" min="16" max="60"
                    className={`w-full bg-slate-900 border rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${ageError ? 'border-red-500 focus:border-red-400' : 'border-slate-700 focus:border-violet-500'}`}
                    placeholder="Must be 16 or older"
                    value={profile.age}
                    onChange={e => {
                      set('age', e.target.value)
                      if (e.target.value) validateAge(e.target.value)
                      else setAgeError('')
                    }}
                    onBlur={e => e.target.value && validateAge(e.target.value)}
                  />
                  {ageError && (
                    <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {ageError}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-1.5">Programmes are open to students aged 16 and above</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Country of residence</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
                    value={profile.countryOfResidence}
                    onChange={e => set('countryOfResidence', e.target.value)}
                  >
                    {RESIDENCE_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <p className="text-xs text-slate-500 mt-1.5">Where you currently live — may differ from your nationality, and affects visa routing.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Currency you think in</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
                    value={profile.preferredCurrency}
                    onChange={e => set('preferredCurrency', e.target.value)}
                  >
                    {CURRENCY_OPTIONS.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.label}</option>)}
                  </select>
                  <p className="text-xs text-slate-500 mt-1.5">We'll show all costs in this currency so you don't have to convert in your head.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Field of study */}
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-bold mb-2">What are you studying?</h2>
              <p className="text-slate-400 mb-8">Your field significantly affects which city suits you — career pipelines are sector-specific.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Field of study</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
                    value={profile.fieldOfStudy}
                    onChange={e => set('fieldOfStudy', e.target.value)}
                  >
                    <option value="">Select your field…</option>
                    {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Degree level</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DEGREE_LEVELS.map(d => (
                      <button
                        key={d}
                        onClick={() => set('degreeLevel', d)}
                        className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${profile.degreeLevel === d ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Priority weights */}
          {step === 2 && (
            <div>
              <h2 className="text-3xl font-bold mb-2">What matters most to you?</h2>
              <p className="text-slate-400 mb-8">
                These weights <span className="text-violet-400 font-medium">directly change which city wins</span>.
                A career-focused profile picks Boston; a cost-focused one picks Netherlands; social picks Paris.
              </p>
              {(() => {
                const ctx = resolveDisplayContext(profile)
                const REAL_WORLD_CONTEXT = {
                  career: {
                    low:  "Career is secondary — you're prioritising lifestyle or research over job-market strength.",
                    mid:  "Career matters but isn't everything — you'd trade some opportunity for quality of life.",
                    high: 'Career is paramount. Boston (MIT/Harvard pipeline, $78k–115k starting) is purpose-built for this.',
                  },
                  cost: {
                    low:  `Cost is secondary — you can cover ${toLocal(2800, ctx)}/mo (Boston) or ${toLocal(900, ctx)}/mo (Netherlands) without stress.`,
                    mid:  `Cost matters. Your home student budget is ~${ctx.studentMonthly}. Boston at ${toLocal(2800, ctx)}/mo is a ${Math.round(2800/ctx.studentMonthlyUSD)}× jump; Netherlands at ${toLocal(900, ctx)}/mo is more manageable.`,
                    high: `Cost is critical. Boston (~${toLocal(2800, ctx)}/mo minimum) is likely out of range unless funded. Netherlands (~${toLocal(900, ctx)}/mo) is your best affordable option.`,
                  },
                  safety: {
                    low:  "Safety is secondary — you're comfortable navigating most urban environments independently.",
                    mid:  "Safety matters but you're not risk-averse. All three cities are safe in university areas.",
                    high: 'Safety is critical. Netherlands (score 93/100) is the clear winner — top 3 safest countries globally.',
                  },
                  social: {
                    low:  "Social life is secondary — you're here to study and build your career first.",
                    mid:  'Social life matters. All three cities have active international student communities.',
                    high: 'Social life is critical. Paris (score 93/100) has unmatched cultural richness — 400+ museums, world-class food scene.',
                  },
                  diversity: {
                    low:  "Diversity is secondary — you're comfortable adapting to any cultural environment.",
                    mid:  'Diversity matters. All three cities are internationally diverse; Netherlands has the highest international student ratio (35% at TU Delft).',
                    high: 'Diversity is critical. Netherlands (35% international) and Paris (130+ nationalities) are the strongest here.',
                  },
                  healthcare: {
                    low:  "Healthcare is secondary — you're healthy and not anticipating significant medical needs.",
                    mid:  `Healthcare matters. Paris offers near-free universal care [city_data]. Boston costs ${toLocal(3500, ctx)}/yr in mandatory insurance.`,
                    high: `Healthcare is critical. Paris (score 95/100) offers near-free universal healthcare. Boston mandatory insurance: ${toLocal(4000, ctx)}/yr.`,
                  },
                }
                const getContext = (key, weight) => {
                  const ctx_dim = REAL_WORLD_CONTEXT[key]
                  if (!ctx_dim) return null
                  if (weight <= 3) return ctx_dim.low
                  if (weight <= 7) return ctx_dim.mid
                  return ctx_dim.high
                }
                return (
                  <div className="space-y-6">
                    {DIMENSION_INFO.map(({ key, label, icon, hint }) => (
                      <div key={key} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{icon}</span>
                            <span className="font-medium text-slate-200">{label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              profile.weights[key] >= 8 ? 'bg-violet-500/20 text-violet-300' :
                              profile.weights[key] >= 5 ? 'bg-slate-700 text-slate-300' :
                              'bg-slate-800 text-slate-500'
                            }`}>
                              {['Not important','Low','Somewhat','Moderate','Important','Important','High','Very high','Critical','Critical','Critical'][profile.weights[key]]}
                            </span>
                            <span className="text-sm font-bold text-violet-400 w-5 text-right">{profile.weights[key]}/10</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 ml-7">{hint}</p>
                        <input
                          type="range" min="1" max="10" step="1"
                          value={profile.weights[key]}
                          onChange={e => setWeight(key, Number(e.target.value))}
                          className="w-full accent-violet-500 mb-2"
                        />
                        <div className="flex justify-between text-xs text-slate-600 mb-2">
                          <span>1 — not important</span>
                          <span>10 — critical</span>
                        </div>
                        {getContext(key, profile.weights[key]) && (
                          <div className="text-xs text-teal-400/80 bg-teal-500/5 border border-teal-500/15 rounded-lg px-3 py-2 leading-relaxed">
                            → {getContext(key, profile.weights[key])}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}

          {/* STEP 3: Culture & lifestyle */}
          {step === 3 && (
            <div>
              <h2 className="text-3xl font-bold mb-2">Culture & lifestyle preferences</h2>
              <p className="text-slate-400 mb-8">These nuances matter far more than statistics typically capture.</p>
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Religion / faith affiliation</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {RELIGION_OPTIONS.map(r => (
                      <button
                        key={r.value}
                        onClick={() => set('religion', r.value)}
                        className={`px-3 py-2 rounded-xl border text-sm transition-all ${profile.religion === r.value ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'}`}
                      >
                        {r.emoji} {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Your relationship with alcohol culture</label>
                  <p className="text-xs text-slate-500 mb-3">This affects social environments and community fit significantly.</p>
                  <div className="space-y-2">
                    {ALCOHOL_OPTIONS.map(a => (
                      <button
                        key={a.value}
                        onClick={() => set('alcoholComfort', a.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${profile.alcoholComfort === a.value ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'}`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Your social style abroad</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SOCIAL_STYLES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => set('socialStyle', s.value)}
                        className={`text-left px-4 py-3 rounded-xl border transition-all ${profile.socialStyle === s.value ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700 bg-slate-900 hover:border-slate-600'}`}
                      >
                        <div className={`font-medium text-sm mb-0.5 ${profile.socialStyle === s.value ? 'text-violet-300' : 'text-slate-300'}`}>{s.label}</div>
                        <div className="text-xs text-slate-500">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Eligibility (NEW — feeds Visa Predictor) */}
          {step === 4 && (
            <div>
              <h2 className="text-3xl font-bold mb-2">Eligibility & visa readiness</h2>
              <p className="text-slate-400 mb-2">
                This information feeds directly into the <span className="text-violet-400 font-medium">Visa Predictor</span> and <span className="text-teal-400 font-medium">Budget Matcher</span> modules —
                no need to re-enter it there.
              </p>
              <div className="flex items-center gap-2 mb-8 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <span className="text-blue-400 text-xs">🔒 Your answers are stored locally on your device only.</span>
              </div>

              <div className="space-y-8">
                {/* Language proficiency */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1">Language proficiency</label>
                  <p className="text-xs text-slate-500 mb-4">Your score is used to assess language eligibility requirements for each destination.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">Language test taken (or planned)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {LANGUAGE_TESTS.map(t => (
                          <button
                            key={t.value}
                            onClick={() => { set('languageTest', t.value); if (t.value === 'none') set('languageScore', '') }}
                            className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${profile.languageTest === t.value ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'}`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {profile.languageTest && profile.languageTest !== 'none' && (
                      <div className="animate-fade-in">
                        <label className="block text-xs text-slate-400 mb-2">
                          Your score / level ({LANGUAGE_TESTS.find(t => t.value === profile.languageTest)?.placeholder})
                        </label>
                        <input
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                          placeholder={LANGUAGE_TESTS.find(t => t.value === profile.languageTest)?.placeholder || 'Enter score or level'}
                          value={profile.languageScore}
                          onChange={e => set('languageScore', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Criminal background */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1">Criminal background declaration</label>
                  <p className="text-xs text-slate-500 mb-4">
                    All major study-abroad visa programmes require a criminal background declaration.
                    Accurate disclosure is essential — discrepancies discovered during processing typically result in automatic refusal.
                  </p>
                  <div className="space-y-2">
                    {CRIMINAL_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => set('criminalBackground', opt.value)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${profile.criminalBackground === opt.value ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'}`}
                      >
                        <span className="text-base flex-shrink-0">{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {(profile.criminalBackground === 'yes' || profile.criminalBackground === 'minor') && (
                    <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-200/80">
                        A prior conviction does not automatically disqualify you, but will require additional documentation (police clearance certificate, legal representation letters). The Visa Predictor will factor this into your assessment.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Budget & timeline */}
          {step === 5 && (
            <div>
              <h2 className="text-3xl font-bold mb-2">Budget & arrival timeline</h2>
              <p className="text-slate-400 mb-8">Cost forecasts are calibrated to when you actually arrive, not today's prices.</p>
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Monthly budget for living costs</label>
                  <p className="text-xs text-slate-500 mb-3">
                    This is your total monthly spend — rent, food, transport, and social. Tuition is separate.
                    {profile.nationality && NATIONALITY_CONTEXT[profile.nationality] && (
                      <span className="text-teal-400"> Your home student baseline: {NATIONALITY_CONTEXT[profile.nationality].studentMonthly}/mo.</span>
                    )}
                  </p>
                  <div className="space-y-2">
                    {(() => {
                      const ctx = resolveDisplayContext(profile)
                      const BUDGET_CITY_CONTEXT = {
                        under_1000:  { boston: 'Impossible without scholarship', paris: 'Possible with CROUS housing', nl: 'Comfortable in Delft', bostonClass: 'text-red-400', parisClass: 'text-amber-400', nlClass: 'text-teal-400' },
                        '1000_1500': { boston: 'Very tight — $1,800 shortfall/mo', paris: 'Manageable with care', nl: 'Comfortable', bostonClass: 'text-orange-400', parisClass: 'text-teal-400', nlClass: 'text-teal-400' },
                        '1500_2500': { boston: 'Tight but workable', paris: 'Comfortable', nl: 'Living well', bostonClass: 'text-amber-400', parisClass: 'text-teal-400', nlClass: 'text-teal-400' },
                        above_2500:  { boston: 'Comfortable', paris: 'Very comfortable', nl: 'Living very well', bostonClass: 'text-teal-400', parisClass: 'text-teal-400', nlClass: 'text-teal-400' },
                      }
                      return BUDGET_OPTIONS.map(b => {
                        const usdAmounts = { under_1000: 900, '1000_1500': 1250, '1500_2500': 2000, above_2500: 3000 }
                        const localAmt = ctx.rate !== 1 ? ` ≈ ${toLocal(usdAmounts[b.value], ctx)}/mo` : ''
                        const cityCtx = BUDGET_CITY_CONTEXT[b.value]
                        return (
                          <button
                            key={b.value}
                            onClick={() => set('budget', b.value)}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${profile.budget === b.value ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700 bg-slate-900 hover:border-slate-600'}`}
                          >
                            <div className={`font-medium text-sm ${profile.budget === b.value ? 'text-violet-300' : 'text-slate-300'}`}>
                              {b.label}{localAmt && <span className="text-slate-500 font-normal text-xs ml-2">{localAmt}</span>}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">{b.desc}</div>
                            {cityCtx && (
                              <div className="flex gap-3 mt-2 text-xs">
                                <span>🇺🇸 <span className={cityCtx.bostonClass}>{cityCtx.boston}</span></span>
                                <span>🇫🇷 <span className={cityCtx.parisClass}>{cityCtx.paris}</span></span>
                                <span>🇳🇱 <span className={cityCtx.nlClass}>{cityCtx.nl}</span></span>
                              </div>
                            )}
                          </button>
                        )
                      })
                    })()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Planned start date</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TIMELINE_OPTIONS.map(t => (
                      <button
                        key={t.value}
                        onClick={() => set('startDate', t.value)}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${profile.startDate === t.value ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile review */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                  <h3 className="font-semibold text-sm text-slate-300 mb-4">Profile summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ['Name', profile.name],
                      ['Nationality', profile.nationality],
                      ['Age', profile.age],
                      ['Field', profile.fieldOfStudy],
                      ['Degree', profile.degreeLevel],
                      ['Religion', profile.religion !== 'none' ? profile.religion : null],
                      ['Social style', profile.socialStyle?.replace('_', ' ')],
                      ['Language test', profile.languageTest !== 'none' ? `${LANGUAGE_TESTS.find(t => t.value === profile.languageTest)?.label || ''}${profile.languageScore ? ` · ${profile.languageScore}` : ''}` : 'None / In progress'],
                      ['Background check', CRIMINAL_OPTIONS.find(c => c.value === profile.criminalBackground)?.label],
                      ['Budget', BUDGET_OPTIONS.find(b => b.value === profile.budget)?.label],
                      ['Start date', TIMELINE_OPTIONS.find(t => t.value === profile.startDate)?.label],
                    ].map(([k, v]) => v ? (
                      <div key={k}>
                        <span className="text-slate-500">{k}: </span>
                        <span className="text-slate-200 capitalize">{v}</span>
                      </div>
                    ) : null)}
                  </div>
                  <div className="mt-4 border-t border-slate-800 pt-4">
                    <div className="text-xs text-slate-500 mb-2">Priority weights</div>
                    <div className="grid grid-cols-3 gap-2">
                      {DIMENSION_INFO.map(({ key, label, icon }) => (
                        <div key={key} className="text-xs">
                          <span className="text-slate-500">{icon} {label.split(' ')[0]}: </span>
                          <span className="text-violet-400 font-medium">{profile.weights[key]}/10</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation ───────────────────────────────────────── */}
          <div className="flex gap-4 mt-10">
            {step > 0 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => {
                  log.info('Router', `Assessment step ${step} → ${step + 1}: ${STEPS[step + 1]}`)
                  setStep(s => s + 1)
                }}
                disabled={!canAdvance()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-white transition-all"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-semibold text-white transition-all hover:scale-105"
              >
                See my matches
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
