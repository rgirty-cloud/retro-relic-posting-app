import { useState } from 'react'
import './App.css'
import DeadwaxHelper from './components/DeadwaxHelper'
import ListingHelper from './components/ListingHelper'
import Inventory from './components/Inventory'

function App() {
  const [activeTab, setActiveTab] = useState('deadwax')
  const [manualAiNotes, setManualAiNotes] = useState('')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Retro Relic Posting App</h1>
        <p className="subtitle">Your vinyl record listing assistant</p>
      </header>

      <nav className="tabs">
        <button
          className={`tab-button ${activeTab === 'deadwax' ? 'active' : ''}`}
          onClick={() => setActiveTab('deadwax')}
        >
          Deadwax Helper
        </button>
        <button
          className={`tab-button ${activeTab === 'listing' ? 'active' : ''}`}
          onClick={() => setActiveTab('listing')}
        >
          Listing Helper
        </button>
        <button
          className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'deadwax' && (
          <DeadwaxHelper
            manualAiNotes={manualAiNotes}
            setManualAiNotes={setManualAiNotes}
          />
        )}
        {activeTab === 'listing' && (
          <ListingHelper manualAiNotes={manualAiNotes} />
        )}
        {activeTab === 'inventory' && <Inventory />}
      </main>
    </div>
  )
}

export default App
