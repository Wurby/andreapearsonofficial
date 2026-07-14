import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGenres } from '../hooks/useGenres'
import { SkeletonText } from '../components/Skeleton'
import Markdown from '../components/Markdown'

export default function AboutGenre() {
  const { genre: slug } = useParams()
  const { genres, loading } = useGenres()

  if (!loading && !genres.find(g => g.slug === slug)) {
    return (
      <div className="px-6 py-12 md:py-20 max-w-3xl mx-auto">
        <p className="text-onyx text-lg mb-4">Genre not found.</p>
        <Link to="/about" className="text-blood-red hover:underline text-base">← Back to About</Link>
      </div>
    )
  }

  const genre = genres.find(g => g.slug === slug)

  return (
    <div className="px-6 py-20 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Link
          to="/about"
          className="text-base text-deep-space-blue/70 hover:text-blood-red transition-colors mb-10 inline-block"
        >
          ← Back to About
        </Link>

        <p className="text-xs tracking-[0.2em] uppercase text-blood-red mb-4 font-medium">Genre Bio</p>
        <div className="w-12 h-px bg-blood-red mb-8" />

        <h1 className="text-title text-deep-space-blue mb-8 md:mb-10">
          {loading ? '…' : genre?.name}
        </h1>

        {loading ? (
          <SkeletonText lines={5} />
        ) : genre?.bio ? (
          <Markdown className="text-body text-onyx leading-relaxed">{genre.bio}</Markdown>
        ) : (
          <p className="text-gray-600 italic text-lg">Bio coming soon.</p>
        )}
      </motion.div>
    </div>
  )
}
