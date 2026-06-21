// AIContext — Global store for LLM analysis results + follow-up state
import { createContext, useContext, useState, useCallback } from 'react'
import { runFullAIAnalysis, generateFollowUpQuestions } from '../lib/aiService.js'
import { log } from '../lib/logger.js'

const AIContext = createContext(null)

export function AIProvider({ children }) {
  const [analysis, setAnalysis]             = useState(null)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState(null)
  const [analysedFor, setAnalysedFor]       = useState(null)

  const [followUp, setFollowUp]             = useState(null)
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [followUpError, setFollowUpError]   = useState(null)
  const [followUpAnswers, setFollowUpAnswers] = useState({})
  const [followUpDone, setFollowUpDone]     = useState(false)

  const triggerAnalysis = useCallback(async ({ profile, topCity, allResults }) => {
    const key = `${profile.name}-${profile.nationality}-${profile.fieldOfStudy}-${topCity.id}`

    if (key === analysedFor && analysis) {
      log.debug('AI', `triggerAnalysis skipped — already have result for key: ${key}`)
      return
    }

    log.info('AI', `triggerAnalysis started`, { key, topCity: topCity.name })
    setLoading(true)
    setError(null)

    try {
      const result = await runFullAIAnalysis({ profile, topCity, allResults })
      setAnalysis(result)
      setAnalysedFor(key)
      log.ok('AI', `triggerAnalysis complete — analysis stored`, { key })
    } catch (e) {
      const msg = e.message || 'Analysis failed'
      setError(msg)
      log.error('AI', `triggerAnalysis threw — error stored in context`, e)
    } finally {
      setLoading(false)
    }
  }, [analysis, analysedFor])

  const triggerFollowUp = useCallback(async ({ profile, results }) => {
    if (followUp) {
      log.debug('FollowUp', 'triggerFollowUp skipped — questions already loaded')
      return
    }
    if (followUpLoading) {
      log.debug('FollowUp', 'triggerFollowUp skipped — already in flight')
      return
    }

    log.info('FollowUp', 'triggerFollowUp started', {
      topCity: results[0]?.city?.name,
      numResults: results.length,
    })
    setFollowUpLoading(true)
    setFollowUpError(null)

    try {
      const result = await generateFollowUpQuestions({ profile, results })
      setFollowUp(result)
      log.ok('FollowUp', `${result.questions?.length} questions loaded`)
    } catch (e) {
      const msg = e.message || 'Follow-up generation failed'
      setFollowUpError(msg)
      log.error('FollowUp', 'triggerFollowUp threw — error stored in context', e)
    } finally {
      setFollowUpLoading(false)
    }
  }, [followUp, followUpLoading])

  const answerFollowUp = (questionId, weightAdjust) => {
    log.info('FollowUp', `Answer recorded`, { questionId, weightAdjust })
    setFollowUpAnswers(prev => ({ ...prev, [questionId]: weightAdjust }))
  }

  const submitFollowUp = () => {
    log.ok('FollowUp', 'Answers submitted — weights will be adjusted', followUpAnswers)
    setFollowUpDone(true)
  }

  const clearAnalysis = () => {
    log.info('AI', 'clearAnalysis — resetting all AI state')
    setAnalysis(null); setAnalysedFor(null); setError(null)
    setFollowUp(null); setFollowUpAnswers({}); setFollowUpDone(false)
  }

  return (
    <AIContext.Provider value={{
      analysis, loading, error, triggerAnalysis,
      followUp, followUpLoading, followUpError, followUpAnswers, followUpDone,
      triggerFollowUp, answerFollowUp, submitFollowUp,
      clearAnalysis,
    }}>
      {children}
    </AIContext.Provider>
  )
}

export const useAI = () => {
  const ctx = useContext(AIContext)
  if (!ctx) throw new Error('useAI must be used within AIProvider')
  return ctx
}
