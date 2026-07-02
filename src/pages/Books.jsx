import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGenres } from '../hooks/useGenres'
import { useBooks } from '../hooks/useBooks'
import { useSeries } from '../hooks/useSeries'
import GenreGrid from '../components/GenreGrid'
import BookCard from '../components/BookCard'
import { SkeletonBookCard } from '../components/Skeleton'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: 'easeOut', delay: i * 0.1 },
  }),
}

const staggerGrid = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardItem = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function Books() {
  const { genres, loading: gLoading } = useGenres()
  const { books, loading: bLoading }  = useBooks()
  const { series }                    = useSeries()

  const featuredBooks = useMemo(() => {
    const arr = [...books.filter(b => b.featured)]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [books])

  const seriesById = Object.fromEntries(series.map(s => [s.id, s]))

  function seriesLabel(book) {
    if (!book.series) return null
    const s = seriesById[book.series]
    if (!s) return null
    return s.name + (book.seriesOrder != null ? ` · #${book.seriesOrder}` : '')
  }

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <div className="bg-deep-space-blue px-6 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <p className="text-xs tracking-[0.2em] uppercase text-blood-red mb-6 font-medium">The Collection</p>
            <div className="w-12 h-px bg-blood-red mb-6" />
            <h1 className="text-title text-mint-cream">Books</h1>
          </motion.div>
        </div>
      </div>

      {/* ── Featured Books ──────────────────────────────────────── */}
      <section className="bg-mint-cream px-6 pt-14 md:pt-24 pb-0 md:pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible"
            className="mb-14"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-blood-red mb-4 font-medium">Featured</p>
            <div className="w-12 h-px bg-blood-red mb-6" />
            <div className="flex items-end justify-between">
              <h2 className="text-subtitle text-deep-space-blue">Featured Titles</h2>
            </div>
          </motion.div>

          {bLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonBookCard key={i} />)}
            </div>
          ) : featuredBooks.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
              variants={staggerGrid} initial="hidden" whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              {featuredBooks.map(book => (
                <motion.div key={book.id} variants={cardItem} className="h-full">
                  <BookCard book={book} seriesLabel={seriesLabel(book)} />
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </div>
      </section>

      {/* ── Browse by Genre ─────────────────────────────────────── */}
      <div className="bg-mint-cream px-6 pt-6 md:pt-16 pb-0 sm:pb-16 md:pb-24 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="mb-10 md:mb-14"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-blood-red mb-4 font-medium">Explore</p>
            <div className="w-12 h-px bg-blood-red mb-6" />
            <h2 className="text-subtitle text-deep-space-blue">Browse by Genre</h2>
          </motion.div>

          {gLoading || bLoading ? (
            <div className="grid sm:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-52 bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="-mx-6 sm:mx-0">
              <GenreGrid genres={genres} books={books} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
