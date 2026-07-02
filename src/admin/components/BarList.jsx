// Ranked horizontal bar list — every report here is "rank these by one metric"
// (nominal categorical, one series), so every bar shares a single hue and the
// value is direct-labeled at the bar's tip rather than gated behind a legend
// or hover. See the dataviz skill: one series → no legend, title names it.

const MAX_BAR_PCT = 82 // leaves room for the trailing value label

function Bar({ label, secondary, value, pct, formatValue }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 sm:w-36 shrink-0 truncate text-sm text-onyx" title={label}>
        {label}
        {secondary && <span className="text-gray-400"> · {secondary}</span>}
      </span>
      <div className="flex-1 min-w-0 flex items-center h-5">
        <div
          className="h-2 bg-deep-space-blue rounded-r transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
        <span className="ml-2 text-xs font-medium text-onyx tabular-nums">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
    </div>
  )
}

export default function BarList({ title, subtitle, rows, labelKey, secondaryKey, valueKey, emptyLabel, formatValue }) {
  const max = Math.max(1, ...rows.map(r => r[valueKey]))

  return (
    <div className="bg-white rounded border p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-deep-space-blue">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">{emptyLabel}</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row, i) => {
            const value = row[valueKey]
            const pct = value > 0 ? Math.max((value / max) * MAX_BAR_PCT, 3) : 0
            return (
              <Bar
                key={i}
                label={row[labelKey]}
                secondary={secondaryKey ? row[secondaryKey] : null}
                value={value}
                pct={pct}
                formatValue={formatValue}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
