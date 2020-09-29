import { logMessage, SEVERITY } from '../../lib/monitoring-log'
import proxiedFetch from '../../lib/proxiedFetch'
import { Listing, ListingType } from '../../lib/crawler/site_definitions'
import getListingFromElement from '../../lib/crawler/crawler'

export default async function crawlIdealista(path: string) {
  return getList(path)
}

async function getList(path: string): Promise<Listing[]> {
  logMessage("🔎  Getting idealista's html", SEVERITY.Debug)
  const body = await proxiedFetch(`https://www.idealista.com/${path}/?ordenado-por=fecha-publicacion-desc`)
  logMessage("🔎  Got idealista's html", SEVERITY.Debug)

  if (body.innerHTML.includes('parece que estamos recibiendo muchas peticiones tuyas en poco tiempo')) {
    logMessage('🤖 Bot check on idealista', SEVERITY.Warning)
    return []
  }

  const listingPromises = Array.from(body.querySelectorAll('main#main-content article.item')).map(async (item) => {
    return getListingFromElement(item, 'idealista', [
      {
        field: 'id',
        function: (elm) => elm.querySelector('a.item-link').getAttribute('href').split('/')[2],
      },
      {
        field: 'type',
        function: (elm) => {
          const title = elm.querySelector('a.item-link').textContent
          // TODO: Improve ChaletPareado detections
          if (/Chalet (pareado|adosado)/i.test(title)) return ListingType.ChaletPareado
          if (/^Dúplex/i.test(title)) return ListingType.Duplex
          if (/^Ático/i.test(title)) return ListingType.Atico
          if (/^Casa/i.test(title)) return ListingType.Casa
          if (/^Piso/i.test(title)) return ListingType.Piso
          throw new Error('Unable to find ListingType')
        },
      },
      { field: 'eurPrice', regExp: /([0-9.,]+)€/, type: Number },
      { field: 'roomsCount', regExp: /([0-9.,]+) hab\./, type: Number },
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

  return (await Promise.all(listingPromises)).filter(Boolean)
}
