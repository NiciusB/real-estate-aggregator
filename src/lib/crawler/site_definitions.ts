/* eslint-disable no-unused-vars */

export enum ListingType {
  Casa = 'Casa',
  ChaletPareado = 'ChaletPareado',
  Piso = 'Piso',
  Duplex = 'Duplex',
  Atico = 'Atico',
}

export type Listing = {
  site: string
  type: ListingType
  id: string
  eurPrice: number
  roomsCount: number
  squareMeters: number
  flatFloorNumber?: number
}

export type Strategy = {
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
