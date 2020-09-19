export function parseNumber(textContent: string) {
  return parseFloat(textContent.replace(/[,.]/g, ''))
}
