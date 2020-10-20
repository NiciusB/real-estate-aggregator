import { sequelize } from './db'
import { logMessage, SEVERITY } from './lib/monitoring-log'
import setupCrawler from './crawl/setupCrawler'
import setupApiServer from './api'

export default async function main() {
  logMessage(`✨ Aggregator started`, SEVERITY.Info)

  // Connect to db
  await sequelize.authenticate()
  await sequelize.sync()

  if (process.env.DISABLE_CRAWLER !== 'true') {
    setupCrawler()
  }

  setupApiServer()
}
