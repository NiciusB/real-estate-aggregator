import proxiedFetch from './proxiedFetch'

export default async function getIP() {
  const page = await proxiedFetch('https://api.ipify.org?format=json')
  const json = JSON.parse(await page.$eval('body', (body: HTMLBodyElement) => body.innerText))
  return json.ip as string
}
