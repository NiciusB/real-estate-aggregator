import { prepareBrowser } from './lib/proxiedFetch'
import setupCrawlers from './sites/crawl_all'

export default async function main() {
  console.log(`✨ Aggregator started`)
  await prepareBrowser()

  setupCrawlers({
    idealista: [
      {
        path: 'venta-viviendas/a-coruna-a-coruna',
      },
    ],
  })
}
