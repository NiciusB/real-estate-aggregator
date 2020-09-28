import { logMessage, SEVERITY } from '../../lib/monitoring-log'
import proxiedFetch from '../../lib/proxiedFetch'
import { Listing } from '../../lib/crawler/site_definitions'
import getListingFromElement from '../../lib/crawler/crawler'

export default async function crawlIdealista(path: string) {
  return getList(path)
}

async function getList(path: string): Promise<Listing[]> {
  logMessage("🔎  Getting idealista's html", SEVERITY.Debug)
  const page = await proxiedFetch(`https://www.idealista.com/${path}/?ordenado-por=fecha-publicacion-desc`)
  logMessage("🔎  Got idealista's html", SEVERITY.Debug)

  const html = await page.$eval('body', (body) => body.innerHTML)
  if (html.includes('parece que estamos recibiendo muchas peticiones tuyas en poco tiempo')) {
    logMessage('🤖 Bot check on idealista', SEVERITY.Warning)
    return []
  }

  const items = await page.$$('main#main-content article.item')

  const listingPromises = items.map(async (item) => {
    return getListingFromElement(item, 'idealista', [
      {
        field: 'id',
        function: (elm) => elm.querySelector('a.item-link').getAttribute('href').split('/')[2],
      },
      { field: 'eurPrice', regExp: /([0-9.,]+)€/, type: Number },
      { field: 'roomsCount', regExp: /([0-9.,]+) hab\./, type: Number },
      { field: 'squareMeters', regExp: /([0-9.,]+) m²/, type: Number },
      { field: 'flatFloorNumber', regExp: /([0-9.,]+)ª planta/, regExpFallback: '1', type: Number },
    ])
  })

  return (await Promise.all(listingPromises)).filter(Boolean)
}
