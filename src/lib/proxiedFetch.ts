import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { Browser } from 'puppeteer'
import { JSDOM } from 'jsdom'
import * as fs from 'fs'
import getIP from './getIP'
import { logMessage, SEVERITY } from './monitoring-log'

puppeteer.use(StealthPlugin())

let _browser: Browser
async function getBrowser() {
  if (!_browser) {
    let proxyArg = ''
    if (process.env.PROXY_URL) {
      const proxyUrls = process.env.PROXY_URL.split('|')
      const proxyUrl = proxyUrls[Math.floor(Math.random() * proxyUrls.length)]
      console.log(`✨ Proxy: ${proxyUrl}`)
      proxyArg = `--proxy-server=${proxyUrl}`
    }

    _browser = await puppeteer.launch({
      headless: false,
      args: [proxyArg],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    })

    console.log(`✨ IP: ${await getIP()}`)
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

export async function prepareBrowser() {
  // For last_fetch.jpg
  if (!fs.existsSync(`${__dirname}/../../logs`)) {
    fs.mkdirSync(`${__dirname}/../../logs`)
  }

  await getBrowser()
}

export default async function proxiedFetch(url: string) {
  logMessage(`🔎 Getting ${url}`, SEVERITY.Debug)
  const page = await getNewPage()
  await page.goto(url)
  logMessage(`🔎 Got ${url}`, SEVERITY.Debug)

  if (process.env.NODE_ENV === 'dev') {
    await page.screenshot({ path: `${__dirname}/../../logs/last_fetch.jpg` })
  }

  const html = await page.$eval('body', (body) => body.innerHTML)
  return {
    page,
    body: new JSDOM(html).window.document.body,
  }
}
