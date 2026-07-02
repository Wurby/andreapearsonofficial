import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../lib/firebase'
import { useGenres } from '../../hooks/useGenres'
import { useSeries } from '../../hooks/useSeries'
import { useTypes } from '../../hooks/useTypes'

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const EMPTY_FORM = {
  title: '',
  genre: 'fantasy',
  series: '',
  seriesOrder: '',
  type: 'novel',
  books2ReadLink: '',
  freeViaNewsletter: false,
  newsletterLink: '',
  description: '',
  coverUrl: '',
  featured: false,
}

export default function AdminBookForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const { genres } = useGenres()
  const { series } = useSeries()
  const { types } = useTypes()

  const [form, setForm] = useState(EMPTY_FORM)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [addingGenre, setAddingGenre] = useState(false)
  const [newGenreName, setNewGenreName] = useState('')
  const [addingType, setAddingType] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')

  useEffect(() => {
    if (!isEdit) return
    getDoc(doc(db, 'books', id)).then(snap => {
      if (!snap.exists()) return
      const d = snap.data()
      setForm({
        title:          d.title          ?? '',
        genre:          d.genre          ?? 'fantasy',
        series:         d.series         ?? '',
        seriesOrder:    d.seriesOrder    ?? '',
        type:           d.type           ?? 'novel',
        books2ReadLink:    d.books2ReadLink    ?? '',
        freeViaNewsletter: d.freeViaNewsletter ?? false,
        newsletterLink:    d.newsletterLink    ?? '',
        description:       d.description       ?? '',
        coverUrl:       d.coverUrl       ?? '',
        featured:       d.featured       ?? false,
      })
    })
  }, [id, isEdit])

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleAddGenre(e) {
    e.preventDefault()
    const name = newGenreName.trim()
    if (!name) return
    const slug = toSlug(name)
    await setDoc(doc(db, 'genres', slug), { name, slug, bio: '', colors: null })
    setForm(f => ({ ...f, genre: slug, series: '' }))
    setNewGenreName('')
    setAddingGenre(false)
  }

  async function handleAddType(e) {
    e.preventDefault()
    const name = newTypeName.trim()
    if (!name) return
    const slug = toSlug(name)
    await setDoc(doc(db, 'types', slug), { name })
    setField('type', slug)
    setNewTypeName('')
    setAddingType(false)
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required.'); return }
    setSaving(true)
    setError(null)

    try {
      const payload = {
        title:          form.title.trim(),
        genre:          form.genre,
        series:         form.series,
        seriesOrder:    form.seriesOrder !== '' ? Number(form.seriesOrder) : null,
        type:           form.type,
        books2ReadLink:    form.books2ReadLink.trim(),
        freeViaNewsletter: form.freeViaNewsletter,
        newsletterLink:    form.newsletterLink.trim(),
        description:       form.description.trim(),
        featured:          form.featured,
      }

      let docRef
      if (isEdit) {
        docRef = doc(db, 'books', id)
      } else {
        docRef = doc(collection(db, 'books'))
      }

      if (coverFile) {
        const sRef = storageRef(storage, `covers/${docRef.id}`)
        await uploadBytes(sRef, coverFile)
        payload.coverUrl = await getDownloadURL(sRef)
      }

      if (isEdit) {
        await updateDoc(docRef, payload)
      } else {
        if (!payload.coverUrl) payload.coverUrl = ''
        await setDoc(docRef, { ...payload, createdAt: serverTimestamp() })
      }

      navigate('/admin/books')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const genreSeries = series.filter(s => s.genre === form.genre)
  const previewSrc = coverPreview ?? (form.coverUrl || null)

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-deep-space-blue mb-8">
        {isEdit ? 'Edit Book' : 'Add Book'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-onyx">Title *</span>
          <input
            type="text"
            value={form.title}
            onChange={e => setField('title', e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between">
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
                  className="block w-full border rounded px-3 py-2 text-sm bg-white"
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
                value={form.genre}
                onChange={e => setForm(f => ({ ...f, genre: e.target.value, series: '' }))}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
              >
                {genres.map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
              </select>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-onyx">Type</span>
              <button
                type="button"
                onClick={() => setAddingType(a => !a)}
                className="text-xs text-deep-space-blue hover:underline"
              >
                {addingType ? 'Cancel' : '+ New'}
              </button>
            </div>
            {addingType ? (
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={newTypeName}
                  onChange={e => setNewTypeName(e.target.value)}
                  placeholder="Type name"
                  className="block w-full border rounded px-3 py-2 text-sm bg-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddType}
                  disabled={!newTypeName.trim()}
                  className="shrink-0 bg-deep-space-blue text-mint-cream px-3 py-2 rounded text-sm font-medium disabled:opacity-40 hover:bg-regal-navy transition-colors"
                >
                  Add
                </button>
              </div>
            ) : (
              <select
                value={form.type}
                onChange={e => setField('type', e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
              >
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-onyx">Series</span>
            <select
              value={form.series}
              onChange={e => setField('series', e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
            >
              <option value="">None / Standalone</option>
              {genreSeries.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>

          {form.series && (
            <label className="block">
              <span className="text-sm font-medium text-onyx">Series Order</span>
              <input
                type="number"
                value={form.seriesOrder}
                onChange={e => setField('seriesOrder', e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
                min="1"
                placeholder="1"
              />
            </label>
          )}
        </div>

        <div className="border rounded p-4 space-y-3">
          <span className="text-sm font-semibold text-onyx block">Availability</span>
          <label className="block">
            <span className="text-sm font-medium text-onyx">Buy / Read link</span>
            <input
              type="url"
              value={form.books2ReadLink}
              onChange={e => setField('books2ReadLink', e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
              placeholder="https://books2read.com/…"
            />
            <span className="text-xs text-gray-400 mt-0.5 block">Shows a "Buy / Read" button on the book card.</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.freeViaNewsletter}
              onChange={e => setField('freeViaNewsletter', e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-deep-space-blue"
            />
            <span className="text-sm font-medium text-onyx">
              Free via newsletter
              <span className="block text-xs font-normal text-gray-400">Shows a "Get for free here →" button on the book card.</span>
            </span>
          </label>
          {form.freeViaNewsletter && (
            <label className="block pl-7">
              <span className="text-sm font-medium text-onyx">Link URL</span>
              <input
                type="url"
                value={form.newsletterLink}
                onChange={e => setField('newsletterLink', e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
                placeholder="/newsletter"
              />
              <span className="text-xs text-gray-400 mt-0.5 block">Leave blank to link to the site newsletter page.</span>
            </label>
          )}
        </div>

        <label className="block">
          <span className="text-sm font-medium text-onyx">Description</span>
          <textarea
            value={form.description}
            onChange={e => setField('description', e.target.value)}
            rows={6}
            className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white resize-y"
          />
        </label>

        <div>
          <span className="text-sm font-medium text-onyx block mb-2">Cover Image</span>
          <div className="flex items-start gap-4">
            {previewSrc && (
              <img src={previewSrc} alt="cover" className="w-16 h-24 object-cover rounded border" />
            )}
            <div>
              <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
              {!coverFile && form.coverUrl && (
                <p className="text-xs text-gray-400 mt-1">Current cover kept unless a new file is selected.</p>
              )}
            </div>
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={e => setField('featured', e.target.checked)}
            className="w-4 h-4 accent-deep-space-blue"
          />
          <span className="text-sm font-medium text-onyx">Featured on homepage</span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-deep-space-blue text-mint-cream px-5 py-2 rounded text-sm font-medium hover:bg-regal-navy transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Book'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/books')}
            className="text-sm text-gray-500 hover:text-onyx"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
