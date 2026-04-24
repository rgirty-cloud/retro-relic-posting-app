import { supabase } from '../supabase'
import { useState, useEffect } from 'react'

function Inventory() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchRecords = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .order('date_added', { ascending: false })

    if (error) {
      console.error('Error fetching records:', error)
    } else {
      setRecords(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleMarkSold = async (id) => {
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('records')
      .update({ status: 'sold', date_sold: today })
      .eq('id', id)

    if (error) {
      console.error('Error updating record:', error)
      alert('Error marking record as sold')
    } else {
      fetchRecords()
    }
  }

  const handleMarkInStock = async (id) => {
    const { error } = await supabase
      .from('records')
      .update({ status: 'in_stock', date_sold: null })
      .eq('id', id)

    if (error) {
      console.error('Error updating record:', error)
      alert('Error marking record as in stock')
    } else {
      fetchRecords()
    }
  }

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      searchQuery === '' ||
      (record.artist && record.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.album && record.album.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus =
      statusFilter === 'all' ||
      record.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPrice = (price) => {
    if (!price) return '-'
    return `$${parseFloat(price).toFixed(2)}`
  }

  return (
    <div className="helper-section">
      <h2>Inventory</h2>
      <p className="helper-description">
        View and manage your record collection.
      </p>

      <div className="inventory-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by artist or album..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${statusFilter === 'in_stock' ? 'active' : ''}`}
            onClick={() => setStatusFilter('in_stock')}
          >
            In Stock
          </button>
          <button
            className={`filter-btn ${statusFilter === 'sold' ? 'active' : ''}`}
            onClick={() => setStatusFilter('sold')}
          >
            Sold
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading records...</div>
      ) : filteredRecords.length === 0 ? (
        <div className="empty-state">
          {searchQuery || statusFilter !== 'all'
            ? 'No records match your search criteria.'
            : 'No records found. Add some records from the Deadwax Helper!'}
        </div>
      ) : (
        <div className="records-grid">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className={`record-card ${record.status === 'sold' ? 'sold' : ''}`}
            >
              <div className="record-header">
                <h3>{record.album || 'Untitled Album'}</h3>
                <span className={`status-badge ${record.status}`}>
                  {record.status === 'in_stock' ? 'In Stock' : 'Sold'}
                </span>
              </div>

              <p className="record-artist">{record.artist || 'Unknown Artist'}</p>

              <div className="record-details">
                <div className="detail-row">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value">{formatPrice(record.price)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Added:</span>
                  <span className="detail-value">{formatDate(record.date_added)}</span>
                </div>
                {record.date_sold && (
                  <div className="detail-row">
                    <span className="detail-label">Sold:</span>
                    <span className="detail-value">{formatDate(record.date_sold)}</span>
                  </div>
                )}
              </div>

              {(record.side_a_deadwax || record.side_b_deadwax) && (
                <div className="deadwax-section">
                  <h4>Deadwax</h4>
                  {record.side_a_deadwax && (
                    <div className="deadwax-side">
                      <span className="side-label">A:</span>
                      <span className="deadwax-text">{record.side_a_deadwax}</span>
                    </div>
                  )}
                  {record.side_b_deadwax && (
                    <div className="deadwax-side">
                      <span className="side-label">B:</span>
                      <span className="deadwax-text">{record.side_b_deadwax}</span>
                    </div>
                  )}
                  {record.side_c_deadwax && (
                    <div className="deadwax-side">
                      <span className="side-label">C:</span>
                      <span className="deadwax-text">{record.side_c_deadwax}</span>
                    </div>
                  )}
                  {record.side_d_deadwax && (
                    <div className="deadwax-side">
                      <span className="side-label">D:</span>
                      <span className="deadwax-text">{record.side_d_deadwax}</span>
                    </div>
                  )}
                </div>
              )}

              {record.extra_clues && (
                <div className="extra-clues-section">
                  <h4>Extra Clues</h4>
                  <p>{record.extra_clues}</p>
                </div>
              )}

              <div className="record-actions">
                {record.status === 'in_stock' ? (
                  <button
                    className="btn-action sold"
                    onClick={() => handleMarkSold(record.id)}
                  >
                    Mark Sold
                  </button>
                ) : (
                  <button
                    className="btn-action restock"
                    onClick={() => handleMarkInStock(record.id)}
                  >
                    Mark In Stock
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Inventory