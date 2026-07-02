import { useState, useEffect } from 'react'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useTheme } from '../../hooks/useTheme'
import { useGenres } from '../../hooks/useGenres'

const COLOR_KEYS = ['deepSpaceBlue', 'regalNavy', 'mintCream', 'onyx', 'bloodRed']
// Role-based labels, not the current default color names — these swatches are meant to
// be repainted, so a label like "Mint Cream" would stop making sense the moment someone
// picks a color that isn't mint or cream.
const COLOR_LABELS = {
  deepSpaceBlue: 'Primary',
  regalNavy:     'Secondary',
  mintCream:     'Page Background',
  onyx:          'Text',
  bloodRed:      'Accent',
}
const DEFAULTS = {
  deepSpaceBlue: '#002B4C',
  regalNavy:     '#003A67',
  mintCream:     '#F1F9F7',
  onyx:          '#0A0C08',
  bloodRed:      '#900101',
}

export default function AdminTheme() {
  const { theme, loading } = useTheme()
  const { genres, loading: genresLoading } = useGenres()
  const [form, setForm]   = useState(DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  const [expandedGenre, setExpandedGenre]   = useState(null)
  const [genreForm, setGenreForm]           = useState({})
  const [useCustomColors, setCustom]        = useState(false)
  const [savingGenre, setSavingGenre]       = useState(false)

  useEffect(() => {
    if (theme) setForm({ ...DEFAULTS, ...theme })
  }, [theme])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await setDoc(doc(db, 'settings', 'theme'), form)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  function toggleGenre(genre) {
    if (expandedGenre === genre.id) {
      setExpandedGenre(null)
      return
    }
    const hasColors = genre.colors && Object.keys(genre.colors).length > 0
    setExpandedGenre(genre.id)
    setGenreForm(genre.colors ?? { ...(theme ?? DEFAULTS) })
    setCustom(hasColors)
  }

  function setGenreColor(key, val) {
    setGenreForm(f => ({ ...f, [key]: val }))
  }

  async function saveGenreColors() {
    setSavingGenre(true)
    try {
      await updateDoc(doc(db, 'genres', expandedGenre), {
        colors: useCustomColors ? genreForm : null,
      })
      setExpandedGenre(null)
    } finally {
      setSavingGenre(false)
    }
  }

  if (loading || genresLoading) return <div className="text-gray-400">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-deep-space-blue mb-8">Site Theme</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded border p-6 space-y-5">
        {COLOR_KEYS.map(key => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm font-medium text-onyx">{COLOR_LABELS[key]}</span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form[key] ?? DEFAULTS[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-10 h-10 rounded cursor-pointer border"
              />
              <span className="text-sm text-gray-500 font-mono w-20">{form[key]}</span>
            </div>
          </div>
        ))}
        <div className="pt-2 flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-deep-space-blue text-mint-cream px-5 py-2 rounded text-sm font-medium hover:bg-regal-navy transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Theme'}
          </button>
          {saved && <p className="text-sm text-green-600">Saved.</p>}
        </div>
      </form>
      <p className="text-xs text-gray-400 mt-4">
        These colors are the site-wide defaults. Individual genres can override them below.
      </p>

      <h2 className="text-sm font-semibold text-onyx uppercase tracking-wide mt-10 mb-3">Genre Overrides</h2>
      <div className="bg-white rounded border divide-y">
        {genres.map(genre => (
          <div key={genre.id} className="p-4">
            <button
              type="button"
              onClick={() => toggleGenre(genre)}
              className="w-full flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-sm font-medium text-onyx">{genre.name}</p>
                <p className="text-xs text-gray-400">
                  {genre.colors && Object.keys(genre.colors).length > 0 ? 'Custom colors' : 'Uses site defaults'}
                </p>
              </div>
              <span className="text-gray-300 text-sm">{expandedGenre === genre.id ? '−' : '+'}</span>
            </button>

            {expandedGenre === genre.id && (
              <div className="mt-4 pt-4 border-t space-y-4">
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
                          value={genreForm?.[key] ?? DEFAULTS[key]}
                          onChange={e => setGenreColor(key, e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border"
                        />
                        <span className="text-sm text-gray-600">{COLOR_LABELS[key]}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={saveGenreColors}
                    disabled={savingGenre}
                    className="text-sm text-deep-space-blue font-medium hover:underline disabled:opacity-50"
                  >
                    {savingGenre ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedGenre(null)}
                    className="text-sm text-gray-400 hover:text-onyx"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {genres.length === 0 && (
          <p className="text-sm text-gray-400 px-4 py-6">No genres yet.</p>
        )}
      </div>
    </div>
  )
}
