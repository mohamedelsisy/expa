/** Up to two initials for an avatar: first letters of the first and last word of the name (works for Arabic too). */
export function initialsOf(name?: string | null, fallback = ''): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean)
  const source = words.length ? words : [fallback.trim()].filter(Boolean)
  if (!source.length) return ''
  const first = [...source[0]!][0] ?? ''
  const last = source.length > 1 ? ([...source[source.length - 1]!][0] ?? '') : ''
  // A zero-width non-joiner keeps two Arabic letters from joining into one ligature-like glyph.
  const sep = /[\u0600-\u06FF]/.test(first) && last ? '\u200c' : ''
  return (first + sep + last).toLocaleUpperCase()
}
