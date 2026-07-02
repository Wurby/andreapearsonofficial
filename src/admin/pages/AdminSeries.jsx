import { useState } from 'react'
import { doc, deleteDoc, setDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useSeries } from '../../hooks/useSeries'
import { useGenres } from '../../hooks/useGenres'

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

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? Books in this series won't be deleted but will lose their series assignment.`)) return
    await deleteDoc(doc(db, 'series', id))
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
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-onyx">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.id}</p>
                </div>
                <button
                  onClick={() => handleDelete(s.id, s.name)}
                  className="text-sm text-blood-red hover:underline"
                >
                  Delete
                </button>
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
    </div>
  )
}
