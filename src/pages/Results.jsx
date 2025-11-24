import { useEffect, useMemo, useState } from 'react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import 'chart.js/auto'
import inputMock from '../mock/input.json'
import outputMock from '../mock/output.json'

const CATEGORIES = [
  { key: 'activity', label: 'Activity' },
  { key: 'vitals', label: 'Vitals' },
  { key: 'environment', label: 'Environment' },
]

export default function Results() {
  const [summary, setSummary] = useState(null)
  const [sleepScore, setSleepScore] = useState(0)
  const [category, setCategory] = useState(CATEGORIES[0].key)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const computeSleepScore = (s, weekly) => {
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
    const targetMinutes = 480
    const durationScore = clamp((s.avg_sleep_minutes / targetMinutes) * 40, 0, 40)
    const idealRem = 0.22
    const remDiff = Math.abs((s.rem_ratio ?? 0) - idealRem)
    const remScore = clamp((1 - remDiff / 0.12) * 25, 0, 25)
    const hrScore = clamp((80 - (s.avg_hr ?? 80)) / 20 * 15, 0, 15)
    const soundScore = clamp((50 - (s.avg_sound_db ?? 50)) / 20 * 10, 0, 10)
    const vals = weekly?.sleep_minutes || []
    const mean = vals.length ? vals.reduce((a,b)=>a+b,0) / vals.length : 0
    const variance = vals.length ? vals.reduce((a,b)=>a + Math.pow(b - mean, 2), 0) / vals.length : 0
    const std = Math.sqrt(variance)
    const consistencyScore = clamp((60 - std) / 60 * 10, 0, 10)
    return Math.round(durationScore + remScore + hrScore + soundScore + consistencyScore)
  }

  useEffect(() => {
    const s = outputMock.summary
    const w = outputMock.weekly_trend
    setSummary({
      'Average Sleep (min)': s.avg_sleep_minutes,
      'Average Heart Rate (bpm)': s.avg_hr,
      'Average Sound Level (dB)': s.avg_sound_db,
      'REM Ratio': s.rem_ratio
    })
    setSleepScore(computeSleepScore(s, w))
  }, [])

  const fullData = useMemo(() => {
    if (category === 'activity') {
      return outputMock.weekly_trend.dates.map((d, i) => ({ date: d, total_minutes: outputMock.weekly_trend.sleep_minutes[i] }))
    }
    if (category === 'vitals') {
      return inputMock.heart_rate.map(p => ({ timestamp: p.t, bpm: p.bpm }))
    }
    return inputMock.sound_levels.map(p => ({ timestamp: p.t, db: p.db }))
  }, [category])

  useEffect(() => {
    setLoading(true)
    setError('')
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const slice = fullData.slice(start, end)
    setRecords(slice)
    setLoading(false)
  }, [fullData, page, pageSize])

  const activityBarData = useMemo(() => ({
    labels: outputMock.weekly_trend.dates,
    datasets: [{ label: 'Sleep Minutes', data: outputMock.weekly_trend.sleep_minutes, backgroundColor: '#2b2eff' }]
  }), [])

  const hrLineData = useMemo(() => ({
    labels: inputMock.heart_rate.map(p => p.t),
    datasets: [{ label: 'Heart Rate (bpm)', data: inputMock.heart_rate.map(p => p.bpm), borderColor: '#ef4444', backgroundColor: '#ef4444', tension: 0.25 }]
  }), [])

  const soundLineData = useMemo(() => ({
    labels: inputMock.sound_levels.map(p => p.t),
    datasets: [{ label: 'Sound Level (dB)', data: inputMock.sound_levels.map(p => p.db), borderColor: '#0ca678', backgroundColor: '#0ca678', tension: 0.25 }]
  }), [])

  const stageDoughnutData = useMemo(() => ({
    labels: outputMock.sleep_stage_distribution.labels,
    datasets: [{ data: outputMock.sleep_stage_distribution.minutes, backgroundColor: ['#ff6384','#36a2eb','#ffcd56'] }]
  }), [])

  return (
    <section className="container results-container">
      <div className="stack">
        <div>
          <h2 className="section-title">Summary</h2>
          {!summary && !error && <div className="msg">Loading summary…</div>}
          {error && <div className="alert error">{error}</div>}
          {summary && (
            <div className="stack">
              <div className="summary-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="summary-key">Sleep Quality Score</div>
                  <div className="summary-val" style={{ fontSize: '2rem' }}>{sleepScore}</div>
                </div>
                <div style={{ flex: 1, marginLeft: '1rem' }}>
                  <div style={{ height: '12px', background: '#eef0ff', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${sleepScore}%`, height: '100%', background: '#2b2eff' }} />
                  </div>
                </div>
              </div>
              <div className="summary-grid">
                {Object.entries(summary).map(([k, v]) => (
                  <div key={k} className="summary-card">
                    <div className="summary-key">{k}</div>
                    <div className="summary-val">{String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

         <div>
          <h2 className="section-title">Metrics</h2>
          <div className="charts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div className="stack">
              <div className="card-subtitle">Sleep Minutes by Day</div>
              <Bar data={activityBarData} options={{ plugins: { legend: { display: true } } }} />
            </div>
            <div className="stack">
              <div className="card-subtitle">Heart Rate</div>
              <Line data={hrLineData} options={{ plugins: { legend: { display: true } }, scales: { x: { ticks: { maxTicksLimit: 5 } } } }} />
            </div>
            <div className="stack">
              <div className="card-subtitle">Sound Level</div>
              <Line data={soundLineData} options={{ plugins: { legend: { display: true } }, scales: { x: { ticks: { maxTicksLimit: 5 } } } }} />
            </div>
            <div className="stack">
              <div className="card-subtitle">Sleep Stage Distribution</div>
              <Doughnut data={stageDoughnutData} options={{ plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>

        <div>
          <div className="metrics-header">
            <h2 className="section-title">History Records</h2>
            <div className="categories">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  className={c.key === category ? 'nav-btn active' : 'nav-btn'}
                  onClick={() => { setCategory(c.key); setPage(1) }}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="pager">
              <label>Page size
                <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                  {[50, 100, 250, 500].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
              <button className="btn" onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">Prev</button>
              <span>Page {page}</span>
              <button className="btn" onClick={() => setPage((p) => p + 1)} aria-label="Next page">Next</button>
            </div>
          </div>

          {loading && <div className="msg">Loading records…</div>}
          {!loading && records.length === 0 && <div className="msg">No records</div>}
          {!loading && records.length > 0 && (
            <div className="records">
              <table>
                <thead>
                  <tr>
                    {Object.keys(records[0]).map((k) => (
                      <th key={k}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, idx) => (
                    <tr key={idx}>
                      {Object.entries(r).map(([k, v]) => (
                        <td key={k}>{String(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

       
      </div>
    </section>
  )
}