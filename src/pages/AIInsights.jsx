// ─────────────────────────────────────────────────────────────────────────────
// AIInsights — Full AI analysis page
//
// Triggered automatically when the user lands on the dashboard after quiz.
// Shows: match transparency, visa assessment, budget breakdown,
// relocation checklist, community intro, lived experience summary.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Shield, DollarSign, Map, MessageCircle, Heart,
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  Copy, Check, Zap, BarChart2, RefreshCw
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useAI } from '../context/AIContext.jsx'
import { calculateMatchScores } from '../lib/matchingEngine.js'
import { log } from '../lib/logger.js'

// ── Streaming text component ──────────────────────────────────────────────────
function StreamText({ text, className = '' }) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    if (!text) return
    setDisplayed('')
    let i = 0
    const iv = setInterval(() => {
      i += 4
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { setDisplayed(text); clearInterval(iv) }
    }, 12)
    return () => clearInterval(iv)
  }, [text])
  return <span className={className}>{displayed}</span>
}


// ── Render text with inline [source_tag] citations as readable badges ────────
function CitedText({ text, className = '' }) {
  if (!text) return null
  const parts = text.split(/(\[[a-z_]+\])/g)
  const sourceConfig = {
    city_data:         { label: 'dataset', color: 'bg-teal-500/20 text-teal-400', title: 'From our verified city dataset' },
    general_knowledge: { label: 'AI knowledge', color: 'bg-violet-500/20 text-violet-400', title: 'AI training knowledge — verify independently if this is a key factor in your decision' },
    profile_inference: { label: 'your profile', color: 'bg-amber-500/20 text-amber-400', title: 'Inferred from your quiz answers' },
  }
  return (
    <span className={className}>
      {parts.map((part, i) => {
        const key = part.replace(/[\[\]]/g, '')
        const cfg = sourceConfig[key]
        if (cfg) {
          return (
            <span key={i} title={cfg.title}
              className={`inline-flex items-center text-[9px] font-semibold px-1.5 py-0.5 rounded mx-0.5 cursor-help ${cfg.color}`}>
              {cfg.label}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ icon, title, badge, children, accentColor = 'violet' }) {
  const colors = {
    violet: 'border-violet-500/20 bg-violet-500/5',
    teal:   'border-teal-500/20 bg-teal-500/5',
    amber:  'border-amber-500/20 bg-amber-500/5',
    blue:   'border-blue-500/20 bg-blue-500/5',
    rose:   'border-rose-500/20 bg-rose-500/5',
  }
  const iconColors = {
    violet: 'bg-violet-500/20 text-violet-400',
    teal:   'bg-teal-500/20 text-teal-400',
    amber:  'bg-amber-500/20 text-amber-400',
    blue:   'bg-blue-500/20 text-blue-400',
    rose:   'bg-rose-500/20 text-rose-400',
  }
  return (
    <div className={`rounded-2xl border p-5 ${colors[accentColor]}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColors[accentColor]}`}>
          {icon}
        </div>
        <h3 className="font-semibold text-slate-100 text-sm">{title}</h3>
        {badge && (
          <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{badge}</span>
        )}
      </div>
      {children}
    </div>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-800 rounded-lg ${className}`} />
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>
      ))}
    </div>
  )
}

// ── Match Transparency Panel ──────────────────────────────────────────────────
function MatchTransparency({ data }) {
  const [expanded, setExpanded] = useState(false)
  if (!data) return null

  const dimColors = {
    career: 'bg-violet-500', cost: 'bg-teal-500', safety: 'bg-blue-500',
    social: 'bg-pink-500', diversity: 'bg-amber-500', healthcare: 'bg-emerald-500',
  }

  return (
    <Section icon={<BarChart2 className="w-4 h-4" />} title="Why You Scored This Way" accentColor="violet">
      {/* Top factors */}
      <div className="space-y-3 mb-4">
        {data.topFactors?.map((f, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-300 capitalize">{f.dimension}</span>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>You: <span className="text-violet-400 font-semibold">{f.userWeight}/10</span></span>
                <span>City: <span className="text-teal-400 font-semibold">{f.cityScore}/100</span></span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
              <div
                className={`h-full rounded-full ${dimColors[f.dimension] || 'bg-violet-500'}`}
                style={{ width: `${f.cityScore}%`, transition: 'width 1s ease' }}
              />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{f.impact}</p>
          </div>
        ))}
      </div>

      {/* Trade-offs toggle */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {expanded ? 'Hide trade-offs' : `Show ${data.tradeoffs?.length || 0} trade-offs`}
      </button>

      {expanded && data.tradeoffs?.length > 0 && (
        <div className="mt-3 space-y-3 animate-fade-in">
          {data.tradeoffs.map((t, i) => (
            <div key={i} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-amber-300 capitalize">{t.dimension}</span>
              </div>
              <p className="text-xs text-slate-400 mb-1.5 leading-relaxed">{t.concern}</p>
              <p className="text-xs text-teal-400 leading-relaxed">💡 {t.mitigation}</p>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

// ── Visa Assessment Panel ─────────────────────────────────────────────────────
function VisaAssessment({ data }) {
  if (!data) return null

  const outlookStyles = {
    'Exceptional Fit':     { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    'Favorable Outlook':   { bg: 'bg-teal-500/15',    text: 'text-teal-400',    border: 'border-teal-500/30'   },
    'Moderate Potential':  { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/30'   },
    'Needs Strengthening': { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/30'  },
    'Significant Challenges': { bg: 'bg-red-500/15',  text: 'text-red-400',     border: 'border-red-500/30'    },
  }
  const s = outlookStyles[data.outlook] || outlookStyles['Moderate Potential']

  return (
    <Section icon={<Shield className="w-4 h-4" />} title="Visa Assessment" accentColor="blue">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold mb-3 ${s.bg} ${s.text} ${s.border}`}>
        {data.outlook}
      </div>
      <p className="text-sm text-slate-300 leading-relaxed mb-4">{data.rationale}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {data.keyStrengths?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-teal-400 mb-1.5">Strengths</p>
            <ul className="space-y-1">
              {data.keyStrengths.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-3 h-3 text-teal-400 flex-shrink-0 mt-0.5" /> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.keyRisks?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-amber-400 mb-1.5">Risks</p>
            <ul className="space-y-1">
              {data.keyRisks.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                  <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" /> {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {data.nextStep && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <Zap className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-violet-200">
            <span className="font-semibold">Next step: </span>{data.nextStep}
          </p>
        </div>
      )}
    </Section>
  )
}

// ── Budget Breakdown Panel ────────────────────────────────────────────────────
function BudgetBreakdown({ data }) {
  if (!data) return null
  return (
    <Section icon={<DollarSign className="w-4 h-4" />} title="Your Budget Reality" accentColor="teal">
      <p className="text-sm text-slate-300 leading-relaxed mb-4">{data.narrative}</p>

      {data.monthlyEstimate && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(data.monthlyEstimate).map(([k, v]) => (
            <div key={k} className="rounded-xl bg-slate-900 border border-slate-800 p-3">
              <div className="text-xs text-slate-500 capitalize mb-0.5">{k}</div>
              <div className="font-semibold text-sm text-slate-200">{v}</div>
            </div>
          ))}
        </div>
      )}

      {data.surplusOrDeficit && (
        <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-3 mb-3">
          <span className="text-xs text-slate-500">Bottom line: </span>
          <span className="text-sm font-medium text-slate-200">{data.surplusOrDeficit}</span>
        </div>
      )}

      {data.savingStrategies?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-teal-400 mb-2">Cost offsets available</p>
          <ul className="space-y-1.5">
            {data.savingStrategies.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300 leading-relaxed">
                <span className="text-teal-400 mt-0.5 flex-shrink-0">→</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  )
}

// ── Relocation Checklist Panel ────────────────────────────────────────────────
function AIChecklist({ items }) {
  const [done, setDone] = useState({})
  if (!items?.length) return null

  const before = items.filter(i => i.phase === 'before')
  const after  = items.filter(i => i.phase === 'after')
  const urgencyBadge = { critical: 'bg-red-500/20 text-red-400', high: 'bg-amber-500/20 text-amber-400', medium: 'bg-slate-700 text-slate-400' }

  const CheckGroup = ({ title, list }) => (
    <div className="mb-4">
      <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">{title}</p>
      <div className="space-y-2">
        {list.map(item => (
          <div
            key={item.id}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${done[item.id] ? 'border-slate-800 opacity-50' : 'border-slate-700 bg-slate-900/50'}`}
          >
            <button
              onClick={() => setDone(d => ({ ...d, [item.id]: !d[item.id] }))}
              className="flex-shrink-0 mt-0.5"
            >
              {done[item.id]
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                : <div className="w-4 h-4 rounded-full border-2 border-slate-600" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className={`text-xs font-medium ${done[item.id] ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {item.title}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${urgencyBadge[item.urgency]}`}>
                  {item.urgency}
                </span>
              </div>
              {item.deadline && <p className="text-xs text-slate-500">{item.deadline}</p>}
              {item.detail && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Section icon={<Map className="w-4 h-4" />} title="Personalised Relocation Checklist" accentColor="amber">
      {before.length > 0 && <CheckGroup title="Before you leave" list={before} />}
      {after.length > 0  && <CheckGroup title="Once you arrive"  list={after}  />}
    </Section>
  )
}

// ── Community Intro Panel ─────────────────────────────────────────────────────
function CommunityIntro({ data }) {
  const [copied, setCopied] = useState(false)
  if (!data) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${data.subject}\n\n${data.body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Section icon={<MessageCircle className="w-4 h-4" />} title="Peer Intro Message" badge="AI-drafted" accentColor="rose">
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 mb-3">
        <div className="text-xs text-slate-500 mb-1">Subject</div>
        <div className="text-sm font-medium text-slate-200 mb-3">{data.subject}</div>
        <div className="text-xs text-slate-500 mb-1">Message</div>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{data.body}</p>
      </div>

      {data.timezoneNote && (
        <p className="text-xs text-slate-500 mb-3">🕐 {data.timezoneNote}</p>
      )}

      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied!' : 'Copy message'}
      </button>
    </Section>
  )
}

// ── Lived Experience Summary Panel ────────────────────────────────────────────
function LivedExperienceSummary({ data }) {
  if (!data) return null
  return (
    <Section icon={<Heart className="w-4 h-4" />} title="Student Reality Check" accentColor="teal">
      {data.headline && (
        <p className="text-base font-semibold text-slate-100 mb-3 leading-snug">{data.headline}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {data.positives?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-teal-400 mb-1.5">What students love</p>
            <ul className="space-y-1.5">
              {data.positives.map((p, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
                  <span className="text-teal-400 flex-shrink-0">✓</span> {p}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.watchouts?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-amber-400 mb-1.5">Watch out for</p>
            <ul className="space-y-1.5">
              {data.watchouts.map((w, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
                  <span className="text-amber-400 flex-shrink-0">△</span> {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {data.forThisStudent && (
        <div className="rounded-xl bg-violet-500/5 border border-violet-500/20 p-3">
          <p className="text-xs text-slate-400 mb-0.5 font-medium text-violet-300">For you specifically</p>
          <p className="text-xs text-slate-300 leading-relaxed">{data.forThisStudent}</p>
        </div>
      )}
    </Section>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AIInsights() {
  const navigate = useNavigate()
  const { profile } = useApp()
  const { analysis, loading, error, triggerAnalysis, clearAnalysis } = useAI()

  // Compute top city on mount
  useEffect(() => {
    if (!profile?.name) {
      log.warn('AI', 'AIInsights mounted but no profile name — skipping analysis trigger')
      return
    }
    log.info('AI', 'AIInsights mounted — computing scores for analysis trigger')
    const results = calculateMatchScores(profile, {})
    if (!results.length) {
      log.error('AI', 'AIInsights: calculateMatchScores returned empty — cannot trigger analysis')
      return
    }
    log.info('AI', `Top city for insights page: ${results[0].city.name} (${results[0].score}/100)`)
    triggerAnalysis({ profile, topCity: results[0].city, allResults: results })
  }, [profile])

  const handleRefresh = () => {
    log.info('AI', 'Manual refresh triggered — clearing and re-running analysis')
    clearAnalysis()
    const results = calculateMatchScores(profile, {})
    if (!results.length) {
      log.error('AI', 'handleRefresh: calculateMatchScores returned empty')
      return
    }
    triggerAnalysis({ profile, topCity: results[0].city, allResults: results })
  }

  if (!profile?.name) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-20">
        <p className="text-slate-400 mb-4">Complete your assessment first to unlock AI insights.</p>
        <button onClick={() => navigate('/assess')} className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors">
          Start Assessment →
        </button>
      </div>
    )
  }

  const topResult = calculateMatchScores(profile, {})[0]

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">AI Insights</h1>
            {loading && (
              <span className="text-xs text-violet-400 animate-pulse ml-2">Analysing your profile…</span>
            )}
          </div>
          <p className="text-sm text-slate-400">
            Personalised analysis for <span className="text-slate-200 font-medium">{profile.name}</span>
            {topResult && (
              <> · top match: <span className="text-violet-300 font-medium">{topResult.city.flag} {topResult.city.name}</span></>
            )}
          </p>
        </div>
        {analysis && !loading && (
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-600 rounded-lg px-3 py-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        )}
      </div>

      {/* Why this matches — always shown first, streams in */}
      {(loading || analysis?.whyThisMatches) && (
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm">Why {topResult?.city.name} matches you specifically</h3>
            {loading && <span className="ml-auto text-xs text-violet-500 animate-pulse">Generating…</span>}
          </div>
          {loading && !analysis?.whyThisMatches ? (
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>
          ) : (
            <p className="text-sm text-slate-300 leading-relaxed">
              {analysis?.whyThisMatches && <CitedText text={analysis.whyThisMatches} />}
            </p>
          )}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-300">Analysis failed</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">{error}</p>
          <button onClick={handleRefresh} className="text-xs text-violet-400 hover:text-violet-300 font-medium">
            Try again →
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && !analysis && <LoadingSkeleton />}

      {/* Full analysis panels */}
      {analysis && !loading && (
        <div className="space-y-5">
          <MatchTransparency data={analysis.matchingTransparency} />
          <VisaAssessment data={analysis.visaAssessment} />
          <BudgetBreakdown data={analysis.budgetBreakdown} />
          <AIChecklist items={analysis.relocationChecklist} />
          <CommunityIntro data={analysis.communityIntroMessage} />
          <LivedExperienceSummary data={analysis.livedExperienceSummary} />
          {analysis.dataValidation && (
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/30 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-slate-700/50 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-300 text-sm">Data transparency & freshness</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {analysis.dataValidation.likelyAccurate?.length > 0 && (
                  <div>
                    <p className="text-teal-400 font-medium mb-1.5">✓ Likely accurate</p>
                    <ul className="space-y-1 text-slate-400">
                      {analysis.dataValidation.likelyAccurate.map((d,i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}
                {analysis.dataValidation.mightBeStale?.length > 0 && (
                  <div>
                    <p className="text-amber-400 font-medium mb-1.5">⚠ May be stale</p>
                    <ul className="space-y-1 text-slate-400">
                      {analysis.dataValidation.mightBeStale.map((d,i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}
                {analysis.dataValidation.verifyBefore?.length > 0 && (
                  <div>
                    <p className="text-rose-400 font-medium mb-1.5">🔍 Verify before deciding</p>
                    <ul className="space-y-1 text-slate-400">
                      {analysis.dataValidation.verifyBefore.map((d,i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="flex gap-3 text-[10px] text-slate-600">
                  <span><span className="text-teal-500">[city_data]</span> = from our dataset</span>
                  <span><span className="text-violet-500">[general_knowledge]</span> = AI training knowledge</span>
                  <span><span className="text-amber-500">[profile_inference]</span> = from your answers</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer note */}
      {analysis && (
        <p className="text-xs text-slate-600 text-center leading-relaxed pt-2">
          AI analysis is indicative only. Visa decisions rest with immigration authorities. Always verify requirements via official channels.
        </p>
      )}
    </div>
  )
}
