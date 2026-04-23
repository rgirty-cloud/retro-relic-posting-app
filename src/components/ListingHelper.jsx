import { useState } from 'react'

function ListingHelper({ manualAiNotes }) {
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')
  const [pressingNote, setPressingNote] = useState('')
  const [vinylGrade, setVinylGrade] = useState('VG+')
  const [sleeveGrade, setSleeveGrade] = useState('VG+')
  const [price, setPrice] = useState('')
  const [standoutSongs, setStandoutSongs] = useState('')
  const [title, setTitle] = useState('')
  const [listingText, setListingText] = useState('')

  const generateListing = () => {
    if (!artist.trim() || !album.trim()) {
      alert('Please enter artist and album at minimum')
      return
    }

    // Generate marketplace title
    const marketplaceTitle = `${artist} - ${album}${pressingNote ? ` (${pressingNote})` : ''} [${vinylGrade}/${sleeveGrade}]`
    setTitle(marketplaceTitle)

    // Generate listing text
    const songsList = standoutSongs
      .split('\n')
      .filter((song) => song.trim())
      .map((song) => `• ${song.trim()}`)
      .join('\n')

    const listingContent = `${artist} - ${album}

Condition: Vinyl ${vinylGrade} / Sleeve ${sleeveGrade}
Price: $${price}

${pressingNote ? `Pressing: ${pressingNote}\n\n` : ''}Details:
This is a great copy of this album in good overall condition.

${manualAiNotes ? `AI Analysis:\n${manualAiNotes}\n\n` : ''}${
  songsList
    ? `Standout Tracks:\n${songsList}\n\n`
    : ''
}Feel free to ask any questions. Ships promptly.`

    setListingText(listingContent)
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    alert(`${label} copied to clipboard!`)
  }

  const gradeOptions = ['M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P']

  return (
    <div className="helper-section">
      <h2>Listing Helper</h2>
      <p className="helper-description">
        Generate marketplace titles and listing descriptions for your vinyl records.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="artist">Artist *</label>
          <input
            id="artist"
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="album">Album *</label>
          <input
            id="album"
            type="text"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            placeholder="Album title"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="pressing">Pressing Note</label>
          <input
            id="pressing"
            type="text"
            value={pressingNote}
            onChange={(e) => setPressingNote(e.target.value)}
            placeholder="e.g., Original 1970, Reissue"
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price ($)</label>
          <input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="vinyl">Vinyl Grade</label>
          <select
            id="vinyl"
            value={vinylGrade}
            onChange={(e) => setVinylGrade(e.target.value)}
          >
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="sleeve">Sleeve Grade</label>
          <select
            id="sleeve"
            value={sleeveGrade}
            onChange={(e) => setSleeveGrade(e.target.value)}
          >
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="songs">Standout Songs (one per line)</label>
        <textarea
          id="songs"
          value={standoutSongs}
          onChange={(e) => setStandoutSongs(e.target.value)}
          placeholder="Track names you want to highlight..."
          rows="3"
        />
      </div>

      <button className="btn-primary" onClick={generateListing}>
        Generate Listing
      </button>

      {title && (
        <>
          <div className="results-section">
            <h3>Marketplace Title</h3>
            <div className="result-box">
              <p className="result-text">{title}</p>
              <button
                className="btn-copy-large"
                onClick={() => copyToClipboard(title, 'Title')}
              >
                📋 Copy Title
              </button>
            </div>
          </div>

          <div className="results-section">
            <h3>Listing Description</h3>
            <div className="result-box">
              <pre className="result-text">{listingText}</pre>
              <button
                className="btn-copy-large"
                onClick={() => copyToClipboard(listingText, 'Listing')}
              >
                📋 Copy Listing
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ListingHelper
