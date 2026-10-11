interface Props {
  left: number
  total: number
}

const MAX_PIPS = 20

/**
 * One mark per cigar in the lot: filled for those still there, hollow for those gone.
 * Big boxes switch to a bar so the row never gets out of hand.
 */
export function Pips({ left, total }: Props) {
  const label = `${left} of ${total} left`
  if (total > MAX_PIPS) {
    return (
      <span className="pip-bar" role="img" aria-label={label}>
        <span style={{ width: `${total > 0 ? (left / total) * 100 : 0}%` }} />
      </span>
    )
  }
  return (
    <span className="pips" role="img" aria-label={label}>
      {Array.from({ length: total }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: the marks are identical and never reorder
        <span key={index} className={index < left ? 'pip is-left' : 'pip'} />
      ))}
    </span>
  )
}
