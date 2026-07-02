import { trackEvent } from '../lib/analytics'

function IconInstagram({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  )
}

function IconFacebook({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  )
}

function IconTikTok({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
    </svg>
  )
}

function IconX({ className }) {
  return (
    <span className={`font-display text-[1.6rem] leading-none select-none inline-flex items-center justify-center translate-y-[2px] ${className}`} aria-hidden="true">𝕏</span>
  )
}

function IconPinterest({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9 8.5h4a2.5 2.5 0 0 1 0 5H9V8.5z"/>
      <path d="M10 13.5 8.5 20"/>
    </svg>
  )
}

function IconGoodreads({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}

function IconYouTube({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon fill="currentColor" stroke="none" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
    </svg>
  )
}

const PLATFORMS = [
  { key: 'instagram', label: 'Instagram',  Icon: IconInstagram },
  { key: 'facebook',  label: 'Facebook',   Icon: IconFacebook  },
  { key: 'tiktok',    label: 'TikTok',     Icon: IconTikTok    },
  { key: 'goodreads', label: 'Goodreads',  Icon: IconGoodreads },
  { key: 'pinterest', label: 'Pinterest',  Icon: IconPinterest },
  { key: 'youtube',   label: 'YouTube',    Icon: IconYouTube   },
  { key: 'twitter',   label: 'X',          Icon: IconX         },
]

export default function SocialLinks({ links, className = '' }) {
  if (!links) return null
  const active = PLATFORMS.filter(p => links[p.key])
  if (!active.length) return null

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {active.map(({ key, label, Icon }) => (
        <a
          key={key}
          href={links[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="hover:text-blood-red transition-colors"
          onClick={() => trackEvent('social_link_click', { platform: key })}
        >
          <Icon className="w-5 h-5" />
        </a>
      ))}
    </div>
  )
}
