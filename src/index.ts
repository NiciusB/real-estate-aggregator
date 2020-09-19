import 'core-js' // Polyfills for ES2020
import * as dotenv from 'dotenv'
import setupCrawlers from './sites/crawl_all'
import * as fs from 'fs'
import getIP from './lib/getIP'

try {
  // For last_fetch.jpg
  fs.mkdirSync('../logs')
} catch (e) {}

dotenv.config()

async function main() {
  console.log(`✨ Aggregator started. IP: ${await getIP()}`)

  setupCrawlers({
    idealista: [
      {
        path: 'venta-viviendas/a-coruna-a-coruna',
      },
    ],
  })
}
main()
