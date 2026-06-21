import { useState } from 'react'
import { MessageCircle, Clock, Star, Globe, Sparkles, Copy, Check, Loader2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { generateCommunityIntro } from '../lib/aiService.js'
import { log } from '../lib/logger.js'

function getLocalTimeInZone(timezoneOffset) {
  const now = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
  const cityOffset = timezoneOffset === 'CET (UTC+1)' ? 1 : timezoneOffset === 'EST (UTC-5)' ? -5 : 0
  const cityTime = new Date(utcMs + cityOffset * 3600000)
  return cityTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
}

function getTimeDiff(timezoneOffset) {
  const userOffset = -(new Date().getTimezoneOffset() / 60)
  const cityOffset = timezoneOffset === 'CET (UTC+1)' ? 1 : timezoneOffset === 'EST (UTC-5)' ? -5 : 0
  const diff = cityOffset - userOffset
  if (diff === 0) return 'Same timezone as you'
  return `${diff > 0 ? '+' : ''}${diff} hrs from you`
}

export default function PeerConnect({ ambassador }) {
  const { profile } = useApp()
  const [introState, setIntroState] = useState(null) // null | 'loading' | { subject, body }
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  // Defensive guard: if no ambassador data, render a fallback instead of crashing
  if (!ambassador) {
    return (
      <div className="text-sm text-slate-500 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        No peer ambassador available for this city yet.
      </div>
    )
  }

  const localTime = getLocalTimeInZone(ambassador.timezone)
  const timeDiff  = getTimeDiff(ambassador.timezone)
  const languages = Array.isArray(ambassador.languages) ? ambassador.languages : []

  const handleGenerateIntro = async () => {
    if (!profile?.name) {
      log.warn('Community', 'handleGenerateIntro called but no profile name — aborting')
      return
    }
    log.info('Community', `Generating intro for ${profile.name} → ${ambassador.name}`)
    setIntroState('loading')
    setError(null)
    try {
      const cityName = ambassador.university?.split(' ').slice(-2).join(' ') || 'your city'
      const result = await generateCommunityIntro({
        userProfile: profile,
        peerProfile: ambassador,
        cityName,
      })
      log.ok('Community', 'Intro generated', { subject: result.subject })
      setIntroState(result)
    } catch (e) {
      log.error('Community', 'handleGenerateIntro failed', e)
      setError('Could not generate intro. Check your API key.')
      setIntroState(null)
    }
  }

  const handleCopy = () => {
    if (!introState || introState === 'loading') return
    navigator.clipboard.writeText(`Subject: ${introState.subject}\n\n${introState.body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <h3 className="font-semibold text-slate-200 mb-4">Talk to a student who lives there</h3>

      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full ${ambassador.avatarColor || 'bg-violet-600'} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
          {ambassador.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-100">{ambassador.name}</span>
            <span className="text-slate-500 text-sm">· from {ambassador.from}</span>
            <div className="flex items-center gap-1 ml-auto">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-sm text-amber-400 font-medium">{ambassador.rating}</span>
            </div>
          </div>
          <div className="text-sm text-slate-400 mt-0.5">{ambassador.program}</div>
          <div className="text-sm text-slate-500">{ambassador.university}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-lg text-xs text-slate-400">
          <Clock className="w-3 h-3 text-teal-400" />
          <span>Local time: <span className="text-slate-200 font-medium">{localTime}</span></span>
          <span className="text-slate-600">·</span>
          <span className="text-teal-400">{timeDiff}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-lg text-xs text-slate-400">
          <Globe className="w-3 h-3 text-violet-400" />
          {languages.join(' · ')}
        </div>
      </div>

      <p className="text-sm text-slate-400 leading-relaxed mt-3">{ambassador.bio}</p>

      <div className="flex items-center gap-1.5 mt-3 mb-4">
        <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        <span className="text-xs text-slate-500">{ambassador.responseTime}</span>
      </div>

      {/* AI Intro Generator */}
      {!introState && introState !== 'loading' && (
        <button
          onClick={handleGenerateIntro}
          disabled={!profile?.name}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4" />
          Generate personalised intro message
        </button>
      )}

      {introState === 'loading' && (
        <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Crafting your message…
        </div>
      )}

      {introState && introState !== 'loading' && (
        <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-400">Subject: <span className="text-slate-200">{introState.subject}</span></span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{introState.body}</p>
          <button
            onClick={handleGenerateIntro}
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
          >
            Regenerate →
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}
