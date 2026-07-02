import { Link } from 'react-router-dom'

export default function Breadcrumb({ items, dark = false }) {
  const mutedCls  = dark ? 'text-mint-cream/50' : 'text-deep-space-blue/50'
  const sepCls    = dark ? 'text-mint-cream/25' : 'text-deep-space-blue/25'
  const activeCls = dark ? 'text-mint-cream/80' : 'text-deep-space-blue/80'

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center flex-wrap gap-x-2 gap-y-1 text-sm mb-8 ${mutedCls}`}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className={sepCls} aria-hidden="true">/</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-blood-red transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={activeCls}>{item.label ?? '…'}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
