import { logMessage, SEVERITY } from '../lib/monitoring-log'
import crawlFotocasa from './sites/fotocasa/fotocasa'
import crawlIdealista from './sites/idealista/idealista'
import crawlPisosCom from './sites/pisos.com/pisos.com'

type SiteOptions = {
  path: string
  locationClue?: string
}
type CrawlOptions = {
  idealista?: SiteOptions[]
  fotocasa?: SiteOptions[]
  pisosCom?: SiteOptions[]
}

async function crawlAll(options: CrawlOptions) {
  const promises: Promise<unknown>[] = []

  if (options.idealista) {
    options.idealista.forEach((opt) => {
      promises.push(crawlIdealista(opt.path, opt.locationClue))
    })
  }
  if (options.fotocasa) {
    options.fotocasa.forEach((opt) => {
      promises.push(crawlFotocasa(opt.path))
    })
  }
  if (options.pisosCom) {
    options.pisosCom.forEach((opt) => {
      promises.push(crawlPisosCom(opt.path, opt.locationClue))
    })
  }

  await Promise.allSettled(promises)

  logMessage('🐸 Finished crawling all sites!', SEVERITY.Debug)
}

export default function setupCrawlers(options: CrawlOptions) {
  const FETCH_INTERVAL_MS = 1000 * 60 * 10 // 10min
  setInterval(crawlAll, FETCH_INTERVAL_MS, options)

  if (process.env.NODE_ENV === 'dev') {
    setTimeout(crawlAll, 10, options)
  }
}
