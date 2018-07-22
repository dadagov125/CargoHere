import {Injectable} from "@angular/core";
import {Geolocation, GeolocationOptions, Geoposition} from "@ionic-native/geolocation";
import {Observable} from "rxjs/Observable";
import {HttpClient} from "@angular/common/http";
import {HERE} from "../app/constants";

@Injectable()
export class GeolocationService {
  private _geolocation: Geolocation;

  public lastAddress: string;

  public lastPosition: Geoposition;

  constructor(private http: HttpClient) {
    this._geolocation = new Geolocation();
  }

  getCurrentPosition(options?: GeolocationOptions): Promise<Geoposition> {
    return this._geolocation.getCurrentPosition(options);
  }

  watchPosition(options?: GeolocationOptions): Observable<Geoposition> {
    return this._geolocation.watchPosition(options);
  }

  getCurrentAddres(): Promise<string> {

    return new Promise((resolve, reject) => {
      let opt: GeolocationOptions = {
        enableHighAccuracy: true,
        timeout: 40000
      };
      this.getCurrentPosition(opt)
          .then((position: Geoposition) => {
            this.lastPosition = position;
            console.info("Geoposition", position);
            this.http.get(`https://reverse.geocoder.api.here.com/6.2/reversegeocode.json?` +
                `app_id=${HERE.APP_ID}&app_code=${HERE.APP_CODE}` +
                `&language=ru_RU` +
                `&pos=${[position.coords.latitude, position.coords.longitude]}` +
                `&mode=retrieveAddresses` +
                `&gen=9` +
                `&level=city` +
                `&maxresults=1` +
                `&prox=${[position.coords.latitude, position.coords.longitude]},10000` +
                `&addressattributes=city,street,houseNumber,postalCode`
            )
                .subscribe(value => {
                  try {
                    let Address = value['Response']['View'][0]['Result'][0]['Location']['Address'];
                    this.lastAddress = [
                      Address['Street'] ? Address['Street'] : undefined,
                      Address['HouseNumber'] ? Address['HouseNumber'] : undefined,
                      Address['City'] ? Address['City'] : undefined,
                    ].filter(value2 => value2).join(', ');

                    resolve(this.lastAddress)

                  } catch (err) {
                    reject(err)
                  }
                })
          })
          .catch((err) => {
            reject(err)
          })
    });


  }
}