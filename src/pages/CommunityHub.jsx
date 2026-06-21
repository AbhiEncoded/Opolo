import { useState, useMemo } from 'react'
import { Search, MessageCircle, Globe, Clock, BadgeCheck, Filter } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { PEER_PROFILES, NATIONALITY_GROUPS } from '../data/communityData.js'

const CITY_FLAGS  = { boston: '🇺🇸', paris: '🇫🇷', netherlands: '🇳🇱' }
const CITY_LABELS = { boston: 'Boston', paris: 'Paris', netherlands: 'Netherlands' }

function getLocalTime(offsetHours) {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const local = new Date(utc + offsetHours * 3600000)
  return local.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
}

function ProfileCard({ peer }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-700 transition-all hover:-translate-y-0.5 flex flex-col gap-4 card-hover">
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-full ${peer.avatarColor} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
          {peer.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm font-bold text-slate-200 truncate">{peer.name}</h3>
            {peer.verified && (
              <BadgeCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" title="Verified profile" />
            )}
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <span>{peer.flag}</span> {peer.nationality}
          </p>
        </div>

        {/* Status badge */}
        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${
          peer.status === 'living'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        }`}>
          {peer.status === 'living' ? '✓ Living there' : '⏳ Planning'}
        </span>
      </div>

      {/* University & program */}
      <div className="flex items-start gap-2">
        <Globe className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-slate-300">{peer.university}</p>
          <p className="text-xs text-slate-500">{peer.program} · {peer.year}</p>
        </div>
      </div>

      {/* City */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="text-base">{CITY_FLAGS[peer.city]}</span>
        <span>{CITY_LABELS[peer.city]}</span>
      </div>

      {/* Languages */}
      <div className="flex flex-wrap gap-1">
        {peer.languages.map(lang => (
          <span key={lang} className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full">
            {lang}
          </span>
        ))}
      </div>

      {/* Quote */}
      <p className="text-xs text-slate-400 italic leading-relaxed border-l-2 border-violet-500/40 pl-3">
        "{peer.quote}"
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800 gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{getLocalTime(peer.timezoneOffset)} local</span>
        </div>
        <a
          href={`mailto:?subject=Connecting via opolo — ${peer.name}`}
          className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Connect
        </a>
      </div>
    </div>
  )
}

export default function CommunityHub() {
  const { selectedCityId, setSelectedCityId } = useApp()

  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('all')   // 'all' | 'living' | 'planning'
  const [cityFilter, setCityFilter]   = useState(selectedCityId)
  const [natFilter, setNatFilter]     = useState('All')

  // Sync city filter with global city when user changes it
  const handleCityChange = (id) => {
    setSelectedCityId(id)
    setCityFilter(id)
  }

  const filtered = useMemo(() => {
    return PEER_PROFILES.filter(p => {
      const matchSearch  = p.name.toLowerCase().includes(search.toLowerCase())
                        || p.nationality.toLowerCase().includes(search.toLowerCase())
                        || p.university.toLowerCase().includes(search.toLowerCase())
                        || p.program.toLowerCase().includes(search.toLowerCase())
      const matchStatus  = statusFilter === 'all' || p.status === statusFilter
      const matchCity    = cityFilter === 'all' || p.city === cityFilter
      const matchNat     = natFilter === 'All' || p.nationality === natFilter
      return matchSearch && matchStatus && matchCity && matchNat
    })
  }, [search, statusFilter, cityFilter, natFilter])

  const livingCount  = PEER_PROFILES.filter(p => p.status === 'living').length
  const planningCount = PEER_PROFILES.filter(p => p.status === 'planning').length

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Community Hub</h1>
        <p className="text-slate-400 text-sm mt-1">
          Connect with peers who are planning to go or already living in your destination city
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total peers', value: PEER_PROFILES.length, icon: '👥' },
          { label: 'Living there', value: livingCount, icon: '✅' },
          { label: 'Planning', value: planningCount, icon: '🗺️' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold text-slate-200">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Filter className="w-3.5 h-3.5" /> Filters
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Name, university, country..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* City */}
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="all">All cities</option>
            {Object.entries(CITY_LABELS).map(([id, label]) => (
              <option key={id} value={id}>{CITY_FLAGS[id]} {label}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="all">All statuses</option>
            <option value="living">Living there</option>
            <option value="planning">Planning</option>
          </select>

          {/* Nationality */}
          <select
            value={natFilter}
            onChange={e => setNatFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="All">All nationalities</option>
            {NATIONALITY_GROUPS.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2">
        <p className="text-sm text-slate-400">
          Showing <span className="text-slate-200 font-semibold">{filtered.length}</span> peers
        </p>
        {(search || statusFilter !== 'all' || cityFilter !== selectedCityId || natFilter !== 'All') && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('all'); setCityFilter(selectedCityId); setNatFilter('All') }}
            className="text-xs text-violet-400 hover:text-violet-300 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(peer => (
            <ProfileCard key={peer.id} peer={peer} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center">
          <p className="text-2xl mb-3">🔍</p>
          <p className="text-slate-400 text-sm">No peers match your filters</p>
          <button
            onClick={() => { setSearch(''); setStatusFilter('all'); setNatFilter('All') }}
            className="mt-3 text-xs text-violet-400 hover:text-violet-300 underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
