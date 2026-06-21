import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Briefcase, Home, Shield, Users, Heart, DollarSign, Sparkles, CheckCircle2, Loader2, BarChart2, X, RefreshCw } from 'lucide-react'
import { useAI } from '../context/AIContext.jsx'
import { useApp } from '../context/AppContext.jsx'
import { calculateMatchScores, getFirstTolerancePrompt } from '../lib/matchingEngine.js'
import { classifyStudentType } from '../lib/clustering.js'
import { DIMENSION_META } from '../data/cityData.js'
import ToleranceModal from '../components/ToleranceModal.jsx'
import CostForecastChart from '../components/CostForecastChart.jsx'
import DimensionChart from '../components/DimensionChart.jsx'
import WhyThisMatches from '../components/WhyThisMatches.jsx'
import LivedExperience from '../components/LivedExperience.jsx'
import PeerConnect from '../components/PeerConnect.jsx'
import { log } from '../lib/logger.js'

const TABS = [
  { id: 'overview',  label: 'Overview',         icon: <Home className="w-3.5 h-3.5" /> },
  { id: 'career',    label: 'Career & Visa',     icon: <Briefcase className="w-3.5 h-3.5" /> },
  { id: 'safety',    label: 'Safety',            icon: <Shield className="w-3.5 h-3.5" /> },
  { id: 'cost',      label: 'Costs & Forecast',  icon: <DollarSign className="w-3.5 h-3.5" /> },
  { id: 'social',    label: 'Social & Culture',  icon: <Users className="w-3.5 h-3.5" /> },
  { id: 'lived',     label: 'Lived Experience',  icon: <Heart className="w-3.5 h-3.5" /> },
]

// Default profile for demo / direct URL access
const DEMO_PROFILE = {
  name: 'Student',
  nationality: 'Indian',
  age: '23',
  fieldOfStudy: 'Computer Science / AI / Data',
  degreeLevel: "Master's (MSc/MA)",
  weights: { career: 9, cost: 7, safety: 7, social: 5, diversity: 6, healthcare: 5 },
  religion: 'none',
  alcoholComfort: 'fine',
  socialStyle: 'community_active',
  budget: '1000_1500',
  startDate: 'sep_2026',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    profile: ctxProfile,
    selectedCityId, setSelectedCityId,
    tolerances, setTolerances,
  } = useApp()
  const profile = ctxProfile?.name ? ctxProfile : DEMO_PROFILE
  const isRealProfile = !!(ctxProfile?.name)
  const {
    analysis, loading: aiLoading, error: aiError,
    followUp, followUpLoading, followUpAnswers, followUpDone,
    triggerAnalysis, triggerFollowUp, answerFollowUp, submitFollowUp,
  } = useAI()

  const [results, setResults] = useState([])
  const [archetype, setArchetype] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [toleranceModal, setToleranceModal] = useState(null)
  // Run matching whenever profile or tolerances change
  // Compute effective weights — memoised so it only changes when inputs actually change
  // (not on every render). This prevents the useEffect below from looping infinitely.
  const effectiveProfile = useMemo(() => {
    if (!followUpDone || Object.keys(followUpAnswers).length === 0 || !followUp?.questions) {
      return profile
    }
    const adjustedWeights = { ...profile.weights }
    followUp.questions.forEach(q => {
      const adj = followUpAnswers[q.id]
      if (adj !== undefined && q.dimension && adjustedWeights[q.dimension] !== undefined) {
        adjustedWeights[q.dimension] = Math.max(1, Math.min(10, adjustedWeights[q.dimension] + adj))
      }
    })
    return { ...profile, weights: adjustedWeights }
  }, [profile, followUpDone, followUpAnswers, followUp])

  // Track whether we've already opened the tolerance modal for the current scoring
  const toleranceModalShown = useRef(false)

  useEffect(() => {
    log.info('Matching', 'Dashboard useEffect fired — running scoring', {
      isRealProfile,
      followUpDone,
      activeTolerances: Object.keys(tolerances),
    })

    const scored = calculateMatchScores(effectiveProfile, tolerances)
    setResults(scored)

    if (scored.length === 0) {
      log.error('Matching', 'calculateMatchScores returned empty array — CITIES data may be missing')
      return
    }

    // Auto-select top match for real profiles
    if (isRealProfile) {
      log.info('Router', `Auto-selecting top match: ${scored[0].city.name} (${scored[0].score}/100)`)
      setSelectedCityId(scored[0].city.id)
    }

    // Trigger AI (guards inside both functions prevent duplicate calls)
    if (isRealProfile) {
      log.info('AI', `Requesting AI analysis for ${scored[0].city.name}`)
      triggerAnalysis({ profile, topCity: scored[0].city, allResults: scored })
      triggerFollowUp({ profile, results: scored })
    }

    // NOTE: the tolerance modal is NOT opened here. It's opened by a separate
    // effect below that waits until the AI analysis has finished loading AND
    // the user has had time to read their recommendation. This prevents the
    // modal from interrupting the initial reveal of results.
  }, [effectiveProfile, tolerances])

  // Open the tolerance modal only after results are visible and AI is done.
  // Fires at most once per session (toleranceModalShown ref guards it).
  useEffect(() => {
    if (toleranceModalShown.current) return        // already shown — never again
    if (toleranceModal) return                      // one is already open
    if (results.length === 0) return                // no results yet
    if (aiLoading) return                           // wait for AI to finish first
    if (!isRealProfile) return                      // skip for demo profile

    const firstPrompt = getFirstTolerancePrompt(results)
    if (!firstPrompt) {
      toleranceModalShown.current = true            // nothing to ask — mark done
      return
    }

    // Give the user 6 seconds with their visible recommendation before asking
    const timer = setTimeout(() => {
      if (toleranceModalShown.current) return
      log.info('Matching', `Opening tolerance modal for: ${firstPrompt.prompt.dimension}`)
      toleranceModalShown.current = true
      setToleranceModal(firstPrompt.prompt)
    }, 6000)

    return () => clearTimeout(timer)
  }, [results, aiLoading, isRealProfile, toleranceModal])

  // Classify archetype once
  useEffect(() => {
    try {
      const result = classifyStudentType(profile.weights)
      log.info('Matching', `Archetype: ${result.label}`, { distance: result.distance?.toFixed(2) })
      setArchetype(result)
    } catch (e) {
      log.error('Matching', 'classifyStudentType threw', e)
    }
  }, [])

  const handleToleranceSubmit = (dimension, value) => {
    log.info('Matching', `Tolerance submitted: ${dimension} = ${value}/10`)
    setTolerances(t => ({ ...t, [dimension]: value }))
    setToleranceModal(null)
  }

  const selected = results.find(r => r.city.id === selectedCityId)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate('/assess')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Reassess
          </button>
          <span className="font-bold text-lg ml-auto">
            <span className="text-gradient">op</span><span className="text-slate-300">olo</span>
          </span>
          {Object.keys(tolerances).length > 0 && (
            <button
              onClick={() => { setTolerances({}); setToleranceModal(null) }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset tolerances
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Hero greeting ─────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            {profile.name !== 'Student' ? `${profile.name}'s` : 'Your'} city matches
          </h1>
          <p className="text-slate-400 text-sm">
            Based on your priorities · {profile.fieldOfStudy} · {profile.nationality}
            {Object.keys(tolerances).length > 0 && (
              <span className="ml-2 text-teal-400">· tolerance adjustments applied</span>
            )}
          </p>
        </div>

        {/* ── Archetype badge ───────────────────────────────── */}
        {archetype && (
          <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r ${archetype.color} text-white text-sm font-medium mb-8`}>
            <span className="text-lg">{archetype.emoji}</span>
            <div>
              <span>{archetype.label}</span>
              <span className="text-white/70 text-xs ml-2">· {archetype.insight}</span>
            </div>
          </div>
        )}

        {/* ── AI Transparency Panel ───────────────────────────── */}
        {isRealProfile && (aiLoading || analysis || aiError) && (
          <div className="rounded-2xl border border-violet-500/20 bg-slate-900/80 mb-4 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-100">AI Reasoning</span>
                  <span className="text-xs text-slate-500 ml-2">powered by Gemini</span>
                </div>
                {aiLoading && (
                  <span className="flex items-center gap-1.5 text-xs text-violet-400 animate-pulse ml-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Thinking…
                  </span>
                )}
                {analysis && !aiLoading && (
                  <span className="text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full ml-1">
                    ✓ Done
                  </span>
                )}
              </div>
              <Link to="/ai-insights" className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium">
                Full insights →
              </Link>
            </div>

            {/* Source legend — explains what the citation tags mean */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/60">
              <span className="text-[10px] text-slate-500">How AI cites its reasoning:</span>
              <span className="text-[10px] flex items-center gap-1">
                <span className="bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded font-mono">[city_data]</span>
                <span className="text-slate-500">from our verified dataset</span>
              </span>
              <span className="text-[10px] flex items-center gap-1">
                <span className="bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded font-mono">[general_knowledge]</span>
                <span className="text-slate-500">AI training knowledge — verify independently</span>
              </span>
              <span className="text-[10px] flex items-center gap-1">
                <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono">[profile_inference]</span>
                <span className="text-slate-500">inferred from your answers</span>
              </span>
            </div>

            <div className="p-5 space-y-5">

              {/* Error state — only shown when NOT loading (avoids flashing stale error on retry) */}
              {aiError && !aiLoading && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-300 mb-0.5">AI analysis ran into a problem</p>
                    <p className="text-xs text-red-400/70 font-mono">{aiError}</p>
                    <p className="text-xs text-slate-500 mt-1">Your match scores are still accurate — they come from our local algorithm and don't need the API. AI explanations, visa outlook, and budget breakdown won't show until this resolves.</p>
                  </div>
                </div>
              )}

              {/* Loading skeleton — shown while Gemini processes the analysis */}
              {aiLoading && !analysis && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-800 rounded-full animate-pulse w-full" />
                    <div className="h-3 bg-slate-800 rounded-full animate-pulse w-10/12" />
                    <div className="h-3 bg-slate-800 rounded-full animate-pulse w-3/4" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="rounded-xl border border-slate-800 p-3 space-y-2">
                        <div className="h-2.5 bg-slate-800 rounded animate-pulse w-1/2" />
                        <div className="h-2 bg-slate-800 rounded animate-pulse w-full" />
                        <div className="h-2 bg-slate-800 rounded animate-pulse w-4/5" />
                        <div className="h-2 bg-slate-800 rounded animate-pulse w-3/5" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 text-center animate-pulse">Analysing your profile against city data…</p>
                </div>
              )}

              {/* Why this city — the main explanation */}
              {analysis?.whyThisMatches && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Why {results[0]?.city?.name} is your top match
                  </p>
                  <p className="text-sm text-slate-200 leading-relaxed">{analysis.whyThisMatches}</p>
                </div>
              )}

              {/* Pros / Cons / Mismatches — 3 column grid */}
              {analysis?.prosAndCons && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Strengths */}
                  <div className="rounded-xl bg-teal-500/5 border border-teal-500/20 p-3.5">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-xs font-semibold text-teal-400">Works for you</span>
                    </div>
                    <ul className="space-y-2">
                      {(analysis.prosAndCons.pros || []).slice(0,3).map((p,i) => (
                        <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                          <span className="text-teal-500 mt-0.5 flex-shrink-0">✓</span>
                          <span>
                            {p.point}
                            {p.source && (
                              <span
                                title={p.source === '[city_data]' ? 'From our verified dataset' : p.source === '[general_knowledge]' ? 'AI training knowledge — verify independently' : 'Inferred from your answers'}
                                className={`ml-1 text-[9px] font-mono px-1 py-0.5 rounded cursor-help ${p.source==='[city_data]'?'bg-teal-500/20 text-teal-500':p.source==='[profile_inference]'?'bg-amber-500/20 text-amber-500':'bg-violet-500/20 text-violet-500'}`}
                              >{p.source}</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Watch outs */}
                  <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3.5">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-semibold text-amber-400">Worth knowing</span>
                    </div>
                    <ul className="space-y-2">
                      {(analysis.prosAndCons.cons || []).slice(0,3).map((c,i) => (
                        <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                          <span className="text-amber-400 mt-0.5 flex-shrink-0">△</span>
                          <span>
                            {c.point}
                            {c.source && (
                              <span
                                title={c.source === '[city_data]' ? 'From our verified dataset' : c.source === '[general_knowledge]' ? 'AI training knowledge — verify independently' : 'Inferred from your answers'}
                                className={`ml-1 text-[9px] font-mono px-1 py-0.5 rounded cursor-help ${c.source==='[city_data]'?'bg-teal-500/20 text-teal-500':c.source==='[profile_inference]'?'bg-amber-500/20 text-amber-500':'bg-violet-500/20 text-violet-500'}`}
                              >{c.source}</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mismatches */}
                  <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-3.5">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <X className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-xs font-semibold text-rose-400">Where it falls short</span>
                    </div>
                    {(analysis.prosAndCons.mismatches || []).length === 0 ? (
                      <p className="text-xs text-slate-500 leading-relaxed">No significant mismatches between your priorities and this city.</p>
                    ) : (
                      <ul className="space-y-2">
                        {(analysis.prosAndCons.mismatches || []).slice(0,3).map((m,i) => (
                          <li key={i} className="text-xs text-slate-300 leading-relaxed">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${m.severity==='significant'?'bg-red-500/20 text-red-400':m.severity==='moderate'?'bg-amber-500/20 text-amber-400':'bg-slate-700 text-slate-400'}`}>
                                {m.severity}
                              </span>
                            </div>
                            <span className="text-slate-500">You want: </span>{m.preference}
                            <br />
                            <span className="text-slate-500">Reality: </span>{m.reality}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Why not others — with city flags */}
              {analysis?.matchingTransparency?.whyNotOthers?.length > 0 && (
                <div className="rounded-xl bg-slate-800/40 border border-slate-700/50 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5" /> Why the other cities scored lower for you
                  </p>
                  <div className="space-y-2">
                    {analysis.matchingTransparency.whyNotOthers.map((c,i) => {
                      const flag = c.city?.toLowerCase().includes('boston') ? '🇺🇸' : c.city?.toLowerCase().includes('paris') ? '🇫🇷' : '🇳🇱'
                      return (
                        <div key={i} className="flex items-start gap-2.5 text-xs">
                          <span className="text-base leading-none mt-0.5 flex-shrink-0">{flag}</span>
                          <div>
                            <span className="font-medium text-slate-300">{c.city}</span>
                            <span className="text-slate-600"> · scored {c.score}/100 · </span>
                            <span className="text-slate-400">{c.keyReason}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Data freshness — when AI flags stale data */}
              {analysis?.dataValidation?.mightBeStale?.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <span className="text-amber-400/80 font-medium">Data note from AI: </span>
                    <span className="text-slate-400">{analysis.dataValidation.mightBeStale[0]}</span>
                    {analysis.dataValidation.verifyBefore?.length > 0 && (
                      <span className="text-slate-500"> Always verify independently: {analysis.dataValidation.verifyBefore[0]}</span>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ── Follow-Up Refinement Panel ───────────────────────── */}
        {isRealProfile && (followUp || followUpLoading) && !followUpDone && (
          <div className="rounded-2xl border border-amber-500/20 bg-slate-900/80 mb-4 overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-100">Let us narrow this down</span>
                  {followUpLoading && (
                    <span className="flex items-center gap-1.5 text-xs text-amber-400 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Generating questions…
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Answer 3 quick tradeoff questions — scores will update instantly based on your answers
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {followUp?.intro && (
                <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-amber-500/40 pl-3">
                  {followUp.intro}
                </p>
              )}

              {/* Loading skeleton */}
              {followUpLoading && !followUp && (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                      <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-slate-800 rounded animate-pulse w-1/2" />
                      <div className="flex gap-2 mt-2">
                        {[1,2,3].map(j => <div key={j} className="h-9 bg-slate-800 rounded-lg animate-pulse flex-1" />)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Questions */}
              {followUp?.questions?.map((q, qi) => (
                <div key={q.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-800 rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">{qi+1}</span>
                    <p className="text-sm font-medium text-slate-200">{q.question}</p>
                  </div>
                  {q.context && (
                    <p className="text-xs text-slate-500 ml-6 mb-3 leading-relaxed">{q.context}</p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 ml-6">
                    {q.answers.map((a, ai) => (
                      <button
                        key={ai}
                        onClick={() => answerFollowUp(q.id, a.weightAdjust)}
                        className={`flex-1 text-xs px-3 py-2.5 rounded-lg border transition-all text-center font-medium ${
                          followUpAnswers[q.id] === a.weightAdjust
                            ? 'border-amber-500 bg-amber-500/20 text-amber-200 shadow-sm shadow-amber-500/10'
                            : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-amber-500/40 hover:text-slate-200'
                        }`}
                      >
                        {followUpAnswers[q.id] === a.weightAdjust && <span className="mr-1">✓</span>}
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Submit — only appears when all answered */}
              {followUp?.questions && Object.keys(followUpAnswers).length === followUp.questions.length && (
                <button
                  onClick={submitFollowUp}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
                >
                  Update my matches based on these answers →
                </button>
              )}

              {/* Progress indicator */}
              {followUp?.questions && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex gap-1">
                    {followUp.questions.map((q,i) => (
                      <div key={i} className={`h-1 w-8 rounded-full transition-all ${followUpAnswers[q.id] !== undefined ? 'bg-amber-500' : 'bg-slate-700'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">
                    {Object.keys(followUpAnswers).length}/{followUp.questions.length} answered
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Post-Refinement Badge ────────────────────────────── */}
        {followUpDone && Object.keys(followUpAnswers).length > 0 && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4 mb-4">
            <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <div>
              <span className="text-sm font-medium text-teal-300">Rankings updated</span>
              <span className="text-xs text-slate-500 ml-2">
                Your priority weights were adjusted based on your answers — the scores above now reflect your refined preferences.
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ── Left: Ranked results ──────────────────────────── */}
          <div className="xl:col-span-1 space-y-4">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Rankings</h2>
            {results.map((r, i) => (
              <CityCard
                key={r.city.id}
                result={r}
                rank={i + 1}
                selected={r.city.id === selectedCityId}
                onSelect={() => { setSelectedCityId(r.city.id); setActiveTab('overview') }}
              />
            ))}

            {/* Tolerance prompts list */}
            {results.flatMap(r => r.tolerancePrompts).length > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-300">Trade-offs to review</span>
                </div>
                {results.flatMap(r =>
                  r.tolerancePrompts.map(p => (
                    <button
                      key={`${r.city.id}-${p.dimension}`}
                      onClick={() => setToleranceModal(p)}
                      className="w-full text-left text-xs text-amber-400/80 hover:text-amber-300 py-1.5 border-b border-amber-500/10 last:border-0 transition-colors"
                    >
                      {r.city.name}: {p.label} ({p.cityScore}/100) →
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ── Right: City detail ────────────────────────────── */}
          {selected ? (
            <div className="xl:col-span-2">
              {/* City header */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{selected.city.flag}</span>
                <div>
                  <h2 className="text-2xl font-bold">{selected.city.name}</h2>
                  <p className="text-slate-400 text-sm">{selected.city.subtitle}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${selected.matchColor.bg} ${selected.matchColor.text} ${selected.matchColor.border}`}>
                    {selected.matchLabel}
                  </div>
                  <div className="text-3xl font-bold mt-1">
                    {selected.score}
                    <span className="text-sm text-slate-500 font-normal">/100</span>
                  </div>
                </div>
              </div>

              {/* Why this matches — always visible */}
              <div className="mb-5">
                <WhyThisMatches
                  explanation={selected.explanation}
                  cityName={selected.city.name}
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-slate-900 rounded-xl mb-6 overflow-x-auto scrollbar-thin">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeTab === t.id ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="animate-fade-in">
                {activeTab === 'overview' && <OverviewTab result={selected} />}
                {activeTab === 'career'   && <CareerTab city={selected.city} />}
                {activeTab === 'safety'   && <SafetyTab city={selected.city} />}
                {activeTab === 'cost'     && <CostTab city={selected.city} />}
                {activeTab === 'social'   && <SocialTab city={selected.city} />}
                {activeTab === 'lived'    && (
                  <div className="space-y-6">
                    <LivedExperience experiences={selected.city.livedExperience} />
                    <PeerConnect ambassador={selected.city.peerAmbassador} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="xl:col-span-2 flex items-center justify-center text-slate-600 text-sm">
              Select a city to see details
            </div>
          )}
        </div>
      </div>

      {/* ── Tolerance Modal ───────────────────────────────── */}
      <ToleranceModal
        prompt={toleranceModal}
        onSubmit={handleToleranceSubmit}
        onDismiss={() => setToleranceModal(null)}
      />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CityCard({ result, rank, selected, onSelect }) {
  const { city, score, strengths, weaknesses, matchLabel, matchColor } = result
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border p-5 transition-all card-hover ${
        selected
          ? 'border-violet-500/60 bg-violet-500/5 shadow-lg shadow-violet-500/10'
          : 'border-slate-800 bg-slate-900/50'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{city.flag}</span>
          <div>
            <div className="font-semibold text-slate-100 flex items-center gap-2">
              {city.name}
              {rank === 1 && <span className="text-xs text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">Top pick</span>}
            </div>
            <div className="text-xs text-slate-500">{city.subtitle}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${selected ? 'text-violet-400' : 'text-slate-200'}`}>
            {score}
          </div>
          <div className={`text-xs font-medium ${matchColor.text}`}>{matchLabel}</div>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div className="h-full progress-bar" style={{ width: `${score}%` }} />
      </div>

      {/* Strengths / weaknesses */}
      <div className="flex flex-wrap gap-1.5">
        {strengths.slice(0, 2).map(s => (
          <span key={s.dim} className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full">
            ✓ {s.label}
          </span>
        ))}
        {weaknesses.slice(0, 1).map(w => (
          <span key={w.dim} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
            △ {w.label}
          </span>
        ))}
      </div>
    </button>
  )
}

function OverviewTab({ result }) {
  const { city } = result
  return (
    <div className="space-y-6">
      <DimensionChart city={city} />

      {/* Quick facts grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: '💰', label: 'Shared room', value: city.cost.avgRentShared },
          { icon: '🚇', label: 'Transport', value: city.cost.publicTransportMonthly },
          { icon: '🍽️', label: 'Meal out', value: city.cost.mealOutAvg },
          { icon: '👥', label: 'Intl students', value: `${city.demographics.internationalStudentPct}%` },
        ].map(f => (
          <div key={f.label} className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <div className="text-xl mb-1">{f.icon}</div>
            <div className="text-xs text-slate-500 mb-0.5">{f.label}</div>
            <div className="font-semibold text-sm text-slate-200">{f.value}</div>
          </div>
        ))}
      </div>

      {/* Tagline */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 mb-1">What this city is really about</div>
        <p className="text-slate-200 font-medium">{city.tagline}</p>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          {city.demographics.localPersonality}
        </p>
      </div>

      {/* Show don't tell */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="text-xs text-slate-500">What "large school" actually means here</div>
        </div>
        <div className="p-4">
          <div className="text-xl font-bold text-gradient mb-1">{city.demographics.whatLargeSchoolMeans.stat}</div>
          <p className="text-sm text-slate-400 leading-relaxed">{city.demographics.whatLargeSchoolMeans.reality}</p>
        </div>
      </div>
    </div>
  )
}

function CareerTab({ city }) {
  const c = city.career
  return (
    <div className="space-y-5">
      {/* Top companies */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <h4 className="font-semibold text-slate-200 mb-3">Top employers & sectors</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {c.topCompanies.map(co => (
            <span key={co} className="text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2.5 py-1 rounded-full">{co}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {c.topSectors.map(s => (
            <span key={s} className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full">{s}</span>
          ))}
        </div>
      </div>

      {/* Visa & salary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="text-xs text-slate-500 mb-1">Post-grad visa</div>
          <div className="font-semibold text-sm text-slate-200 mb-1">{c.postGradVisa}</div>
          <div className={`text-xs font-medium ${c.visaRisk.startsWith('LOW') ? 'text-teal-400' : c.visaRisk.startsWith('MEDIUM') ? 'text-amber-400' : 'text-red-400'}`}>
            Visa risk: {c.visaRisk}
          </div>
        </div>
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="text-xs text-slate-500 mb-1">Starting salary range</div>
          <div className="font-bold text-lg text-gradient">{c.avgStartSalary}</div>
        </div>
      </div>

      {/* Part-time rules */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 mb-1">Part-time work rules (as student)</div>
        <p className="text-sm text-slate-300">{c.partTimeRules}</p>
      </div>

      {/* Hidden perk */}
      {c.hiddenPerk && (
        <div className="rounded-xl bg-teal-500/5 border border-teal-500/20 p-4">
          <div className="text-xs text-teal-400 font-medium mb-1">💡 Hidden advantage</div>
          <p className="text-sm text-slate-300 leading-relaxed">{c.hiddenPerk}</p>
        </div>
      )}

      {/* Internship strength */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 mb-1">Internship / placement culture</div>
        <p className="text-sm text-slate-300 leading-relaxed">{c.internshipStrength}</p>
      </div>
    </div>
  )
}

function SafetyTab({ city }) {
  const s = city.safety
  return (
    <div className="space-y-5">
      {/* Score */}
      <div className="flex gap-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 flex-1">
          <div className="text-xs text-slate-500 mb-1">Overall safety score</div>
          <div className={`text-3xl font-bold ${s.overallScore >= 80 ? 'text-teal-400' : s.overallScore >= 65 ? 'text-amber-400' : 'text-red-400'}`}>
            {s.overallScore}<span className="text-sm text-slate-500">/100</span>
          </div>
        </div>
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 flex-1">
          <div className="text-xs text-teal-400 font-medium mb-1">☀ Daytime</div>
          <p className="text-xs text-slate-300">{s.daytime}</p>
        </div>
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 flex-1">
          <div className="text-xs text-amber-400 font-medium mb-1">🌙 Night</div>
          <p className="text-xs text-slate-300">{s.nighttime}</p>
        </div>
      </div>

      {/* Neighbourhoods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-teal-500/5 border border-teal-500/20 p-4">
          <div className="text-xs text-teal-400 font-medium mb-2">Safe zones</div>
          <ul className="space-y-1">
            {s.safeZones.map(z => (
              <li key={z} className="text-xs text-slate-300 flex items-center gap-1.5">
                <span className="text-teal-500">✓</span> {z}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
          <div className="text-xs text-amber-400 font-medium mb-2">Exercise caution</div>
          <ul className="space-y-1">
            {s.cautionZones.map(z => (
              <li key={z} className="text-xs text-slate-300 flex items-center gap-1.5">
                <span className="text-amber-500">△</span> {z}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Racism / inclusion */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 font-medium mb-2">Racism & inclusion climate</div>
        <p className="text-sm text-slate-300 leading-relaxed">{s.racismClimate}</p>
      </div>

      {/* Forum insights */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 font-medium mb-3">Student-reported insights</div>
        <div className="space-y-3">
          {s.nuancedInsights.map((insight, i) => {
            const [quote, ...rest] = insight.split(' — ')
            const author = rest.join(' — ')
            return (
              <div key={i} className="text-xs leading-relaxed">
                <span className="text-slate-300 italic">"{quote}"</span>
                {author && <span className="text-slate-500 ml-1">— {author}</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CostTab({ city }) {
  return (
    <div className="space-y-6">
      {/* Forecast chart */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <CostForecastChart
          data={city.costForecast}
          currency={city.forecastCurrency === 'USD' ? '$' : '€'}
          forecastNote={city.forecastNote}
        />
      </div>

      {/* Cost breakdown */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <h4 className="font-semibold text-slate-200 mb-4">Full cost breakdown</h4>
        <div className="space-y-3">
          {[
            ['Shared room (monthly)', city.cost.avgRentShared],
            ['Studio / solo (monthly)', city.cost.avgRentStudio],
            ['Total monthly living', city.cost.avgMonthlyTotal],
            ['Groceries / month', city.cost.groceriesMonthly],
            ['Meal out (mid-range)', city.cost.mealOutAvg],
            ['Public transport', city.cost.publicTransportMonthly],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between text-sm border-b border-slate-800 pb-2 last:border-0 last:pb-0">
              <span className="text-slate-400">{label}</span>
              <span className="font-medium text-slate-200">{val}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-3">Source: {city.cost.source}</p>
      </div>

      {/* Housing options */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <h4 className="font-semibold text-slate-200 mb-3">Housing options</h4>
        <ul className="space-y-2 mb-4">
          {city.housing.options.map((o, i) => (
            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
              <span className="text-violet-400 mt-0.5">•</span>
              {o}
            </li>
          ))}
        </ul>
        <div className="text-xs text-slate-500 mb-1">Lead time required</div>
        <p className="text-sm text-slate-300 mb-3">{city.housing.avgLeadTime}</p>
        <div className="rounded-lg bg-teal-500/5 border border-teal-500/20 p-3">
          <div className="text-xs text-teal-400 font-medium mb-1">💡 Insider tip</div>
          <p className="text-xs text-slate-300 leading-relaxed">{city.housing.insiderTip}</p>
        </div>
      </div>
    </div>
  )
}

function SocialTab({ city }) {
  const d = city.demographics
  const s = city.social
  const r = city.religion
  return (
    <div className="space-y-5">
      {/* Local personality */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 mb-1">What the locals are actually like</div>
        <p className="text-sm text-slate-300 leading-relaxed">{d.localPersonality}</p>
      </div>

      {/* Alcohol & social style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="text-xs text-slate-500 mb-1">Alcohol culture</div>
          <p className="text-sm text-slate-300 leading-relaxed">{d.alcoholCulture}</p>
        </div>
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="text-xs text-slate-500 mb-1">Quiet vs. party</div>
          <p className="text-sm text-slate-300 leading-relaxed">{d.quietVsParty}</p>
        </div>
      </div>

      {/* Religion / halal */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 mb-2">Religious infrastructure</div>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-violet-400 font-medium">Mosques nearby: </span>
            <span className="text-xs text-slate-300">{r.mosques.join(' · ')}</span>
          </div>
          <div>
            <span className="text-xs text-violet-400 font-medium">Halal food: </span>
            <span className="text-xs text-slate-300">{r.halalFood}</span>
          </div>
          {r.prayerSpaces && (
            <div>
              <span className="text-xs text-violet-400 font-medium">Prayer spaces: </span>
              <span className="text-xs text-slate-300">{r.prayerSpaces}</span>
            </div>
          )}
        </div>
      </div>

      {/* Events & outdoors */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 mb-2">Events & social highlights</div>
        <p className="text-sm text-slate-300 leading-relaxed mb-3">{s.eventsHighlight}</p>
        <div className="text-xs text-slate-500 mb-2">Outdoor & adventure options</div>
        <ul className="space-y-1">
          {s.outdoors.map((o, i) => (
            <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
              <span className="text-teal-500">→</span> {o}
            </li>
          ))}
        </ul>
      </div>

      {/* Weather */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 mb-1">Weather reality check</div>
        <p className="text-sm text-slate-300">{s.weather}</p>
        {s.hiddenGem && (
          <div className="mt-3 rounded-lg bg-violet-500/5 border border-violet-500/20 p-3">
            <div className="text-xs text-violet-400 font-medium mb-1">Hidden gem</div>
            <p className="text-xs text-slate-300">{s.hiddenGem}</p>
          </div>
        )}
      </div>
    </div>
  )
}
