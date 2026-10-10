import { formatDate as formatLocaleDate, formatNumber as formatLocaleNumber } from 'kay/i18n'

export function formatDate(date: Date): string {
  return formatLocaleDate(date, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function formatNumber(value: number, digits = 1): string {
  return formatLocaleNumber(value, { maximumFractionDigits: digits })
}
