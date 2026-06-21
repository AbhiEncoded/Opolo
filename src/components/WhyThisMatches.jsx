// WhyThisMatches — Shows AI-generated or rule-based explanation for a city match
// Displays source citation tags with hover tooltips when AI analysis is available

import { useEffect, useState } from 'react'
import { Sparkles, Zap } from 'lucide-react'
import { useAI } from '../context/AIContext.jsx'

// Renders text with [source_tag] citations as styled, hoverable badges
function CitedText({ text }) {
  if (!text) return null
  const parts = text.split(/(\[[a-z_]+\])/g)
  const sourceConfig = {
    city_data:        { label: 'our data', color: 'bg-teal-500/20 text-teal-400', title: 'From our verified city dataset' },
    general_knowledge:{ label: 'AI knowledge', color: 'bg-violet-500/20 text-violet-400', title: 'From AI training — verify independently' },
    profile_inference:{ label: 'your answers', color: 'bg-amber-500/20 text-amber-400', title: 'Inferred from your quiz responses' },
  }
  return (
    <>
      {parts.map((part, i) => {
        const key = part.replace(/[\[\]]/g, '')
        const cfg = sourceConfig[key]
        if (cfg) {
          return (
            <span
              key={i}
              title={cfg.title}
              className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded mx-0.5 cursor-help ${cfg.color}`}
            >
              {cfg.label}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

// Streams text character by character for the fallback rule-based explanation
function StreamText({ text }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    if (!text) return
    let i = 0
    const iv = setInterval(() => {
      i += 3
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { setDisplayed(text); setDone(true); clearInterval(iv) }
    }, 12)
    return () => clearInterval(iv)
  }, [text])
  return (
    <>
      {displayed}
      {!done && <span className="inline-block w-0.5 h-4 bg-violet-400 animate-pulse ml-0.5 align-middle" />}
    </>
  )
}

export default function WhyThisMatches({ explanation, cityName }) {
  const { analysis, loading } = useAI()
  const aiText   = analysis?.whyThisMatches
  const isAI     = !!aiText

  return (
    <div className="rounded-xl bg-violet-500/5 border border-violet-500/20 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <span className="text-sm font-semibold text-slate-200">
            Why {cityName} matches you
          </span>
        </div>
        {isAI ? (
          <span className="flex items-center gap-1 text-[10px] text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
            <Zap className="w-2.5 h-2.5" /> AI
          </span>
        ) : loading ? (
          <span className="text-[10px] text-violet-400 animate-pulse">AI thinking…</span>
        ) : (
          <span className="text-[10px] text-slate-600">algorithm</span>
        )}
      </div>

      {/* Body */}
      <p className="text-sm text-slate-300 leading-relaxed">
        {isAI ? <CitedText text={aiText} /> : <StreamText text={explanation || ''} />}
      </p>

      {/* Source legend — only shows when AI is active */}
      {isAI && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 pt-3 border-t border-violet-500/10">
          <span className="text-[9px] text-slate-600">Sources:</span>
          {[
            { k: 'city_data', label: 'our data', c: 'text-teal-500' },
            { k: 'general_knowledge', label: 'AI knowledge (verify)', c: 'text-violet-500' },
            { k: 'profile_inference', label: 'your answers', c: 'text-amber-500' },
          ].map(s => (
            <span key={s.k} className={`text-[9px] ${s.c} font-medium`}>{s.label}</span>
          ))}
        </div>
      )}
    </div>
  )
}
