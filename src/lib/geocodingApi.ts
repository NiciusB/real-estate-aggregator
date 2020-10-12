import fetch from 'node-fetch'
import { GeocodingApi } from './geocodingApi.types'

export default async function geocodingApi(address: string) {
  address = encodeURIComponent(address).replace(/%20/g, '+')
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_MAPS_API_KEY}`

  const res = (await fetch(url).then((res) => res.json())) as GeocodingApi.RootObject

  if (res.status !== 'OK' || !res.results[0]) {
    throw new Error(`[geocodingApi] Something went wrong (${JSON.stringify(res)})`)
  }

  return res.results[0].geometry.location
}
