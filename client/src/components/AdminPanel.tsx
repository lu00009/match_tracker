import React, { useState } from 'react'

export default function AdminPanel({ onCreate }: {
  onCreate: (team1: string, team2: string) => void | Promise<void>
}) {
  const [team1, setTeam1] = useState('')
  const [team2, setTeam2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDone(false)
    if (!team1 || !team2) {
      setError('Both team names required')
      return
    }
    try {
      setLoading(true)
      await onCreate(team1, team2)
      setTeam1('')
      setTeam2('')
      setDone(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to create match')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
      <input value={team1} onChange={e => setTeam1(e.target.value)} placeholder="Team 1" disabled={loading} />
      <input value={team2} onChange={e => setTeam2(e.target.value)} placeholder="Team 2" disabled={loading} />
      <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Match'}</button>
      {error && <p style={{ color: '#c00', margin: 0 }}>{error}</p>}
      {done && !error && <p style={{ color: '#0a7', margin: 0 }}>Match added.</p>}
      <p style={{ color: '#666', margin: 0, fontSize: 12 }}>Tip: live list updates via SSE.</p>
    </form>
  )
}
