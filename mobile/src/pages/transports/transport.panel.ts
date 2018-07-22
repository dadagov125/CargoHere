import {Component} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {ITransport, transportTypes} from "../../../../common/models/ITransport";
import {ActionType} from "../../../../common/models/ActionType";
import {TransportService} from "../../services/transport.service";
import {AuthService} from "../../services/auth.service";
import * as moment from "moment";


@Component({
  selector: 'transport-panel',
  templateUrl: 'transport.panel.html',
})
export class TransportPanel {
  transport: ITransport;
  transportTypes = transportTypes;
  actionType: ActionType;

  maxYear: string;
  minYear: string;
  monthShortNames: Array<string>;

  constructor(private transportService: TransportService, private authService: AuthService, public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {
    this.actionType = this.navParams.get("actionType");

    if (this.actionType === ActionType.create) {


      this.transport = {
        mark: "Камаз",
        model: "505",
        routes: [],
        type: transportTypes[0],
        owner: this.authService.user
      }

    } else {
      this.transport = Object.assign({}, navParams.get('data'));
    }

    this.maxYear = moment().add('year', 1).format('YYYY');
    this.minYear = moment().subtract('year', 1).format('YYYY');
    this.monthShortNames = moment.monthsShort();

  }

  get actionText() {
    let text = '';
    switch (this.actionType) {
      case ActionType.create:
        text = "Создать";
        break;
      case ActionType.edit:
        text = "Сохранить";
        break;
      case ActionType.view:
        text = "Просмотр";
        break;
      case ActionType.delete:
        text = "Удалить";
        break;
      default:

    }
    return text
  }

  addRoute() {
    this.transport.routes.push({
      from: "",
      to: "",
      price: 0,
      dateTime: moment().format(),
      distance: 0
    })
  }

  removeRoute() {
    this.transport.routes.splice(this.transport.routes.length - 1, 1)
  }

  changeMode(actionType: ActionType) {
    this.actionType = actionType
  }

  isOwner() {
    return this.authService.isLoggedIn.getValue() && this.authService.user.id == this.transport.owner.id
  }

  ok() {
    switch (this.actionType) {
      case ActionType.create:
        this.transportService.create(this.transport).subscribe(transport => {
          this.dismiss(transport)
        });
        break;
      case ActionType.edit:
        this.transportService.save(this.transport).subscribe(() => {
          this.dismiss(this.transport)
        });
        break;
    }
  }

  close() {
    if (this.actionType == ActionType.edit) {
      this.changeMode(ActionType.view)
    } else {
      this.actionType = null;
      this.dismiss();
    }
  }

  dismiss(data?: any) {
    this.viewCtrl.dismiss({actionType: this.actionType, data})
  }

}
