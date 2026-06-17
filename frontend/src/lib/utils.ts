export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatFileSize(value?: number) {
  if (!value || value <= 0) {
    return 'Unknown size'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let size = value
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export function formatRelativeTime(value: string) {
  const date = new Date(value)
  const diffMs = date.getTime() - Date.now()
  const minutes = Math.round(diffMs / 60000)

  if (Math.abs(minutes) < 60) {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(minutes, 'minute')
  }

  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(hours, 'hour')
  }

  const days = Math.round(hours / 24)
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(days, 'day')
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function average(values: number[]) {
  if (values.length === 0) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}
