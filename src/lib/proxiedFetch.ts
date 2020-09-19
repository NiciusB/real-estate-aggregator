import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { Browser } from 'puppeteer'

puppeteer.use(StealthPlugin())

let _browser: Browser
async function getBrowser() {
  if (!_browser) {
    _browser = await puppeteer.launch({
      args: [`--proxy-server=${process.env.PROXY_URL}`],
    })
  }
  return _browser
}

async function getNewPage() {
  const browser = await getBrowser()
  const page = await browser.newPage()
  await page.authenticate({
    username: process.env.PROXY_USER,
    password: process.env.PROXY_PASS,
  })
  return page
}

export default async function proxiedFetch(url: string) {
  const page = await getNewPage()
  await page.goto(url)

  if (process.env.NODE_ENV === 'dev') {
    await page.screenshot({ path: `${__dirname}/../../logs/last_fetch.jpg` })
  }

  return page
}
