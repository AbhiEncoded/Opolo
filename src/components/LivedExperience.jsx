import { Shield, AlertCircle } from 'lucide-react'

export default function LivedExperience({ experiences }) {
  const items = Array.isArray(experiences) ? experiences : []
  if (items.length === 0) {
    return (
      <div className="text-sm text-slate-500 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        No student experience data available for this city yet.
      </div>
    )
  }
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-slate-200">What students actually say</h3>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
          Forum / vlog / Reddit transcripts
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
        Official statistics often differ from lived reality. These quotes are sourced from student vlogs, Reddit threads, and forum posts —
        not the university marketing office. Bias notes are included where relevant.
      </p>

      <div className="space-y-4">
        {items.map((exp, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full ${exp.avatarColor || 'bg-violet-600'} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5`}>
                {exp.avatar}
              </div>

              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="font-medium text-sm text-slate-200">{exp.name}</span>
                    <span className="text-slate-500 text-xs ml-2">from {exp.from}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {exp.verified ? (
                      <span className="flex items-center gap-1 text-xs text-teal-400">
                        <Shield className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <AlertCircle className="w-3 h-3" />
                        Unverified
                      </span>
                    )}
                  </div>
                </div>

                {/* Program */}
                <div className="text-xs text-slate-500 mb-3">{exp.program}</div>

                {/* Quote */}
                <blockquote className="text-sm text-slate-300 leading-relaxed border-l-2 border-violet-500/40 pl-3 italic">
                  "{exp.quote}"
                </blockquote>

                {/* Source + bias */}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="text-xs text-slate-600">Source: {exp.source}</span>
                  {exp.bias && (
                    <span className="text-xs text-amber-600">
                      ⚠ Bias note: {exp.bias}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
