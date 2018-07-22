import {Component} from '@angular/core';
import {Events, ModalController, NavController} from 'ionic-angular';
import {CargoService} from "../../services/cargo.service";
import {ICargo} from "../../../../common/models/ICargo";
import {AuthService} from "../../services/auth.service";
import {ActionType} from "../../../../common/models/ActionType";
import {SignInPage} from "../sign/sign-in.page";
import {CargoPage} from "./cargo.page";
import {CargoPanel} from "./cargo.panel";
import {EVENTS} from "../../app/constants";
import {OfferService} from "../../services/offer.service";
import {IOffer, OfferRelation, OfferStatus} from "../../../../common/models/IOffer";
import {OfferPage} from "../offer/offer.page";

@Component({
  selector: 'cargo-list-page',
  templateUrl: 'cargo-list.page.html'
})
export class CargoListPage {

  _cargos: Map<number, ICargo> = new Map<any, ICargo>();

  myOffersWait: IOffer[];

  myOffersAccepted: IOffer[];

  showMap = false;

  segmentState = 'NEW';

  constructor(private offerService: OfferService, public events: Events, private modalCtrl: ModalController, private navCtrl: NavController, private cargoService: CargoService, private authService: AuthService) {

  }

  ngOnInit() {
    this.events.subscribe(EVENTS.CARGO_SET, this.onCargoSet);
    this.segmentChange();
  }

  ngOnDestroy() {
    this.events.unsubscribe(EVENTS.CARGO_SET, this.onCargoSet);
  }


  onCargoSet = (cargo: ICargo) => {
    if (cargo) {
      this._cargos.set(cargo.id, cargo)
    }
  };


  get cargos() {
    return Array.from(this._cargos.values())
  }

  segmentChange() {
    switch (this.segmentState) {
      case 'NEW':
        this.loadCargos();
        break;

      case 'OFFERS':
        this.loadMyOffersWait();
        break;

      case 'PROCESS':
        this.loadMyOffersAccepted();
        break;
    }

  }

  loadMyOffersWait() {
    this.offerService.my(OfferStatus.WAIT).subscribe(values => {
      this.myOffersWait = values;
    })
  }


  loadMyOffersAccepted() {
    this.offerService.my(OfferStatus.ACCEPTED).subscribe(values => {
      this.myOffersAccepted = values;
      this.events.publish(EVENTS.WATCH_GEO);
    })
  }

  loadCargos() {
    this.cargoService.list()
        .subscribe((cargos) => {
          console.log(cargos);
          cargos.forEach(cargo => {
            this._cargos.set(cargo.id, cargo);
          });
        })
  }


  cargoPanel(actionType: ActionType, cargo?: ICargo) {
    if (actionType == ActionType.view) {
      return this.navCtrl.push(CargoPage, {cargo});
    }
    if (!this.authService.isLoggedIn.getValue()) {
      return this.navCtrl.push(SignInPage);
    }

    this.modalCtrl.create(CargoPanel, {
      cargo,
      actionType: actionType
    }).present();
  }


  getShortText(text: string, maxLength: number = text.length, replace: string = '...') {
    if (!text) {
      return text
    } else if (text.length <= maxLength) {
      return text
    } else {
      return text.substring(0, maxLength) + replace
    }
  }

  relationText(relation: OfferRelation) {

  }

  offerStatusText(status: OfferStatus) {
    switch (status) {
      case OfferStatus.ACCEPTED:
        return 'принят';
      case OfferStatus.WAIT:
        return "в ожидании";
      case OfferStatus.REJECTED:
        return 'отклонен';
      case OfferStatus.COMPLETED:
        return 'завершен'
    }

  }


  offerPage(offer: IOffer) {
    this.navCtrl.push(OfferPage, {offer})
  }

}
