import React, { useEffect, useMemo, useState } from 'react'
import MatchList from './components/MatchList'
import AdminPanel from './components/AdminPanel'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
const ROLE = import.meta.env.VITE_ROLE || 'user'

export type Match = {
  id: number
  team1: string
  team2: string
  score: string
}

export default function App() {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = useMemo(() => matches.find(m => m.id === selectedId) || null, [selectedId, matches])
  const eventsUrl = useMemo(() => `${SERVER_URL}/events`, [])

  useEffect(() => {
    // Initial fetch
    fetch(`${SERVER_URL}/matches`).then(r => r.json()).then(setMatches).catch(console.error)

    // SSE stream
    const es = new EventSource(eventsUrl)
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as Match[]
        setMatches(data)
      } catch (err) {
        console.error('Bad SSE payload', err)
      }
    }
    es.onerror = () => {
      // silently handled; browser will reconnect
    }
    return () => es.close()
  }, [eventsUrl])

  const addMatch = async (team1: string, team2: string) => {
    const res = await fetch(`${SERVER_URL}/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': import.meta.env.VITE_ADMIN_TOKEN || '' },
      body: JSON.stringify({ team1, team2 })
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `Create failed (${res.status})`)
    }
  }

  const updateMatch = async (id: number, patch: Partial<Pick<Match, 'team1' | 'team2' | 'score'>>) => {
    const res = await fetch(`${SERVER_URL}/matches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': import.meta.env.VITE_ADMIN_TOKEN || '' },
      body: JSON.stringify(patch)
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `Update failed (${res.status})`)
    }
  }

  const deleteMatch = async (id: number) => {
    const res = await fetch(`${SERVER_URL}/matches/${id}`, { method: 'DELETE', headers: { 'x-admin-token': import.meta.env.VITE_ADMIN_TOKEN || '' } })
    if (!res.ok && res.status !== 204) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `Delete failed (${res.status})`)
    }
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      maxWidth: 1100, margin: '0 auto', padding: 24
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Football Live Scores</h1>
        <span style={{ color: '#666' }}>Server: {SERVER_URL} · Role: {ROLE}</span>
      </header>

      {ROLE === 'admin' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          <section>
            <h2>Matches</h2>
            <MatchList matches={matches} onUpdate={updateMatch} onDelete={deleteMatch} />
          </section>
          <aside>
            <h2>Admin</h2>
            <AdminPanel onCreate={addMatch} />
          </aside>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
          <section>
            <h2>Matches</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {matches.map(m => (
                <button key={m.id} onClick={() => setSelectedId(m.id)} style={{
                  textAlign: 'left', padding: '12px 16px', borderRadius: 8, border: selectedId === m.id ? '2px solid #0a7' : '1px solid #ccc', background: selectedId === m.id ? '#f5fffa' : '#fff', cursor: 'pointer'
                }}>
                  <strong>{m.team1}</strong> vs <strong>{m.team2}</strong>
                </button>
              ))}
              {matches.length === 0 && <div style={{ color: '#666' }}>No matches yet</div>}
            </div>
          </section>
          <aside>
            <h2>Selected Match</h2>
            {selected ? (
              <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
                <h3 style={{ marginTop: 0 }}>{selected.team1} vs {selected.team2}</h3>
                <div style={{ fontSize: 32, fontWeight: 600, color: '#0a7' }}>{selected.score}</div>
                <p style={{ color: '#666' }}>Live updates via SSE.</p>
                <button onClick={() => setSelectedId(null)}>Clear</button>
              </div>
            ) : <p style={{ color: '#666' }}>Select a match to view its live score.</p>}
          </aside>
        </div>
      )}
    </div>
  )
}
