export function Icon({
  src,
  size = 18,
  className = '',
  alt = '',
}: {
  src: string
  size?: number
  className?: string
  alt?: string
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img src={src} alt={alt} width={size} height={size} className="block size-full max-w-none" />
    </span>
  )
}
