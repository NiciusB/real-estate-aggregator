import proxiedFetch from '../../lib/proxiedFetch'
import { parseNumber } from '../../lib/utils'
import { Listing } from '../site_definitions'

export async function getList(path: string): Promise<Listing[]> {
  const page = await proxiedFetch(`https://www.idealista.com/${path}/?ordenado-por=fecha-publicacion-desc`)

  const listings = (
    await page.$$eval('main#main-content article.item', (elms) =>
      elms.map((elm) => ({
        id: elm.querySelector('a.item-link').getAttribute('href').split('/')[2],
        eurPrice: elm.querySelector('.price-row .item-price').textContent,
        roomsCount: elm.querySelector('.item-detail:nth-child(4)').textContent,
        squareMeters: elm.querySelector('.item-detail:nth-child(5)').textContent,
      }))
    )
  ).map((listing) => ({
    ...listing,
    site: 'idealista',
    eurPrice: parseNumber(listing.eurPrice),
    roomsCount: parseNumber(listing.roomsCount),
    squareMeters: parseNumber(listing.squareMeters),
  }))

  return listings
}
