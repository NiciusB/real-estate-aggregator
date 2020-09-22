export function parseNumber(textContent?: string): number | null {
  if (!textContent) return null

  const num = parseFloat(textContent.replace(/[,.]/g, ''))
  if (Number.isNaN(num)) throw new Error(`[parseNumber] Invalid number ${textContent}`)
  return num
}
