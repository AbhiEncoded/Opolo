import { createContext, useContext, useState, useEffect } from 'react'
import { log } from '../lib/logger.js'

const AppContext = createContext(null)

const DEFAULT_PROFILE = {
  name: '', nationality: '', age: '',
  fieldOfStudy: '', degreeLevel: '',
  weights: { career: 7, cost: 6, safety: 7, social: 5, diversity: 5, healthcare: 5 },
  religion: 'none', alcoholComfort: 'fine',
  socialStyle: 'community_active', budget: '1000_1500', startDate: 'sep_2026',
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) { log.debug('Storage', `${key} — not found in localStorage, using default`); return fallback }
    const parsed = JSON.parse(raw)
    log.ok('Storage', `${key} — loaded from localStorage`, parsed)
    return parsed
  } catch (e) {
    log.error('Storage', `${key} — JSON.parse failed, falling back to default`, e)
    return fallback
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    log.debug('Storage', `${key} — saved`)
  } catch (e) {
    log.error('Storage', `${key} — localStorage.setItem failed (quota exceeded?)`, e)
  }
}

export function AppProvider({ children }) {
  const [profile, setProfileRaw] = useState(() => loadFromStorage('hf_profile', DEFAULT_PROFILE))
  const [selectedCityId, setSelectedCityId] = useState(() => localStorage.getItem('hf_city') || 'netherlands')
  const [tolerances, setTolerances] = useState({})
  const [checklistProgress, setChecklistProgress] = useState(() => loadFromStorage('hf_checklist', {}))
  const [visaAnswers, setVisaAnswers] = useState({})

  // Logged version of setProfile
  const setProfile = (next) => {
    const val = typeof next === 'function' ? next(profile) : next
    log.info('Profile', 'Profile updated', {
      name: val.name,
      nationality: val.nationality,
      field: val.fieldOfStudy,
      weights: val.weights,
    })
    setProfileRaw(val)
  }

  useEffect(() => { saveToStorage('hf_profile', profile) }, [profile])
  useEffect(() => { saveToStorage('hf_city', selectedCityId) }, [selectedCityId])
  useEffect(() => { saveToStorage('hf_checklist', checklistProgress) }, [checklistProgress])

  const updateProfile = (updates) => {
    log.debug('Profile', 'updateProfile patch', updates)
    setProfile(p => ({ ...p, ...updates }))
  }

  const setSelectedCityIdLogged = (id) => {
    log.info('Router', `Selected city changed → ${id}`)
    setSelectedCityId(id)
  }

  const setTolerancesLogged = (next) => {
    const val = typeof next === 'function' ? next(tolerances) : next
    log.info('Matching', 'Tolerances updated', val)
    setTolerances(val)
  }

  const toggleChecklistItem = (cityId, itemId) => {
    log.debug('Storage', `Checklist toggle: ${cityId}/${itemId}`)
    setChecklistProgress(prev => {
      const city = prev[cityId] || {}
      return { ...prev, [cityId]: { ...city, [itemId]: !city[itemId] } }
    })
  }

  const getChecklistCount = (cityId, items) => {
    const prog = checklistProgress[cityId] || {}
    const done = items.filter(i => prog[i.id]).length
    return { done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 }
  }

  const isProfileComplete = () => !!(profile.name && profile.nationality && profile.fieldOfStudy)

  return (
    <AppContext.Provider value={{
      profile, updateProfile, setProfile,
      selectedCityId, setSelectedCityId: setSelectedCityIdLogged,
      tolerances, setTolerances: setTolerancesLogged,
      checklistProgress, toggleChecklistItem, getChecklistCount,
      visaAnswers, setVisaAnswers,
      isProfileComplete,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
