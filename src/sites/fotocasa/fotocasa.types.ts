// http://json2ts.com/

export declare module FotocasaApi {
  export interface Coordinates {
    latitude: number
    longitude: number
    accuracy: number
  }

  export interface Date {
    diff: number
    unit: string
    timestamp: number
  }

  export interface Detail {
    'es-ES': string
  }

  /**
   * Things like number of bathrooms, square meters, etc...
   */
  export interface Feature {
    key: string
    value: number
    maxValue: number
    minValue: number
  }

  export interface Multimedia {
    type: string
    src: string
  }

  export interface Realestate {
    accuracy: boolean
    buildingSubtype: string
    buildingType: string
    clientAlias: string
    clientId: number
    clientUrl: string
    coordinates: Coordinates
    date: Date
    description: string
    detail: Detail
    features: Feature[]
    id: number
    isExternalContact: boolean
    isFaved: boolean
    isHighlighted: boolean
    isMsAdvance: boolean
    isNew: boolean
    isNewConstruction: boolean
    isOpportunity: boolean
    isPhotoReport: boolean
    isPremium: boolean
    isTop: boolean
    isVirtualTour: boolean
    location: string
    minPrice: number
    multimedia: Multimedia[]
    periodicityId: number
    phone: string
    price: string
    promotionId: number
    promotionLogo: string
    promotionUrl: string
    rawPrice: number
    reducedPrice?: any
    subtypeId: number
    transactionTypeId: number
    typeId: number
  }
}
