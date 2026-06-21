// ─────────────────────────────────────────────────────────────────────────────
// opolo Matching Engine — Absolute Scoring
//
// Algorithm:
//   1. Weighted score  = Σ (cityDimScore[d] × normalised userWeight[d])
//      City dimension scores are fixed absolute values (0–100).
//      The result is a genuine 0–100 score — NOT normalised to produce an
//      artificial "best match". If no city aligns well, all scores stay low.
//   2. Tolerance re-weighting: when user reports tolerance for a weak dimension,
//      that dimension's effective weight is *reduced* (they accept the flaw).
//      When tolerance is LOW, the weight stays high (it remains a dealbreaker).
//   3. Cultural fit bonus (+/- points) applied on top of weighted score.
//   4. Eligibility penalties for criminal background and language score.
//   5. Tolerance prompts generated wherever a HIGH user priority meets LOW city score.
// ─────────────────────────────────────────────────────────────────────────────

import { CITIES, DIMENSION_META } from '../data/cityData.js'
import { log } from './logger.js'

const DIMS = ['career', 'cost', 'safety', 'social', 'diversity', 'healthcare']

/**
 * Run the full matching pipeline.
 *
 * @param {Object} profile      - Full user profile from Assessment
 * @param {Object} tolerances   - { dimensionKey: toleranceScore(1-10) } collected via modal
 * @returns {Array}             - Sorted array of { city, score, ... } results
 */
export function calculateMatchScores(profile, tolerances = {}) {
  const done = log.time('Matching', 'calculateMatchScores')
  log.info('Matching', 'Scoring started', {
    profile: profile.name || '(demo)',
    nationality: profile.nationality,
    field: profile.fieldOfStudy,
    weights: profile.weights,
    toleranceKeys: Object.keys(tolerances),
  })
  const raw = { ...profile.weights }

  // ── Step 1: Apply tolerance re-weighting ────────────────────────────────
  // High tolerance (8-10) = user will live with the flaw → reduce effective weight
  // Low tolerance  (1-3)  = dealbreaker remains → keep/amplify weight
  const adjusted = { ...raw }
  Object.entries(tolerances).forEach(([dim, tol]) => {
    // toleranceFactor: 0 (intolerable) → 1 (totally fine)
    const tf = tol / 10
    // Weight adjustment: 1.5× if intolerable, 0.5× if totally fine
    adjusted[dim] = raw[dim] * (1.5 - tf)
  })

  // ── Step 2: Normalise weights so they sum to 1 ──────────────────────────
  const totalW = DIMS.reduce((s, d) => s + (adjusted[d] || 1), 0)
  const norm = {}
  DIMS.forEach(d => { norm[d] = (adjusted[d] || 1) / totalW })

  // ── Step 3: Score each city ─────────────────────────────────────────────
  const results = Object.values(CITIES).map(city => {
    let weighted = 0
    const dimScores = {}
    DIMS.forEach(d => {
      dimScores[d] = city.dimensions[d]
      weighted += city.dimensions[d] * norm[d]
    })

    const culturalBonus = getCulturalBonus(profile, city)
    const eligibilityPenalty = getEligibilityPenalty(profile, city)
    const rawScore = weighted + culturalBonus - eligibilityPenalty
    // Absolute scoring: no artificial floor. A poor match scores low.
    const score = Math.round(Math.min(100, Math.max(0, rawScore)))

    // Top strengths and weaknesses relative to city data
    const strengths = DIMS
      .filter(d => dimScores[d] >= 75)
      .sort((a, b) => dimScores[b] - dimScores[a])
      .slice(0, 3)
      .map(d => ({ dim: d, score: dimScores[d], label: DIMENSION_META[d].label }))

    const weaknesses = DIMS
      .filter(d => dimScores[d] < 65)
      .sort((a, b) => dimScores[a] - dimScores[b])
      .slice(0, 2)
      .map(d => ({ dim: d, score: dimScores[d], label: DIMENSION_META[d].label }))

    // Tolerance prompts: only where the user cares AND the city underperforms
    const tolerancePrompts = DIMS
      .filter(d => {
        const userCares = (raw[d] || 5) >= 7
        const cityWeak  = dimScores[d] < 65
        const notYetAnswered = !(d in tolerances)
        return userCares && cityWeak && notYetAnswered
      })
      .map(d => ({
        dimension: d,
        label: DIMENSION_META[d].label,
        cityScore: dimScores[d],
        userWeight: raw[d],
        prompt: buildTolerancePrompt(d, city.name, dimScores[d]),
      }))

    const explanation = buildExplanation(profile, city, dimScores, norm, raw)

    return {
      city,
      score,
      dimScores,
      strengths,
      weaknesses,
      tolerancePrompts,
      explanation,
      matchLabel: scoreLabel(score),
      matchColor: scoreColor(score),
    }
  })

  const sorted = results.sort((a, b) => b.score - a.score)
  log.ok('Matching', 'Scores calculated', sorted.map(r => ({
    city: r.city.name,
    score: r.score,
    label: r.matchLabel,
    bonus: r.score - Math.round(
      Object.values(r.dimScores || {}).reduce((s, v) => s + v, 0) /
      Object.values(r.dimScores || {}).length
    ),
  })))
  done()
  return sorted
}

// ── Cultural fit bonus (+/- points on final score) ──────────────────────────
// Bonuses are balanced: no city should get >8 total bonus from any one category
function getCulturalBonus(profile, city) {
  let bonus = 0
  const id = city.id

  // Religion / halal food availability
  if (profile.religion === 'muslim') {
    // Paris has the largest Muslim community in Western Europe
    bonus += id === 'paris' ? 6 : id === 'netherlands' ? 4 : 2
  }
  if (profile.religion === 'christian') {
    bonus += id === 'boston' ? 3 : id === 'paris' ? 3 : 2
  }
  if (profile.religion === 'hindu') {
    // Boston has strong Indian community with Hindu temples
    bonus += id === 'boston' ? 3 : id === 'netherlands' ? 2 : 1
  }
  if (profile.religion === 'jewish') {
    bonus += id === 'boston' ? 4 : id === 'paris' ? 2 : id === 'netherlands' ? 2 : 0
  }

  // Alcohol comfort
  if (profile.alcoholComfort === 'must_avoid') {
    // All cities have alcohol culture; NL is most accommodating to sober students
    bonus += id === 'netherlands' ? 3 : id === 'boston' ? 1 : -2
  }
  if (profile.alcoholComfort === 'prefer_none') {
    bonus += id === 'netherlands' ? 2 : 0
  }

  // Social style — genuinely differentiated by city character
  if (profile.socialStyle === 'community_active') {
    // Paris has most vibrant community life; NL studieverenigingen are strong
    bonus += id === 'paris' ? 4 : id === 'netherlands' ? 3 : 2
  }
  if (profile.socialStyle === 'nightlife') {
    // Paris is unmatched for nightlife
    bonus += id === 'paris' ? 6 : id === 'boston' ? 2 : id === 'netherlands' ? 1 : 0
  }
  if (profile.socialStyle === 'outdoors') {
    // Boston (Cape Cod, White Mountains) and NL (cycling, coast) are both strong
    bonus += id === 'boston' ? 4 : id === 'netherlands' ? 4 : id === 'paris' ? 1 : 0
  }
  if (profile.socialStyle === 'quiet') {
    // Delft's small-city feel is ideal for quiet focused students
    bonus += id === 'netherlands' ? 3 : id === 'paris' ? 1 : 0
  }

  // Field of study — city has a dominant cluster for this field
  if (profile.fieldOfStudy) {
    const f = profile.fieldOfStudy.toLowerCase()
    // CS/AI/Engineering: Boston (MIT/Harvard/Kendall Square) > Netherlands (TU Delft) > Paris
    if (f.includes('computer') || f.includes('ai') || f.includes('data')) {
      bonus += id === 'boston' ? 6 : id === 'netherlands' ? 4 : 1
    }
    if (f.includes('engineer')) {
      bonus += id === 'boston' ? 5 : id === 'netherlands' ? 5 : 1
    }
    // Business/Finance: Boston (HBS, Fidelity, State Street) is strongest
    if (f.includes('business') || f.includes('finance') || f.includes('mba') || f.includes('econom')) {
      bonus += id === 'boston' ? 5 : id === 'paris' ? 4 : id === 'netherlands' ? 2 : 0
    }
    // Arts/Design/Fashion: Paris is dominant
    if (f.includes('arts') || f.includes('fashion') || f.includes('design') || f.includes('architect')) {
      bonus += id === 'paris' ? 7 : id === 'netherlands' ? 2 : id === 'boston' ? 1 : 0
    }
    // Biomedical/Pharma: Boston (Moderna, Vertex, Dana-Farber) is world #1
    if (f.includes('bio') || f.includes('pharma') || f.includes('medic') || f.includes('health')) {
      bonus += id === 'boston' ? 7 : id === 'netherlands' ? 3 : id === 'paris' ? 2 : 0
    }
    // Law: Paris and Boston both strong
    if (f.includes('law') || f.includes('legal')) {
      bonus += id === 'boston' ? 4 : id === 'paris' ? 4 : id === 'netherlands' ? 2 : 0
    }
    // Sustainability/Climate/Energy: Netherlands (Wageningen, Shell, circular economy)
    if (f.includes('sustain') || f.includes('climate') || f.includes('energy') || f.includes('environ')) {
      bonus += id === 'netherlands' ? 6 : id === 'paris' ? 3 : id === 'boston' ? 3 : 0
    }
    // Social Sciences/Psychology: all cities solid
    if (f.includes('social') || f.includes('psych') || f.includes('politic')) {
      bonus += id === 'paris' ? 4 : id === 'boston' ? 3 : id === 'netherlands' ? 3 : 0
    }
    // Natural Sciences: Netherlands (top research universities)
    if (f.includes('natural') || f.includes('physics') || f.includes('chem') || f.includes('math')) {
      bonus += id === 'netherlands' ? 5 : id === 'boston' ? 5 : id === 'paris' ? 3 : 0
    }
  }

  // Budget match — hard reality: Boston is unaffordable on tight budgets
  if (profile.budget) {
    if (profile.budget === 'under_1000') {
      bonus += id === 'netherlands' ? 6 : id === 'paris' ? 3 : 0
      bonus += id === 'boston' ? -8 : 0  // Boston ~$2,800/mo minimum — serious mismatch
    }
    if (profile.budget === '1000_1500') {
      bonus += id === 'netherlands' ? 4 : id === 'paris' ? 3 : 0
      bonus += id === 'boston' ? -4 : 0  // Still a stretch for Boston
    }
    if (profile.budget === '1500_2500') {
      bonus += id === 'netherlands' ? 2 : id === 'paris' ? 2 : id === 'boston' ? 0 : 0
    }
    if (profile.budget === 'above_2500') {
      bonus += id === 'boston' ? 4 : 0   // Boston is comfortable at this budget
    }
  }

  return bonus
}

// ── Eligibility penalty — reduces score for flags that affect visa approval ──
function getEligibilityPenalty(profile, city) {
  let penalty = 0
  const id = city.id

  // Criminal background
  if (profile.criminalBackground === 'yes') penalty += 18
  if (profile.criminalBackground === 'minor') penalty += 8
  if (profile.criminalBackground === 'undisclosed') penalty += 5

  // Language proficiency — penalise where threshold not met
  if (profile.languageTest && profile.languageScore) {
    const test = profile.languageTest
    const score = profile.languageScore

    // IELTS: Paris/NL programmes need ≥6.5, Boston top schools ≥7.0
    if (test === 'ielts') {
      const n = parseFloat(score)
      if (!isNaN(n)) {
        if (n < 6.0) penalty += 15
        else if (n < 6.5) penalty += 8
        else if (n < 7.0 && id === 'boston') penalty += 4
      }
    }
    // TOEFL: Boston needs ≥100, NL/Paris ≥80
    if (test === 'toefl') {
      const n = parseInt(score, 10)
      if (!isNaN(n)) {
        if (n < 70) penalty += 15
        else if (n < 80) penalty += 8
        else if (n < 100 && id === 'boston') penalty += 4
      }
    }
    // DELF/DALF: Paris needs ≥B2
    if (test === 'delf' && id === 'paris') {
      const lvl = score.toUpperCase()
      if (lvl === 'A1' || lvl === 'A2') penalty += 15
      else if (lvl === 'B1') penalty += 6
    }
  }
  // No test = significant risk if applying to top universities
  if (profile.languageTest === 'none') penalty += 10

  return penalty
}

// ── Generate natural-language "why this matches you" explanation ─────────────
export function buildExplanation(profile, city, dimScores, norm, rawWeights) {
  const rw = rawWeights || {}
  const cityId = city.id

  // Find top 2 user priorities that city is strong on
  const strongMatches = DIMS
    .filter(d => dimScores[d] >= 75 && (rw[d] || 5) >= 6)
    .sort((a, b) => (dimScores[b] * (rw[b] || 5)) - (dimScores[a] * (rw[a] || 5)))
    .slice(0, 2)

  // Find top concern (user priority that city underperforms on)
  const topConcern = DIMS
    .filter(d => dimScores[d] < 65 && (rw[d] || 5) >= 7)
    .sort((a, b) => dimScores[a] - dimScores[b])[0]

  const strengthLines = {
    career: {
      boston: `Boston's academic-industry pipeline (${city.career?.topCompanies?.slice(0,2).join(', ')}) is one of the strongest in the world for your field`,
      paris: `Paris's Station F ecosystem and Grande École network create genuine career pathways, especially in finance, consulting, and luxury`,
      netherlands: `The Netherlands hosts ASML, Philips, Booking.com, and Adyen — a tech-engineering ecosystem rivalling London at significantly lower cost`,
    },
    cost: {
      boston: `For Boston, cost-of-living is a consistent challenge — budget at least $2,800/mo`,
      paris: `Paris offers solid value by major European capital standards, with free healthcare and subsidised CROUS housing options`,
      netherlands: `Netherlands offers the best career-to-cost ratio in this comparison — Delft rents average €700–€900 for a shared room`,
    },
    safety: {
      boston: `Cambridge and university areas are safe for daily life; awareness is needed in parts of Roxbury at night`,
      paris: `Paris is generally safe in student districts with common-sense precautions; pickpocket awareness is the primary concern`,
      netherlands: `The Netherlands consistently ranks among Europe's top 3 safest countries — near-zero safety concerns for students`,
    },
    social: {
      boston: `Boston's international student community is vibrant with culture events, sports obsession, and strong university organisations`,
      paris: `Paris offers genuinely unmatched cultural richness — 400+ museums, world-class music venues, and the most diverse street food scene in Europe`,
      netherlands: `Dutch studieverenigingen (student associations) create tight-knit international communities quickly, and the cycling lifestyle means you\'re always mobile`,
    },
    diversity: {
      boston: `Boston's universities attract 28% international students — you'll find most nationalities represented on campus`,
      paris: `Paris is home to over 130 nationalities with large North African, Chinese, and sub-Saharan African communities well-established`,
      netherlands: `35% of TU Delft students are international — one of the highest ratios in Europe. English is the de facto language on campus`,
    },
    healthcare: {
      boston: `Boston healthcare is world-class in quality but very expensive — budget $3,000–$4,500/yr for insurance`,
      paris: `French universal healthcare (CPAM) is a major advantage — most student care is free or near-free under the national system`,
      netherlands: `Dutch healthcare requires ~€130/mo insurance but zorgtoeslag (government allowance) can offset most of the cost for students`,
    },
  }

  const concernLines = {
    cost: {
      boston: `The main trade-off: Boston's cost of living is high — shared rooms start around $1,000+/mo and the mandatory health insurance adds $3,500/yr`,
      paris: `The main trade-off: housing competition is fierce and the language barrier is real for the first 3–6 months`,
      netherlands: `The main trade-off: Amsterdam housing market is competitive — apply for university housing the day you receive your acceptance`,
    },
    career: {
      boston: `Career opportunity here is exceptional if your field aligns with Boston's biotech/finance/tech cluster`,
      paris: `Career pathways in Paris are strong but sector-specific — French language skills significantly expand options`,
      netherlands: `Career risk is low here — the Zoekjaar post-grad visa and ASML ecosystem make Netherlands among the safest career bets in Europe`,
    },
    safety: {
      boston: `Boston has neighbourhood-level safety variation — living and studying in Cambridge or Back Bay is very different from parts of Roxbury`,
      paris: `Paris safety is solid; the primary concern is opportunistic pickpocketing on the Metro rather than personal safety`,
      netherlands: `Safety concern here is essentially nil — the Netherlands has some of the lowest student-area crime rates in the world`,
    },
    social: {
      boston: `Boston's social scene is lively but can feel insular without proximity to a large university social network`,
      paris: `Paris social life requires some French to access fully — but English-speaking events are growing rapidly`,
      netherlands: `Delft is a small city — social life is rich within the student bubble but you'll want weekend trips to Amsterdam/Rotterdam for variety`,
    },
    diversity: {
      boston: `Boston's diversity is strong on paper but can feel racially stratified outside university bubbles — a nuance worth knowing`,
      paris: `Paris is highly diverse but French laïcité creates friction for visibly religious students in some institutional contexts`,
      netherlands: `Dutch directness can initially feel exclusionary but is actually the most egalitarian social contract once you understand it`,
    },
    healthcare: {
      boston: `Healthcare is Boston's biggest practical downside for international students — the US insurance system is complex and expensive`,
      paris: `Healthcare is Paris's strongest practical card — the French public health system is free for registered students`,
      netherlands: `Healthcare insurance is mandatory but affordable, and the zorgtoeslag allowance means most students pay very little net`,
    },
  }

  const parts = []

  // Opening
  parts.push(`Based on your profile, **${city.name}** `)

  // Strengths
  if (strongMatches.length > 0) {
    const line = strengthLines[strongMatches[0]]?.[cityId]
    if (line) parts.push(`scores strongly because ${line}`)
    if (strongMatches[1]) {
      const line2 = strengthLines[strongMatches[1]]?.[cityId]
      if (line2) parts.push(`. Additionally, ${line2}`)
    }
    parts.push('.')
  }

  // Concern / trade-off
  if (topConcern) {
    const cLine = concernLines[topConcern]?.[cityId]
    if (cLine) parts.push(` ${cLine}.`)
  }

  // Religion / cultural fit
  if (profile.religion === 'muslim') {
    const halalLine = {
      boston: ' For halal food: available across Cambridge and Somerville, with dedicated grocery stores in Watertown.',
      paris: ' For halal food: extremely abundant — whole arrondissements (18th, 19th, 20th) are halal-first.',
      netherlands: ' For halal food: widely available in Delft near campus and throughout Amsterdam.',
    }[cityId]
    if (halalLine) parts.push(halalLine)
  }

  return parts.join('')
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function buildTolerancePrompt(dim, cityName, cityScore) {
  const PROMPTS = {
    cost:        `${cityName} is a strong match for your priorities, but cost of living is high (score ${cityScore}/100). On a scale of 1–10, how much are you willing to tolerate higher expenses for the other benefits?`,
    career:      `${cityName} scores ${cityScore}/100 on career opportunities. Given this, how important is the career trajectory vs. quality of life trade-off for you?`,
    safety:      `${cityName} has some neighbourhood-level safety nuances (score ${cityScore}/100). How much would safety concerns affect your final decision?`,
    social:      `${cityName} may not match your ideal social scene perfectly (score ${cityScore}/100). How central is a highly active social life to your experience abroad?`,
    diversity:   `${cityName} scores ${cityScore}/100 on diversity and inclusion. How important is being surrounded by a highly diverse student body to you?`,
    healthcare:  `${cityName} scores ${cityScore}/100 on healthcare accessibility and affordability. How much would this affect your day-to-day peace of mind?`,
  }
  return PROMPTS[dim] || `${cityName} scores ${cityScore}/100 on ${dim}. Would this affect your decision?`
}

function scoreLabel(score) {
  if (score >= 82) return 'Exceptional fit'
  if (score >= 70) return 'Strong match'
  if (score >= 57) return 'Good match'
  if (score >= 43) return 'Moderate fit'
  if (score >= 28) return 'Weak alignment'
  return 'Poor fit'
}

function scoreColor(score) {
  if (score >= 82) return { bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/40' }
  if (score >= 70) return { bg: 'bg-teal-500/20',   text: 'text-teal-300',   border: 'border-teal-500/40'   }
  if (score >= 57) return { bg: 'bg-blue-500/20',   text: 'text-blue-300',   border: 'border-blue-500/40'   }
  if (score >= 43) return { bg: 'bg-amber-500/20',  text: 'text-amber-300',  border: 'border-amber-500/40'  }
  if (score >= 28) return { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' }
  return               { bg: 'bg-red-500/20',    text: 'text-red-400',    border: 'border-red-500/40'    }
}

/**
 * Find the first city with a tolerance prompt, for the modal trigger.
 * Called on the top-ranked city immediately after scoring.
 */
export function getFirstTolerancePrompt(scoredResults) {
  for (const result of scoredResults) {
    if (result.tolerancePrompts.length > 0) {
      return {
        cityId: result.city.id,
        prompt: result.tolerancePrompts[0],
      }
    }
  }
  return null
}
