import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Books',        to: '/books',        external: false },
  { label: 'About',        to: '/about',        external: false },
  { label: 'Newsletter',   to: '/newsletter',   external: false },
  { label: 'Work With Me', to: '/work-with-me', external: false },
  { label: 'The Show',     to: 'https://theandreapearsonshow.com', external: true },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { pathname } = location
  const isFullBleedHero =
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/books' ||
    pathname === '/newsletter' ||
    pathname === '/work-with-me' ||
    /^\/books\/[^/]+$/.test(pathname) ||
    /^\/books\/[^/]+\/series\/[^/]+$/.test(pathname)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const transparent = isFullBleedHero && !scrolled

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          transparent
            ? 'bg-transparent'
            : 'bg-mint-cream/95 backdrop-blur-sm shadow-sm'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt=""
              className="h-8 w-auto"
            />
            <span className={`font-display text-xl font-medium tracking-wide transition-colors duration-300 ${
              transparent ? 'text-mint-cream' : 'text-deep-space-blue'
            }`}>
              Andrea Pearson
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <DesktopLink
                key={link.to}
                link={link}
                transparent={transparent}
                active={!link.external && location.pathname.startsWith(link.to) && link.to !== '/'
                  ? true
                  : location.pathname === link.to}
              />
            ))}
          </nav>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className={`md:hidden flex flex-col gap-1.5 p-2 transition-colors duration-300 ${
              transparent ? 'text-mint-cream' : 'text-deep-space-blue'
            }`}
          >
            <span className="block w-6 h-px bg-current" />
            <span className="block w-6 h-px bg-current" />
            <span className="block w-4 h-px bg-current" />
          </button>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-deep-space-blue flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="absolute top-5 right-6 text-mint-cream/60 hover:text-mint-cream transition-colors text-3xl leading-none"
            >
              ×
            </button>

            <nav className="flex flex-col items-center gap-8">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3, ease: 'easeOut' }}
                >
                  {link.external ? (
                    <a
                      href={link.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display text-4xl text-mint-cream hover:text-blood-red transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.to}
                      className="font-display text-4xl text-mint-cream hover:text-blood-red transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function DesktopLink({ link, transparent, active }) {
  const base = `text-sm font-medium tracking-wide transition-colors duration-200 relative pb-0.5`
  const color = transparent
    ? 'text-mint-cream/80 hover:text-mint-cream'
    : 'text-deep-space-blue/70 hover:text-deep-space-blue'

  const content = link.external ? (
    <a
      href={link.to}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${color}`}
    >
      {link.label}
    </a>
  ) : (
    <Link to={link.to} className={`${base} ${color}`}>
      {link.label}
    </Link>
  )

  return (
    <div className="relative">
      {content}
      {active && (
        <span className="absolute -bottom-1 left-0 right-0 h-px bg-blood-red" />
      )}
    </div>
  )
}
