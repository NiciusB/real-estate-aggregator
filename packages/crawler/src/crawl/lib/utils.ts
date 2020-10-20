import { ListingType } from '../../../models/Listing'

export function parseNumber(textContent?: string): number | null {
  if (!textContent) return null

  const num = parseFloat(textContent.replace(/[,.]/g, ''))
  if (Number.isNaN(num)) throw new Error(`[parseNumber] Invalid number ${textContent}`)
  return num
}

export function titleToListingType(title: string): ListingType {
  // fotocasa's buildingSubtype
  switch (title) {
    case 'House_Chalet':
      return ListingType.Casa
    case 'Flat':
    case 'Attic':
      return ListingType.Piso
    case 'SemidetachedHouse':
      return ListingType.ChaletPareado
    case 'Duplex':
      return ListingType.Duplex
  }

  // textos de interfaz, idealista y pisos.com
  if (/Chalet (pareado|adosado)/i.test(title)) return ListingType.ChaletPareado
  if (/^Dúplex/i.test(title)) return ListingType.Duplex
  if (/^Ático/i.test(title)) return ListingType.Atico
  if (/Casa|Chalet/i.test(title)) return ListingType.Casa
  if (/^Piso|Estudio|Apartamento/i.test(title)) return ListingType.Piso
  if (/^Finca/i.test(title)) return ListingType.Finca

  // idk
  return ListingType.Desconocido
}
