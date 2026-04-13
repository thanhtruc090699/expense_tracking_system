import { useState } from 'react'

interface OcrResponse {
  ParsedResults?: Array<{ ParsedText: string; FileParseExitCode: number }>;
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string[];
}

export function EasyOcr() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OcrResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [language, setLanguage] = useState('eng')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    setResult(null)
    setError(null)
  }

  const scanFromUrl = async () => {
    if (!imageUrl) {
      setError('Please enter an image URL')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const params = new URLSearchParams({ url: imageUrl, language })
      const response = await fetch(`http://10.0.0.2:3000/scan?${params}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || `Error: ${response.status}`)
      }
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const scanFromFile = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('language', language)

      const response = await fetch('http://10.0.0.2:3000/scan', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || `Error: ${response.status}`)
      }
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, padding: 20 }}>
      <h1>OCR Test</h1>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Language:</label>
        <input
          type="text"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{ width: '100%', padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Image URL:</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            style={{ flex: 1, padding: 8 }}
          />
          <button
            onClick={scanFromUrl}
            disabled={loading || !imageUrl}
            style={{ padding: '8px 16px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Processing...' : 'Scan URL'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Or upload a file:</label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          disabled={loading}
          style={{ marginBottom: 8 }}
        />
        <button
          onClick={scanFromFile}
          disabled={loading || !selectedFile}
          style={{ padding: '8px 16px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Processing...' : 'Scan File'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 16, color: 'red' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          <h3>Result:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#f5f5f5', padding: 16 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}