import { useState, useMemo } from 'react'
import { Search, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { HOME_CITIES, DESTINATION_COSTS, COST_CATEGORIES } from '../data/costComparisonData.js'

const CITY_FLAGS  = { boston: '🇺🇸', paris: '🇫🇷', netherlands: '🇳🇱' }
const CITY_LABELS = { boston: 'Boston, USA', paris: 'Paris, France', netherlands: 'Netherlands' }

function DeltaBadge({ pct }) {
  if (Math.abs(pct) < 5) return (
    <span className="flex items-center gap-1 text-xs text-slate-400">
      <Minus className="w-3 h-3" /> Similar
    </span>
  )
  if (pct > 0) return (
    <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
      <TrendingUp className="w-3 h-3" /> +{pct}%
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
      <TrendingDown className="w-3 h-3" /> {pct}%
    </span>
  )
}

function ComparisonRow({ label, icon, homeVal, destVal, desc }) {
  const delta = homeVal > 0 ? Math.round(((destVal - homeVal) / homeVal) * 100) : 0
  const isHigher = destVal > homeVal * 1.05
  const isLower  = destVal < homeVal * 0.95

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <div>
          <p className="text-sm font-medium text-slate-200">{label}</p>
          {desc && <p className="text-xs text-slate-500">{desc}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 items-end">
        {/* Home */}
        <div>
          <p className="text-xs text-slate-500 mb-1">Home city</p>
          <p className="text-xl font-bold text-slate-300">${homeVal.toLocaleString()}</p>
          <p className="text-xs text-slate-500">/ mo</p>
        </div>

        {/* Delta arrow */}
        <div className="text-center">
          <DeltaBadge pct={delta} />
          <div className="relative mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 h-full rounded-full transition-all ${
                isHigher ? 'bg-red-500 right-0' : isLower ? 'bg-emerald-500 left-0' : 'bg-slate-500 left-0'
              }`}
              style={{ width: `${Math.min(Math.abs(delta) * 0.8, 100)}%` }}
            />
          </div>
        </div>

        {/* Destination */}
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Destination</p>
          <p className={`text-xl font-bold ${isHigher ? 'text-red-400' : isLower ? 'text-emerald-400' : 'text-slate-300'}`}>
            ${destVal.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">/ mo</p>
        </div>
      </div>
    </div>
  )
}

export default function BudgetMatcher() {
  const { selectedCityId, setSelectedCityId } = useApp()
  const [search, setSearch] = useState('')
  const [homeCity, setHomeCity] = useState(null)
  const [regionFilter, setRegionFilter] = useState('All')

  const destData = DESTINATION_COSTS[selectedCityId]

  const regions = useMemo(() => {
    const r = ['All', ...new Set(HOME_CITIES.map(c => c.region))]
    return r
  }, [])

  const filtered = useMemo(() => {
    return HOME_CITIES.filter(c => {
      const matchSearch = c.label.toLowerCase().includes(search.toLowerCase())
      const matchRegion = regionFilter === 'All' || c.region === regionFilter
      return matchSearch && matchRegion
    })
  }, [search, regionFilter])

  // Total monthly delta
  const totalDelta = homeCity
    ? Math.round(((destData.total_shared - homeCity.total) / homeCity.total) * 100)
    : null

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Budget Matcher</h1>
        <p className="text-slate-400 text-sm mt-1">Side-by-side cost-of-living comparison: your home city vs destination</p>
      </div>

      {/* Destination selector */}
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

      <div className="grid lg:grid-cols-5 gap-6">
        {/* ── Home city selector ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-sm font-bold text-slate-200 mb-3">Select Your Home City</h2>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search city..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {/* Region filter */}
            <div className="flex flex-wrap gap-1 mb-3">
              {regions.map(r => (
                <button
                  key={r}
                  onClick={() => setRegionFilter(r)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                    regionFilter === r
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* City list */}
            <div className="space-y-1 max-h-72 overflow-y-auto scrollbar-thin">
              {filtered.map(city => (
                <button
                  key={city.id}
                  onClick={() => setHomeCity(city)}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                    homeCity?.id === city.id
                      ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base">{city.flag}</span>
                  <span className="flex-1 truncate">{city.label}</span>
                  <span className="text-xs text-slate-500">${city.total.toLocaleString()}/mo</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">No cities match your search</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Comparison panel ───────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          {!homeCity ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 flex flex-col items-center justify-center gap-3 text-center h-full min-h-[300px]">
              <span className="text-4xl">🌍</span>
              <p className="text-slate-400 text-sm">Select a home city to see cost comparison</p>
            </div>
          ) : (
            <>
              {/* Summary banner */}
              <div className={`rounded-2xl border p-5 ${
                totalDelta > 30 ? 'border-red-500/30 bg-red-500/5'
                : totalDelta < -20 ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-slate-800 bg-slate-900'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Comparing</p>
                    <h3 className="text-base font-bold text-slate-200">
                      {homeCity.flag} {homeCity.label} → {CITY_FLAGS[selectedCityId]} {destData.label}
                    </h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-500 mb-0.5">Total monthly change</p>
                    <p className={`text-2xl font-bold ${
                      totalDelta > 20 ? 'text-red-400' : totalDelta < -10 ? 'text-emerald-400' : 'text-slate-300'
                    }`}>
                      {totalDelta > 0 ? '+' : ''}{totalDelta}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="rounded-xl bg-slate-800/60 p-3">
                    <p className="text-xs text-slate-500 mb-0.5">Home total (est.)</p>
                    <p className="text-lg font-bold text-slate-300">${homeCity.total.toLocaleString()}<span className="text-xs font-normal text-slate-500">/mo</span></p>
                  </div>
                  <div className="rounded-xl bg-slate-800/60 p-3">
                    <p className="text-xs text-slate-500 mb-0.5">Destination (shared)</p>
                    <p className={`text-lg font-bold ${totalDelta > 20 ? 'text-red-400' : totalDelta < -10 ? 'text-emerald-400' : 'text-slate-300'}`}>
                      ${destData.total_shared.toLocaleString()}<span className="text-xs font-normal text-slate-500">/mo</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Category breakdown */}
              <div className="space-y-3">
                {COST_CATEGORIES.map(cat => (
                  <ComparisonRow
                    key={cat.id}
                    label={cat.label}
                    icon={cat.icon}
                    desc={cat.description}
                    homeVal={homeCity[cat.id] || 0}
                    destVal={destData[cat.id] || 0}
                  />
                ))}
              </div>

              {/* Destination notes */}
              {destData.notes && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-200/80">{destData.notes}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
