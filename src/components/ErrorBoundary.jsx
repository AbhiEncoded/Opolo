import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { log } from '../lib/logger.js'

/**
 * Catches any rendering error in the component tree below it and shows a
 * readable error page instead of a blank white screen.
 *
 * This is the safety net: even if a bug slips through, the user sees what
 * went wrong and can recover, rather than staring at nothing.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log the full crash with component stack so we can trace exactly where it happened
    log.error('Crash', `React render error: ${error?.message || 'unknown'}`, {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
    })
    this.setState({ errorInfo })
  }

  handleReset = () => {
    log.info('Crash', 'User clicked "Try again" — resetting error boundary')
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleGoHome = () => {
    log.info('Crash', 'User clicked "Go home" — navigating to landing')
    window.location.href = '/'
  }

  handleHardReload = () => {
    log.info('Crash', 'User clicked "Reload app"')
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const { error, errorInfo } = this.state

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="rounded-2xl border border-red-500/30 bg-slate-900 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100">Something broke on this page</h1>
                <p className="text-xs text-slate-500">The rest of the app is fine — you can recover below.</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              We hit an unexpected error while rendering this screen. Your data is safe and saved.
              Try the page again, or head back home and re-enter.
            </p>

            {/* Technical detail — collapsed by default, useful for debugging */}
            {error?.message && (
              <details className="mb-5 rounded-xl bg-slate-800/60 border border-slate-700/50 overflow-hidden">
                <summary className="px-3 py-2 text-xs text-slate-400 cursor-pointer hover:text-slate-300 select-none">
                  Technical details (for developers)
                </summary>
                <div className="px-3 py-2 border-t border-slate-700/50">
                  <p className="text-xs font-mono text-red-400 break-words mb-2">{error.message}</p>
                  {errorInfo?.componentStack && (
                    <pre className="text-[10px] font-mono text-slate-500 whitespace-pre-wrap max-h-40 overflow-auto">
                      {errorInfo.componentStack.trim().split('\n').slice(0, 8).join('\n')}
                    </pre>
                  )}
                  <p className="text-[10px] text-slate-600 mt-2">
                    The full error and component stack have been logged to your browser console.
                  </p>
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Try this page again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-slate-100 hover:border-slate-600 font-medium text-sm transition-colors"
              >
                <Home className="w-4 h-4" /> Home
              </button>
            </div>

            <button
              onClick={this.handleHardReload}
              className="w-full mt-2 text-xs text-slate-500 hover:text-slate-400 transition-colors py-1"
            >
              Still broken? Reload the whole app
            </button>
          </div>
        </div>
      </div>
    )
  }
}
