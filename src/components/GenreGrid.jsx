import { useMemo, useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const item = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function CoverStrip({ strip, paused }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || strip.length === 0) return

    // Measure after layout, then hand off to CSS animation (compositor-threaded = no jitter)
    const raf = requestAnimationFrame(() => {
      const half = Math.floor(el.scrollWidth / 2)
      if (half === 0) return
      el.style.setProperty('--scroll-dist', `${half}px`)
      el.style.animation = `genre-scroll ${(half / 10).toFixed(2)}s linear infinite`
    })

    return () => {
      cancelAnimationFrame(raf)
      if (ref.current) ref.current.style.animation = ''
    }
  }, [strip])

  useEffect(() => {
    if (!ref.current) return
    ref.current.style.animationPlayState = paused ? 'paused' : 'running'
  }, [paused])

  return (
    <div ref={ref} className="flex gap-1.5 h-full items-end will-change-transform">
      {strip.map((book, i) => (
        <img
          key={`${book.id}-${i}`}
          src={book.coverUrl}
          alt=""
          aria-hidden="true"
          className="h-full w-auto flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          style={{ aspectRatio: '2/3', objectFit: 'cover' }}
        />
      ))}
    </div>
  )
}

function GenreCard({ genre, books }) {
  const count = books.length
  const [hovered, setHovered] = useState(false)

  const strip = useMemo(() => {
    const covers = shuffle(books.filter(b => b.coverUrl))
    if (covers.length === 0) return []
    // Ensure one set fills ≥960px so scrollWidth/2 is always wider than the card
    const reps = Math.max(1, Math.ceil(960 / (covers.length * 102)))
    const set = Array.from({ length: reps }).flatMap(() => covers)
    return [...set, ...set]
  }, [books])

  return (
    <Link
      to={`/books/${genre.slug}`}
      className="group block bg-deep-space-blue hover:bg-regal-navy transition-colors duration-300 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {strip.length > 0 && (
        <div className="relative overflow-hidden h-36 transform-gpu">
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-deep-space-blue group-hover:from-regal-navy to-transparent z-10 pointer-events-none transition-colors duration-300" />
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-deep-space-blue group-hover:from-regal-navy to-transparent z-10 pointer-events-none transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-b from-transparent to-deep-space-blue group-hover:to-regal-navy z-10 pointer-events-none transition-colors duration-300" />
          <CoverStrip strip={strip} paused={hovered} />
        </div>
      )}

      <div className="relative z-20 px-6 sm:px-10 -mt-8 pt-0 pb-10">
        <h2 className="text-subtitle text-mint-cream mb-4 group-hover:text-blood-red transition-colors duration-200">
          {genre.name}
        </h2>
        <p className="text-mint-cream/50 text-base mb-8">
          {count} {count === 1 ? 'title' : 'titles'}
        </p>
        <span className="text-xs tracking-widest uppercase text-mint-cream/60 group-hover:text-blood-red transition-colors">
          Explore →
        </span>
      </div>
    </Link>
  )
}

export default function GenreGrid({ genres, books }) {
  const counts = Object.fromEntries(
    genres.map(genre => [genre.slug, books.filter(b => b.genre === genre.slug).length])
  )
  const sorted = [...genres].sort((a, b) =>
    counts[b.slug] - counts[a.slug] || a.name.localeCompare(b.name)
  )

  return (
    <motion.div
      className="grid sm:grid-cols-3 gap-0.5 sm:gap-6"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {sorted.map(genre => (
        <motion.div key={genre.id} variants={item} className="min-w-0">
          <GenreCard
            genre={genre}
            books={books.filter(b => b.genre === genre.slug)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
