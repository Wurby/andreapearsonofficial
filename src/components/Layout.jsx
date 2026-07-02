import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Nav from './Nav'
import Footer from './Footer'
import PageViewTracker from './PageViewTracker'

export default function Layout() {
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

  return (
    <div className="min-h-screen flex flex-col">
      <PageViewTracker />
      <Nav />
      {/* Spacer for fixed nav — omitted on pages whose hero bleeds under the nav */}
      {!isFullBleedHero && <div className="h-16" />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
