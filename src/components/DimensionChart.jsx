import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { DIMENSION_META } from '../data/cityData.js'

const DIMS = ['career', 'cost', 'safety', 'social', 'diversity', 'healthcare']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-300 font-medium">{d.payload.dimension}</p>
      <p className="text-violet-400">{d.value}/100</p>
    </div>
  )
}

export default function DimensionChart({ city }) {
  const data = DIMS.map(d => ({
    dimension: DIMENSION_META[d].label,
    score: city.dimensions[d],
    fullMark: 100,
  }))

  return (
    <div>
      <h3 className="font-semibold text-slate-200 mb-1">6-dimension breakdown</h3>
      <p className="text-xs text-slate-500 mb-4">All scores 0–100, higher = better</p>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="rgba(99,102,241,0.15)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name={city.name}
            dataKey="score"
            stroke="#818cf8"
            fill="#818cf8"
            fillOpacity={0.18}
            strokeWidth={2}
            dot={{ r: 3, fill: '#818cf8' }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Bar summary below chart */}
      <div className="space-y-2 mt-2">
        {DIMS.map(d => {
          const score = city.dimensions[d]
          const color = score >= 80 ? 'bg-violet-500' : score >= 65 ? 'bg-teal-500' : 'bg-amber-500'
          return (
            <div key={d} className="flex items-center gap-3">
              <span className="text-sm w-4 text-center">{DIMENSION_META[d].icon}</span>
              <span className="text-xs text-slate-400 w-28 truncate dim-label">{DIMENSION_META[d].label}</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${score}%` }} />
              </div>
              <span className={`text-xs font-medium w-6 text-right ${score >= 80 ? 'text-violet-400' : score >= 65 ? 'text-teal-400' : 'text-amber-400'}`}>{score}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
