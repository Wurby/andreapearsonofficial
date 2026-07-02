const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { defineString } = require('firebase-functions/params')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { BetaAnalyticsDataClient } = require('@google-analytics/data')

initializeApp()
const db = getFirestore()
const analyticsDataClient = new BetaAnalyticsDataClient()

const ga4PropertyId = defineString('GA4_PROPERTY_ID')

const VALID_DAYS = new Set([7, 30, 90])

function rowsOf(report) {
  return report.rows ?? []
}

function dim(row, i) {
  return row.dimensionValues[i]?.value ?? ''
}

function metric(row) {
  return Number(row.metricValues[0]?.value ?? 0)
}

function eventReportRequest(dateRange, eventName, dimensionNames) {
  return {
    dateRanges: [dateRange],
    dimensions: dimensionNames.map(name => ({ name })),
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: eventName } } },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 20,
  }
}

exports.getSiteAnalytics = onCall(async request => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in required.')
  }

  const days = VALID_DAYS.has(request.data?.days) ? request.data.days : 30
  const dateRange = { startDate: `${days}daysAgo`, endDate: 'today' }
  const property = `properties/${ga4PropertyId.value()}`

  // batchRunReports caps out at 5 requests per call, and we have 6 reports —
  // split across two concurrent batches.
  const [[{ reports: batchA }], [{ reports: batchB }]] = await Promise.all([
    analyticsDataClient.batchRunReports({
      property,
      requests: [
        {
          dateRanges: [dateRange],
          dimensions: [{ name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 100,
        },
        eventReportRequest(dateRange, 'book_buy_click', ['customEvent:bookTitle', 'customEvent:genre']),
        eventReportRequest(dateRange, 'newsletter_signup_click', ['customEvent:newsletterLabel']),
      ],
    }),
    analyticsDataClient.batchRunReports({
      property,
      requests: [
        eventReportRequest(dateRange, 'work_with_me_cta_click', ['customEvent:ctaType', 'customEvent:consultantName']),
        eventReportRequest(dateRange, 'social_link_click', ['customEvent:platform']),
        {
          dateRanges: [dateRange],
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 10,
        },
      ],
    }),
  ])

  const [pagesReport, buyClicksReport, newsletterReport] = batchA
  const [wwmReport, socialReport, trafficReport] = batchB

  const pageRows = rowsOf(pagesReport).map(row => ({ path: dim(row, 0), views: metric(row) }))

  // Book detail pages are exactly /books/{genre}/{id} — series pages add a
  // /series/{id} segment, and the genre index page has no third segment.
  const bookPageRows = pageRows.filter(({ path }) =>
    /^\/books\/[^/]+\/[^/]+$/.test(path) && !path.includes('/series/'))

  const genreViews = new Map()
  for (const { path, views } of pageRows) {
    const m = path.match(/^\/books\/([^/]+)/)
    if (!m) continue
    genreViews.set(m[1], (genreViews.get(m[1]) ?? 0) + views)
  }

  const [booksSnap, genresSnap] = await Promise.all([
    db.collection('books').get(),
    db.collection('genres').get(),
  ])
  const bookById = new Map(booksSnap.docs.map(d => [d.id, d.data()]))
  const genreBySlug = new Map(genresSnap.docs.map(d => [d.id, d.data()]))

  const topBooksByViews = bookPageRows
    .map(({ path, views }) => {
      const [, genreSlug, bookId] = path.match(/^\/books\/([^/]+)\/([^/]+)$/)
      return {
        bookId,
        bookTitle: bookById.get(bookId)?.title ?? bookId,
        genre: genreBySlug.get(genreSlug)?.name ?? genreSlug,
        views,
      }
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  const topGenres = [...genreViews.entries()]
    .map(([slug, views]) => ({ genre: genreBySlug.get(slug)?.name ?? slug, views }))
    .sort((a, b) => b.views - a.views)

  return {
    days,
    topPages: pageRows.slice(0, 15),
    topGenres,
    topBooksByViews,
    topBooksByBuyClick: rowsOf(buyClicksReport).map(row => ({
      bookTitle: dim(row, 0),
      genre: dim(row, 1),
      clicks: metric(row),
    })),
    newsletterClicks: rowsOf(newsletterReport).map(row => ({
      newsletterLabel: dim(row, 0),
      clicks: metric(row),
    })),
    workWithMeClicks: rowsOf(wwmReport).map(row => ({
      ctaType: dim(row, 0),
      consultantName: dim(row, 1),
      clicks: metric(row),
    })),
    socialClicks: rowsOf(socialReport).map(row => ({
      platform: dim(row, 0),
      clicks: metric(row),
    })),
    trafficSources: rowsOf(trafficReport).map(row => ({
      source: dim(row, 0),
      sessions: metric(row),
    })),
  }
})
