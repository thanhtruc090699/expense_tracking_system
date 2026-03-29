import { useState } from 'react'
import billImage from '../assets/bill.png'

import '@patternfly/react-core/dist/styles/base.css'
import {
  Card,
  CardTitle,
  CardBody,
  CardFooter,
  FileUpload,
} from '@patternfly/react-core'

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
  const [fileName, setFileName] = useState<string>('') // PatternFly file upload display

  const handleFileUpload: FileUploadCallbackHandler = (_event, file, _fileName) => {
    // PatternFly passes File[] or string; handle File[]
    if (Array.isArray(file) && file[0] instanceof File) {
      setSelectedFile(file[0])
      setFileName(file[0].name)
      setResult(null)
      setError(null)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setFileName('')
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
          'X-Access-Key': 'eocr_CC_o-BV5tLYe4DktHn1WNs-UdCDlrziN',
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
    } catch {
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
          <p>This allows you to upload a file and test the API.</p>

          <FileUpload
            id="easy-ocr-upload"
            type="default"
            value={fileName}
            filename={fileName || 'Drag and drop a file or browse'}
            filenamePlaceholder="Drag and drop a file or browse"
            onChange={handleFileUpload}
            onClearClick={clearFile}
            browseButtonText="Upload"
            isDisabled={loading}
            allowEditingUploadedText={false}
            dropzoneProps={{ accept: 'image/*,.pdf' }}
          />

          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={testWithBillImage} disabled={loading} className="pf-c-button pf-m-primary">
              {loading ? 'Processing...' : 'Test with bill.png'}
            </button>

            <div style={{ padding: '0 8px', color: '#6a6e73' }}>OR</div>

            <button
              onClick={testWithSelectedFile}
              disabled={loading || !selectedFile}
              className="pf-c-button pf-m-secondary"
            >
              {loading ? 'Processing...' : 'Test with Selected File'}
            </button>
          </div>
        </CardBody>

        <CardFooter>Footer</CardFooter>
      </Card>

      {error && (
        <div style={{ marginTop: 12, color: '#c9190b' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 12 }}>
          <h3>API Response</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </>
  )
}

