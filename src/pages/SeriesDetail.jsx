import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useBooks } from '../hooks/useBooks'
import { useSeries } from '../hooks/useSeries'
import { useGenres } from '../hooks/useGenres'
import BookCard from '../components/BookCard'
import Breadcrumb from '../components/Breadcrumb'
import { SkeletonBookCard } from '../components/Skeleton'
import { bookCountLabel } from '../lib/pluralize'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export default function SeriesDetail() {
  const { genre: genreSlug, seriesId } = useParams()
  const { books, loading: bLoading } = useBooks()
  const { series, loading: sLoading } = useSeries()
  const { genres, loading: gLoading } = useGenres()

  const loading = bLoading || sLoading || gLoading

  const seriesInfo = series.find(s => s.id === seriesId)
  const genre = genres.find(g => g.slug === genreSlug)

  const seriesBooks = books
    .filter(b => b.series === seriesId)
    .sort((a, b) => (a.seriesOrder ?? 999) - (b.seriesOrder ?? 999))

  if (!loading && !seriesInfo) {
    return (
      <div className="px-6 py-12 md:py-20 max-w-6xl mx-auto">
        <p className="text-onyx text-lg mb-4">Series not found.</p>
        <Link to={`/books/${genreSlug}`} className="text-blood-red hover:underline text-base">
          ← Back to {genre?.name ?? 'Books'}
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Series hero band — bleeds under transparent nav */}
      <div className="bg-deep-space-blue px-6 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb
            dark
            items={[
              { label: 'Books', to: '/books' },
              { label: genre?.name, to: `/books/${genreSlug}` },
              { label: seriesInfo?.name },
            ]}
          />
          <p className="text-xs tracking-[0.2em] uppercase text-blood-red mb-4 font-medium">Series</p>
          <h1 className="text-title text-mint-cream mb-3">
            {loading ? '…' : seriesInfo?.name}
          </h1>
          {!loading && seriesBooks.length > 0 && (
            <p className="text-mint-cream/70 text-base">
              {bookCountLabel(seriesBooks.length)}
            </p>
          )}
        </div>
      </div>

      {/* Bookshelf grid */}
      <div className="px-6 py-12 md:py-20 max-w-6xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonBookCard key={i} />)}
          </div>
        ) : seriesBooks.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {seriesBooks.map(book => (
              <motion.div key={book.id} variants={cardItem} className="h-full">
                <div className="relative h-full">
                  {book.seriesOrder != null && (
                    <span className="absolute -top-2 -left-2 z-10 bg-blood-red text-mint-cream text-xs px-2 py-0.5 tracking-wide">
                      Book {book.seriesOrder}
                    </span>
                  )}
                  <BookCard
                    book={book}
                    seriesLabel={seriesInfo ? seriesInfo.name + (book.seriesOrder != null ? ` · #${book.seriesOrder}` : '') : null}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-gray-600 text-base">No books in this series yet.</p>
        )}
      </div>
    </>
  )
}
