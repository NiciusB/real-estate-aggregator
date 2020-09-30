import { logMessage, SEVERITY } from '../../lib/monitoring-log'
import { parseNumber } from '../utils'
import Listing from '../../../models/Listing'

type Strategy = {
  field: string
  type?: NumberConstructor

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
  strategies: Strategy[]
): Promise<Listing | null> {
  const wipListing = new Listing({ site })

  // First of all, get the "type" field, because we use it in guards
  const typeIndex = strategies.findIndex((s) => s.field === 'type')
  await parseStrategy(strategies[typeIndex], wipListing, elm)
  strategies.splice(typeIndex, 1)

  // Run all the other ones
  await Promise.all(strategies.map((strategy) => parseStrategy(strategy, wipListing, elm)))

  return wipListing
}

async function parseStrategy(strategy: Strategy, wipListing: Listing, elm: Element) {
  const text = elm.textContent
  try {
    if (strategy.guard !== undefined && !strategy.guard(wipListing)) {
      return
    }

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

    if (strategy.type === Number) {
      res = parseNumber(res)
    }

    wipListing[strategy.field] = res
  } catch (err) {
    err.message = `🐛 [getListingFromElement] ${wipListing.site} ${strategy.field}: ${err.message}`
    logMessage(err, SEVERITY.Error, text)
  }
}
