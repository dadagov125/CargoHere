import {Component} from '@angular/core';
import {ModalController, NavController} from 'ionic-angular';
import {ITransport} from "../../../../common/models/ITransport";
import {TransportService} from "../../services/transport.service";
import {ActionType} from "../../../../common/models/ActionType";
import {SignInPage} from "../sign/sign-in.page";
import {TransportPanel} from "./transport.panel";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'transport-list-page',
  templateUrl: 'transport-list.page.html'
})
export class TransportListPage {
  transports: Map<any, ITransport> = new Map<any, ITransport>();

  constructor(private modalCtrl: ModalController, public navCtrl: NavController, private transportService: TransportService, private authService: AuthService) {
    this.loadTransports()
  }

  get transportList() {
    return Array.from(this.transports.values())
  }

  transportPanel(actionType: ActionType, transport: ITransport) {

    if (actionType != ActionType.view && !this.authService.isLoggedIn.getValue()) {
      return this.navCtrl.push(SignInPage);
    }

    let transportPanel = this.modalCtrl.create(TransportPanel, {
      data: transport,
      actionType: actionType
    });
    transportPanel.onDidDismiss((result) => {
      if (result.actionType && result.data) {
        this.transports.set(result.data.id, result.data)
      }
    });
    transportPanel.present()
  }


  loadTransports() {
    this.transportService.list().subscribe((trans: ITransport[]) => {
      console.debug("transports loaded", trans);
      trans.forEach((value) => {
        this.transports.set(value.id, value)
      })
    })
  }

}
