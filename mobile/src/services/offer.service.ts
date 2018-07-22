import {Injectable} from "@angular/core";
import {IOffer, OfferStatus} from "../../../common/models/IOffer";
import {CrudService, RestPoint} from "./rest";
import {HttpClient} from "@angular/common/http";
import {ICargo} from "../../../common/models/ICargo";
import {IMessage} from "../../../common/models/IMessage";

@Injectable()
@RestPoint("offer")
export class OfferService extends CrudService<IOffer> {
  constructor(http: HttpClient) {
    super(http);

  }

  getOffersOfCargo(cargo: ICargo) {
    if (cargo) {

      return this.http.get<IOffer[]>(`${this.restUrl}cargo/${cargo.id}`)
      // return this.list({
      //   // "cargo.id": cargo.id,
      //   // $relations: ['cargo', 'cargo.owner', 'transport', 'transport.owner']
      // })
    }
  }

  my(status?: OfferStatus) {
    return this.http.get<IOffer[]>(`${this.restUrl}my/all?status=${status}`)
  }

  messages(offerId) {
    return this.http.get<Set<IMessage>>(`${this.restUrl}messages/${offerId}`)
  }

  delivery(offer: IOffer) {
    return this.http.post(`${this.restUrl}${offer.id}/delivery`, offer)
  }

}