import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useBooks } from '../hooks/useBooks'
import { useSeries } from '../hooks/useSeries'
import { useGenres } from '../hooks/useGenres'
import { SkeletonText } from '../components/Skeleton'
import Button from '../components/Button'
import Breadcrumb from '../components/Breadcrumb'
import FadingImage from '../components/FadingImage'
import { trackEvent } from '../lib/analytics'

const TYPE_LABELS = {
  novella: 'Novella',
  'short-story': 'Short Story',
  'picture-book': 'Picture Book',
  collection: 'Collection',
}

export default function BookDetail() {
  const { genre: genreSlug, id } = useParams()
  const { books, loading: bLoading } = useBooks()
  const { series, loading: sLoading } = useSeries()
  const { genres, loading: gLoading } = useGenres()

  const loading = bLoading || sLoading || gLoading

  if (loading) {
    return (
      <div className="px-6 py-20 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-12">
          <div className="shrink-0 w-52 h-80 bg-gray-200 animate-pulse" />
          <div className="flex-1 pt-4">
            <SkeletonText lines={1} className="mb-4" />
            <div className="h-10 bg-gray-200 animate-pulse rounded w-2/3 mb-6" />
            <SkeletonText lines={6} />
          </div>
        </div>
      </div>
    )
  }

  const book = books.find(b => b.id === id)
  if (!book) {
    return (
      <div className="px-6 py-20 max-w-5xl mx-auto">
        <p className="text-onyx text-lg mb-4">Book not found.</p>
        <Link to="/books" className="text-blood-red hover:underline text-base">← Back to Books</Link>
      </div>
    )
  }

  const genre      = genres.find(g => g.slug === genreSlug)
  const seriesInfo = book.series ? series.find(s => s.id === book.series) : null

  const breadcrumbItems = [
    { label: 'Books', to: '/books' },
    { label: genre?.name, to: `/books/${genreSlug}` },
    ...(seriesInfo ? [{ label: seriesInfo.name, to: `/books/${genreSlug}/series/${book.series}` }] : []),
    { label: book.title },
  ]

  const bookMeta = (
    <>
      {seriesInfo && (
        <p className="text-base text-deep-space-blue/50 mb-2 tracking-wide">
          {seriesInfo.name}{book.seriesOrder != null ? ` · #${book.seriesOrder}` : ''}
        </p>
      )}
      <h1 className="text-title text-deep-space-blue mb-4 leading-tight">{book.title}</h1>

      {TYPE_LABELS[book.type] && (
        <span className="inline-block text-xs text-deep-space-blue/50 border border-deep-space-blue/20 px-3 py-1 mb-8 tracking-wide">
          {TYPE_LABELS[book.type]}
        </span>
      )}

      {book.description ? (
        <p className="text-body text-onyx leading-relaxed mb-10">{book.description}</p>
      ) : (
        <p className="text-gray-400 italic mb-10 text-lg">No description available.</p>
      )}

      {book.books2ReadLink ? (
        <Button
          href={book.books2ReadLink}
          onClick={() => trackEvent('book_buy_click', {
            bookId: book.id,
            bookTitle: book.title,
            genre: genreSlug,
          })}
        >
          Buy / Read →
        </Button>
      ) : (
        <p className="text-base text-gray-400">Available to members of Andrea's Readers Group.</p>
      )}
    </>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* ── Mobile layout ───────────────────────────────────────── */}
      <div className="sm:hidden">
        {/* Full-bleed cover with gradient melt */}
        <div className="relative w-full">
          {book.seriesOrder != null && (
            <span className="absolute top-3 left-3 z-10 bg-blood-red text-mint-cream text-xs px-2 py-0.5 tracking-wide">
              Book {book.seriesOrder}
            </span>
          )}
          {book.coverUrl ? (
            <FadingImage
              src={book.coverUrl}
              alt={book.title}
              className="w-full block"
              wrapperClassName="w-full"
            />
          ) : (
            <div className="w-full aspect-[2/3] bg-gray-100" />
          )}
          {/* Gradient melt — starts mid-cover, opaque by 80% */}
          <div className="absolute bottom-0 left-0 right-0 h-4/5 bg-gradient-to-b from-transparent via-[#F1F9F7]/80 to-[#F1F9F7]" />
        </div>

        {/* Text content overlapping gradient */}
        <div className="px-6 -mt-32 relative z-10">
          {bookMeta}
        </div>

        {/* Breadcrumb below content on mobile */}
        <div className="px-6 pt-6 pb-2">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* ── Desktop layout ──────────────────────────────────────── */}
      <div className="hidden sm:block px-6 py-20 max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex gap-12">
          <div className="shrink-0 relative w-[28%] min-w-[180px]">
            {book.seriesOrder != null && (
              <span className="absolute -top-2 -left-2 z-10 bg-blood-red text-mint-cream text-xs px-2 py-0.5 tracking-wide">
                Book {book.seriesOrder}
              </span>
            )}
            {book.coverUrl ? (
              <FadingImage
                src={book.coverUrl}
                alt={book.title}
                className="w-full block shadow-lg"
                wrapperClassName="w-full"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-gray-100" />
            )}
          </div>

          <div className="flex-1">
            {bookMeta}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
