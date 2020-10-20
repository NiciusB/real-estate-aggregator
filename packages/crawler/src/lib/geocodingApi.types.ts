/* eslint-disable camelcase */
// http://json2ts.com/

export declare module GeocodingApi {
  export interface AddressComponent {
    long_name: string
    short_name: string
    types: string[]
  }

  export interface Location {
    lat: number
    lng: number
  }

  export interface Northeast {
    lat: number
    lng: number
  }

  export interface Southwest {
    lat: number
    lng: number
  }

  export interface Viewport {
    northeast: Northeast
    southwest: Southwest
  }

  export interface Geometry {
    location: Location
    location_type: string
    viewport: Viewport
  }

  export interface PlusCode {
    compound_code: string
    global_code: string
  }

  export interface Result {
    address_components: AddressComponent[]
    formatted_address: string
    geometry: Geometry
    place_id: string
    plus_code: PlusCode
    types: string[]
  }

  export interface RootObject {
    results: Result[]
    status: string
  }
}
