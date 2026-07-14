import { useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useBooks } from '../../hooks/useBooks'
import { useGenres } from '../../hooks/useGenres'
import { useSeries } from '../../hooks/useSeries'
import { useSessionState } from '../../hooks/useSessionState'
import ConfirmDialog from '../components/ConfirmDialog'

const NO_SERIES = '__none__'
const SELECT_CLASS = 'border rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-deep-space-blue focus-visible:ring-2 focus-visible:ring-deep-space-blue hover:border-gray-400 transition-colors'

const SORT_COLUMNS = [
  { key: 'title',  label: 'Title' },
  { key: 'genre',  label: 'Genre' },
  { key: 'series', label: 'Series' },
  { key: 'type',   label: 'Type' },
]

export default function AdminBooks() {
  const { books, loading } = useBooks()
  const { genres } = useGenres()
  const { series } = useSeries()
  const [filterGenre, setFilterGenre]     = useSessionState('adminBooks.filterGenre', '')
  const [filterSeries, setFilterSeries]   = useSessionState('adminBooks.filterSeries', '')
  const [filterFeatured, setFilterFeatured] = useSessionState('adminBooks.filterFeatured', false)
  const [filterComingSoon, setFilterComingSoon] = useSessionState('adminBooks.filterComingSoon', false)
  const [sortKey, setSortKey] = useSessionState('adminBooks.sortKey', 'title')
  const [sortDir, setSortDir] = useSessionState('adminBooks.sortDir', 'asc')
  const [pendingDelete, setPendingDelete] = useState(null)

  async function handleDelete() {
    await deleteDoc(doc(db, 'books', pendingDelete.id))
    setPendingDelete(null)
  }

  async function handleToggleFeatured(id, current) {
    await updateDoc(doc(db, 'books', id), { featured: !current })
  }

  function toggleSort(key) {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  if (loading) return <div className="text-gray-400">Loading…</div>

  const genreName  = slug => genres.find(g => g.slug === slug)?.name ?? slug
  const seriesName = id   => series.find(s => s.id === id)?.name ?? '—'

  const availableSeries = series.filter(s => !filterGenre || s.genre === filterGenre)

  const filtered = books
    .filter(b => !filterGenre   || b.genre === filterGenre)
    .filter(b => !filterSeries  || (filterSeries === NO_SERIES ? !b.series : b.series === filterSeries))
    .filter(b => !filterFeatured || b.featured)
    .filter(b => !filterComingSoon || b.comingSoon)
    .sort((a, b) => {
      let av, bv
      switch (sortKey) {
        case 'genre':  av = genreName(a.genre);           bv = genreName(b.genre);           break
        case 'series': av = a.series ? seriesName(a.series) : ''; bv = b.series ? seriesName(b.series) : ''; break
        case 'type':   av = a.type ?? '';                 bv = b.type ?? '';                 break
        default:       av = a.title;                      bv = b.title
      }
      const cmp = av.localeCompare(bv)
      return sortDir === 'asc' ? cmp : -cmp
    })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-deep-space-blue">Books</h1>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <select
          value={filterGenre}
          onChange={e => { setFilterGenre(e.target.value); if (filterSeries !== NO_SERIES) setFilterSeries('') }}
          className={SELECT_CLASS}
        >
          <option value="">All Genres</option>
          {genres.map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
        </select>
        <select
          value={filterSeries}
          onChange={e => setFilterSeries(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="">All Series</option>
          <option value={NO_SERIES}>No series assigned</option>
          {availableSeries.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-onyx cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterFeatured}
            onChange={e => setFilterFeatured(e.target.checked)}
            className="w-4 h-4 accent-deep-space-blue"
          />
          Featured only
        </label>
        <label className="flex items-center gap-2 text-sm text-onyx cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterComingSoon}
            onChange={e => setFilterComingSoon(e.target.checked)}
            className="w-4 h-4 accent-deep-space-blue"
          />
          Coming Soon only
        </label>
        {(filterGenre || filterSeries || filterFeatured || filterComingSoon) && (
          <button
            onClick={() => { setFilterGenre(''); setFilterSeries(''); setFilterFeatured(false); setFilterComingSoon(false) }}
            className="text-sm text-gray-400 hover:text-onyx px-2"
          >
            Clear
          </button>
        )}
        <Link
          to="/admin/books/new"
          className="ml-auto bg-deep-space-blue text-mint-cream px-4 py-2 rounded text-sm font-medium hover:bg-regal-navy transition-colors"
        >
          + Add Book
        </Link>
      </div>

      <div className="bg-white rounded border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-12">Cover</th>
                {SORT_COLUMNS.map(col => (
                  <th key={col.key} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="flex items-center gap-1 hover:text-onyx transition-colors"
                    >
                      {col.label}
                      <span className="text-gray-300">
                        {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </button>
                  </th>
                ))}
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-16">Featured</th>
                <th className="px-4 py-3 w-28"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(book => (
                <tr key={book.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {book.coverUrl
                      ? <img src={book.coverUrl} alt="" className="w-8 h-12 object-cover rounded" />
                      : <div className="w-8 h-12 bg-gray-100 rounded" />
                    }
                  </td>
                  <td className="px-4 py-2 font-medium text-onyx">
                    {book.title}
                    {book.comingSoon && (
                      <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-blood-red border border-blood-red/30 rounded px-1.5 py-0.5 align-middle">
                        Soon
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-500">{genreName(book.genre)}</td>
                  <td className="px-4 py-2 text-gray-500">{book.series ? seriesName(book.series) : '—'}</td>
                  <td className="px-4 py-2 text-gray-500 capitalize">{book.type}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleToggleFeatured(book.id, book.featured)}
                      aria-label={book.featured ? 'Unfeature this book' : 'Feature this book'}
                      title={book.featured ? 'Unfeature this book' : 'Feature this book'}
                      className={`text-lg leading-none transition-colors ${book.featured ? 'text-blood-red' : 'text-gray-300 hover:text-gray-400'}`}
                    >
                      {book.featured ? '★' : '☆'}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-right space-x-3 whitespace-nowrap">
                    <Link to={`/admin/books/${book.id}/edit`} className="text-deep-space-blue hover:underline">
                      Edit
                    </Link>
                    <button
                      onClick={() => setPendingDelete({ id: book.id, title: book.title })}
                      className="text-blood-red hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 px-4 py-6">No books found.</p>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-3">{filtered.length} of {books.length} books</p>

      <ConfirmDialog
        open={!!pendingDelete}
        message={`Delete "${pendingDelete?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
