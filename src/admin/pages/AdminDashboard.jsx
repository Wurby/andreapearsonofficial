import { useBooks } from '../../hooks/useBooks'
import { useGenres } from '../../hooks/useGenres'
import { useSeries } from '../../hooks/useSeries'

export default function AdminDashboard() {
  const { books }  = useBooks()
  const { genres } = useGenres()
  const { series } = useSeries()

  const stats = [
    { label: 'Books',  value: books.length },
    { label: 'Genres', value: genres.length },
    { label: 'Series', value: series.length },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-deep-space-blue mb-8">Dashboard</h1>

      <div className="flex gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded border px-6 py-4 flex-1 text-center">
            <p className="text-3xl font-bold text-deep-space-blue">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
