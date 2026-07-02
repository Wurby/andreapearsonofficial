import { useState } from 'react'

export default function FadingImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  wrapperStyle,
  style,
  shimmer = 'bg-gray-200',
  ...props
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`} style={wrapperStyle}>
      {!loaded && (
        <div className={`absolute inset-0 animate-pulse ${shimmer}`} aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        style={style}
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </div>
  )
}
