import { logMessage, SEVERITY } from '../../../lib/monitoring-log'
import proxiedFetch from '../../lib/proxiedFetch'
import getListingFromElement from '../../lib/crawler'
import { ListingType } from '../../../../models/Listing'
import { titleToListingType } from '../../lib/utils'
import ListingPictures from '../../../../models/ListingPictures'

export default async function crawlIdealista(path: string, locationClue: string) {
  return getList(path, locationClue)
}

async function getList(path: string, locationClue: string) {
  const { page, body } = await proxiedFetch(`https://www.idealista.com/${path}/?ordenado-por=fecha-publicacion-desc`)

  if (body.innerHTML.includes('parece que estamos recibiendo muchas peticiones tuyas en poco tiempo')) {
    logMessage('🤖 Bot check on idealista', SEVERITY.Warning)
    return null
  }

  const rawListingPictures = (await page.evaluate(
    `Object.entries(listingMultimediaGallery)
      .map(([key, val]) => ({ siteListingId: key, picUrls: val.map(a => a.src) }))
      `
  )) as [{ siteListingId: string; picUrls: string[] }]

  const listingPromises = Array.from(body.querySelectorAll('main#main-content article.item')).map(async (item) => {
    const listing = await getListingFromElement(item, 'idealista', locationClue, [
      {
        field: 'siteId',
        type: String,
        function: (elm) => elm.querySelector('a.item-link').getAttribute('href').split('/')[2],
      },
      {
        field: 'type',
        function: (elm) => titleToListingType(elm.querySelector('a.item-link').textContent),
      },
      {
        field: 'location',
        function: (elm) => elm.querySelector('a.item-link').textContent.replace(/^(.+?) en /, ''),
        type: String,
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

    if (!listing) return

    await listing.save()

    await Promise.allSettled(
      rawListingPictures
        .find((list) => list.siteListingId === listing.siteId)
        .picUrls.map((originalUrl) =>
          ListingPictures.upsert({
            listingId: listing.id,
            originalUrl,
          })
        )
    )
  })

  await Promise.allSettled(listingPromises)
}
