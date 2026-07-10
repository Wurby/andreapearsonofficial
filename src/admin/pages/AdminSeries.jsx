import { useState } from 'react'
import { doc, deleteDoc, setDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useSeries } from '../../hooks/useSeries'
import { useGenres } from '../../hooks/useGenres'
import ConfirmDialog from '../components/ConfirmDialog'

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function AdminSeries() {
  const { series, loading } = useSeries()
  const { genres } = useGenres()
  const [newName, setNewName]   = useState('')
  const [newGenre, setNewGenre] = useState('fantasy')
  const [adding, setAdding]     = useState(false)

  const [addingGenre, setAddingGenre]   = useState(false)
  const [newGenreName, setNewGenreName] = useState('')

  const [editingId, setEditingId]   = useState(null)
  const [editName, setEditName]     = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const [pendingDelete, setPendingDelete] = useState(null)

  async function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    try {
      const slug = toSlug(newName)
      await setDoc(doc(db, 'series', slug), { name: newName.trim(), genre: newGenre })
      setNewName('')
    } finally {
      setAdding(false)
    }
  }

  async function handleAddGenre(e) {
    e.preventDefault()
    const name = newGenreName.trim()
    if (!name) return
    const slug = toSlug(name)
    await setDoc(doc(db, 'genres', slug), { name, slug, bio: '', colors: null })
    setNewGenre(slug)
    setNewGenreName('')
    setAddingGenre(false)
  }

  async function handleDelete() {
    await deleteDoc(doc(db, 'series', pendingDelete.id))
    setPendingDelete(null)
  }

  function startEdit(s) {
    setEditingId(s.id)
    setEditName(s.name)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
  }

  async function handleSaveEdit(id) {
    const name = editName.trim()
    if (!name) return
    setSavingEdit(true)
    try {
      await setDoc(doc(db, 'series', id), { name }, { merge: true })
      setEditingId(null)
      setEditName('')
    } finally {
      setSavingEdit(false)
    }
  }

  if (loading) return <div className="text-gray-400">Loading…</div>

  const grouped = {}
  genres.forEach(g => { grouped[g.slug] = [] })
  series.forEach(s => {
    if (!grouped[s.genre]) grouped[s.genre] = []
    grouped[s.genre].push(s)
  })

  const genreLabel = id => genres.find(g => g.slug === id)?.name ?? id

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-deep-space-blue mb-8">Series</h1>

      {Object.entries(grouped).filter(([, items]) => items.length > 0).map(([genreSlug, items]) => (
        <div key={genreSlug} className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {genreLabel(genreSlug)}
          </h2>
          <div className="bg-white rounded border divide-y">
            {items.map(s => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3 gap-3">
                {editingId === s.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveEdit(s.id)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      className="flex-1 border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-deep-space-blue"
                      autoFocus
                    />
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleSaveEdit(s.id)}
                        disabled={savingEdit || !editName.trim()}
                        className="text-sm text-deep-space-blue hover:underline disabled:opacity-40"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-sm text-gray-400 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-onyx">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.id}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => startEdit(s)}
                        className="text-sm text-deep-space-blue hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setPendingDelete({ id: s.id, name: s.name })}
                        className="text-sm text-blood-red hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white rounded border p-5">
        <h2 className="font-semibold text-onyx mb-4">Add Series</h2>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
          <label className="block flex-1 min-w-40">
            <span className="text-sm font-medium text-onyx">Name</span>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
              placeholder="Series name"
            />
          </label>
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-onyx">Genre</span>
              <button
                type="button"
                onClick={() => setAddingGenre(a => !a)}
                className="text-xs text-deep-space-blue hover:underline"
              >
                {addingGenre ? 'Cancel' : '+ New'}
              </button>
            </div>
            {addingGenre ? (
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={newGenreName}
                  onChange={e => setNewGenreName(e.target.value)}
                  placeholder="Genre name"
                  className="block w-full border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-deep-space-blue"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddGenre}
                  disabled={!newGenreName.trim()}
                  className="shrink-0 bg-deep-space-blue text-mint-cream px-3 py-2 rounded text-sm font-medium disabled:opacity-40 hover:bg-regal-navy transition-colors"
                >
                  Add
                </button>
              </div>
            ) : (
              <select
                value={newGenre}
                onChange={e => setNewGenre(e.target.value)}
                className="mt-1 block border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-deep-space-blue hover:border-gray-400 transition-colors"
              >
                {genres.map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
              </select>
            )}
          </div>
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="bg-deep-space-blue text-mint-cream px-4 py-2 rounded text-sm font-medium hover:bg-regal-navy transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        message={`Delete "${pendingDelete?.name}"? Books in this series won't be deleted but will lose their series assignment.`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
