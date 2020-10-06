import Listing from '../../models/Listing'
import ListingPictures from '../../models/ListingPictures'
import crawlFotocasa from './fotocasa/fotocasa'
import crawlIdealista from './idealista/idealista'
import crawlPisosCom from './pisos.com/pisos.com'

type SiteOptions = {
  path: string
}
type CrawlOptions = {
  idealista?: SiteOptions[]
  fotocasa?: SiteOptions[]
  pisosCom?: SiteOptions[]
}

async function crawlAll(options: CrawlOptions) {
  const promises: Promise<{
    listings: Listing[]
    listingPictures: ListingPictures[]
  }>[] = []

  if (options.idealista) {
    options.idealista.forEach((opt) => {
      promises.push(crawlIdealista(opt.path))
    })
  }
  if (options.fotocasa) {
    options.fotocasa.forEach((opt) => {
      promises.push(crawlFotocasa(opt.path))
    })
  }
  if (options.pisosCom) {
    options.pisosCom.forEach((opt) => {
      promises.push(crawlPisosCom())
    })
  }

  const results = await Promise.all(promises)

  // Save to DB
  await Promise.all(
    results
      .map((res) => res.listings)
      .flat()
      .map((res) => res.save())
  )
  await Promise.all(
    results
      .map((res) => res.listingPictures)
      .flat()
      .map((res) => res.save())
  )
}

export default function setupCrawlers(options: CrawlOptions) {
  setInterval(crawlAll, 60 * 60 * 1000, options)

  if (process.env.NODE_ENV === 'dev') {
    setTimeout(crawlAll, 10, options)
  }
}
