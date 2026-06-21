// ─────────────────────────────────────────────────────────────────────────────
// opolo Student Archetype Classifier
//
// Uses nearest-centroid assignment (same principle as K-Means inference) to
// classify a student's preference weight vector into one of four archetypes.
// ─────────────────────────────────────────────────────────────────────────────

import { STUDENT_ARCHETYPES } from '../data/cityData.js'

const DIMS = ['career', 'cost', 'safety', 'social', 'diversity', 'healthcare']

/**
 * Assign a student to the nearest archetype centroid.
 *
 * @param {Object} weights  - { career:7, cost:8, safety:5, social:4, diversity:6, healthcare:3 }
 * @returns {Object}        - The matched STUDENT_ARCHETYPE object + { distance, scores }
 */
export function classifyStudentType(weights) {
  let best = null
  let minDist = Infinity

  const distances = STUDENT_ARCHETYPES.map(archetype => {
    const dist = euclidean(weights, archetype.centroid)
    if (dist < minDist) {
      minDist = dist
      best = archetype
    }
    return { archetype, dist }
  })

  // Sort by distance to give ordered match quality
  distances.sort((a, b) => a.dist - b.dist)

  return {
    ...best,
    distance: minDist,
    allMatches: distances.map(({ archetype, dist }) => ({
      ...archetype,
      matchPct: Math.round(100 - (dist / maxPossibleDistance()) * 100),
    })),
  }
}

function euclidean(w, centroid) {
  return Math.sqrt(
    DIMS.reduce((sum, d) => {
      const diff = (w[d] || 5) - (centroid[d] || 5)
      return sum + diff * diff
    }, 0),
  )
}

// Max possible Euclidean distance in a 6-dim space with range [1,10]
// = sqrt(6 * 9^2) = sqrt(486) ≈ 22
function maxPossibleDistance() {
  return Math.sqrt(DIMS.length * 81)
}
