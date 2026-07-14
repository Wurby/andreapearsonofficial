import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGenres } from '../hooks/useGenres'
import { useBooks } from '../hooks/useBooks'
import { useSeries } from '../hooks/useSeries'
import { useIsMobile } from '../hooks/useIsMobile'
import BookCard from '../components/BookCard'
import Breadcrumb from '../components/Breadcrumb'
import { SkeletonBookCard } from '../components/Skeleton'
import FadingImage from '../components/FadingImage'
import Markdown from '../components/Markdown'
import { bookCountLabel } from '../lib/pluralize'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// SeriesStack responds to "rest"/"hover" variants propagated from SeriesCard.
// coverW scales all pixel math so the stack fits correctly on any screen size.
function SeriesStack({ books, containerW, containerH, coverW = 150, isMobile = false }) {
  const [topIdx, setTopIdx] = useState(null)

  const covers = books
  const n = covers.length
  const centerI = (n - 1) / 2
  const s = coverW / 150

  const restOffset = n <= 1 ? 0 : Math.min(10 * s, 120 * s / (n - 1))
  const fanSpread  = n <= 1 ? 0 : Math.min(32 * s, 220 * s / (n - 1))
  const fanRotDeg  = n <= 1 ? 0 : Math.min(9, 54 / (n - 1))

  // Center the stack within the uniform container space (rest)
  const actualW = coverW + (n <= 1 ? 0 : (n - 1) * restOffset)
  const actualH = coverW * 1.5 + (n <= 1 ? 0 : (n - 1) * restOffset)
  const cx = Math.round((containerW - actualW) / 2)
  const cy = Math.round((containerH - actualH) / 2)

  // Center the fan — middle book sits at container center (hover)
  const fanCenterX = Math.round(containerW / 2 - coverW / 2)
  const fanMaxY = centerI * 6 * s
  const fanCenterY = Math.round((containerH - (coverW * 1.5 + fanMaxY)) / 2)

  return (
    <div
      className="relative"
      style={{ width: containerW, height: containerH, overflow: 'visible' }}
    >
      {covers.map((book, i) => (
        <motion.div
          key={book.id}
          className="absolute origin-bottom"
          variants={{
            rest: {
              x: cx + i * restOffset,
              y: cy + i * restOffset,
              rotate: 0,
              transition: { type: 'spring', stiffness: 320, damping: 24 },
            },
            hover: {
              x: Math.round(fanCenterX + (i - centerI) * fanSpread),
              y: Math.round(fanCenterY + Math.abs(i - centerI) * 6 * s),
              rotate: (i - centerI) * fanRotDeg,
              transition: { type: 'spring', stiffness: 260, damping: 18 },
            },
          }}
          onMouseEnter={isMobile ? undefined : () => setTopIdx(i)}
          onMouseLeave={isMobile ? undefined : () => setTopIdx(prev => prev === i ? null : prev)}
          style={{
            zIndex: topIdx === i ? n + 20 : n - i,
            width: coverW,
            cursor: isMobile ? 'default' : 'pointer',
            boxShadow: topIdx === i
              ? '0 12px 32px rgba(0,0,0,0.35)'
              : `${2 + i * 2}px ${2 + i * 2}px ${10 + i * 4}px rgba(0,0,0,0.2)`,
          }}
        >
          <div
            style={{
              transform: topIdx === i ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.18s ease',
              transformOrigin: 'bottom center',
            }}
          >
            {book.coverUrl ? (
              <FadingImage
                src={book.coverUrl}
                alt={book.title}
                className="w-full block"
                wrapperClassName="w-full"
                style={{ aspectRatio: '2/3', objectFit: 'cover' }}
                loading="lazy"
              />
            ) : (
              <div className="bg-gray-200" style={{ width: coverW, height: coverW * 1.5 }} />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function SeriesCard({ seriesInfo, seriesBooks, genreSlug, containerW, containerH, coverW, isMobile }) {
  if (!seriesBooks.length) return null

  return (
    <motion.div variants={item} className="h-full">
      <motion.div
        initial="rest"
        {...(!isMobile && { whileHover: 'hover' })}
        className="group h-full"
      >
        <Link to={`/books/${genreSlug}/series/${seriesInfo.id}`} className="h-full flex flex-col">
          <div className="mb-6 shrink-0">
            <SeriesStack books={seriesBooks} containerW={containerW} containerH={containerH} coverW={coverW} isMobile={isMobile} />
          </div>
          <div className="flex-1 flex flex-col" style={isMobile ? undefined : { maxWidth: containerW }}>
            <motion.h3
              className="text-booktitle mb-2"
              variants={{
                rest: { color: '#002B4C' },
                hover: { color: '#900101' },
              }}
              transition={{ duration: 0.15 }}
            >
              {seriesInfo.name}
            </motion.h3>
            <p className="text-xs text-onyx/60 mb-1">
              {bookCountLabel(seriesBooks.length)}
            </p>
            <span className="mt-auto pt-2 block text-xs py-2 px-3 bg-blood-red text-mint-cream text-center border border-transparent transition-colors group-hover:bg-blood-red/90">
              View series →
            </span>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  )
}

export default function BookGenre() {
  const { genre: genreSlug } = useParams()
  const { genres, loading: gLoading } = useGenres()
  const { books, loading: bLoading } = useBooks()
  const { series, loading: sLoading } = useSeries()
  const isMobile = useIsMobile()
  const coverW = isMobile ? 90 : 150

  const loading = gLoading || bLoading || sLoading
  const genre = genres.find(g => g.slug === genreSlug)

  if (!loading && !genre) {
    return (
      <div className="px-6 py-12 md:py-20 max-w-6xl mx-auto">
        <p className="text-onyx text-lg mb-4">Genre not found.</p>
        <Link to="/books" className="text-blood-red hover:underline text-base">← Back to Books</Link>
      </div>
    )
  }

  const genreBooks = books.filter(b => b.genre === genreSlug)
  const genreSeries = series.filter(s => s.genre === genreSlug)
  const featuredBooks = genreBooks.filter(b => b.featured)

  const seriesById = Object.fromEntries(series.map(s => [s.id, s]))
  function seriesLabel(book) {
    if (!book.series) return null
    const s = seriesById[book.series]
    if (!s) return null
    return s.name + (book.seriesOrder ? ` · #${book.seriesOrder}` : '')
  }

  // Build series map
  const seriesMap = {}
  const standalone = []
  genreBooks.forEach(book => {
    if (book.series) {
      if (!seriesMap[book.series]) seriesMap[book.series] = []
      seriesMap[book.series].push(book)
    } else {
      standalone.push(book)
    }
  })
  Object.values(seriesMap).forEach(arr =>
    arr.sort((a, b) => (a.seriesOrder ?? 999) - (b.seriesOrder ?? 999))
  )

  // Uniform container dimensions — all stacks match the largest series so titles align
  const maxN = genreSeries.reduce((max, s) => Math.max(max, (seriesMap[s.id] ?? []).length), 1)
  const sc = coverW / 150
  const maxRestOffset = maxN <= 1 ? 0 : Math.min(10 * sc, 120 * sc / (maxN - 1))
  const stackContainerW = coverW + (maxN - 1) * maxRestOffset
  const stackContainerH = coverW * 1.5 + (maxN - 1) * maxRestOffset

  return (
    <>
      {/* Genre hero band — bleeds under transparent nav, so pt-24 clears the bar */}
      <div className="bg-deep-space-blue px-6 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb
            dark
            items={[
              { label: 'Books', to: '/books' },
              { label: genre?.name },
            ]}
          />
          <p className="text-xs tracking-[0.2em] uppercase text-blood-red mb-6 font-medium">Genre</p>

          <div className="flex flex-col md:flex-row md:items-start md:gap-16">
            <div className="md:shrink-0">
              <h1 className="text-title text-mint-cream mb-4 md:mb-0">
                {loading ? '…' : genre?.name}
              </h1>
            </div>
            {!loading && (
              <div className="md:flex-1 md:pt-3 md:flex md:justify-end">
                {genre?.bio ? (
                  <Markdown className="text-body text-mint-cream/70 leading-relaxed md:text-right md:max-w-xl">
                    {genre.bio}
                  </Markdown>
                ) : (
                  <p className="text-body text-mint-cream/70 leading-relaxed md:text-right md:max-w-xl">
                    No bio yet — add one in the admin.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Series + standalone */}
      <div className="px-6 py-12 md:py-20 max-w-6xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonBookCard key={i} />)}
          </div>
        ) : (
          <>
            {/* Featured books in this genre */}
            {featuredBooks.length > 0 && (
              <section className="mb-20">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="mb-12"
                >
                  <h2 className="text-subtitle text-deep-space-blue">Featured</h2>
                  <div className="w-8 h-px bg-blood-red mt-3" />
                </motion.div>

                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                >
                  {featuredBooks.map(book => (
                    <motion.div key={book.id} variants={item} className="h-full">
                      <BookCard book={book} seriesLabel={seriesLabel(book)} />
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            )}

            {/* Series cards */}
            {genreSeries.filter(s => seriesMap[s.id]?.length).length > 0 && (
              <section className="mb-20">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="mb-12"
                >
                  <h2 className="text-subtitle text-deep-space-blue">Series</h2>
                  <div className="w-8 h-px bg-blood-red mt-3" />
                </motion.div>

                <motion.div
                  className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12 sm:gap-x-12 sm:gap-y-16"
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                >
                  {genreSeries.map(s => (
                    <SeriesCard
                      key={s.id}
                      seriesInfo={s}
                      seriesBooks={seriesMap[s.id] ?? []}
                      genreSlug={genreSlug}
                      containerW={stackContainerW}
                      containerH={stackContainerH}
                      coverW={coverW}
                      isMobile={isMobile}
                    />
                  ))}
                </motion.div>
              </section>
            )}

            {/* Standalone books */}
            {standalone.length > 0 && (
              <section>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="mb-12"
                >
                  <h2 className="text-subtitle text-deep-space-blue">Standalone Titles</h2>
                  <div className="w-8 h-px bg-blood-red mt-3" />
                </motion.div>

                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                >
                  {standalone.map(book => (
                    <motion.div key={book.id} variants={item} className="h-full">
                      <BookCard book={book} />
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            )}

            {genreBooks.length === 0 && (
              <p className="text-gray-600 text-base">No books yet.</p>
            )}
          </>
        )}
      </div>
    </>
  )
}
