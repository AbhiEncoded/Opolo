import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, Legend, ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-sm">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-slate-100 font-medium">{currency}{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function CostForecastChart({ data, currency = '€', forecastNote }) {
  const forecastStart = data.find(d => d.forecast)?.month

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-200">Cost forecast</h3>
          <p className="text-xs text-slate-500 mt-0.5">Shared room rent + total cost of living, next 12 months</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-0.5 bg-violet-400" />
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-0.5 border-t-2 border-dashed border-teal-400" />
            <span>Forecast</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${currency}${v}`}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          {forecastStart && (
            <ReferenceLine
              x={forecastStart}
              stroke="rgba(99,102,241,0.35)"
              strokeDasharray="4 2"
              label={{ value: 'Forecast →', fill: '#818cf8', fontSize: 10, position: 'insideTopLeft' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="rent"
            name="Shared rent"
            stroke="#818cf8"
            strokeWidth={2}
            dot={d => !d.payload.forecast ? <circle cx={d.cx} cy={d.cy} r={3} fill="#818cf8" /> : null}
            strokeDasharray={d => d?.payload?.forecast ? '5 3' : undefined}
          />
          <Line
            type="monotone"
            dataKey="cola"
            name="Total living"
            stroke="#2dd4bf"
            strokeWidth={2}
            dot={d => !d.payload.forecast ? <circle cx={d.cx} cy={d.cy} r={3} fill="#2dd4bf" /> : null}
            strokeDasharray={d => d?.payload?.forecast ? '5 3' : undefined}
          />
        </LineChart>
      </ResponsiveContainer>

      {forecastNote && (
        <p className="text-xs text-slate-600 mt-3 leading-relaxed">
          <span className="text-slate-500">Model note: </span>{forecastNote}
        </p>
      )}
    </div>
  )
}
