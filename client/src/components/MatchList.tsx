import React, { useMemo, useState } from 'react'
import type { Match } from '../App'

export default function MatchList({ matches, onUpdate, onDelete }: {
  matches: Match[]
  onUpdate: (id: number, patch: Partial<Pick<Match, 'team1' | 'team2' | 'score'>>) => void | Promise<void>
  onDelete: (id: number) => void | Promise<void>
}) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const editing = useMemo(() => matches.find(m => m.id === editingId) ?? null, [editingId, matches])
  const [form, setForm] = useState({ team1: '', team2: '', score: '' })

  const startEdit = (m: Match) => {
    setEditingId(m.id)
    setForm({ team1: m.team1, team2: m.team2, score: m.score })
  }
  const cancel = () => {
    setEditingId(null)
  }
  const save = async () => {
    if (!editing) return
    await onUpdate(editing.id, form)
    setEditingId(null)
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {matches.length === 0 && <div style={{ color: '#666' }}>No matches yet</div>}
      {matches.map(m => (
        <div key={m.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {editingId === m.id ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input value={form.team1} onChange={e => setForm(f => ({ ...f, team1: e.target.value }))} placeholder="Team 1" />
              <span>vs</span>
              <input value={form.team2} onChange={e => setForm(f => ({ ...f, team2: e.target.value }))} placeholder="Team 2" />
              <input
                value={form.score}
                onChange={e => {
                  const raw = e.target.value
                  // Allow digits, spaces, ':' only
                  const cleaned = raw.replace(/[^0-9:\s]/g, '')
                  setForm(f => ({ ...f, score: cleaned }))
                }}
                placeholder="Score e.g. 1 : 0"
                pattern="^\d+\s*:\s*\d+$"
                title="Format: number : number (e.g. 2 : 1)"
              />
            </div>
          ) : (
            <div style={{ fontSize: 18 }}>
              <strong>{m.team1}</strong> vs <strong>{m.team2}</strong>
              <span style={{ marginLeft: 12, color: '#0a7' }}>{m.score}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            {editingId === m.id ? (
              <>
                <button onClick={save}>Save</button>
                <button onClick={cancel}>Cancel</button>
              </>
            ) : (
              <>
                <button onClick={() => startEdit(m)}>Edit</button>
                <button onClick={() => onDelete(m.id)} style={{ color: '#c00' }}>Delete</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
