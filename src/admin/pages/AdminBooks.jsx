import { useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useBooks } from '../../hooks/useBooks'
import { useGenres } from '../../hooks/useGenres'
import { useSeries } from '../../hooks/useSeries'

const NO_SERIES = '__none__'
const SELECT_CLASS = 'border rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-deep-space-blue hover:border-gray-400 transition-colors'

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
  const [filterGenre, setFilterGenre] = useState('')
  const [filterSeries, setFilterSeries] = useState('')
  const [filterFeatured, setFilterFeatured] = useState(false)
  const [sortKey, setSortKey] = useState('title')
  const [sortDir, setSortDir] = useState('asc')

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    await deleteDoc(doc(db, 'books', id))
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
        {(filterGenre || filterSeries || filterFeatured) && (
          <button
            onClick={() => { setFilterGenre(''); setFilterSeries(''); setFilterFeatured(false) }}
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
                  <td className="px-4 py-2 font-medium text-onyx">{book.title}</td>
                  <td className="px-4 py-2 text-gray-500">{genreName(book.genre)}</td>
                  <td className="px-4 py-2 text-gray-500">{book.series ? seriesName(book.series) : '—'}</td>
                  <td className="px-4 py-2 text-gray-500 capitalize">{book.type}</td>
                  <td className="px-4 py-2 text-right space-x-3 whitespace-nowrap">
                    <Link to={`/admin/books/${book.id}/edit`} className="text-deep-space-blue hover:underline">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(book.id, book.title)}
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
    </div>
  )
}
