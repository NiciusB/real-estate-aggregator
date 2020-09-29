import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { Browser } from 'puppeteer'
import { JSDOM } from 'jsdom'
import * as fs from 'fs'
import getIP from './getIP'

puppeteer.use(StealthPlugin())

let _browser: Browser
async function getBrowser() {
  if (!_browser) {
    const proxyUrls = process.env.PROXY_URL.split('|')
    const proxyUrl = proxyUrls[Math.floor(Math.random() * proxyUrls.length)]
    console.log(`✨ Proxy: ${proxyUrl}`)

    _browser = await puppeteer.launch({
      args: [`--proxy-server=${proxyUrl}`],
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
  const page = await getNewPage()
  await page.goto(url)

  if (process.env.NODE_ENV === 'dev') {
    await page.screenshot({ path: `${__dirname}/../../logs/last_fetch.jpg` })
  }

  const html = await page.$eval('body', (body) => body.innerHTML)
  return new JSDOM(html).window.document.body
}
