import { logMessage, SEVERITY } from '../../lib/monitoring-log'
import proxiedFetch from '../../lib/proxiedFetch'
import getListingFromElement from '../../lib/crawler/crawler'
import Listing, { ListingType } from '../../../models/Listing'
import { titleToListingType } from '../../lib/utils'

export default async function crawlIdealista(path: string) {
  return getList(path)
}

async function getList(path: string): Promise<Listing[]> {
  const { body } = await proxiedFetch(`https://www.idealista.com/${path}/?ordenado-por=fecha-publicacion-desc`)

  if (body.innerHTML.includes('parece que estamos recibiendo muchas peticiones tuyas en poco tiempo')) {
    logMessage('🤖 Bot check on idealista', SEVERITY.Warning)
    return []
  }

  const listingPromises = Array.from(body.querySelectorAll('main#main-content article.item')).map(async (item) => {
    return getListingFromElement(item, 'idealista', [
      {
        field: 'siteId',
        type: String,
        function: (elm) => elm.querySelector('a.item-link').getAttribute('href').split('/')[2],
      },
      {
        field: 'type',
        function: (elm) => titleToListingType(elm.querySelector('a.item-link').textContent),
      },
      { field: 'eurPrice', regExp: /([0-9.,]+)€/, type: Number },
      { field: 'roomsCount', regExp: /([0-9.,]+) hab\./, regExpFallback: null, type: Number },
      { field: 'squareMeters', regExp: /([0-9.,]+) m²/, type: Number },
      {
        field: 'flatFloorNumber',
        guard: (wipListing) => [ListingType.Duplex, ListingType.Atico, ListingType.Piso].includes(wipListing.type),
        regExp: /([0-9.,]+)ª planta/,
        regExpFallback: '1',
        type: Number,
      },
    ])
  })

  const listings = (await Promise.all(listingPromises)).filter(Boolean)

  return listings
}
