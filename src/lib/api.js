const DEFAULT_BASE_URL = localStorage.getItem('backendBaseUrl') || 'http://localhost:8000'

export function setBackendBaseUrl(url) {
  localStorage.setItem('backendBaseUrl', url)
}

export function getBackendBaseUrl() {
  return localStorage.getItem('backendBaseUrl') || DEFAULT_BASE_URL
}

export async function uploadHealthExport(file, onProgress) {
  const base = getBackendBaseUrl()
  const url = `${base.replace(/\/$/, '')}/upload`

  const form = new FormData()
  form.append('file', file)

  const controller = new AbortController()

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    })
  } catch (e) {
    throw new Error(`Network error: ${e.message}`)
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Upload failed: ${response.status} ${text}`)
  }

  const json = await response.json().catch(() => ({}))
  return json
}

export async function fetchSummary() {
  const base = getBackendBaseUrl()
  const url = `${base.replace(/\/$/, '')}/summary`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Summary fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchMetrics(category, page = 1, pageSize = 100) {
  const base = getBackendBaseUrl()
  const url = `${base.replace(/\/$/, '')}/metrics/${encodeURIComponent(category)}?page=${page}&page_size=${pageSize}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Metrics fetch failed: ${res.status}`)
  return res.json()
}