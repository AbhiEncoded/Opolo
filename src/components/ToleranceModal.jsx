import { useState } from 'react'
import { X } from 'lucide-react'

export default function ToleranceModal({ prompt, onSubmit, onDismiss }) {
  const [value, setValue] = useState(5)

  if (!prompt) return null

  const toleranceLabels = {
    1: 'Complete deal-breaker',
    2: 'Strongly against',
    3: 'Would be a problem',
    4: 'Somewhat concerned',
    5: 'Neutral',
    6: 'Could manage',
    7: 'Would tolerate',
    8: 'Mostly fine',
    9: 'Happy to accept',
    10: 'Completely fine',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onDismiss} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-xs font-medium text-violet-400 uppercase tracking-wider mb-1">Trade-off detected</div>
            <h3 className="text-xl font-bold text-slate-100">We need your input</h3>
          </div>
          <button onClick={onDismiss} className="text-slate-500 hover:text-slate-300 transition-colors ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dimension badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
          <span className="text-amber-400 text-sm font-medium capitalize">{prompt.label}</span>
          <span className="text-amber-300 text-xs">· {prompt.cityScore}/100</span>
        </div>

        {/* Prompt */}
        <p className="text-slate-300 text-sm leading-relaxed mb-6">{prompt.prompt}</p>

        {/* Tolerance slider */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-500">How much would you tolerate this?</span>
            <span className="text-sm font-bold text-violet-400">{value}/10</span>
          </div>
          <input
            type="range" min="1" max="10" step="1"
            value={value}
            onChange={e => setValue(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>Deal-breaker</span>
            <span>Completely fine</span>
          </div>
          <div className="mt-3 text-center">
            <span className={`text-sm font-medium ${value <= 3 ? 'text-red-400' : value <= 6 ? 'text-amber-400' : 'text-teal-400'}`}>
              {toleranceLabels[value]}
            </span>
          </div>
        </div>

        {/* Context box */}
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-3 mb-5 text-xs text-slate-400 leading-relaxed">
          <span className="text-violet-400 font-medium">How this affects your results: </span>
          {value <= 4
            ? 'Low tolerance means this dimension stays highly weighted — cities with this weakness will be penalised.'
            : value <= 7
            ? 'Moderate tolerance means the algorithm slightly reduces the weight of this concern.'
            : 'High tolerance means we\'ll reduce the penalty for this weakness — the city can still rank well overall.'}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors text-sm"
          >
            Skip
          </button>
          <button
            onClick={() => onSubmit(prompt.dimension, value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm transition-all"
          >
            Re-rank with my tolerance →
          </button>
        </div>
      </div>
    </div>
  )
}
