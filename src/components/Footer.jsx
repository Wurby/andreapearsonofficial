import { Link } from 'react-router-dom'
import { useContent } from '../hooks/useContent'
import SocialLinks from './SocialLinks'
import { NAV_LINKS } from '../lib/links'

export default function Footer() {
  const { content } = useContent()

  return (
    <footer className="bg-onyx text-mint-cream py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start">
          <p className="font-display text-2xl font-medium text-mint-cream mb-1">Andrea Pearson</p>
          <p className="text-sm text-mint-cream/50 mb-3">Author · Speaker · Strategist</p>
          <SocialLinks links={content?.socialLinks} className="text-mint-cream/50" />
        </div>

        <nav className="flex flex-wrap justify-center gap-6 text-sm text-mint-cream/60">
          {NAV_LINKS.map(link => link.external ? (
            <a
              key={link.to}
              href={link.to}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-mint-cream transition-colors"
            >
              {link.label}
            </a>
          ) : (
            <Link key={link.to} to={link.to} className="hover:text-mint-cream transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-mint-cream/10 flex items-center justify-between">
        <p className="text-xs text-mint-cream/50">© {new Date().getFullYear()} Andrea Pearson. All rights reserved.</p>
        <Link
          to="/admin"
          className="text-mint-cream/10 hover:text-mint-cream/30 transition-colors"
          aria-label="Admin"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </Link>
      </div>
    </footer>
  )
}
