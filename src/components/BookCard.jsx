import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from './Button'
import FadingImage from './FadingImage'
import { TYPE_LABELS } from '../lib/bookTypes'

export default function BookCard({ book, seriesLabel }) {
  const detailPath = `/books/${book.genre}/${book.id}`

  return (
    <motion.div
      className="flex flex-col group h-full"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Link to={detailPath} className="relative aspect-[2/3] overflow-hidden mb-3 block">
        {book.comingSoon && (
          <span className="absolute bottom-0 left-0 right-0 z-10 bg-blood-red/80 text-mint-cream text-[10px] font-medium uppercase tracking-wide text-center py-1.5">
            Coming Soon
          </span>
        )}
        {book.coverUrl ? (
          <FadingImage
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:opacity-90"
            wrapperClassName="w-full h-full"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-600 text-xs p-2 text-center">
            No cover
          </div>
        )}
      </Link>

      <div className="flex-1 flex flex-col">
        <Link to={detailPath}>
          <h3 className="text-booktitle text-onyx leading-snug mb-1 group-hover:text-blood-red transition-colors duration-200">
            {book.title}
          </h3>
        </Link>
        <span className="mt-auto pt-1 block text-xs text-gray-600 min-h-[1.25rem]">
          {seriesLabel || TYPE_LABELS[book.type] || ''}
        </span>
      </div>

      {book.books2ReadLink ? (
        <Button href={book.books2ReadLink} size="sm" className="mt-3 w-full text-center">
          {book.comingSoon ? 'Pre-order' : 'Buy / Read'}
        </Button>
      ) : book.freeViaNewsletter ? (
        <Button
          variant="outline"
          size="sm"
          {...(book.newsletterLink?.startsWith('http')
            ? { href: book.newsletterLink ?? '/newsletter' }
            : { to: book.newsletterLink ?? '/newsletter' })}
          className="mt-3 w-full text-center"
        >
          Get for free here →
        </Button>
      ) : null}
    </motion.div>
  )
}
