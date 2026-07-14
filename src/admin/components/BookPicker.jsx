import { useState, useRef, useEffect } from 'react'

const MAX_RESULTS = 5

// Searchable book combobox — a plain <select> gets unwieldy once there are
// 75+ books, so this filters to the top 5 title matches as she types.
export default function BookPicker({ books, value, onChange, excludeIds = [], placeholder = 'Search books…' }) {
  const selected = books.find(b => b.id === value)
  const [query, setQuery] = useState(selected?.title ?? '')
  const [open, setOpen] = useState(false)
  const [prevValue, setPrevValue] = useState(value)
  const wrapperRef = useRef(null)

  // Resync display text when the *selected id* changes, adjusted during render
  // rather than via an effect — and keyed off `value` (not `books`) so a
  // Firestore refetch mid-search doesn't clobber what she's currently typing.
  if (value !== prevValue) {
    setPrevValue(value)
    setQuery(selected?.title ?? '')
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
        setQuery(selected?.title ?? '')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selected])

  const q = query.trim().toLowerCase()
  const results = books
    .filter(b => b.id === value || !excludeIds.includes(b.id))
    .filter(b => !q || b.title.toLowerCase().includes(q))
    .slice(0, MAX_RESULTS)

  function handleSelect(book) {
    onChange(book.id)
    setQuery(book.title)
    setOpen(false)
  }

  function handleClear() {
    onChange('')
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); setQuery(selected?.title ?? '') } }}
          placeholder={placeholder}
          className="block w-full border rounded px-3 py-2 pr-7 text-sm bg-white focus:outline-none focus:border-deep-space-blue focus-visible:ring-2 focus-visible:ring-deep-space-blue"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear selection"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blood-red text-sm leading-none"
          >
            ×
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <p className="text-xs text-gray-400 px-3 py-2">No books found.</p>
          ) : (
            results.map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => handleSelect(b)}
                className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  b.id === value ? 'text-deep-space-blue font-medium' : 'text-onyx'
                }`}
              >
                {b.title}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
