import { getAnalytics, isSupported, logEvent } from 'firebase/analytics'
import { app } from './firebase'

// Only initialized in production — local dev traffic never gets tracked.
// isSupported() guards against environments where GA4 can't run (e.g. some
// private-browsing modes) so logEvent() never throws.
const analyticsPromise = import.meta.env.PROD
  ? isSupported().then(supported => (supported ? getAnalytics(app) : null))
  : Promise.resolve(null)

export async function trackEvent(name, params) {
  const analytics = await analyticsPromise
  if (analytics) logEvent(analytics, name, params)
}
