// opolo AI Service — Gemini-powered analysis pipeline
// Model: gemini-2.5-flash  (update GEMINI_MODEL below if you have a different key tier)
// Key: VITE_GEMINI_API_KEY in .env

import { log } from './logger.js'

// ─── Change this to 'gemini-2.5-flash-preview-05-20' or 'gemini-3.5-flash'
//     depending on which model your API key gives you access to.
const GEMINI_MODEL = 'gemini-2.5-flash'

// ── API caller ────────────────────────────────────────────────────────────────
function getApiKey() {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) {
    const err = new Error('VITE_GEMINI_API_KEY missing from .env — AI features disabled')
    log.error('Gemini', 'API key not configured', err)
    throw err
  }
  return key
}

async function callGemini({ systemPrompt, userMessage, maxTokens = 4096, label = 'Gemini call', temperature = 0.3 }) {
  const done = log.time('Gemini', label)
  log.info('Gemini', `→ ${label}`, {
    model: GEMINI_MODEL,
    maxTokens,
    temperature,
    promptChars: userMessage.length,
  })

  const key = getApiKey()
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`

  // NOTE: we deliberately do NOT set responseMimeType:'application/json'
  // because it causes Gemini to truncate long JSON mid-object when near the token limit,
  // producing valid-looking but cut-off JSON that fails to parse. We enforce JSON output
  // via the system prompt instead, which gives the model room to complete the object.
  const body = {
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    ...(systemPrompt && { systemInstruction: { parts: [{ text: systemPrompt }] } }),
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  }

  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (networkErr) {
    log.error('Gemini', 'fetch() failed — offline or CORS block', networkErr)
    throw networkErr
  }

  if (!res.ok) {
    let errBody = {}
    try { errBody = await res.json() } catch { /* ignore */ }
    const message = errBody?.error?.message || `HTTP ${res.status} ${res.statusText}`
    log.error('Gemini', `API error ${res.status}`, { status: res.status, body: errBody })
    throw new Error(message)
  }

  const data = await res.json()
  const candidate = data?.candidates?.[0]
  const text = candidate?.content?.parts?.[0]?.text
  const finishReason = candidate?.finishReason

  if (!text) {
    // Log the full response so we can debug empty returns
    log.error('Gemini', `Empty text in response (finishReason: ${finishReason})`, { fullResponse: JSON.stringify(data).slice(0, 800) })
    if (finishReason === 'SAFETY') throw new Error('Gemini blocked this response for safety reasons. Try rephrasing.')
    if (finishReason === 'RECITATION') throw new Error('Gemini refused to respond due to recitation policy.')
    throw new Error(`Gemini returned no text. Finish reason: ${finishReason ?? 'unknown'}`)
  }

  if (finishReason === 'MAX_TOKENS') {
    log.warn('Gemini', `Response hit token limit (${maxTokens}) — JSON may be truncated. Will attempt repair.`)
  }

  done({ chars: text.length, finishReason })
  return text
}

// ── JSON parser with repair ───────────────────────────────────────────────────
// Handles: markdown fences, truncation (attempts to close unclosed objects),
// and stray text before/after the JSON object.
function parseJSON(raw, label = 'response') {
  log.debug('Gemini', `Parsing ${label} (${raw.length} chars)`)

  // Step 1: strip markdown code fences Gemini sometimes adds despite instructions
  let cleaned = raw.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  // Step 2: extract outermost { ... } in case there's prose before/after
  const firstBrace = cleaned.indexOf('{')
  const lastBrace  = cleaned.lastIndexOf('}')

  if (firstBrace === -1) {
    log.error('Gemini', `No opening { found in response`, { rawPreview: raw.slice(0, 400) })
    throw new Error(`AI response contained no JSON object. Full response logged to console.`)
  }

  // If there's no closing brace the response was truncated — attempt repair
  let jsonStr = firstBrace !== -1 && lastBrace > firstBrace
    ? cleaned.slice(firstBrace, lastBrace + 1)
    : cleaned.slice(firstBrace) // truncated — try anyway

  // Step 3: parse
  try {
    const parsed = JSON.parse(jsonStr)
    log.ok('Gemini', `JSON parsed from ${label}`, { topLevelKeys: Object.keys(parsed) })
    return parsed
  } catch (firstErr) {
    log.warn('Gemini', `Standard parse failed: ${firstErr.message}`)

    // Step 4: attempt to repair truncated JSON by closing open structures
    const repaired = repairTruncatedJSON(jsonStr)
    if (repaired) {
      try {
        const parsed = JSON.parse(repaired)
        log.ok('Gemini', `JSON recovered via truncation repair`)
        return parsed
      } catch { /* fall through */ }
    }

    log.error('Gemini', `All JSON parse strategies failed`, {
      parseError: firstErr.message,
      rawPreview: raw.slice(0, 600),
    })
    throw new Error(`Could not parse AI response as JSON. The raw output has been logged to console for debugging.`)
  }
}

// Closes unclosed brackets/braces in truncated JSON responses
function repairTruncatedJSON(str) {
  try {
    // Count unclosed structures
    let depth = 0
    const stack = []
    let inStr = false
    let escape = false
    for (let i = 0; i < str.length; i++) {
      const c = str[i]
      if (escape) { escape = false; continue }
      if (c === '\\') { escape = true; continue }
      if (c === '"' && !escape) { inStr = !inStr; continue }
      if (inStr) continue
      if (c === '{' || c === '[') { stack.push(c === '{' ? '}' : ']') }
      else if (c === '}' || c === ']') { stack.pop() }
    }
    // Append closing characters in reverse
    let repaired = str
    // Remove trailing comma before close (common truncation artifact)
    repaired = repaired.replace(/,\s*$/, '')
    for (let i = stack.length - 1; i >= 0; i--) {
      repaired += stack[i]
    }
    return repaired
  } catch {
    return null
  }
}

function serializeCity(city) {
  return {
    id: city.id, name: city.name, country: city.country,
    dimensions: city.dimensions,
    monthlyLivingCost: city.cost?.avgMonthlyTotal,
    sharedRoomRent: city.cost?.avgRentShared,
    transportMonthly: city.cost?.publicTransportMonthly,
    groceriesMonthly: city.cost?.groceriesMonthly,
    topCareerSectors: city.career?.topSectors?.slice(0, 4),
    majorEmployers: city.career?.topCompanies?.slice(0, 4),
    postGradVisa: city.career?.postGradVisa,
    visaRisk: city.career?.visaRisk,
    workRightsDuringStudy: city.career?.partTimeRules,
    typicalStartSalary: city.career?.avgStartSalary,
    healthcareCostLevel: city.healthcare?.costLevel,
    healthcareStudentPlan: city.healthcare?.studentPlan,
    muslimCommunity: city.demographics?.muslimCommunitySize,
    lgbtqFriendly: city.demographics?.lgbtqFriendly,
    drinkingCulture: city.demographics?.alcoholCulture,
    safeNeighbourhoods: city.safety?.safeZones,
    cautiousNeighbourhoods: city.safety?.cautionZones,
    housingInsiderTip: city.housing?.insiderTip,
    housingApplicationLeadTime: city.housing?.avgLeadTime,
    weather: city.social?.weather,
  }
}

// ── Prompt engineering helpers ────────────────────────────────────────────────
// This system instruction governs ALL calls. It defines the tone, formatting rules,
// and anti-patterns that make responses sound natural rather than AI-generated.
const BASE_SYSTEM = `You are the researcher behind opolo — a city-matching tool for international students. You've personally looked into each of these cities and you're giving a friend the honest rundown of what studying there is actually like.

TONE:
- Conversational and direct. Like a knowledgeable friend, not a consultant writing a report.
- Second person ("your budget", "your field") — never third person ("the student's budget").
- No openers that use the person's name. Never "Hello [name]", "Dear [name]", "[Name], your results show...". Just start with the substance.
- Short sentences. Specific numbers. Active voice.
- No filler phrases: avoid "It is worth noting", "Additionally", "Furthermore", "It should be mentioned".
- Contractions are fine (it's, you'll, that's, here's).

CITATIONS:
After relevant claims, add the source inline like a footnote: [city_data] [general_knowledge] [profile_inference]
- [city_data] = fact comes from our city dataset
- [general_knowledge] = from your training knowledge (reader should verify independently)
- [profile_inference] = you inferred this from the student's quiz answers
Keep citations short and unobtrusive. Don't explain the citation system in the output.

DATA HONESTY:
- Never invent statistics.
- If something might be out of date, flag it: "last we checked [city_data]" or "verify this one".
- A confident wrong answer is worse than an honest "we're not sure".

OUTPUT FORMAT:
Return ONLY a raw JSON object. No markdown. No code fences. No explanation text before or after. Just the JSON.`

// ─────────────────────────────────────────────────────────────────────────────
export async function runFullAIAnalysis({ profile, topCity, allResults }) {
  const g = log.group('AI', `Analysis: ${profile.name} → ${topCity.name}`)
  log.info('AI', 'Starting full analysis', {
    name: profile.name, nationality: profile.nationality,
    field: profile.fieldOfStudy, budget: profile.budget,
    topCity: topCity.name,
    allScores: allResults.map(r => `${r.city.name}:${r.score}`).join(', '),
  })

  const cityPayload = serializeCity(topCity)
  const others = allResults
    .filter(r => r.city.id !== topCity.id)
    .map(r => ({
      name: r.city.name, score: r.score,
      topDimension: Object.entries(r.city.dimensions).sort((a, b) => b[1] - a[1])[0],
    }))

  const budgetLabels = {
    under_1000: 'under $1,000/mo',
    '1000_1500': '$1,000–$1,500/mo',
    '1500_2500': '$1,500–$2,500/mo',
    above_2500: 'above $2,500/mo',
  }

  const userMessage = `Here's the student profile and their top city match. Write a complete analysis.

STUDENT
- Nationality: ${profile.nationality}, Age: ${profile.age}
- Country of residence: ${profile.countryOfResidence && profile.countryOfResidence !== 'Same as nationality' ? profile.countryOfResidence : profile.nationality}
- Preferred currency: ${profile.preferredCurrency || 'USD'} (show budget figures in this currency, with a USD value in parentheses)
- Field: ${profile.fieldOfStudy} (${profile.degreeLevel})
- Monthly budget: ${budgetLabels[profile.budget] || profile.budget}
- Religion: ${profile.religion}
- Alcohol comfort: ${profile.alcoholComfort}
- Social style: ${profile.socialStyle}
- Language: ${profile.languageTest || 'none'} ${profile.languageScore || ''}
- Criminal background: ${profile.criminalBackground || 'not disclosed'}
- Priority weights (1=irrelevant, 10=dealbreaker):
  Career ${profile.weights.career}/10, Cost ${profile.weights.cost}/10, Safety ${profile.weights.safety}/10, Social ${profile.weights.social}/10, Diversity ${profile.weights.diversity}/10, Healthcare ${profile.weights.healthcare}/10

TOP MATCH: ${topCity.name} (${topCity.country})
CITY DATA:
${JSON.stringify(cityPayload, null, 2)}

OTHER CITIES:
${others.map(c => `${c.name}: scored ${c.score}/100, strongest in ${c.topDimension[0]} (${c.topDimension[1]})`).join('\n')}

Return this exact JSON structure. Every string field is actual output text — write it as you would to the student:

{
  "whyThisMatches": "2-3 sentences. Start with the most concrete reason this city fits their specific combination of field + budget + priorities. Reference actual numbers from city data. Do NOT start with their name.",

  "matchingTransparency": {
    "scoreBreakdown": [
      {
        "dimension": "one of: career, cost, safety, social, diversity, healthcare",
        "userPriority": 7,
        "cityScore": 80,
        "insight": "what this number actually means for this person in practice",
        "dataSource": "city_data or general_knowledge"
      }
    ],
    "whyNotOthers": [
      {
        "city": "city name",
        "score": 72,
        "keyReason": "the single most important reason this city fits less well for this specific student"
      }
    ]
  },

  "prosAndCons": {
    "pros": [
      { "point": "specific, concrete advantage — not generic", "source": "[city_data]", "confidence": "high" }
    ],
    "cons": [
      { "point": "honest, specific downside — not sugarcoated", "source": "[city_data]", "confidence": "high" }
    ],
    "mismatches": [
      { "preference": "what the student said they want", "reality": "what this city actually delivers", "severity": "minor or moderate or significant" }
    ]
  },

  "visaAssessment": {
    "outlook": "one of: Exceptional Fit, Favorable Outlook, Moderate Potential, Needs Strengthening, Significant Challenges",
    "rationale": "2 sentences. Specific to their nationality and language score. Mention the actual visa type and one concrete risk or advantage.",
    "keyRisks": ["specific risk"],
    "keyStrengths": ["specific strength"],
    "nextStep": "single most important action to take right now"
  },

  "budgetBreakdown": {
    "narrative": "2 sentences. Compare their stated budget to actual monthly costs. Give a concrete surplus or deficit figure.",
    "monthlyEstimate": {
      "rent": "realistic figure from city data",
      "food": "realistic figure",
      "transport": "from city data",
      "insurance": "from city data",
      "total": "realistic total"
    },
    "savingStrategies": ["specific, city-specific way to reduce costs — name the actual program or scheme"],
    "surplusOrDeficit": "e.g. roughly $400/mo short — coverable with part-time campus work"
  },

  "relocationChecklist": [
    { "id": "ai_1", "phase": "before", "title": "short action title", "detail": "specific to their nationality and destination", "deadline": "relative timing", "urgency": "critical", "docs": ["document name"] },
    { "id": "ai_2", "phase": "before", "title": "short action title", "detail": "specific detail", "deadline": "timing", "urgency": "high", "docs": [] },
    { "id": "ai_3", "phase": "before", "title": "short action title", "detail": "specific detail", "deadline": "timing", "urgency": "high", "docs": [] },
    { "id": "ai_4", "phase": "after",  "title": "short action title", "detail": "first week action", "deadline": "week 1", "urgency": "high", "docs": [] },
    { "id": "ai_5", "phase": "after",  "title": "short action title", "detail": "first month action", "deadline": "month 1", "urgency": "medium", "docs": [] }
  ],

  "communityIntroMessage": {
    "subject": "email subject line",
    "body": "warm, specific intro email under 120 words. Reference their shared field and one specific aspect of the city. Do not start with their name.",
    "timezoneNote": "e.g. They're 6 hours ahead — best to message before noon your time"
  },

  "livedExperienceSummary": {
    "headline": "one honest sentence capturing what daily life actually feels like there",
    "positives": [
      { "point": "something students genuinely love about this city", "source": "[city_data]" }
    ],
    "watchouts": [
      { "point": "something this specific student needs to know", "source": "[general_knowledge]" }
    ],
    "forThisStudent": "1-2 sentences about how their specific background — nationality, religion, field, budget — will shape their experience here. Be honest about friction points."
  },

  "dataValidation": {
    "likelyAccurate": ["data point that looks current"],
    "mightBeStale": ["data point that may have changed, with reason"],
    "verifyBefore": ["data point worth double-checking before making a decision"]
  }
}`

  try {
    const raw = await callGemini({
      systemPrompt: BASE_SYSTEM,
      userMessage,
      maxTokens: 4096,
      label: 'runFullAIAnalysis',
      temperature: 0.3,
    })
    const result = parseJSON(raw, 'runFullAIAnalysis')
    log.ok('AI', 'Analysis complete', {
      fieldsPresent: Object.keys(result),
      checklistLen: result.relocationChecklist?.length,
      prosLen: result.prosAndCons?.pros?.length,
    })
    g.end()
    return result
  } catch (err) {
    log.error('AI', 'runFullAIAnalysis failed', err)
    g.end()
    throw err
  }
}

// ─────────────────────────────────────────────────────────────────────────────
export async function generateFollowUpQuestions({ profile, results }) {
  const top = results[0]
  const second = results[1]
  const gap = top.score - (second?.score || 0)
  const weakestForUser = top.dimScores
    ? Object.entries(top.dimScores)
        .filter(([k]) => (profile.weights[k] || 5) >= 6)
        .sort((a, b) => a[1] - b[1])[0]?.[0] || 'cost'
    : 'cost'

  log.info('FollowUp', 'Generating follow-up questions', {
    topCity: top.city.name, topScore: top.score,
    runnerUp: second?.city?.name, gap, weakestForUser,
  })

  const userMessage = `A student just saw their city matching results. Ask 3 targeted follow-up questions to refine their match.

Results: ${top.city.name} scored ${top.score}/100. Runner-up: ${second?.city?.name || 'none'} scored ${second?.score || 'N/A'}/100. Gap: ${gap} points.
Student: ${profile.nationality}, ${profile.fieldOfStudy}, budget ${profile.budget}.
Weakest dimension the student cares about (weight ≥6): ${weakestForUser}.

Each question should feel like a natural follow-up someone knowledgeable would ask. 
Reference specific numbers from the results. Make the options concrete and relatable, not abstract.
Do NOT start any text with the student's name.

Return this JSON:
{
  "intro": "one conversational sentence setting up the refinement — reference the top city by name, do not start with the student name",
  "questions": [
    {
      "id": "q1",
      "question": "specific question referencing the actual city and score",
      "dimension": "career",
      "context": "one sentence explaining why this tradeoff matters here",
      "answers": [
        { "label": "concrete answer option", "weightAdjust": -2 },
        { "label": "concrete answer option", "weightAdjust": 0 },
        { "label": "concrete answer option", "weightAdjust": 3 }
      ]
    },
    {
      "id": "q2",
      "question": "second question",
      "dimension": "cost",
      "context": "context",
      "answers": [
        { "label": "option", "weightAdjust": -2 },
        { "label": "option", "weightAdjust": 0 },
        { "label": "option", "weightAdjust": 3 }
      ]
    },
    {
      "id": "q3",
      "question": "third question",
      "dimension": "${weakestForUser}",
      "context": "context",
      "answers": [
        { "label": "option", "weightAdjust": -2 },
        { "label": "option", "weightAdjust": 0 },
        { "label": "option", "weightAdjust": 3 }
      ]
    }
  ]
}`

  try {
    const raw = await callGemini({
      systemPrompt: BASE_SYSTEM,
      userMessage,
      maxTokens: 1200,
      label: 'generateFollowUpQuestions',
      temperature: 0.4,
    })
    const result = parseJSON(raw, 'generateFollowUpQuestions')
    log.ok('FollowUp', `${result.questions?.length} questions generated`, {
      dims: result.questions?.map(q => q.dimension),
    })
    return result
  } catch (err) {
    log.error('FollowUp', 'generateFollowUpQuestions failed', err)
    throw err
  }
}

// ─────────────────────────────────────────────────────────────────────────────
export async function generateCommunityIntro({ userProfile, peerProfile, cityName }) {
  log.info('Community', `Intro: ${userProfile.name} → ${peerProfile.name} (${cityName})`)

  const userMessage = `Write a short, genuine intro email from one international student to another.

Writer: studying ${userProfile.fieldOfStudy}, originally from ${userProfile.nationality}.
Recipient: ${peerProfile.name}, from ${peerProfile.from}, doing ${peerProfile.program} at ${peerProfile.university} in ${cityName}.
${peerProfile.bio ? `Recipient said about themselves: "${peerProfile.bio}"` : ''}

Keep it under 120 words. Sound like a real person reaching out, not a template. 
Reference something specific about either their shared field or the city.
Do NOT start with "Hello [name]" — just get into it naturally.

Return JSON: { "subject": "...", "body": "..." }`

  try {
    const raw = await callGemini({
      systemPrompt: BASE_SYSTEM,
      userMessage,
      maxTokens: 400,
      label: 'generateCommunityIntro',
      temperature: 0.5,
    })
    const result = parseJSON(raw, 'generateCommunityIntro')
    log.ok('Community', 'Intro generated')
    return result
  } catch (err) {
    log.error('Community', 'generateCommunityIntro failed', err)
    throw err
  }
}
