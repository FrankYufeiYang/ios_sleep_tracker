import { useEffect, useState } from 'react'
import { getBackendBaseUrl, setBackendBaseUrl } from '../lib/api.js'

export default function BackendSettings() {
  const [url, setUrl] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setUrl(getBackendBaseUrl())
  }, [])

  function onSave() {
    setBackendBaseUrl(url.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="backend-settings">
      <input
        className="backend-input"
        type="text"
        value={url}
        placeholder="Backend URL (e.g., http://localhost:8000)"
        onChange={(e) => setUrl(e.target.value)}
        aria-label="Backend API base URL"
      />
      <button className="nav-btn" onClick={onSave}>Save</button>
      {saved && <span className="saved-indicator">Saved</span>}
    </div>
  )
}