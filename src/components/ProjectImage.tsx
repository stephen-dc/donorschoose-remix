import { useState } from 'react'

interface Props {
  src?: string | null
  alt: string
  className?: string
  fallbackClassName?: string
  loading?: 'lazy' | 'eager'
}

/**
 * Renders a project image with a consistent 🏫 fallback if the URL is
 * missing or fails to load. Pass `fallbackClassName` when the fallback
 * div needs a different CSS class than the <img> (e.g. separate sizing).
 */
export default function ProjectImage({
  src,
  alt,
  className = '',
  fallbackClassName,
  loading,
}: Props) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={fallbackClassName ?? className} aria-label={alt}>
        🏫
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setFailed(true)}
    />
  )
}
