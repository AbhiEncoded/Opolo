import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Map, Calculator, ShieldCheck, Users,
  ChevronLeft, ChevronRight, Globe, Menu, X, Sparkles
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const NAV = [
  { to: '/dashboard',   icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard'       },
  { to: '/ai-insights', icon: <Sparkles        className="w-4 h-4" />, label: 'AI Insights', badge: 'AI' },
  { to: '/budget',      icon: <Calculator      className="w-4 h-4" />, label: 'Budget Matcher'  },
  { to: '/visa',        icon: <ShieldCheck     className="w-4 h-4" />, label: 'Visa Predictor'  },
  { to: '/guide',       icon: <Map             className="w-4 h-4" />, label: 'Relocation Guide'},
  { to: '/community',   icon: <Users           className="w-4 h-4" />, label: 'Community Hub'   },
]

const CITY_FLAGS = { boston: '🇺🇸', paris: '🇫🇷', netherlands: '🇳🇱' }
const CITY_NAMES = { boston: 'Boston', paris: 'Paris', netherlands: 'Netherlands' }

export default function AppLayout() {
  const { profile, selectedCityId, isProfileComplete } = useApp()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
        <Globe className="w-5 h-5 text-violet-400 flex-shrink-0" />
        {!collapsed && (
          <span className="font-bold text-xl leading-none tracking-tight">
            <span className="text-gradient">op</span><span className="text-slate-300">olo</span>
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {NAV.map(({ to, icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <span className="flex-shrink-0">{icon}</span>
            {!collapsed && (
              <span className="flex-1">{label}</span>
            )}
            {!collapsed && badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className={`border-t border-slate-800 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {isProfileComplete() ? (
          <button
            onClick={() => { navigate('/assess'); setMobileOpen(false) }}
            className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors group ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {profile.name?.[0]?.toUpperCase() || '?'}
            </div>
            {!collapsed && (
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-slate-200 truncate">{profile.name}</div>
                <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                  <span>{CITY_FLAGS[selectedCityId]}</span>
                  <span>{CITY_NAMES[selectedCityId]}</span>
                </div>
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={() => { navigate('/assess'); setMobileOpen(false) }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-medium hover:bg-violet-600/30 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            {collapsed ? '→' : 'Complete your profile →'}
          </button>
        )}
      </div>

      <button
        onClick={() => setCollapsed(c => !c)}
        className="hidden lg:flex items-center justify-center w-full py-3 border-t border-slate-800 text-slate-600 hover:text-slate-400 transition-colors text-xs gap-1"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
      </button>
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <aside className={`hidden lg:flex flex-col bg-slate-900 border-r border-slate-800 flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-56 bg-slate-900 border-r border-slate-800 flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-3 text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-slate-800 bg-slate-900 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-slate-200">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-lg">
            <span className="text-gradient">op</span><span className="text-slate-300">olo</span>
          </span>
          {isProfileComplete() && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
              <span>{CITY_FLAGS[selectedCityId]}</span>
              <span>{CITY_NAMES[selectedCityId]}</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
