import { motion } from 'framer-motion'
import { useContent } from '../hooks/useContent'
import { useBooks } from '../hooks/useBooks'
import { useSeries } from '../hooks/useSeries'
import { useGenres } from '../hooks/useGenres'
import { SkeletonText } from '../components/Skeleton'
import FadingImage from '../components/FadingImage'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: 'easeOut', delay: i * 0.1 },
  }),
}

function Stat({ value, label }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }}
    >
      <span className="font-display text-4xl sm:text-6xl md:text-7xl font-light text-mint-cream leading-none">{value}</span>
      <span className="text-xs tracking-[0.2em] uppercase text-mint-cream/70 font-medium">{label}</span>
    </motion.div>
  )
}

export default function About() {
  const { content, loading }          = useContent()
  const { books, loading: bLoading }  = useBooks()
  const { series, loading: sLoading } = useSeries()
  const { genres, loading: gLoading } = useGenres()

  const statsReady = !bLoading && !sLoading && !gLoading

  return (
    <>
      {/* ── Hero band ──────────────────────────────────────────── */}
      <div className="bg-deep-space-blue px-6 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <p className="text-xs tracking-[0.2em] uppercase text-blood-red mb-6 font-medium">The Author</p>
            <div className="w-12 h-px bg-blood-red mb-6" />
            <h1 className="text-title text-mint-cream">About Andrea</h1>
          </motion.div>
        </div>
      </div>

      {/* ── Bio + headshot ─────────────────────────────────────── */}
      <div className="px-6 py-16 md:py-24 bg-mint-cream">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[2fr_1fr] gap-14 items-start">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            {loading ? (
              <SkeletonText lines={10} />
            ) : (
              <p className="text-body text-onyx leading-relaxed">{content?.bioLong}</p>
            )}
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="order-first md:order-last">
            <div className="relative inline-block w-full max-w-xs md:max-w-none">
              {/* Blood-red accent block */}
              <div className="absolute -bottom-3 -right-3 md:-bottom-6 md:-right-6 w-full h-full bg-blood-red" />
              {content?.headshotUrl ? (
                <FadingImage
                  src={content.headshotUrl}
                  alt="Andrea Pearson"
                  className="w-full h-auto shadow-xl"
                  wrapperClassName="relative z-10 w-full"
                />
              ) : (
                <div
                  className="relative z-10 w-full bg-deep-space-blue/10"
                  style={{ aspectRatio: '3/4' }}
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Stats strip ────────────────────────────────────────── */}
      <div className="bg-blood-red px-6 py-16 md:py-20">
        <motion.div
          className="max-w-4xl mx-auto grid grid-cols-3 gap-4 md:gap-8 text-center"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <Stat value={statsReady ? `${books.length}+` : '—'} label="Books Published" />
          <Stat value={statsReady ? series.length : '—'} label="Complete Series" />
          <Stat value={statsReady ? genres.length : '—'} label="Genres" />
        </motion.div>
      </div>

      {/* ── Pull quote — only renders when set in admin ────────── */}
      {content?.pullQuote && (
        <div className="bg-onyx px-6 py-20 md:py-28">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <p className="text-xs tracking-[0.3em] uppercase text-blood-red mb-6 font-medium">In Her Own Words</p>
            <div className="w-12 h-px bg-blood-red mx-auto mb-10" />
            <blockquote className="text-subtitle text-mint-cream leading-relaxed italic">
              "{content.pullQuote}"
            </blockquote>
          </motion.div>
        </div>
      )}
    </>
  )
}
