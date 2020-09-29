import { logMessage, SEVERITY } from '../../lib/monitoring-log'
import { parseNumber } from '../utils'
import { Listing, Strategy } from './site_definitions'

export default async function getListingFromElement(
  elm: Element,
  site: string,
  strategies: Strategy[]
): Promise<Listing | null> {
  const text = elm.textContent
  const wipListing = {
    id: null,
    type: null,
    site,
    eurPrice: null,
    roomsCount: null,
    squareMeters: null,
  }

  await Promise.all(
    strategies.map(async (strategy) => {
      try {
        if (strategy.guard && !strategy.guard(wipListing)) return

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
        err.message = `🐛 [getListingFromElement] ${site} ${strategy.field}: ${err.message}`
        logMessage(err, SEVERITY.Error, text)
      }
    })
  )

  return wipListing
}
