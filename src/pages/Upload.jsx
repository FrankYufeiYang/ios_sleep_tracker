import { useState, useRef } from 'react'
import { uploadHealthExport } from '../lib/api.js'

export default function Upload({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const inputRef = useRef(null)

  function onSelect(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setMessage('')
  }

  function onDrop(e) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) {
      setFile(f)
      setMessage('')
    }
  }

  function onDragOver(e) {
    e.preventDefault()
  }

  async function onUpload() {
    if (!file) return
    setStatus('uploading')
    try {
      const res = await uploadHealthExport(file)
      setStatus('success')
      setMessage('Uploaded successfully')
      onUploaded?.(res)
    } catch (err) {
      setStatus('error')
      setMessage(err.message)
    }
  }

  function reset() {
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section className="container stack">
      <div className="card">
        <div className="card-title">Upload Apple Health Export</div>
        <div className="card-subtitle">Drag and drop a `.zip` or `.xml` export, or choose a file.</div>
        <div
          className="dropzone"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <p>Drag and drop here</p>
          <p>or</p>
          <input
            ref={inputRef}
            type="file"
            accept=".zip,.xml"
            onChange={onSelect}
            aria-label="Apple Health export file"
          />
        </div>
        {file && (
          <div className="file-info">
            <div><strong>Selected:</strong> {file.name} ({Math.round(file.size/1024)} KB)</div>
            <div className="actions">
              <button className="btn primary" onClick={onUpload} disabled={status==='uploading'} aria-busy={status==='uploading'}>
                {status === 'uploading' ? 'Uploading…' : 'Upload'}
              </button>
              <button className="btn" onClick={reset} disabled={status==='uploading'}>Clear</button>
            </div>
          </div>
        )}
        {message && (
          <div className={status === 'error' ? 'alert error' : 'alert success'}>
            {message}
          </div>
        )}
        <div className="tips">
          <ul>
            <li>Large exports may take time; backend should stream parse.</li>
            <li>Only essential metrics are stored (e.g., heart rate, sleep).</li>
            <li>If upload fails, verify backend URL in Settings.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}