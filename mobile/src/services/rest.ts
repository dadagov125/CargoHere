import {HttpClient} from "@angular/common/http";
import {API_URL} from "../app/constants";
import {Identity} from "../../../common/models/Identity";

export class RestFilter {
  [param: string]: string | string[] | any;

  $select?: string[];

  $order?: {
    [key: string]: "ASC" | "DESC";
  };

  $skip?: number;

  $take?: number;
}

export function RestPoint(name: string) {
  return (target: any) => {
    target.prototype.restUrl = API_URL + '/' + name + '/';
    return target;
  };
}

export abstract class RestService {

  protected restUrl: string;

  constructor(protected http: HttpClient) {
  }

}

export abstract class CrudService<T extends Identity> extends RestService {

  constructor(http: HttpClient) {
    super(http);
  }

  public list(filter?: RestFilter) {
    return this.http.get<T[]>(this.restUrl, {params: filter})
  }

  public get(id?: number, filter?: RestFilter) {
    return this.http.get<T>(this.restUrl + id, {params: filter})
  }

  public create(item: T) {
    return this.http.post(this.restUrl, item);
  }

  public save(item: T) {
    return this.http.post(this.restUrl + item.id, item);
  }

  public remove(id: number) {
    return this.http.delete(this.restUrl + id)
  }

  //
  // protected createModal(panel: Object): Promise<T> {
  //   return new Promise<T>((resolve) => {
  //     let modal = this.modalCtrl.create(panel, {actionType: ActionType.create});
  //     modal.onDidDismiss((data: T) => {
  //       resolve(data);
  //     });
  //     modal.present();
  //   });
  // }
  //
  // protected editModal(item: T, panel: Object): Promise<T> {
  //   return new Promise<T>((resolve) => {
  //     let modal = this.modalCtrl.create(panel, {actionType: ActionType.edit});
  //     modal.onDidDismiss((data: T) => {
  //       resolve(data);
  //     });
  //     modal.present();
  //   });
  //
  // }
  //
  // protected viewPage(item: T, page: any){
  //
  // }
  //
  // protected removeModal(item: T): Promise<void> {
  //   throw  new Error();
  // }


}

