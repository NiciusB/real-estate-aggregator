import { ListingType } from '../../models/Listing'

export function parseNumber(textContent?: string): number | null {
  if (!textContent) return null

  const num = parseFloat(textContent.replace(/[,.]/g, ''))
  if (Number.isNaN(num)) throw new Error(`[parseNumber] Invalid number ${textContent}`)
  return num
}

export function titleToListingType(title: string): ListingType {
  if (/Chalet (pareado|adosado)/i.test(title)) return ListingType.ChaletPareado
  if (/^Dúplex/i.test(title)) return ListingType.Duplex
  if (/^Ático/i.test(title)) return ListingType.Atico
  if (/^(Casa|Chalet)/i.test(title)) return ListingType.Casa
  if (/^(Piso|Estudio)/i.test(title)) return ListingType.Piso
  if (/^Finca/i.test(title)) return ListingType.Finca
  return ListingType.Desconocido
}
