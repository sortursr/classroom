// Classes are held every Sunday. Weeks are identified by the Sunday's date, "YYYY-MM-DD",
// in the viewer's local time zone.

function toWeekId(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** The Sunday on/after `from` (defaults to today). */
export function nextSunday(from: Date = new Date()): Date {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const daysUntilSunday = (7 - d.getDay()) % 7
  d.setDate(d.getDate() + daysUntilSunday)
  return d
}

/** weekId + display date for the next `count` Sundays, starting with the next one. */
export function upcomingWeeks(count: number): { weekId: string; date: Date }[] {
  const first = nextSunday()
  const weeks: { weekId: string; date: Date }[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(first)
    d.setDate(d.getDate() + i * 7)
    weeks.push({ weekId: toWeekId(d), date: d })
  }
  return weeks
}

export function formatWeek(weekId: string): string {
  const [y, m, d] = weekId.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}
