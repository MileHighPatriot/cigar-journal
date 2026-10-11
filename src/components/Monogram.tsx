const SKIP = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'the', 'by', 'of', '&'])

function initials(brand: string): string {
  const words = brand
    .replace(/[.']/g, '')
    .split(/\s+/)
    .filter((word) => word && !SKIP.has(word.toLowerCase()))
  const letters = (words.length > 1 ? words.slice(0, 2) : words).map((word) => word[0] ?? '')
  const text = words.length === 1 ? (words[0] ?? '').slice(0, 2) : letters.join('')
  return text.toUpperCase()
}

/** A small brass medallion with the brand's initials. A graphic, not cigar artwork. */
export function Monogram({ brand }: { brand: string }) {
  return (
    <span className="monogram" aria-hidden="true">
      {initials(brand) || '?'}
    </span>
  )
}

/** Wrapper names from the lounge sheet, mapped to a leaf-shade token in tokens.css. */
const LEAF: Record<string, string> = {
  Connecticut: 'connecticut',
  Candela: 'candela',
  Claro: 'claro',
  'Natural/Sun Grown': 'natural',
  Cameroon: 'cameroon',
  Sumatra: 'sumatra',
  Corojo: 'corojo',
  Criollo: 'criollo',
  Habano: 'habano',
  Rosado: 'rosado',
  Colorado: 'colorado',
  'Mata Fina': 'matafina',
  'San Andrés': 'sanandres',
  'Maduro/Broadleaf': 'maduro',
}

/** A dot in the shade of the wrapper leaf, with the wrapper named for screen readers. */
export function WrapperDot({ wrapper }: { wrapper: string | null }) {
  const leaf = wrapper ? LEAF[wrapper] : undefined
  if (!wrapper || !leaf) return null
  return (
    <span className="leaf">
      <span className="leaf-dot" data-leaf={leaf} aria-hidden="true" />
      {wrapper}
    </span>
  )
}
