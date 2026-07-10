import { useState } from 'react'
import { doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useGenres } from '../../hooks/useGenres'
import { useTheme } from '../../hooks/useTheme'
import { useTypes } from '../../hooks/useTypes'
import MarkdownBadge, { MARKDOWN_HINT } from '../components/MarkdownBadge'
import ConfirmDialog from '../components/ConfirmDialog'

const COLOR_KEYS = ['deepSpaceBlue', 'regalNavy', 'mintCream', 'onyx', 'bloodRed']
// Role-based labels, not the current default color names — see matching note in AdminTheme.jsx.
const COLOR_LABELS = {
  deepSpaceBlue: 'Primary',
  regalNavy:     'Secondary',
  mintCream:     'Page Background',
  onyx:          'Text',
  bloodRed:      'Accent',
}
const SITE_DEFAULTS = {
  deepSpaceBlue: '#002B4C',
  regalNavy:     '#003A67',
  mintCream:     '#F1F9F7',
  onyx:          '#0A0C08',
  bloodRed:      '#900101',
}

function toSlug(name) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function AdminGenres() {
  const { genres, loading } = useGenres()
  const { theme } = useTheme()

  const [editing, setEditing]        = useState(null)
  const [form, setForm]              = useState({})
  const [useCustomColors, setCustom] = useState(false)
  const [saving, setSaving]          = useState(false)

  const [newName, setNewName]        = useState('')
  const [adding, setAdding]          = useState(false)

  const { types, loading: typesLoading } = useTypes()
  const [newTypeName, setNewTypeName] = useState('')
  const [addingType, setAddingType]   = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [editTypeName, setEditTypeName] = useState('')
  const [savingType, setSavingType]   = useState(false)

  const [pendingDelete, setPendingDelete] = useState(null)

  function startEdit(genre) {
    const hasColors = genre.colors && Object.keys(genre.colors).length > 0
    setEditing(genre.id)
    setForm({
      bio:    genre.bio ?? '',
      colors: genre.colors ?? { ...(theme ?? SITE_DEFAULTS) },
    })
    setCustom(hasColors)
  }

  async function saveEdit() {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'genres', editing), {
        bio:    form.bio,
        colors: useCustomColors ? form.colors : null,
      })
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  async function addGenre(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    const slug = toSlug(name)
    setAdding(true)
    try {
      await setDoc(doc(db, 'genres', slug), { name, slug, bio: '', colors: null })
      setNewName('')
    } finally {
      setAdding(false)
    }
  }

  async function deleteGenre() {
    const { id } = pendingDelete
    await deleteDoc(doc(db, 'genres', id))
    if (editing === id) setEditing(null)
    setPendingDelete(null)
  }

  async function addType(e) {
    e.preventDefault()
    const name = newTypeName.trim()
    if (!name) return
    const slug = toSlug(name)
    setAddingType(true)
    try {
      await setDoc(doc(db, 'types', slug), { name })
      setNewTypeName('')
    } finally {
      setAddingType(false)
    }
  }

  async function deleteType() {
    await deleteDoc(doc(db, 'types', pendingDelete.id))
    setPendingDelete(null)
  }

  function startEditType(type) {
    setEditingType(type.id)
    setEditTypeName(type.name)
  }

  function cancelEditType() {
    setEditingType(null)
    setEditTypeName('')
  }

  async function saveEditType(id) {
    const name = editTypeName.trim()
    if (!name) return
    setSavingType(true)
    try {
      await updateDoc(doc(db, 'types', id), { name })
      setEditingType(null)
      setEditTypeName('')
    } finally {
      setSavingType(false)
    }
  }

  function setColor(key, val) {
    setForm(f => ({ ...f, colors: { ...f.colors, [key]: val } }))
  }

  if (loading || typesLoading) return <div className="text-gray-400">Loading…</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-deep-space-blue mb-8">Genres</h1>

      <div className="flex flex-wrap gap-8 items-start">
      <div className="flex-1 min-w-[320px]">
      <div className="space-y-4 mb-10">
        {genres.map(genre => (
          <div key={genre.id} className="bg-white rounded border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-onyx">{genre.name}</p>
                <p className="text-xs text-gray-400">{genre.slug}</p>
              </div>
              <div className="flex items-center gap-4">
                {editing === genre.id ? (
                  <>
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="text-sm text-deep-space-blue font-medium hover:underline disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(null)} className="text-sm text-gray-400 hover:text-onyx">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(genre)} className="text-sm text-deep-space-blue hover:underline">
                      Edit
                    </button>
                    <button
                      onClick={() => setPendingDelete({ kind: 'genre', id: genre.id, name: genre.name })}
                      className="text-sm text-blood-red hover:underline"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {editing === genre.id && (
              <div className="mt-4 pt-4 border-t space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-onyx flex items-center gap-2">
                    Genre Bio
                    <MarkdownBadge />
                  </span>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    rows={4}
                    className="mt-1 block w-full border rounded px-3 py-2 text-sm resize-y"
                    placeholder="Bio shown on the genre's About page…"
                  />
                  <p className="text-xs text-gray-400 mt-1">{MARKDOWN_HINT}</p>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomColors}
                    onChange={e => setCustom(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-onyx">Use custom colors for this genre</span>
                </label>

                {useCustomColors && (
                  <div className="grid grid-cols-2 gap-3 pl-6">
                    {COLOR_KEYS.map(key => (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form.colors?.[key] ?? SITE_DEFAULTS[key]}
                          onChange={e => setColor(key, e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border"
                        />
                        <span className="text-sm text-gray-600">{COLOR_LABELS[key]}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add genre */}
      <div className="border-t pt-8">
        <h2 className="text-sm font-semibold text-onyx mb-3">Add Genre</h2>
        <form onSubmit={addGenre} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Genre name"
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          {newName.trim() && (
            <span className="self-center text-xs text-gray-400 font-mono">
              /{toSlug(newName.trim())}
            </span>
          )}
          <button
            type="submit"
            disabled={!newName.trim() || adding}
            className="bg-deep-space-blue text-mint-cream px-4 py-2 rounded text-sm font-medium disabled:opacity-40 hover:bg-regal-navy transition-colors"
          >
            {adding ? 'Adding…' : 'Add'}
          </button>
        </form>
      </div>
      </div>

      <div className="flex-1 min-w-[280px]">
        <h2 className="text-sm font-semibold text-onyx uppercase tracking-wide mb-3">Types</h2>
        <div className="bg-white rounded border divide-y mb-6">
          {types.map(type => (
            <div key={type.id} className="flex items-center justify-between px-4 py-3 gap-3">
              {editingType === type.id ? (
                <>
                  <input
                    type="text"
                    value={editTypeName}
                    onChange={e => setEditTypeName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveEditType(type.id)
                      if (e.key === 'Escape') cancelEditType()
                    }}
                    className="flex-1 border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-deep-space-blue"
                    autoFocus
                  />
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => saveEditType(type.id)}
                      disabled={savingType || !editTypeName.trim()}
                      className="text-sm text-deep-space-blue hover:underline disabled:opacity-40"
                    >
                      Save
                    </button>
                    <button onClick={cancelEditType} className="text-sm text-gray-400 hover:underline">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-onyx">{type.name}</p>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => startEditType(type)}
                      className="text-sm text-deep-space-blue hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setPendingDelete({ kind: 'type', id: type.id, name: type.name })}
                      className="text-sm text-blood-red hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {types.length === 0 && (
            <p className="text-sm text-gray-400 px-4 py-6">No types yet.</p>
          )}
        </div>

        <form onSubmit={addType} className="flex gap-3">
          <input
            type="text"
            value={newTypeName}
            onChange={e => setNewTypeName(e.target.value)}
            placeholder="Type name"
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={!newTypeName.trim() || addingType}
            className="bg-deep-space-blue text-mint-cream px-4 py-2 rounded text-sm font-medium disabled:opacity-40 hover:bg-regal-navy transition-colors"
          >
            {addingType ? 'Adding…' : 'Add'}
          </button>
        </form>
      </div>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        message={
          pendingDelete?.kind === 'type'
            ? `Delete "${pendingDelete?.name}"? Books using this type will keep it, but it won't appear as an option anymore.`
            : `Delete "${pendingDelete?.name}"? This won't delete books in the genre.`
        }
        onConfirm={pendingDelete?.kind === 'type' ? deleteType : deleteGenre}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
