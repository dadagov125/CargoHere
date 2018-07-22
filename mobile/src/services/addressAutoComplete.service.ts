import {AutoCompleteService} from 'ionic2-auto-complete';
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {HERE} from "../app/constants";


@Injectable()
export class AddressAutoCompleteService implements AutoCompleteService {
  labelAttribute = "displayName";

  constructor(private http: HttpClient) {

  }


  getResults(keyword: string) {
    return new Promise((resolve, reject) => {

      this.http.get(`http://autocomplete.geocoder.cit.api.here.com/6.2/suggest.json?app_id=${HERE.APP_ID}&app_code=${HERE.APP_CODE}&query=${keyword}` +
          `&maxresults=4`
      )
          .subscribe(value => {

            let res = (value['suggestions'] as Array<any>).map(value2 => {
              let address = value2['address'];

              let map = value2['label'].split(',').reverse();

              map = [
                map[0] ? map[0] : undefined,
                map[1] ? map[1] : undefined,
                map[2] ? map[2] : undefined,
              ].join(', ');
              return map;
              // let map = [
              //   address['street'] ? address['street'] : undefined,
              //   address['houseNumber'] ? address['houseNumber'] : undefined,
              //   address['city'] ? address['city'] : undefined,
              // ].filter(value2 => value2).join(', ');
              // return map && map.length > 0 ? map : undefined;
            }).filter(value3 => value3);

            resolve(res);
          });
    })
  }
}