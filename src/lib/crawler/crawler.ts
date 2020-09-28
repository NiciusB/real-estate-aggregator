import { ElementHandle } from 'puppeteer'
import { logMessage, SEVERITY } from '../../lib/monitoring-log'
import { parseNumber } from '../utils'
import { Listing, Strategy } from './site_definitions'

export default async function getListingFromElement(
  elm: ElementHandle<Element>,
  site: string,
  strategies: Strategy[]
): Promise<Listing | null> {
  const text = await elm.evaluate((e) => e.textContent)
  const result = {
    id: null,
    site,
    eurPrice: null,
    roomsCount: null,
    squareMeters: null,
  }

  await Promise.all(
    strategies.map(async (strategy) => {
      try {
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
          res = await elm.evaluate(strategy.function)
        }

        if (strategy.type === Number) {
          res = parseNumber(res)
        }

        result[strategy.field] = res
      } catch (err) {
        err.message = `🐛 [getListingFromElement] ${site} ${strategy.field}: ${err.message}`
        logMessage(err, SEVERITY.Error, text)
      }
    })
  )

  return result
}
