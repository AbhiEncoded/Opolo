// ─────────────────────────────────────────────────────────────────────────────
// opolo Logger — verbose, structured, colour-coded console tracing
//
// Usage:
//   import { log } from './logger.js'
//   log.info('AI', 'Starting analysis', { profile, city })
//   log.error('Matching', 'Score calculation failed', err)
//   const done = log.time('Gemini')   // returns a function; call done() to print elapsed ms
//
// All output goes to console. Nothing is sent anywhere externally.
// To silence in production: set VITE_LOG=off in your .env.
// ─────────────────────────────────────────────────────────────────────────────

const ENABLED = import.meta.env.VITE_LOG !== 'off'

// Namespace colours (CSS for Chrome DevTools styled console)
const NS_STYLES = {
  'Matching':   'background:#4c1d95;color:#ddd6fe;padding:2px 6px;border-radius:4px;font-weight:bold',
  'AI':         'background:#0f4c75;color:#bfdbfe;padding:2px 6px;border-radius:4px;font-weight:bold',
  'Gemini':     'background:#064e3b;color:#6ee7b7;padding:2px 6px;border-radius:4px;font-weight:bold',
  'Profile':    'background:#78350f;color:#fde68a;padding:2px 6px;border-radius:4px;font-weight:bold',
  'Router':     'background:#1e3a5f;color:#93c5fd;padding:2px 6px;border-radius:4px;font-weight:bold',
  'Storage':    'background:#134e4a;color:#5eead4;padding:2px 6px;border-radius:4px;font-weight:bold',
  'FollowUp':   'background:#4a044e;color:#e879f9;padding:2px 6px;border-radius:4px;font-weight:bold',
  'Visa':       'background:#1c1917;color:#a78bfa;padding:2px 6px;border-radius:4px;font-weight:bold',
  'Community':  'background:#0c4a6e;color:#38bdf8;padding:2px 6px;border-radius:4px;font-weight:bold',
  'Budget':     'background:#14532d;color:#86efac;padding:2px 6px;border-radius:4px;font-weight:bold',
}

const LEVEL_STYLES = {
  info:  'color:#94a3b8',
  warn:  'color:#fbbf24;font-weight:bold',
  error: 'color:#f87171;font-weight:bold',
  debug: 'color:#64748b',
  ok:    'color:#34d399;font-weight:bold',
}

function nsStyle(ns) {
  return NS_STYLES[ns] || 'background:#374151;color:#e5e7eb;padding:2px 6px;border-radius:4px;font-weight:bold'
}

function stamp() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}.${String(now.getMilliseconds()).padStart(3,'0')}`
}

function write(level, ns, message, data) {
  if (!ENABLED) return
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.info
  const prefix = `%c ${ns} %c ${stamp()} `
  const args = [prefix, nsStyle(ns), `color:#475569;font-size:10px`, message]

  if (data !== undefined) {
    if (level === 'error') {
      console.groupCollapsed(...args)
      if (data instanceof Error) {
        console.error(data)
        if (data.stack) console.debug('Stack:', data.stack)
      } else {
        console.error(data)
      }
      console.groupEnd()
    } else if (typeof data === 'object' && data !== null) {
      console.groupCollapsed(...args)
      console.log(data)
      console.groupEnd()
    } else {
      console.log(...args, `—`, data)
    }
  } else {
    if (level === 'error') console.error(...args)
    else if (level === 'warn') console.warn(...args)
    else console.log(...args)
  }
}

// Timer — returns a "done" function that logs elapsed ms
function timer(ns, label) {
  if (!ENABLED) return () => {}
  const start = performance.now()
  write('debug', ns, `⏱ ${label} — started`)
  return (extraData) => {
    const ms = (performance.now() - start).toFixed(1)
    write('ok', ns, `✓ ${label} — ${ms}ms`, extraData)
  }
}

// Group — wraps a labelled console.group; call end() to close it
function group(ns, label) {
  if (!ENABLED) return { end: () => {} }
  console.group(`%c ${ns} %c ${label}`, nsStyle(ns), 'color:#94a3b8')
  return { end: () => console.groupEnd() }
}

export const log = {
  info:  (ns, msg, data) => write('info',  ns, msg, data),
  warn:  (ns, msg, data) => write('warn',  ns, msg, data),
  error: (ns, msg, data) => write('error', ns, msg, data),
  debug: (ns, msg, data) => write('debug', ns, msg, data),
  ok:    (ns, msg, data) => write('ok',    ns, msg, data),
  time:  (ns, label)     => timer(ns, label),
  group: (ns, label)     => group(ns, label),
}
