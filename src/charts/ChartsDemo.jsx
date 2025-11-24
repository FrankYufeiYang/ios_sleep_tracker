import { Line, Bar, Doughnut } from 'react-chartjs-2'
import 'chart.js/auto'
import input from '../mock/input.json'
import output from '../mock/output.json'

function toLineDataset(points, xKey, yKey, label, color) {
  return {
    labels: points.map(p => p[xKey]),
    datasets: [
      {
        label,
        data: points.map(p => p[yKey]),
        borderColor: color,
        backgroundColor: color,
        tension: 0.25
      }
    ]
  }
}

export default function ChartsDemo() {
  const hrLine = toLineDataset(input.heart_rate, 't', 'bpm', 'Heart Rate (bpm)', '#2b2eff')
  const soundLine = toLineDataset(input.sound_levels, 't', 'db', 'Sound Level (dB)', '#0ca678')

  const sleepBar = {
    labels: input.sleep_sessions.map(s => s.date),
    datasets: [
      {
        label: 'Total Sleep (min)',
        data: input.sleep_sessions.map(s => s.total_minutes),
        backgroundColor: '#2b2eff'
      }
    ]
  }

  const stageDoughnut = {
    labels: output.sleep_stage_distribution.labels,
    datasets: [
      {
        data: output.sleep_stage_distribution.minutes,
        backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56']
      }
    ]
  }

  const weeklyBar = {
    labels: output.weekly_trend.dates,
    datasets: [
      {
        label: 'Sleep Minutes',
        data: output.weekly_trend.sleep_minutes,
        backgroundColor: '#6b7280'
      }
    ]
  }

  return (
    <section className="container stack">
      <div className="card">
        <div className="card-title section-title">Chart.js Demo</div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div className="stack">
            <div className="card-subtitle">Heart Rate Time Series</div>
            <Line data={hrLine} options={{ plugins: { legend: { display: true } }, scales: { x: { ticks: { maxTicksLimit: 5 } } } }} />
          </div>
          <div className="stack">
            <div className="card-subtitle">Environmental Sound Level</div>
            <Line data={soundLine} options={{ plugins: { legend: { display: true } }, scales: { x: { ticks: { maxTicksLimit: 5 } } } }} />
          </div>
          <div className="stack">
            <div className="card-subtitle">Daily Total Sleep</div>
            <Bar data={sleepBar} options={{ plugins: { legend: { display: true } } }} />
          </div>
          <div className="stack">
            <div className="card-subtitle">Sleep Stage Distribution</div>
            <Doughnut data={stageDoughnut} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </div>
          <div className="stack">
            <div className="card-subtitle">Weekly Trend (Total Sleep)</div>
            <Bar data={weeklyBar} options={{ plugins: { legend: { display: true } } }} />
          </div>
        </div>
      </div>
    </section>
  )
}