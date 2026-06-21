import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { log } from './lib/logger.js'
import { useEffect } from 'react'
import { AppProvider } from './context/AppContext.jsx'
import { AIProvider } from './context/AIContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import AppLayout from './components/AppLayout.jsx'
import Landing from './pages/Landing.jsx'
import Assessment from './pages/Assessment.jsx'
import Dashboard from './pages/Dashboard.jsx'
import RelocationGuide from './pages/RelocationGuide.jsx'
import BudgetMatcher from './pages/BudgetMatcher.jsx'
import VisaPredictor from './pages/VisaPredictor.jsx'
import CommunityHub from './pages/CommunityHub.jsx'
import AIInsights from './pages/AIInsights.jsx'

// Logs every route change so navigation issues are traceable
function RouteLogger() {
  const location = useLocation()
  useEffect(() => {
    log.info('Router', `Navigated to ${location.pathname}${location.search}`)
  }, [location.pathname])
  return null
}

// Wraps a page in its own ErrorBoundary so a crash on one screen
// shows an error page for THAT screen instead of blanking the whole app.
function Guarded({ children }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

export default function App() {
  return (
    // Top-level boundary: catches catastrophic errors (e.g. in providers/router)
    <ErrorBoundary>
      <AppProvider>
        <AIProvider>
          <BrowserRouter>
            <RouteLogger />
            <Routes>
              <Route path="/" element={<Guarded><Landing /></Guarded>} />
              <Route path="/assess" element={<Guarded><Assessment /></Guarded>} />
              <Route element={<AppLayout />}>
                <Route path="/dashboard"   element={<Guarded><Dashboard /></Guarded>} />
                <Route path="/ai-insights" element={<Guarded><AIInsights /></Guarded>} />
                <Route path="/budget"      element={<Guarded><BudgetMatcher /></Guarded>} />
                <Route path="/visa"        element={<Guarded><VisaPredictor /></Guarded>} />
                <Route path="/guide"       element={<Guarded><RelocationGuide /></Guarded>} />
                <Route path="/community"   element={<Guarded><CommunityHub /></Guarded>} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AIProvider>
      </AppProvider>
    </ErrorBoundary>
  )
}
