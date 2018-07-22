declare module "*.json" {
  const value: any;
  export default value;
}
declare let require: any;

declare const H: any;

declare namespace ymaps {
  function suggest(request: string, options?: any): Promise<any[]>

  function geocode(request: string | number[], options?: Object): Promise<any | GeoObjectCollection>

  interface GeocodeResult {

    events: IEventManager
    geometry: IGeometry | null
    options: IOptionManager
    properties: IDataManager
    state: IDataManager


    getAddressLine (): String

    getAdministrativeAreas (): String[]

    getCountry (): String | null

    getCountryCode (): String | null

    getLocalities (): String[]

  }
}