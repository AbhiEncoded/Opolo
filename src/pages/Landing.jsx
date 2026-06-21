import { useNavigate } from 'react-router-dom'
import { ArrowRight, Globe, Zap, Shield, Star } from 'lucide-react'

const SHOW_TELL = [
  {
    icon: '🏫',
    title: '"Large school" actually means…',
    items: [
      { city: 'Boston (Northeastern)', stat: '11,000+ events/yr', reality: 'A Nobel laureate talks every week. You\'ll never see the same face twice in a semester. Scale = resources, but anonymity is real — you must self-initiate.' },
      { city: 'Netherlands (TU Delft)', stat: '27,000 students, 32% intl', reality: 'Delft is a small city — you\'ll see the same faces regularly. Community builds faster, but you\'ll want Amsterdam weekends for variety.' },
      { city: 'Paris (Sciences Po)', stat: '14,000 across 7 campuses', reality: 'No single campus — the city IS the campus. Your lecture hall shares a street with a Michelin-starred restaurant. Complete freedom, zero hand-holding.' },
    ],
  },
  {
    icon: '💰',
    title: '"Affordable city" actually means…',
    items: [
      { city: 'Delft, Netherlands', stat: 'Shared room: ~€720/mo', reality: 'That\'s 0.7 hrs of Dutch minimum wage per euro spent. One month\'s part-time income covers your rent.' },
      { city: 'Paris, France', stat: 'CROUS housing: €400–600/mo', reality: 'Free doctor visits. €86 for unlimited metro. €8 Louvre entry under 26. The city subsidises your existence as a student.' },
      { city: 'Boston, USA', stat: 'Shared room: ~$1,200/mo', reality: 'Your Netflix subscription costs 1.5 hours of the min-wage job you\'re legally not allowed to work more than 20hrs/wk at.' },
    ],
  },
  {
    icon: '🛡️',
    title: '"Safe city" actually means…',
    items: [
      { city: 'Netherlands', stat: 'Safety score: 92/100', reality: 'Cycling home at midnight in Delft is normal. The most common "crime" is someone stealing your bike if you use only one lock.' },
      { city: 'Paris', stat: 'Safety score: 72/100', reality: 'Perfectly safe in student areas. The one real threat is pickpockets on Metro Line 1 near tourist spots. Keep your bag in front.' },
      { city: 'Boston', stat: 'Safety score: 64/100', reality: 'Cambridge and Back Bay are as safe as anywhere. Roxbury and parts of Dorchester after 10pm are a different matter. Neighbourhood knowledge is essential.' },
    ],
  },
]

const CITIES_PREVIEW = [
  { flag: '🇺🇸', name: 'Boston', country: 'USA', tagline: 'Career launchpad', color: 'from-blue-500/10 to-indigo-500/10', border: 'border-blue-500/20', scores: { career: 88, cost: 35, safety: 64 } },
  { flag: '🇫🇷', name: 'Paris', country: 'France', tagline: 'Cultural immersion', color: 'from-teal-500/10 to-cyan-500/10', border: 'border-teal-500/20', scores: { career: 70, cost: 54, safety: 72 } },
  { flag: '🇳🇱', name: 'Netherlands', country: 'Netherlands', tagline: 'Engineering paradise', color: 'from-violet-500/10 to-purple-500/10', border: 'border-violet-500/20', scores: { career: 92, cost: 58, safety: 92 } },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-xl tracking-tight">
            <span className="text-gradient">op</span>
            <span className="text-slate-300">olo</span>
          </span>
          <button
            onClick={() => navigate('/assess')}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Get started →
          </button>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-8">
          <Star className="w-3 h-3" />
          Depth over breadth — powered by real student data
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-none">
          <span className="text-slate-100">Where should</span>
          <br />
          <span className="text-gradient">you study abroad?</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Not a pros/cons list. A deep AI-powered analysis of your exact priorities —
          career pathways, safety nuances, cultural fit, hidden costs — across
          Boston, Paris, and the Netherlands.
        </p>

        <p className="text-sm text-slate-500">5-minute assessment · no sign-up required · personalised results</p>

        {/* City preview cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          {CITIES_PREVIEW.map(c => (
            <div key={c.name} className={`rounded-2xl bg-gradient-to-br ${c.color} border ${c.border} p-6 text-left`}>
              <div className="text-3xl mb-3">{c.flag}</div>
              <div className="font-semibold text-lg text-slate-100">{c.name}</div>
              <div className="text-sm text-slate-400 mb-4">{c.tagline}</div>
              <div className="space-y-2">
                {[['Career', c.scores.career], ['Affordability', c.scores.cost], ['Safety', c.scores.safety]].map(([label, val]) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-24">{label}</span>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full progress-bar" style={{ width: `${val}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-6 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Show Don't Tell ──────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-slate-800/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Show, don't tell
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Statistics mean nothing without context. Here's what common phrases actually mean in student life.
            </p>
          </div>

          <div className="space-y-12">
            {SHOW_TELL.map((section, i) => (
              <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <h3 className="font-semibold text-lg text-slate-100">{section.title}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                  {section.items.map((item, j) => (
                    <div key={j} className="p-6">
                      <div className="font-medium text-slate-200 text-sm mb-1">{item.city}</div>
                      <div className="text-2xl font-bold text-gradient mb-3">{item.stat}</div>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.reality}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-slate-800/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What makes this different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Zap className="w-5 h-5" />, title: 'AI trade-off analysis', desc: 'If your top city has a flaw you care about, we ask how much you\'d tolerate it — then re-rank.' },
              { icon: <Globe className="w-5 h-5" />, title: 'Lived experience data', desc: 'Real student vlog transcripts and forum posts surface what official stats hide.' },
              { icon: <Shield className="w-5 h-5" />, title: 'Nuanced safety', desc: 'Not a single crime-rate number. Neighbourhood-level breakdowns with student-reported insights.' },
              { icon: <Star className="w-5 h-5" />, title: 'Cost forecasting', desc: 'Predictive rent trends for when you actually arrive — 6 to 12 months out.' },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400 mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-slate-800/40">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to find your city?</h2>
          <p className="text-slate-400 mb-8">5 minutes. No fluff. Real insights.</p>
          <button
            onClick={() => navigate('/assess')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl font-semibold text-white text-lg transition-all hover:scale-105"
          >
            Start your assessment
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 px-6 text-center text-sm text-slate-600">
        opolo — Data sources: Numbeo, Kamernet, SpareRoom, Studapart, HousingAnywhere, student forums & vlog transcripts
      </footer>
    </div>
  )
}
