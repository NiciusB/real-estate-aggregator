import { logMessage, SEVERITY } from '../../lib/monitoring-log'
import proxiedFetch from '../../lib/proxiedFetch'
import { parseNumber } from '../../lib/utils'
import { Listing } from '../site_definitions'

export default async function crawlIdealista(path: string) {
  return getList(path)
}

async function getList(path: string): Promise<Listing[]> {
  const page = await proxiedFetch(`https://www.idealista.com/${path}/?ordenado-por=fecha-publicacion-desc`)
  const items = await page.$$('main#main-content article.item')

  const listingPromises = items.map(async (item) => {
    try {
      const listing = await item.evaluate((elm) => {
        const text = elm.textContent

        const floorRegexp = /([0-9.,]+)ª planta/.exec(text)

        return {
          id: elm.querySelector('a.item-link').getAttribute('href').split('/')[2],
          eurPrice: /([0-9.,]+)€/.exec(text)[1],
          roomsCount: /([0-9.,]+) hab\./.exec(text)[1],
          squareMeters: /([0-9.,]+) m²/.exec(text)[1],
          flatFloorNumber: floorRegexp ? floorRegexp[1] : '1',
        }
      })

      return {
        ...listing,
        site: 'idealista',
        eurPrice: parseNumber(listing.eurPrice),
        roomsCount: parseNumber(listing.roomsCount),
        squareMeters: parseNumber(listing.squareMeters),
        flatFloorNumber: parseNumber(listing.flatFloorNumber),
      }
    } catch (err) {
      logMessage(err, SEVERITY.Error, await item.evaluate((elm) => elm.textContent))
      return null
    }
  })

  return (await Promise.all(listingPromises)).filter(Boolean)
}
