import proxiedFetch from '../../lib/proxiedFetch'
import getListingFromElement from '../../lib/crawler/crawler'
import Listing from '../../../models/Listing'
import { titleToListingType } from '../../lib/utils'
import ListingPictures from '../../../models/ListingPictures'
import { FotocasaApi } from './fotocasa.types'

export default async function crawlFotocasa(path: string) {
  return getList(path)
}

async function getList(path: string): Promise<{ listings: Listing[]; listingPictures: ListingPictures[] }> {
  const { body, sourceHtml } = await proxiedFetch(`https://www.fotocasa.es/es/${path}`)

  // TODO: Reemplace html scraping with apiRealEstates, which already has everything nicely formatted

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

  const nextInitialProps = JSON.parse(
    /window\.__INITIAL_PROPS__ = JSON\.parse\("(.*[^\\])"\)/.exec(sourceHtml)[1].replace(/\\(.)/g, '$1')
  )

  const apiRealEstates = nextInitialProps.initialSearch.result.realEstates as FotocasaApi.Realestate[]

  const listingPictures = await Promise.all(
    apiRealEstates
      .map((realEstate) =>
        realEstate.multimedia.map(async (multimedia) => {
          return (
            await ListingPictures.findOrBuild({
              where: { listingId: realEstate.id, originalUrl: multimedia.src },
            })
          )[0]
        })
      )
      .flat()
  )

  return { listings, listingPictures }
}
