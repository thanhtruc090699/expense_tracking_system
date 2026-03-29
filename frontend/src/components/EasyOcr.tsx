import { useState } from 'react'
import billImage from '../assets/bill.png'

import '@patternfly/react-core/dist/styles/base.css';
import { Card, CardTitle, CardBody, CardFooter } from '@patternfly/react-core';

interface OcrWord {
  text: string
  score: number
}

interface OcrResponse {
  request_id: string
  message: string
  user: string
  remaining_quota: number
  elapsed_seconds: number
  result_summary: string
  words: OcrWord[]
}

export function EasyOcr() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OcrResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0])
      setResult(null)
      setError(null)
    }
  }

  const testOcr = async (fileToTest: File) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', fileToTest)

      const response = await fetch('https://console.easyocr.org/api/ocr', {
        method: 'POST',
        headers: {
          'X-Access-Key': "eocr_CC_o-BV5tLYe4DktHn1WNs-UdCDlrziN",
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data: OcrResponse = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const testWithBillImage = async () => {
    try {
      const response = await fetch(billImage)
      const blob = await response.blob()
      const file = new File([blob], 'bill.png', { type: 'image/png' })
      await testOcr(file)
    } catch (err) {
      setError('Failed to load bill.png image')
    }
  }

  const testWithSelectedFile = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }
    await testOcr(selectedFile)
  }

  return (
	  <>
    <Card ouiaId="BasicCard">
      <CardTitle>Easy OCR API Tester</CardTitle>

      <CardBody>
        <div className="button-section">
          <button
            onClick={testWithBillImage}
            disabled={loading}
            className="primary"
          >
            {loading ? 'Processing...' : 'Test with bill.png'}
          </button>

          <div className="separator">OR</div>

          <div className="file-upload">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              disabled={loading}
              id="fileInput"
            />
            <label htmlFor="fileInput">
              {selectedFile ? selectedFile.name : 'Choose a file'}
            </label>
            <button
              onClick={testWithSelectedFile}
              disabled={loading || !selectedFile}
              className="secondary"
            >
              {loading ? 'Processing...' : 'Test with Selected File'}
            </button>
          </div>
        </div>
      </CardBody>

      <CardFooter>Footer</CardFooter>
    </Card>

    {error && <div className="error">{error}</div>}

    {result && (
      <div className="result-section">
        <h3>API Response</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    )}
  </>
  )
}
