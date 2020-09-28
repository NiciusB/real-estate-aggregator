/* eslint-disable no-unused-vars */

export type Listing = {
  site: string
  id: string
  eurPrice: number
  roomsCount: number
  squareMeters: number
  flatFloorNumber?: number
  houseFloorsCount?: number
}

export type Strategy = {
  field: string
  type?: NumberConstructor

  // regexp strategy
  regExp?: RegExp
  regExpFallback?: any

  // function stratey
  function?: (elm: Element) => any
}
