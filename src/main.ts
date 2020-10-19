import { sequelize } from './db'
import { setupDownloadListingImageTimer } from './downloadListingImages'
import { logMessage, SEVERITY } from './lib/monitoring-log'
import { prepareBrowser } from './lib/proxiedFetch'
import setupCrawlers from './sites/crawl_all'

export default async function main() {
  logMessage(`✨ Aggregator started`, SEVERITY.Info)

  // Connect to db
  await sequelize.authenticate()
  await sequelize.sync()

  // Prepare puppeteer
  await prepareBrowser()

  // Download images
  setupDownloadListingImageTimer()

  // Setup crawlers
  setupCrawlers({
    idealista: [
      {
        locationClue: 'A Coruña, Galicia',
        path: 'venta-viviendas/a-coruna-provincia',
      },
    ],
    fotocasa: [
      {
        path:
          'comprar/viviendas/a-coruna-provincia/comarca-de-a-coruna/l?latitude=43.36648237797239&longitude=-8.40839001161291',
      },
    ],
    pisosCom: [
      {
        locationClue: 'A Coruña, Galicia',
        path: 'venta/pisos-area_de_a_coruna',
      },
    ],
  })
}
