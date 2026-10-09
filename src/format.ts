const dateFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })

export function formatDate(date: Date): string {
  return dateFormat.format(date)
}

export function formatNumber(value: number, digits = 1): string {
  return value.toLocaleString('en', { maximumFractionDigits: digits })
}
