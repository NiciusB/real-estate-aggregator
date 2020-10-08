import Listing from '../../models/Listing'
import ListingPictures from '../../models/ListingPictures'
import { logMessage, SEVERITY } from '../lib/monitoring-log'
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
      promises.push(crawlPisosCom(opt.path))
    })
  }

  const results = (await Promise.allSettled(promises))
    .map((p) => (p.status === 'fulfilled' ? p.value : null))
    .filter(Boolean)

  logMessage('🐸 Finished crawling all sites!', SEVERITY.Debug)

  // Save to DB
  await Promise.allSettled(
    results
      .map((res) => res.listings)
      .flat()
      .map((res) => res.save())
  )
  await Promise.allSettled(
    results
      .map((res) => res.listingPictures)
      .flat()
      .map((res) => res.save())
  )

  logMessage('🐸 Finished saving new data!', SEVERITY.Debug)
}

export default function setupCrawlers(options: CrawlOptions) {
  const FETCH_INTERVAL_MS = 1000 * 60 * 10 // 10min
  setInterval(crawlAll, FETCH_INTERVAL_MS, options)

  if (process.env.NODE_ENV === 'dev') {
    setTimeout(crawlAll, 10, options)
  }
}
