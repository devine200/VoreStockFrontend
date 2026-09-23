export function Icon({
  src,
  size = 18,
  width,
  height,
  className = '',
  alt = '',
}: {
  src: string
  size?: number
  width?: number
  height?: number
  className?: string
  alt?: string
}) {
  const w = width ?? size
  const h = height ?? size
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: w, height: h }}
    >
      <img src={src} alt={alt} width={w} height={h} className="block max-w-none" style={{ width: w, height: h }} />
    </span>
  )
}
