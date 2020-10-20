import proxiedFetch from './proxiedFetch'

export default async function getIP() {
  const { body } = await proxiedFetch('https://api.ipify.org?format=json')
  const json = JSON.parse(body.textContent) as { ip: string }
  return json.ip
}
