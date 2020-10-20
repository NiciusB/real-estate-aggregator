import { sequelize } from './db'
import { logMessage, SEVERITY } from './lib/monitoring-log'
import { prepareBrowser } from './lib/proxiedFetch'
import setupCrawler from './crawl/setupCrawler'

export default async function main() {
  logMessage(`✨ Aggregator started`, SEVERITY.Info)

  // Connect to db
  await sequelize.authenticate()
  await sequelize.sync()

  // Prepare puppeteer
  await prepareBrowser()

  setupCrawler()
}
