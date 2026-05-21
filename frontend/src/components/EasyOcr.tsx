import { useState } from 'react'
import { getToken } from '../auth'

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? '';

interface ScanResponse {
  ok: boolean;
  data: {
    meta: {
      source_file: string;
      ocr_engine: string;
      source_type: string;
      extraction_mode: string;
    };
    spatial: {
      tokens?: Array<{
        text: string;
        conf: number;
        x: number;
        y: number;
        w: number;
        h: number;
        x2: number;
        y2: number;
        cx: number;
        cy: number;
      }>;
      rows: Array<{
        id: number;
        tokens: Array<{
          text: string;
          conf: number;
          x: number;
          y: number;
          w: number;
          h: number;
          x2: number;
          y2: number;
          cx: number;
          cy: number;
        }>;
        text: string;
        x: number;
        y: number;
        w: number;
        h: number;
      }>;
    };
    invoice: {
      vendor: string | null;
      items: Array<{
        item_name: string;
        quantity: number | null;
        amount_before_tax: number | null;
        tax_percent: number | null;
        final_amount: number | null;
        row_id: number;
        row_bbox: { x: number; y: number; w: number; h: number };
      }>;
      tax_lines: Array<{
        tax_percent: number;
        gross_amount: number;
        net_amount: number;
        tax_amount: number;
      }>;
      totals: {
        total_amount: number | null;
        total_items_declared: number | null;
        line_items_sum: number;
        sum_difference: number | null;
        line_sum_matches_total: boolean | null;
        total_items_detected: number;
      };
    };
  };
}

export function EasyOcr() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [language, setLanguage] = useState('eng')
  const [psm, setPsm] = useState('6')
  const [oem, setOem] = useState('1')
  const [minConf, setMinConf] = useState('30')
  const [includeTokens, setIncludeTokens] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    setResult(null)
    setError(null)
  }

  const scanFromFile = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    const token = getToken()
    if (!token) {
      setError('Not authenticated. Please log in.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('lang', language)
      formData.append('psm', psm)
      formData.append('oem', oem)
      formData.append('min_conf', minConf)
      formData.append('include_tokens', includeTokens ? '1' : '0')

      const response = await fetch(`${ALLOWED_HOST}:3000/ocr/scan`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || `Error: ${response.status}`)
      }
      const data: ScanResponse = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, padding: 20 }}>
      <h1>Invoice OCR Scanner</h1>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Language:</label>
        <input
          type="text"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="eng or eng+deu"
          style={{ width: '100%', padding: 8 }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>PSM (Page Segmentation):</label>
          <select value={psm} onChange={(e) => setPsm(e.target.value)} style={{ width: '100%', padding: 8 }}>
            <option value="3">3 - Fully automatic</option>
            <option value="4">4 - Multi-column text</option>
            <option value="6">6 - Uniform block (default)</option>
            <option value="11">11 - Sparse text</option>
            <option value="12">12 - Sparse text + OCR</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>OEM (Engine Mode):</label>
          <select value={oem} onChange={(e) => setOem(e.target.value)} style={{ width: '100%', padding: 8 }}>
            <option value="0">0 - Legacy only</option>
            <option value="1">1 - LSTM only (default)</option>
            <option value="2">2 - Legacy + LSTM</option>
            <option value="3">3 - Default (auto)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>Min Confidence:</label>
          <input
            type="number"
            value={minConf}
            onChange={(e) => setMinConf(e.target.value)}
            min="0"
            max="100"
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={includeTokens}
              onChange={(e) => setIncludeTokens(e.target.checked)}
            />
            Include OCR tokens (debug)
          </label>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Upload Invoice:</label>
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
          style={{ 
            padding: '10px 20px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
          }}
        >
          {loading ? 'Processing...' : 'Scan Invoice'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: '#ffe6e6', color: '#cc0000', borderRadius: 4 }}>
          {error}
        </div>
      )}

      {result && result.data && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 16, padding: 12, background: '#f0f0f0', borderRadius: 4 }}>
            <h3>Meta</h3>
            <p><strong>Source:</strong> {result.data.meta.source_file}</p>
            <p><strong>Engine:</strong> {result.data.meta.ocr_engine}</p>
            <p><strong>Type:</strong> {result.data.meta.source_type}</p>
            <p><strong>Mode:</strong> {result.data.meta.extraction_mode}</p>
          </div>

          {result.data.invoice.vendor && (
            <div style={{ marginBottom: 16, padding: 12, background: '#e6f3ff', borderRadius: 4 }}>
              <h3>Vendor</h3>
              <p>{result.data.invoice.vendor}</p>
            </div>
          )}

          {result.data.invoice.items.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3>Items</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: 8, textAlign: 'left', border: '1px solid #ddd' }}>Item</th>
                    <th style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>Qty</th>
                    <th style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>Price</th>
                    <th style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>Tax %</th>
                    <th style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.item_name}</td>
                      <td style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>{item.quantity ?? '-'}</td>
                      <td style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>
                        {item.amount_before_tax?.toFixed(2) ?? '-'}
                      </td>
                      <td style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>
                        {item.tax_percent?.toFixed(1) ?? '-'}%
                      </td>
                      <td style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>
                        {item.final_amount?.toFixed(2) ?? '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.data.invoice.tax_lines.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3>Tax Lines</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>Tax %</th>
                    <th style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>Net</th>
                    <th style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>Tax</th>
                    <th style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>Gross</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.invoice.tax_lines.map((line, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>
                        {line.tax_percent.toFixed(1)}%
                      </td>
                      <td style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>
                        {line.net_amount.toFixed(2)}
                      </td>
                      <td style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>
                        {line.tax_amount.toFixed(2)}
                      </td>
                      <td style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>
                        {line.gross_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ padding: 12, background: '#e8f5e9', borderRadius: 4 }}>
            <h3>Totals</h3>
            <p><strong>Total Amount:</strong> {result.data.invoice.totals.total_amount?.toFixed(2) ?? 'N/A'}</p>
            <p><strong>Items Declared:</strong> {result.data.invoice.totals.total_items_declared ?? 'N/A'}</p>
            <p><strong>Line Items Sum:</strong> {result.data.invoice.totals.line_items_sum.toFixed(2)}</p>
            {result.data.invoice.totals.sum_difference !== null && (
              <p><strong>Difference:</strong> {result.data.invoice.totals.sum_difference.toFixed(2)}</p>
            )}
            <p><strong>Matches:</strong> {result.data.invoice.totals.line_sum_matches_total ? 'Yes' : 'No'}</p>
          </div>

          {result.data.spatial.rows.length > 0 && (
            <details style={{ marginTop: 16 }}>
              <summary style={{ cursor: 'pointer' }}>Show OCR Rows ({result.data.spatial.rows.length})</summary>
              <pre style={{ marginTop: 8, padding: 12, background: '#f5f5f5', fontSize: 12, maxHeight: 300, overflow: 'auto' }}>
                {result.data.spatial.rows.map(row => row.text).join('\n')}
              </pre>
            </details>
          )}

          {result.data.spatial.tokens && result.data.spatial.tokens.length > 0 && (
            <details style={{ marginTop: 16 }}>
              <summary style={{ cursor: 'pointer' }}>Show OCR Tokens ({result.data.spatial.tokens.length})</summary>
              <pre style={{ marginTop: 8, padding: 12, background: '#f5f5f5', fontSize: 11, maxHeight: 400, overflow: 'auto' }}>
                {JSON.stringify(result.data.spatial.tokens, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}