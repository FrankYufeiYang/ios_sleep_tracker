import { useEffect, useState } from 'react'
import './App.css'
import Upload from './pages/Upload.jsx'
import Results from './pages/Results.jsx'
import BackendSettings from './components/BackendSettings.jsx'

function App() {
  const [view, setView] = useState('upload')

  useEffect(() => {
    if (view === 'results') {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'auto' })
      })
    }
  }, [view])

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">Sleep Health Insight</div>
        <nav className="nav">
          <button
            className={view === 'upload' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setView('upload')}
          >
            Upload
          </button>
          <button
            className={view === 'results' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setView('results')}
          >
            Results (Mock)
          </button>
          
          <BackendSettings />
        </nav>
      </header>
      <main className="app-main container">
        {view === 'upload' && <Upload onUploaded={() => setView('results')} />}
        {view === 'results' && <Results />}
        
      </main>
    </div>
  )
}

export default App
