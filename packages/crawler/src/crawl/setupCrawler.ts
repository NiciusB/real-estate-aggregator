import crawlAllSites from './crawlAllSites'
import { setupDownloadListingImageTimer } from './downloadListingImages'

export default function setupCrawler() {
  // Download images
  setupDownloadListingImageTimer()

  // Setup crawlers
  crawlAllSites({
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
