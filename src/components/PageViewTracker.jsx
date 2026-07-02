import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackEvent } from '../lib/analytics'

// GA4's automatic pageview tracking doesn't catch client-side route changes
// in an SPA, so we fire one explicitly on every navigation (including the
// first render) using GA4's own page_view schema.
export default function PageViewTracker() {
  const location = useLocation()

  useEffect(() => {
    trackEvent('page_view', {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [location.pathname, location.search])

  return null
}
