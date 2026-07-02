export function SkeletonBookCard() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-[2/3] bg-gray-200 rounded mb-3" />
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-8 bg-gray-200 rounded mt-auto" />
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function SkeletonHeading({ className = '' }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-10 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-1/4" />
    </div>
  )
}
