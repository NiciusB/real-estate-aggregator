import { getList } from './idealista_api'

export default async function crawlIdealista(path: string) {
  const listings = getList(path)
  return listings
}
