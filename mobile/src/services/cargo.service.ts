import {Injectable} from "@angular/core";

import {CargoStatus, ICargo} from "../../../common/models/ICargo";
import {CrudService, RestPoint} from "./rest";
import {HttpClient} from '@angular/common/http';


@Injectable()
@RestPoint("cargo")
export class CargoService extends CrudService<ICargo> {


  constructor(http: HttpClient) {
    super(http);

  }

  acceptOffer(cargoId: number, offerId: number) {
    return this.http.get<ICargo>(this.restUrl + `${cargoId}/offer/${offerId}/accept`)
  }

  rejectOffer(cargoId: number, offerId: number) {
    return this.http.get<ICargo>(this.restUrl + `${cargoId}/offer/${offerId}/reject`)
  }

  my(status?: CargoStatus) {
    return this.http.get<ICargo[]>(`${this.restUrl}my/all?status=${status}`)
  }

}