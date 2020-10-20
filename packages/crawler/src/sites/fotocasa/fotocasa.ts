import proxiedFetch from '../../lib/proxiedFetch'
import Listing from '../../../models/Listing'
import { parseNumber, titleToListingType } from '../../lib/utils'
import ListingPictures from '../../../models/ListingPictures'
import { FotocasaApi } from './fotocasa.types'
import { logMessage, SEVERITY } from '../../lib/monitoring-log'

export default async function crawlFotocasa(path: string) {
  return getList(path)
}

async function getList(path: string): Promise<{ listings: Listing[]; listingPictures: ListingPictures[] }> {
  const { sourceHtml } = await proxiedFetch(`https://www.fotocasa.es/es/${path}`)

  const apiListings = JSON.parse(
    /window\.__INITIAL_PROPS__ = JSON\.parse\("(.*[^\\])"\)/.exec(sourceHtml)[1].replace(/\\(.)/g, '$1')
  ).initialSearch.result.realEstates as FotocasaApi.RootObject[]

  const listingPictures: ListingPictures[] = []

  const listingPromises = apiListings.map(async (realEstate) => {
    try {
      const site = 'fotocasa'
      const siteId = realEstate.id + ''

      const [listing] = await Listing.findOrBuild({
        where: { site, siteId },
      })

      // Fill data using their data structure
      listing.type = titleToListingType(realEstate.buildingSubtype)
      listing.eurPrice = parseNumber(realEstate.price)
      listing.roomsCount = realEstate.features.find((f) => f.key === 'rooms')?.value
      listing.squareMeters = realEstate.features.find((f) => f.key === 'surface')?.value
      listing.flatFloorNumber = realEstate.features.find((f) => f.key === 'floor')?.value

      listing.location = realEstate.location
      listing.latitude = realEstate.coordinates.latitude
      listing.longitude = realEstate.coordinates.longitude
      listing.areCoordiantesAccurate = realEstate.coordinates.accuracy === 1

      // Add pics to listingPictures
      await Promise.allSettled(
        realEstate.multimedia.map(async (multimedia) => {
          listingPictures.push(
            await ListingPictures.findOrBuild({
              where: { listingId: realEstate.id, originalUrl: multimedia.src },
            })[0]
          )
        })
      )

      return listing
    } catch (err) {
      logMessage(err, SEVERITY.Error)
      return false
    }
  })

  const listings = (await Promise.all(listingPromises)).filter((listing): listing is Listing => Boolean(listing))

  return { listings, listingPictures }
}
