import { logMessage, SEVERITY } from '../../lib/monitoring-log'
import { parseNumber } from '../utils'
import Listing from '../../../models/Listing'
import geocodingApi from '../geocodingApi'

type Strategy = {
  field: string
  type?: NumberConstructor | StringConstructor

  /**
   * If it returns false, we skip getting it's value
   */
  guard?: (wipListing: Listing) => boolean

  // regexp strategy
  regExp?: RegExp
  regExpFallback?: any

  // function stratey
  function?: (elm: Element) => any
}

export default async function getListingFromElement(
  elm: Element,
  site: string,
  locationClue: string,
  strategies: Strategy[]
): Promise<Listing | null> {
  const siteIdIndex = strategies.findIndex((s) => s.field === 'siteId')
  const siteId = await parseStrategyRaw(strategies[siteIdIndex], elm)
  strategies.splice(siteIdIndex, 1)

  const [listing] = await Listing.findOrBuild({
    where: { site, siteId },
  })

  // Get the "type" field before others, because we might use it in guards
  const typeIndex = strategies.findIndex((s) => s.field === 'type')
  await parseStrategy(strategies[typeIndex], elm, listing)
  strategies.splice(typeIndex, 1)

  // Run all the other ones
  await Promise.all(strategies.map((strategy) => parseStrategy(strategy, elm, listing)))

  // We only use getListingFromElement for parsing user interfaces, and they don't have the exact coordinates, so we get them from the location string
  // We skip it if the listing already exists, because we don't want to make unnecessary API requests
  if (listing.isNewRecord && listing.location) {
    try {
      const coordinates = await geocodingApi(listing.location + ' ' + locationClue)
      listing.latitude = coordinates.lat
      listing.longitude = coordinates.lng
      listing.areCoordiantesAccurate = false
    } catch (err) {}
  }

  return listing

  async function parseStrategy(strategy: Strategy, elm: Element, wipListing: Listing) {
    const text = elm.textContent
    try {
      if (strategy.guard !== undefined && !strategy.guard(wipListing)) {
        return
      }

      wipListing[strategy.field] = await parseStrategyRaw(strategy, elm)
    } catch (err) {
      err.message = `🐛 [getListingFromElement] ${wipListing.site} ${strategy.field}: ${err.message}`
      logMessage(err, SEVERITY.Error, text)
    }
  }

  async function parseStrategyRaw(strategy: Strategy, elm: Element) {
    const text = elm.textContent

    let res = null
    if (strategy.regExp) {
      const regexp = strategy.regExp.exec(text)
      if (regexp && regexp.length >= 2) {
        res = regexp[1]
      } else if (strategy.regExpFallback !== undefined) {
        res = strategy.regExpFallback
      } else {
        throw new Error("Regexp didn't find anything")
      }
    } else if (strategy.function) {
      res = await strategy.function(elm)
    }

    if (res === null) {
      return res
    }

    if (strategy.type === Number) {
      res = parseNumber(res)
    } else if (strategy.type === String) {
      res = res + ''
    }

    return res
  }
}
