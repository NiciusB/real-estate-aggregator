import proxiedFetch from '../../lib/proxiedFetch'
import getListingFromElement from '../../lib/crawler/crawler'
import Listing, { ListingType } from '../../../models/Listing'
import { titleToListingType } from '../../lib/utils'
import ListingPictures from '../../../models/ListingPictures'

export default async function crawlPisosCom(path: string, locationClue: string) {
  return getList(path, locationClue)
}

async function getList(
  path: string,
  locationClue: string
): Promise<{ listings: Listing[]; listingPictures: ListingPictures[] }> {
  const { body } = await proxiedFetch(`https://www.pisos.com/${path}`)

  const listingPromises = Array.from(body.querySelectorAll('#parrilla div.row[id]')).map(async (item) => {
    const listing = await getListingFromElement(item, 'pisos.com', locationClue, [
      {
        field: 'siteId',
        type: String,
        function: (elm) => elm.getAttribute('id'),
      },
      {
        field: 'type',
        function: (elm) => titleToListingType(elm.querySelector('h3.title a').textContent),
      },
      {
        field: 'location',
        function: (elm) => elm.querySelector('h3.title a').textContent.replace(/^(.+?) en /, ''),
        type: String,
      },
      { field: 'eurPrice', regExp: /([0-9.,]+) €/, type: Number },
      {
        field: 'roomsCount',
        function: (elm) => elm.querySelector('.item[data-rooms]')?.textContent || null,
        type: Number,
      },
      { field: 'squareMeters', regExp: /([0-9.,]+) m²/, regExpFallback: null, type: Number },
      {
        field: 'flatFloorNumber',
        guard: (wipListing) => [ListingType.Duplex, ListingType.Atico, ListingType.Piso].includes(wipListing.type),
        regExp: /([0-9.,]+)ª planta/,
        regExpFallback: '1',
        type: Number,
      },
    ])

    if (!listing) return

    const listingPictures = await Promise.all(
      Array.from(item.querySelectorAll('.overInfo>img, .photo-main>img, .photo-secondary>img'))
        .map(
          (elm) =>
            (elm.getAttribute('data-lazy-img') ?? elm.getAttribute('src'))
              .replace('/nrds/', '/nrd/') // small to normal
              .replace('/nrd/', '/h700/') // normal to high quality
        )
        .map((picUrl) =>
          ListingPictures.findOrBuild({
            where: { listingId: listing.id, originalUrl: picUrl },
          }).then((r) => r[0])
        )
    )

    return { listing, listingPictures }
  })

  const rawListings = await Promise.all(listingPromises)

  return {
    listings: rawListings.map((l) => l.listing).filter(Boolean),
    listingPictures: rawListings
      .map((l) => l.listingPictures)
      .flat()
      .filter(Boolean),
  }
}
