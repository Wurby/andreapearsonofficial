import { useState, useEffect, useCallback } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../lib/firebase'
import { useBooks } from '../../hooks/useBooks'
import { useGenres } from '../../hooks/useGenres'
import { useSeries } from '../../hooks/useSeries'
import BarList from '../components/BarList'

const DAY_OPTIONS = [7, 30, 90]

export default function AdminDashboard() {
  const { books }  = useBooks()
  const { genres } = useGenres()
  const { series } = useSeries()

  const stats = [
    { label: 'Books',  value: books.length },
    { label: 'Genres', value: genres.length },
    { label: 'Series', value: series.length },
  ]

  const [days, setDays] = useState(30)
  const [data, setData] = useState(null)
  const [refreshing, setRefreshing] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async selectedDays => {
    setRefreshing(true)
    setError(null)
    try {
      const getSiteAnalytics = httpsCallable(functions, 'getSiteAnalytics')
      const result = await getSiteAnalytics({ days: selectedDays })
      setData(result.data)
    } catch (err) {
      setError(err.message ?? 'Failed to load analytics.')
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load(days) }, [days, load])

  return (
    <div>
      <h1 className="text-2xl font-bold text-deep-space-blue mb-6">Dashboard</h1>

      <div className="flex gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded border px-6 py-4 flex-1 text-center">
            <p className="text-3xl font-bold text-deep-space-blue">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-deep-space-blue">Site Analytics</h2>
        <div className="flex gap-1 bg-white border rounded p-1">
          {DAY_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                days === d
                  ? 'bg-deep-space-blue text-mint-cream'
                  : 'text-gray-500 hover:text-onyx'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-6">
        Sourced from Google Analytics — may lag a few hours behind real-time activity.
      </p>

      {error && (
        <p className="text-sm text-blood-red bg-blood-red/5 border border-blood-red/20 rounded px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {!data && refreshing && <p className="text-gray-400">Loading…</p>}

      {data && (
        <div
          className={`grid md:grid-cols-2 gap-6 transition-opacity duration-200 ${
            refreshing ? 'opacity-50' : 'opacity-100'
          }`}
        >
          <BarList
            title="Top Books by Views"
            rows={data.topBooksByViews}
            labelKey="bookTitle"
            secondaryKey="genre"
            valueKey="views"
            emptyLabel="No book views yet."
          />
          <BarList
            title="Top Books by Buy/Read Click"
            rows={data.topBooksByBuyClick}
            labelKey="bookTitle"
            secondaryKey="genre"
            valueKey="clicks"
            emptyLabel="No buy/read clicks yet."
          />
          <BarList
            title="Top Genres by Views"
            rows={data.topGenres}
            labelKey="genre"
            valueKey="views"
            emptyLabel="No genre views yet."
          />
          <BarList
            title="Top Pages"
            rows={data.topPages}
            labelKey="path"
            valueKey="views"
            emptyLabel="No page views yet."
          />
          <BarList
            title="Traffic Sources"
            rows={data.trafficSources}
            labelKey="source"
            valueKey="sessions"
            emptyLabel="No sessions yet."
          />
          <BarList
            title="Newsletter Signup Clicks"
            rows={data.newsletterClicks}
            labelKey="newsletterLabel"
            valueKey="clicks"
            emptyLabel="No newsletter clicks yet."
          />
          <BarList
            title="Work With Me CTA Clicks"
            rows={data.workWithMeClicks}
            labelKey="ctaType"
            secondaryKey="consultantName"
            valueKey="clicks"
            emptyLabel="No Work With Me clicks yet."
          />
          <BarList
            title="Social Link Clicks"
            rows={data.socialClicks}
            labelKey="platform"
            valueKey="clicks"
            emptyLabel="No social clicks yet."
          />
        </div>
      )}
    </div>
  )
}
