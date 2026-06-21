// ─────────────────────────────────────────────────────────────────────────────
// Cost Comparison Data — Home city monthly budgets vs destination cities
// All costs in USD equivalent (approximate, 2025 figures)
// ─────────────────────────────────────────────────────────────────────────────

// Destination city monthly costs (USD equivalent)
export const DESTINATION_COSTS = {
  boston: {
    label: 'Boston, USA',
    flag: '🇺🇸',
    currency: 'USD',
    rent1br: 2800,        // 1-bed in student area (Allston-Brighton)
    rent_shared: 1100,   // room in shared apartment
    groceries: 380,
    eating_out: 350,     // avg 2–3x per week eating out
    transport: 90,       // MBTA monthly pass
    utilities: 120,      // elec/gas/internet
    health_insurance: 320, // avg student plan
    misc: 150,
    total_shared: 2510,  // realistic student total (shared room)
    total_solo: 4210,    // 1-bed total
    notes: 'Costs vary significantly by neighbourhood. Allston and Brighton are most affordable. Cambridge/Back Bay are significantly more expensive.',
    costIndex: 100,      // base index
  },
  paris: {
    label: 'Paris, France',
    flag: '🇫🇷',
    currency: 'EUR',
    rent1br: 1650,
    rent_shared: 850,
    groceries: 220,
    eating_out: 200,
    transport: 86,       // Navigo monthly (young adult rate)
    utilities: 90,
    health_insurance: 0, // covered by French social security for students
    misc: 100,
    total_shared: 1546,
    total_solo: 2346,
    notes: 'Health insurance is largely subsidised by French social security. CAF housing aid of €100–250/mo can significantly reduce rent. Paris is expensive but subsidies help.',
    costIndex: 72,
  },
  netherlands: {
    label: 'Netherlands',
    flag: '🇳🇱',
    currency: 'EUR',
    rent1br: 1400,
    rent_shared: 650,
    groceries: 250,
    eating_out: 180,
    transport: 100,      // OV-chipkaart monthly
    utilities: 80,
    health_insurance: 145, // mandatory Dutch health insurance (~€145/mo, partially offset by zorgtoeslag)
    misc: 100,
    total_shared: 1505,
    total_solo: 2255,
    notes: 'Zorgtoeslag (health allowance) can return up to €120/mo for low-income students. Amsterdam is 20–30% more expensive than Delft or Eindhoven.',
    costIndex: 70,
  },
}

// Home cities with monthly cost data (USD equivalent)
export const HOME_CITIES = [
  // South Asia
  { id: 'mumbai',       label: 'Mumbai, India',          flag: '🇮🇳',  region: 'South Asia',    rent_shared: 350,  groceries: 80,  eating_out: 60,  transport: 25,  total: 600 },
  { id: 'delhi',        label: 'New Delhi, India',        flag: '🇮🇳',  region: 'South Asia',    rent_shared: 300,  groceries: 75,  eating_out: 55,  transport: 20,  total: 550 },
  { id: 'bangalore',    label: 'Bengaluru, India',        flag: '🇮🇳',  region: 'South Asia',    rent_shared: 320,  groceries: 80,  eating_out: 65,  transport: 25,  total: 580 },
  { id: 'dhaka',        label: 'Dhaka, Bangladesh',       flag: '🇧🇩',  region: 'South Asia',    rent_shared: 200,  groceries: 60,  eating_out: 40,  transport: 15,  total: 380 },
  { id: 'karachi',      label: 'Karachi, Pakistan',       flag: '🇵🇰',  region: 'South Asia',    rent_shared: 180,  groceries: 65,  eating_out: 45,  transport: 15,  total: 360 },
  { id: 'colombo',      label: 'Colombo, Sri Lanka',      flag: '🇱🇰',  region: 'South Asia',    rent_shared: 250,  groceries: 80,  eating_out: 55,  transport: 20,  total: 480 },

  // East Asia
  { id: 'beijing',      label: 'Beijing, China',          flag: '🇨🇳',  region: 'East Asia',     rent_shared: 550,  groceries: 180, eating_out: 150, transport: 40,  total: 1050 },
  { id: 'shanghai',     label: 'Shanghai, China',         flag: '🇨🇳',  region: 'East Asia',     rent_shared: 650,  groceries: 200, eating_out: 180, transport: 45,  total: 1200 },
  { id: 'seoul',        label: 'Seoul, South Korea',      flag: '🇰🇷',  region: 'East Asia',     rent_shared: 600,  groceries: 250, eating_out: 200, transport: 60,  total: 1250 },
  { id: 'tokyo',        label: 'Tokyo, Japan',            flag: '🇯🇵',  region: 'East Asia',     rent_shared: 750,  groceries: 300, eating_out: 250, transport: 80,  total: 1550 },
  { id: 'jakarta',      label: 'Jakarta, Indonesia',      flag: '🇮🇩',  region: 'Southeast Asia', rent_shared: 280,  groceries: 120, eating_out: 90,  transport: 30,  total: 620 },

  // Middle East & North Africa
  { id: 'cairo',        label: 'Cairo, Egypt',            flag: '🇪🇬',  region: 'MENA',          rent_shared: 180,  groceries: 100, eating_out: 80,  transport: 20,  total: 460 },
  { id: 'tehran',       label: 'Tehran, Iran',            flag: '🇮🇷',  region: 'MENA',          rent_shared: 250,  groceries: 120, eating_out: 90,  transport: 20,  total: 560 },
  { id: 'casablanca',   label: 'Casablanca, Morocco',     flag: '🇲🇦',  region: 'MENA',          rent_shared: 250,  groceries: 130, eating_out: 100, transport: 25,  total: 600 },
  { id: 'riyadh',       label: 'Riyadh, Saudi Arabia',    flag: '🇸🇦',  region: 'MENA',          rent_shared: 600,  groceries: 300, eating_out: 200, transport: 50,  total: 1350 },
  { id: 'dubai',        label: 'Dubai, UAE',              flag: '🇦🇪',  region: 'MENA',          rent_shared: 900,  groceries: 350, eating_out: 250, transport: 80,  total: 1800 },

  // Sub-Saharan Africa
  { id: 'lagos',        label: 'Lagos, Nigeria',          flag: '🇳🇬',  region: 'Africa',        rent_shared: 300,  groceries: 150, eating_out: 100, transport: 30,  total: 700 },
  { id: 'nairobi',      label: 'Nairobi, Kenya',          flag: '🇰🇪',  region: 'Africa',        rent_shared: 250,  groceries: 130, eating_out: 90,  transport: 25,  total: 600 },
  { id: 'accra',        label: 'Accra, Ghana',            flag: '🇬🇭',  region: 'Africa',        rent_shared: 280,  groceries: 140, eating_out: 100, transport: 25,  total: 650 },
  { id: 'joburg',       label: 'Johannesburg, S. Africa', flag: '🇿🇦',  region: 'Africa',        rent_shared: 400,  groceries: 200, eating_out: 150, transport: 40,  total: 950 },
  { id: 'dakar',        label: 'Dakar, Senegal',          flag: '🇸🇳',  region: 'Africa',        rent_shared: 200,  groceries: 110, eating_out: 80,  transport: 20,  total: 510 },

  // Latin America
  { id: 'bogota',       label: 'Bogotá, Colombia',        flag: '🇨🇴',  region: 'Latin America', rent_shared: 280,  groceries: 150, eating_out: 120, transport: 40,  total: 700 },
  { id: 'saopaulo',     label: 'São Paulo, Brazil',       flag: '🇧🇷',  region: 'Latin America', rent_shared: 400,  groceries: 200, eating_out: 160, transport: 45,  total: 950 },
  { id: 'lima',         label: 'Lima, Peru',              flag: '🇵🇪',  region: 'Latin America', rent_shared: 280,  groceries: 140, eating_out: 110, transport: 30,  total: 680 },
  { id: 'mexico_city',  label: 'Mexico City, Mexico',     flag: '🇲🇽',  region: 'Latin America', rent_shared: 380,  groceries: 180, eating_out: 140, transport: 30,  total: 880 },

  // Europe
  { id: 'istanbul',     label: 'Istanbul, Turkey',        flag: '🇹🇷',  region: 'Europe',        rent_shared: 350,  groceries: 160, eating_out: 120, transport: 40,  total: 850 },
  { id: 'kyiv',         label: 'Kyiv, Ukraine',           flag: '🇺🇦',  region: 'Europe',        rent_shared: 300,  groceries: 150, eating_out: 100, transport: 25,  total: 700 },
  { id: 'bucharest',    label: 'Bucharest, Romania',      flag: '🇷🇴',  region: 'Europe',        rent_shared: 450,  groceries: 200, eating_out: 150, transport: 30,  total: 1000 },
  { id: 'warsaw',       label: 'Warsaw, Poland',          flag: '🇵🇱',  region: 'Europe',        rent_shared: 500,  groceries: 250, eating_out: 180, transport: 40,  total: 1150 },
]

export const COST_CATEGORIES = [
  { id: 'rent_shared', label: 'Rent (shared room)', icon: '🏠', description: 'Monthly rent for a room in a shared flat' },
  { id: 'groceries',   label: 'Groceries',           icon: '🛒', description: 'Monthly grocery spend for one person' },
  { id: 'eating_out',  label: 'Eating Out',          icon: '🍜', description: 'Dining out ~2–3x per week' },
  { id: 'transport',   label: 'Transport',           icon: '🚌', description: 'Monthly public transport pass' },
]
