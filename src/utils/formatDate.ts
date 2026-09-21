export function formatDate(date: Date | string, locale = 'ko-KR') {
  return new Intl.DateTimeFormat(locale).format(new Date(date))
}
