import { UserRound } from 'lucide-react'

type SupportAvatarProps = {
  name?: string
  src?: string | null
  sizeClassName?: string
}

const initialsFromName = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  const first = parts[0]?.[0] || ''
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : ''
  return `${first}${second}`.toUpperCase()
}

export function SupportAvatar({ name = '', src, sizeClassName = 'size-10' }: SupportAvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Profile'}
        className={`${sizeClassName} shrink-0 rounded-full object-cover ring-1 ring-white/10`}
      />
    )
  }

  const initials = initialsFromName(name)

  return (
    <div
      className={`${sizeClassName} text-body-sm-semibold text-brand-text/90 grid shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/10`}
    >
      {initials || <UserRound className="size-4" />}
    </div>
  )
}
