import proxiedFetch from '../../lib/proxiedFetch'
import getListingFromElement from '../../lib/crawler/crawler'
import Listing from '../../../models/Listing'
import { titleToListingType } from '../../lib/utils'

export default async function crawlFotocasa(path: string) {
  return getList(path)
}

async function getList(path: string): Promise<Listing[]> {
  const { body } = await proxiedFetch(`https://www.fotocasa.es/es/${path}`)

  const listingPromises = Array.from(body.querySelectorAll('.re-Searchresult .re-Searchresult-itemRow')).map(
    async (item) => {
      if (!item.querySelector('.re-Card-price')) return false // It's an ad

      return getListingFromElement(item, 'fotocasa', [
        {
          field: 'siteId',
          type: String,
          function: (elm) =>
            elm
              .querySelector('.re-Card-primary a')
              .getAttribute('href')
              .split('/')
              .map((num) => parseInt(num))
              .filter(Boolean)[0],
        },
        {
          field: 'type',
          function: (elm) => titleToListingType(elm.querySelector('.re-Card-title span').textContent),
        },
        { field: 'eurPrice', regExp: /([0-9.,]+) €/, type: Number },
        { field: 'roomsCount', regExp: /([0-9.,]+) habs?\./, regExpFallback: null, type: Number },
        { field: 'squareMeters', regExp: /([0-9.,]+) m²/, type: Number },
      ])
    }
  )

  const listings = (await Promise.all(listingPromises)).filter(Boolean) as Listing[]

  return listings
}
