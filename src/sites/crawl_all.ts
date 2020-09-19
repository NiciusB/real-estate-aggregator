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
  const promises = []

  if (options.idealista) {
    options.idealista.forEach((opt) => {
      promises.push(crawlIdealista(opt.path))
    })
  }
  if (options.fotocasa) {
    options.fotocasa.forEach((opt) => {
      promises.push(crawlFotocasa())
    })
  }
  if (options.pisosCom) {
    options.pisosCom.forEach((opt) => {
      promises.push(crawlPisosCom())
    })
  }

  const results = (await Promise.all(promises)).flat()
  console.log(results)
}

export default function setupCrawlers(options: CrawlOptions) {
  setInterval(crawlAll, 10 * 60 * 1000, options)

  if (process.env.NODE_ENV === 'dev') {
    crawlAll(options)
  }
}
