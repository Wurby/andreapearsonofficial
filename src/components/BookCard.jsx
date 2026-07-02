import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from './Button'
import FadingImage from './FadingImage'

const TYPE_LABELS = {
  novella: 'Novella',
  'short-story': 'Short Story',
  'picture-book': 'Picture Book',
  collection: 'Collection',
}

export default function BookCard({ book, seriesLabel }) {
  const detailPath = `/books/${book.genre}/${book.id}`

  return (
    <motion.div
      className="flex flex-col group h-full"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Link to={detailPath} className="aspect-[2/3] overflow-hidden mb-3 block">
        {book.coverUrl ? (
          <FadingImage
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:opacity-90"
            wrapperClassName="w-full h-full"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 text-xs p-2 text-center">
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
        <span className="mt-auto pt-1 block text-xs text-gray-400 min-h-[1.25rem]">
          {seriesLabel || TYPE_LABELS[book.type] || ''}
        </span>
      </div>

      {book.books2ReadLink ? (
        <Button href={book.books2ReadLink} size="sm" className="mt-3 w-full text-center">
          Buy / Read
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
