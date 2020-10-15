import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { Browser } from 'puppeteer'
import { JSDOM } from 'jsdom'
import * as fs from 'fs'
import getIP from './getIP'
import { logMessage, SEVERITY } from './monitoring-log'

puppeteer.use(StealthPlugin())

// === Page stuff ===
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
  logMessage(`🔎 Getting ${url}`, SEVERITY.Debug)
  const page = await getNewPage()
  const response = await page.goto(url, { waitUntil: 'networkidle0' })
  await autoScrollToBottom(page)
  logMessage(`🔎 Got ${url}`, SEVERITY.Debug)

  if (process.env.NODE_ENV === 'dev') {
    await page.screenshot({ path: `${__dirname}/../../logs/last_fetch.jpg` })
  }

  const html = await page.$eval('body', (body) => body.innerHTML)
  return {
    page,
    body: new JSDOM(html).window.document.body,
    response,
    sourceHtml: await response.text(),
  }
}

async function autoScrollToBottom(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      const scrollCheckInterval = 1000
      const maxScrollTime = 1000 * 25

      let lastHeight = 0
      const timer = setInterval(() => {
        const heightNow = document.body.scrollHeight
        window.scrollBy(0, Number.MAX_SAFE_INTEGER)

        if (lastHeight === heightNow) {
          end()
        }
        lastHeight = heightNow
      }, scrollCheckInterval)

      const timeout = setTimeout(end, maxScrollTime)

      function end() {
        clearInterval(timer)
        clearTimeout(timeout)
        resolve()
      }
    })
    window.scrollTo(0, 0)
  })
}

// === Browser stuff ===
const MAX_BROWSER_LIFETIME_MS = 1000 * 60 * 9

export async function prepareBrowser() {
  // For last_fetch.jpg
  if (!fs.existsSync(`${__dirname}/../../logs`)) {
    fs.mkdirSync(`${__dirname}/../../logs`)
  }

  console.log(`✨ IP: ${await getIP()}`)
}

let _browserPromise: Promise<Browser> = null
let _browserCreatedAt: number = null
async function getBrowser() {
  if (_browserPromise && Date.now() - _browserCreatedAt > MAX_BROWSER_LIFETIME_MS) {
    closeBrowser(_browserPromise)
    _browserPromise = null
  }
  if (!_browserPromise) {
    _browserPromise = createBrowserAsync()
  }

  return await _browserPromise
}

function createBrowserAsync() {
  let proxyArg = ''
  if (process.env.PROXY_URL) {
    const proxyUrls = process.env.PROXY_URL.split('|')
    const proxyUrl = proxyUrls[Math.floor(Math.random() * proxyUrls.length)]
    console.log(`✨ Proxy: ${proxyUrl}`)
    proxyArg = `--proxy-server=${proxyUrl}`
  }

  _browserCreatedAt = Date.now()
  return puppeteer.launch({
    headless: true,
    args: [proxyArg],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  })
}

async function closeBrowser(browserPromise) {
  const browser = await browserPromise

  // Close tabs
  for (const page of await browser.pages()) {
    await page.close()
  }

  // Close browser
  await browser.close()
}
