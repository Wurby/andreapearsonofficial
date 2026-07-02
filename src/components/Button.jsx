import { Link } from 'react-router-dom'

const VARIANTS = {
  primary: 'bg-blood-red text-mint-cream border border-transparent hover:bg-blood-red/90',
  outline: 'border border-deep-space-blue text-deep-space-blue hover:bg-deep-space-blue hover:text-mint-cream',
  ghost:   'border border-mint-cream/40 text-mint-cream hover:border-mint-cream hover:bg-mint-cream/10',
}

const SIZES = {
  sm: 'text-xs py-2 px-3',
  md: 'text-base py-3 px-5 font-medium',
  lg: 'text-base py-3.5 px-8 font-medium tracking-wide',
}

export default function Button({
  variant = 'primary',
  size = 'lg',
  to,
  href,
  className = '',
  children,
  ...props
}) {
  const cls = `inline-block transition-colors ${VARIANTS[variant]} ${SIZES[size]} ${className}`.trim()
  const isExternal = href?.startsWith('http')

  if (to) {
    return <Link to={to} className={cls} {...props}>{children}</Link>
  }
  if (href) {
    return (
      <a
        href={href}
        className={cls}
        {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
        {...props}
      >
        {children}
      </a>
    )
  }
  return <button type="button" className={cls} {...props}>{children}</button>
}
