import { useState } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, ExternalLink, AlertTriangle, Clock, FileText } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { RELOCATION_DATA } from '../data/relocationData.js'

const CITY_LABELS = { boston: 'Boston, USA', paris: 'Paris, France', netherlands: 'Netherlands' }
const CITY_FLAGS  = { boston: '🇺🇸', paris: '🇫🇷', netherlands: '🇳🇱' }

const URGENCY_STYLES = {
  critical: 'border-red-500/40 bg-red-500/5',
  high:     'border-amber-500/40 bg-amber-500/5',
  medium:   'border-slate-700 bg-slate-800/40',
}
const URGENCY_BADGE = {
  critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
  high:     'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  medium:   'bg-slate-700 text-slate-400',
}

function ChecklistItem({ item, done, onToggle }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-xl border transition-all duration-200 ${URGENCY_STYLES[item.urgency]} ${done ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-violet-400 transition-colors"
        >
          {done
            ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            : <Circle className="w-5 h-5" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 mb-1">
            <p className={`text-sm font-medium leading-snug ${done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
              {item.title}
            </p>
            <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${URGENCY_BADGE[item.urgency]}`}>
              {item.urgency}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            {item.deadline && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.deadline}
              </span>
            )}
            {item.category && (
              <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">
                {item.category}
              </span>
            )}
          </div>

          {/* Expandable detail */}
          {(item.detail || item.docs?.length > 0) && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-2 flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Less detail' : 'Show detail & documents'}
            </button>
          )}

          {expanded && (
            <div className="mt-3 space-y-3 animate-fade-in">
              {item.detail && (
                <p className="text-xs text-slate-400 leading-relaxed">{item.detail}</p>
              )}
              {item.docs?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Documents needed:
                  </p>
                  <ul className="space-y-1">
                    {item.docs.map((doc, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <span className="text-violet-400 mt-0.5">•</span>
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PhaseSection({ title, icon, items, cityId, progress, onToggle }) {
  const { done, total, pct } = progress

  return (
    <div className="flex-1 min-w-0">
      {/* Phase header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-500">{done}/{total} completed</p>
        </div>
        <div className="ml-auto text-right">
          <span className={`text-lg font-bold ${pct === 100 ? 'text-emerald-400' : pct > 50 ? 'text-amber-400' : 'text-slate-400'}`}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-800 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct === 100
              ? 'rgb(52, 211, 153)'
              : 'linear-gradient(90deg, #7c3aed, #6ee7b7)'
          }}
        />
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map(item => (
          <ChecklistItem
            key={item.id}
            item={item}
            done={!!progress.checklist?.[item.id]}
            onToggle={() => onToggle(cityId, item.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default function RelocationGuide() {
  const { selectedCityId, setSelectedCityId, checklistProgress, toggleChecklistItem, getChecklistCount } = useApp()

  const cityData = RELOCATION_DATA[selectedCityId]
  if (!cityData) return null

  const allItems = [...cityData.before, ...cityData.after]
  const overallProgress = getChecklistCount(selectedCityId, allItems)
  const beforeProgress = getChecklistCount(selectedCityId, cityData.before)
  const afterProgress  = getChecklistCount(selectedCityId, cityData.after)

  // Pass raw checklist for done lookup inside PhaseSection
  const cityChecklist = checklistProgress[selectedCityId] || {}

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Relocation Guide</h1>
        <p className="text-slate-400 text-sm mt-1">Your personalised pre- and post-arrival roadmap</p>
      </div>

      {/* City selector */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CITY_LABELS).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSelectedCityId(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              selectedCityId === id
                ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <span>{CITY_FLAGS[id]}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Visa overview card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="text-3xl">{CITY_FLAGS[selectedCityId]}</div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-slate-100">{cityData.visaType}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {cityData.visaRequired}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Processing: {cityData.processingTime}
            </p>
          </div>
          <a
            href={cityData.officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Official guidance <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Overall progress */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Overall progress</span>
            <span className="text-xs font-semibold text-slate-300">
              {overallProgress.done}/{overallProgress.total} tasks complete
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 progress-bar"
              style={{ width: `${overallProgress.pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tip banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/80">
          Immigration rules change frequently. Always verify requirements at the official links above before submitting documents. The timelines shown are typical — your consulate may differ.
        </p>
      </div>

      {/* Two-phase layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        <PhaseSection
          title="Before You Leave"
          icon="✈️"
          items={cityData.before}
          cityId={selectedCityId}
          progress={{ ...beforeProgress, checklist: cityChecklist }}
          onToggle={toggleChecklistItem}
        />
        <PhaseSection
          title="Once You Arrive"
          icon="🏠"
          items={cityData.after}
          cityId={selectedCityId}
          progress={{ ...afterProgress, checklist: cityChecklist }}
          onToggle={toggleChecklistItem}
        />
      </div>
    </div>
  )
}
