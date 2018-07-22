import {HttpClient} from '@angular/common/http';
import {Injectable} from "@angular/core";
import {ITransport} from "../../../common/models/ITransport";
import {CrudService, RestPoint} from "./rest";
import {IUser} from "../../../common/models/IUser";

@Injectable()
@RestPoint('transport')
export class TransportService extends CrudService<ITransport> {

  constructor(http: HttpClient) {
    super(http);

  }

  getTransportsOfUser(user: IUser) {
    if (user) {
      return this.list({
        "owner.id": user.id
      })
    }

  }

}