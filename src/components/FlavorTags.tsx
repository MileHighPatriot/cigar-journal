import { tagFamily } from '../domain/tags'

/** Flavor tags with a small dot in the color of their family. */
export function FlavorTags({ tags, className }: { tags: string[]; className?: string }) {
  if (tags.length === 0) return null
  return (
    <span className={className ? `flavors ${className}` : 'flavors'}>
      {tags.map((tag) => (
        <span key={tag} className="flavor">
          <span className="flavor-dot" data-family={tagFamily(tag)} aria-hidden="true" />
          {tag}
        </span>
      ))}
    </span>
  )
}
