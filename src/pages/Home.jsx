import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useContent } from '../hooks/useContent'
import { useBooks } from '../hooks/useBooks'
import { useGenres } from '../hooks/useGenres'
import { useSeries } from '../hooks/useSeries'
import BookCard from '../components/BookCard'
import Button from '../components/Button'
import GenreGrid from '../components/GenreGrid'
import { SkeletonBookCard, SkeletonText } from '../components/Skeleton'
import FadingImage from '../components/FadingImage'
import PodcastSection from '../components/PodcastSection'
import Markdown from '../components/Markdown'
import { stripMarkdown } from '../lib/markdown'
import { PODCAST_URL } from '../lib/links'

// Originally 420/460/395 (desktop) and 180/175/165 (mobile) — cut ~17% after
// Andrea flagged them as too large/crowding the hero text, then nudged back
// up slightly here since the first cut read a bit too small.
const SCATTER_DESKTOP = [
  { top: '2%',  left: '1%',  rotate: -15, delay: 0.55, w: 370 },
  { top: '32%', right: '1%', rotate:  10, delay: 0.70, w: 405 },
  { top: '68%', left: '8%',  rotate:   6, delay: 0.85, w: 350 },
]
const SCATTER_MOBILE = [
  { top: '2%',  left: '-12%',  rotate: -14, delay: 0.55, w: 160 },
  { top: '42%', right: '-14%', rotate:  13, delay: 0.65, w: 155 },
  { top: '65%', left: '-8%',   rotate:  -7, delay: 0.80, w: 145 },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay: i * 0.12 },
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

export default function Home() {
  const { content, loading: contentLoading } = useContent()
  const { books, loading: booksLoading } = useBooks()
  const { genres, loading: genresLoading } = useGenres()
  const { series } = useSeries()

  const featuredBooks = useMemo(() => {
    const arr = [...books.filter(b => b.featured)]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [books])

  // Hero scatter covers — hand-picked and ordered by Andrea, independent of
  // the "Featured" flag used by the Featured Titles grid below.
  // Sparse by slot index so Position 1/2/3 in admin stay put. Empty slots
  // render nothing — no ghost placeholders if Andrea only picks one (or none).
  const heroBooks = useMemo(() => {
    const ids = content?.homepageHeroes ?? []
    return ids.map(id => (id ? books.find(b => b.id === id) : null))
  }, [content, books])

  const seriesById = Object.fromEntries(series.map(s => [s.id, s]))

  function seriesLabel(book) {
    if (!book.series) return null
    const s = seriesById[book.series]
    if (!s) return null
    return s.name + (book.seriesOrder ? ` · #${book.seriesOrder}` : '')
  }

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────── */}
      {/* Short of 100svh so Featured Titles peeks above the fold (cut-off
          "Books" eyebrow + blood-red rule). min-h, not h, so short windows
          can still grow with the copy instead of clipping the CTAs. */}
      <section className="min-h-[calc(100svh-4rem)] md:min-h-[calc(100svh-6rem)] bg-deep-space-blue flex flex-col items-center justify-center text-mint-cream px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_top_right,_#F1F9F7_0%,_transparent_60%)]" />

        {/* Scrim — fades book covers behind the nav zone without moving them */}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-deep-space-blue to-transparent pointer-events-none" style={{ zIndex: 3 }} />

        {/* Radial haze — desktop: tighter ellipse, mobile: wider + stronger */}
        <div
          className="absolute inset-0 pointer-events-none hidden lg:block"
          style={{ zIndex: 4, background: 'radial-gradient(ellipse 45% 50% at 50% 50%, rgba(0,43,76,0.48) 0%, transparent 100%)' }}
        />
        <div
          className="absolute inset-0 pointer-events-none block lg:hidden backdrop-blur-xs"
          style={{ zIndex: 4, background: 'radial-gradient(ellipse 80% 55% at 50% 45%, rgba(0,43,76,0.72) 0%, transparent 100%)' }}
        />

        {/* Scattered hero book covers */}
        {!booksLoading && !contentLoading && (
          <>
            {SCATTER_DESKTOP.map((cfg, i) => {
              const book = heroBooks[i]
              if (!book?.coverUrl) return null
              return (
                <motion.div
                  key={`d-${book.id}`}
                  className="absolute hidden lg:block"
                  style={{ top: cfg.top, left: cfg.left, right: cfg.right, width: cfg.w, zIndex: 2 }}
                  initial={{ opacity: 0, y: 28, rotate: cfg.rotate }}
                  animate={{ opacity: 0.82, y: 0, rotate: cfg.rotate }}
                  transition={{ delay: cfg.delay, duration: 0.8, ease: 'easeOut' }}
                  whileHover={{ scale: 1.05, opacity: 1, transition: { duration: 0.2 } }}
                >
                  <Link to={`/books/${book.genre}/${book.id}`} className="block">
                    <FadingImage
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full block"
                      wrapperClassName="w-full"
                      shimmer="bg-white/10"
                      style={{ aspectRatio: '2/3', objectFit: 'cover', boxShadow: '6px 12px 32px rgba(0,0,0,0.5)' }}
                      loading="eager"
                    />
                  </Link>
                </motion.div>
              )
            })}

            {SCATTER_MOBILE.map((cfg, i) => {
              const book = heroBooks[i]
              if (!book?.coverUrl) return null
              return (
                <motion.div
                  key={`m-${book.id}`}
                  className="absolute block lg:hidden"
                  style={{ top: cfg.top, left: cfg.left, right: cfg.right, width: cfg.w, zIndex: 2 }}
                  initial={{ opacity: 0, y: 20, rotate: cfg.rotate }}
                  animate={{ opacity: 0.7, y: 0, rotate: cfg.rotate }}
                  transition={{ delay: cfg.delay, duration: 0.8, ease: 'easeOut' }}
                >
                  <Link to={`/books/${book.genre}/${book.id}`} className="block">
                    <FadingImage
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full block"
                      wrapperClassName="w-full"
                      shimmer="bg-white/10"
                      style={{ aspectRatio: '2/3', objectFit: 'cover', boxShadow: '4px 8px 24px rgba(0,0,0,0.5)' }}
                      loading="eager"
                    />
                  </Link>
                </motion.div>
              )
            })}
          </>
        )}

        <div className="relative z-10 text-center max-w-4xl mx-auto sm:-mt-20">
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="flex flex-col items-center gap-4 mb-8"
          >
            <img src="/logo.png" alt="Andrea Pearson" className="h-24 sm:h-48 w-auto" />
            <p className="text-xs tracking-[0.3em] uppercase text-mint-cream/70">
              andreapearsonofficial.com
            </p>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-hero text-mint-cream mb-6 leading-none"
          >
            {contentLoading ? 'Andrea Pearson' : (content?.headline || 'Andrea Pearson')}
          </motion.h1>

          {!contentLoading && content?.intro && (
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="max-w-2xl mx-auto mb-12"
            >
              <Markdown className="text-body text-mint-cream/70 leading-relaxed">{content.intro}</Markdown>
            </motion.div>
          )}

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button to="/books">Explore Books</Button>
            <Button variant="ghost" href={PODCAST_URL}>The Show</Button>
          </motion.div>
        </div>
      </section>

      {/* ── Featured Books ──────────────────────────────────────── */}
      <section className="bg-mint-cream pt-7 md:pt-14 pb-5 md:pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            className="mb-7"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-blood-red mb-4 font-medium">Books</p>
            <div className="w-12 h-px bg-blood-red mb-6" />
            <div className="flex items-end justify-between">
              <h2 className="text-subtitle text-deep-space-blue">Featured Titles</h2>
              <Link
                to="/books"
                className="text-base text-deep-space-blue/70 hover:text-blood-red transition-colors tracking-wide hidden sm:block"
              >
                View all →
              </Link>
            </div>
          </motion.div>

          {booksLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonBookCard key={i} />)}
            </div>
          ) : featuredBooks.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
              variants={staggerGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              {featuredBooks.slice(0, 6).map(book => (
                <motion.div key={book.id} variants={cardItem} className="h-full">
                  <BookCard book={book} seriesLabel={seriesLabel(book)} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-gray-400 text-base">No featured books yet — mark books as featured in the admin panel.</p>
          )}

          <div className="mt-5 sm:hidden">
            <Link to="/books" className="text-base text-deep-space-blue/70 hover:text-blood-red transition-colors">
              View all books →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Browse by Genre ─────────────────────────────────────── */}
      <section className="bg-mint-cream pt-5 md:pt-8 px-6 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            className="mb-7"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-blood-red mb-4 font-medium">Explore</p>
            <div className="w-12 h-px bg-blood-red mb-6" />
            <h2 className="text-subtitle text-deep-space-blue">Browse by Genre</h2>
          </motion.div>

          {genresLoading || booksLoading ? (
            <div className="grid sm:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 bg-deep-space-blue/10 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="-mx-6 sm:mx-0">
              <GenreGrid genres={genres} books={books} />
            </div>
          )}
        </div>
      </section>

      {/* ── Podcast ──────────────────────────────────────────────── */}
      <PodcastSection />

      {/* ── About the Author ────────────────────────────────────── */}
      <section className="bg-onyx py-7 md:py-14 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
          >
            <p className="text-xs tracking-[0.2em] uppercase text-blood-red mb-4 font-medium">About Andrea</p>

            <div className="w-12 h-px bg-blood-red mb-8" />
            {contentLoading ? (
              <SkeletonText lines={4} />
            ) : (
              <p className="text-body text-mint-cream/80 leading-relaxed mb-8">
                {content?.bioShort
                  ? <Markdown inline>{content.bioShort}</Markdown>
                  : stripMarkdown(content?.bioLong).substring(0, 300)}
              </p>
            )}
            <Link
              to="/about"
              className="text-mint-cream font-medium hover:text-blood-red transition-colors text-base tracking-wide"
            >
              Read more →
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            custom={1}
            className="flex justify-center md:justify-end"
          >
            {content?.headshotUrl ? (
              <FadingImage
                src={content.headshotUrl}
                alt="Andrea Pearson"
                className="w-full h-full object-cover object-top shadow-lg"
                wrapperClassName="w-72 h-96"
              />
            ) : (
              <div className="w-72 h-96 bg-gray-100 flex items-center justify-center text-gray-600 text-base">
                Headshot
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </>
  )
}
