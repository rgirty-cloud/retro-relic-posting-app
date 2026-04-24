import { supabase } from '../supabase'
import { useState } from 'react'

const CLUE_PATTERNS = {
  wally: { regex: /wally/i, label: 'Wally', confidence: 'high' },
  rl: { regex: /\bRL\b|\bR\.L\b/i, label: 'RL', confidence: 'high' },
  sterling: { regex: /sterling/i, label: 'Sterling', confidence: 'high' },
  masterdisk: { regex: /masterdisk/i, label: 'Masterdisk', confidence: 'high' },
  artisan: { regex: /artisan/i, label: 'Artisan', confidence: 'high' },
  porky: { regex: /porky|pecko/i, label: 'Porky/Pecko', confidence: 'high' },
  promo: { regex: /promo|promotional|dj copy/i, label: 'Promo', confidence: 'high' },
  noBarcode: { regex: /no barcode|without barcode/i, label: 'No Barcode', confidence: 'high' },
  purpleLabel: { regex: /purple label/i, label: 'Purple Label', confidence: 'high' },
  smas: { regex: /\bSMAS\b/i, label: 'SMAS', confidence: 'weak' },
  st: { regex: /\bST\b/i, label: 'ST', confidence: 'weak' },
  sw: { regex: /\bSW\b/i, label: 'SW', confidence: 'weak' },
  sideNumber: { regex: /-\s*[12]\b/, label: 'Side number marker', confidence: 'weak' },
  matrixString: { regex: /\b[A-Z0-9]{2,}(?:[-/][A-Z0-9]{1,4})+\b/i, label: 'Matrix-style string', confidence: 'weak' },
}

const WORDING_SUGGESTIONS = {
  wally: 'Wally pressing',
  rl: 'RL pressing',
  sterling: 'Sterling pressing',
  masterdisk: 'Masterdisk mastered',
  artisan: 'Artisan Records',
  porky: 'Porky pressing',
  promo: 'Promo copy',
  noBarcode: 'Original pressing (no barcode)',
  purpleLabel: 'Original purple label pressing',
}

const FALLBACK_CLUES = [
  'No named mastering signature detected',
  'Matrix / catalog style deadwax captured',
  'This appears to be technical deadwax text rather than a recognizable mastering keyword',
]

const FALLBACK_SUGGESTIONS = [
  'deadwax and matrix details noted',
  'matrix information present in the deadwax',
]

function DeadwaxHelper({ manualAiNotes, setManualAiNotes }) {
  const [sideA, setSideA] = useState('')
  const [sideB, setSideB] = useState('')
  const [sideC, setSideC] = useState('')
  const [sideD, setSideD] = useState('')
  const [showSidesCD, setShowSidesCD] = useState(false)
  const [extraClues, setExtraClues] = useState('')
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')
  const [price, setPrice] = useState('')
  const [status, setStatus] = useState('in_stock')
  const [detectedClues, setDetectedClues] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [cautionNotes, setCautionNotes] = useState([])
  const [saveMessage, setSaveMessage] = useState('')

  const saveRecord = async () => {
    const today = new Date().toISOString().split('T')[0]
    const dateSold = status === 'sold' ? today : null

    const { error } = await supabase
      .from('records')
      .insert([
        {
          artist,
          album,
          side_a_deadwax: sideA,
          side_b_deadwax: sideB,
          side_c_deadwax: sideC || null,
          side_d_deadwax: sideD || null,
          extra_clues: extraClues,
          manual_ai_notes: manualAiNotes || '',
          generated_listing: '',
          price: price || null,
          status: status,
          date_added: today,
          date_sold: dateSold,
        },
      ])

    if (error) {
      console.error('Save error:', error)
      alert(`Error saving record: ${error.message}`)
    } else {
      setSaveMessage('Record saved. Ready for next record.')
    }
  }

  const handleNextRecord = () => {
    setArtist('')
    setAlbum('')
    setSideA('')
    setSideB('')
    setSideC('')
    setSideD('')
    setShowSidesCD(false)
    setExtraClues('')
    setManualAiNotes('')
    setDetectedClues([])
    setSuggestions([])
    setCautionNotes([])
    setPrice('')
    setStatus('in_stock')
    setSaveMessage('')
  }

  const detectClues = () => {
    const allText = `${sideA} ${sideB} ${sideC} ${sideD} ${extraClues}`.trim()
    const lowercaseText = allText.toLowerCase()
    const detected = []
    const weakEvidence = []
    let hasMatrixEvidence = false

    Object.entries(CLUE_PATTERNS).forEach(([key, { regex, label, confidence }]) => {
      if (regex.test(allText)) {
        detected.push(label)
        if (confidence === 'weak') {
          weakEvidence.push(label)
        }
        if (['smas', 'st', 'sw', 'sideNumber', 'matrixString'].includes(key)) {
          hasMatrixEvidence = true
        }
      }
    })

    const finalDetected = detected.length > 0 ? detected : FALLBACK_CLUES
    setDetectedClues(finalDetected)

    const words =
      detected.length > 0
        ? detected.map((clue) => {
            for (const [key, value] of Object.entries(WORDING_SUGGESTIONS)) {
              if (
                value.toLowerCase().includes(clue.toLowerCase()) ||
                clue.toLowerCase().includes(key)
              ) {
                return value
              }
            }
            return clue
          })
        : FALLBACK_SUGGESTIONS

    setSuggestions(words)

    const notes = []
    if (detected.length === 0) {
      notes.push('⚠️ No identifying features detected - recommend researching Discogs for pressing info')
      notes.push('⚠️ Do not infer first pressing from matrix text alone.')
    }
    if (weakEvidence.length > 0) {
      notes.push(`⚠️ Weak evidence for: ${weakEvidence.join(', ')} - verify before listing`)
    }
    if (hasMatrixEvidence && detected.length > 0) {
      notes.push('⚠️ Do not infer first pressing from matrix text alone.')
    }
    if (detected.length > 0 && !lowercaseText.includes('original')) {
      notes.push('💡 Consider noting original vs reissue status')
    }

    setCautionNotes(notes)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const handleAnalyzeInChatGPT = () => {
    const sideCDText = showSidesCD && (sideC || sideD)
      ? `\nSIDE C DEADWAX: ${sideC || 'Not provided'}\nSIDE D DEADWAX: ${sideD || 'Not provided'}`
      : ''

    const prompt = `Please analyze this vinyl record's deadwax markings and provide interpretation for marketplace listing.

ARTIST: ${artist || 'Unknown'}
ALBUM: ${album || 'Unknown'}

SIDE A DEADWAX: ${sideA || 'Not provided'}
SIDE B DEADWAX: ${sideB || 'Not provided'}${sideCDText}
EXTRA CLUES: ${extraClues || 'None provided'}

Please provide:
1. Interpretation of the deadwax markings
2. Likely meaning/significance
3. Confidence level (High/Medium/Low)
4. Any cautions or warnings
5. Safe wording suggestions for marketplace listing

Respond in a clear, structured format.`

    copyToClipboard(prompt)
    alert('Prompt copied. Paste into ChatGPT.')
  }

  const handleDetect = () => {
    if (sideA.trim() || sideB.trim() || sideC.trim() || sideD.trim() || extraClues.trim()) {
      detectClues()
    }
  }

  return (
    <div className="helper-section">
      <h2>Deadwax Helper</h2>
      <p className="helper-description">
        Analyze deadwax markings to identify pressing information and generate safe wording for your listing.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="artist">Artist</label>
          <input
            id="artist"
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist name (optional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="album">Album</label>
          <input
            id="album"
            type="text"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            placeholder="Album title (optional)"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="sideA">Side A Deadwax</label>
        <textarea
          id="sideA"
          value={sideA}
          onChange={(e) => setSideA(e.target.value)}
          placeholder="Enter the text you see in the deadwax area of Side A..."
          rows="4"
        />
      </div>

      <div className="form-group">
        <label htmlFor="sideB">Side B Deadwax</label>
        <textarea
          id="sideB"
          value={sideB}
          onChange={(e) => setSideB(e.target.value)}
          placeholder="Enter the text you see in the deadwax area of Side B..."
          rows="4"
        />
      </div>

      {!showSidesCD && (
        <button className="btn-toggle" onClick={() => setShowSidesCD(true)}>
          + Add Sides C/D
        </button>
      )}

      {showSidesCD && (
        <>
          <div className="form-group">
            <label htmlFor="sideC">Side C Deadwax</label>
            <textarea
              id="sideC"
              value={sideC}
              onChange={(e) => setSideC(e.target.value)}
              placeholder="Enter the text you see in the deadwax area of Side C..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sideD">Side D Deadwax</label>
            <textarea
              id="sideD"
              value={sideD}
              onChange={(e) => setSideD(e.target.value)}
              placeholder="Enter the text you see in the deadwax area of Side D..."
              rows="4"
            />
          </div>
        </>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="in_stock">In Stock</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="extra">Extra Clues</label>
        <textarea
          id="extra"
          value={extraClues}
          onChange={(e) => setExtraClues(e.target.value)}
          placeholder="Any other clues (purple label, no barcode, etc.)..."
          rows="3"
        />
      </div>

      <div className="button-row">
        <button className="btn-primary" onClick={handleDetect}>
          Analyze Deadwax
        </button>
        <button className="btn-secondary" onClick={handleAnalyzeInChatGPT}>
          Analyze in ChatGPT
        </button>
        <button className="btn-secondary" onClick={saveRecord}>
          Save Record
        </button>
        {saveMessage && (
          <button className="btn-secondary" onClick={handleNextRecord}>
            Next Record
          </button>
        )}
      </div>

      {saveMessage && (
        <div className="save-message">{saveMessage}</div>
      )}

      <div className="form-group">
        <label htmlFor="manualAiNotes">Manual AI Notes</label>
        <textarea
          id="manualAiNotes"
          value={manualAiNotes}
          onChange={(e) => setManualAiNotes(e.target.value)}
          placeholder="Paste ChatGPT response here..."
          rows="6"
        />
      </div>

      {detectedClues.length > 0 && (
        <>
          <div className="results-section">
            <h3>Detected Clues</h3>
            <div className="clues-list">
              {detectedClues.map((clue) => (
                <span key={clue} className="clue-badge">
                  {clue}
                </span>
              ))}
            </div>
          </div>

          <div className="results-section">
            <h3>Safe Wording Suggestions</h3>
            <div className="suggestions-box">
              {suggestions.map((suggestion, idx) => (
                <div key={idx} className="suggestion-item">
                  <code>{suggestion}</code>
                  <button
                    className="btn-copy"
                    onClick={() => copyToClipboard(suggestion)}
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
              ))}
            </div>
          </div>

          {cautionNotes.length > 0 && (
            <div className="results-section caution">
              <h3>⚠️ Caution Notes</h3>
              <ul>
                {cautionNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default DeadwaxHelper