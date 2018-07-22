import {Component} from '@angular/core';
import {Events, ModalController, NavController, NavParams} from 'ionic-angular';
import {ICargo} from "../../../../common/models/ICargo";
import {AuthService} from "../../services/auth.service";
import {ActionType} from "../../../../common/models/ActionType";
import {CargoPanel} from "./cargo.panel";
import {EVENTS} from "../../app/constants";
import {SignInPage} from "../sign/sign-in.page";
import {OfferPanel} from "../offer/offer-panel";
import {IOffer, OfferRelation} from "../../../../common/models/IOffer";
import {OfferService} from "../../services/offer.service";
import {OfferPage} from "../offer/offer.page";
import {CargoMapPanel} from "./cargo-map.panel";


@Component({
  selector: 'cargo-page',
  templateUrl: './cargo.page.html'
})
export class CargoPage {
  cargo: ICargo;

  onCargoSet = (cargo: ICargo) => {
    if (cargo) {
      this.cargo = cargo;
    }
  };

  onOfferSet = (offer: IOffer) => {
    if (!this.cargo.offers) this.cargo.offers = [];
    this.cargo.offers.push(offer);
    this.events.publish(EVENTS.CARGO_SET, this.cargo)
  };

  constructor(private offerService: OfferService, private navCtrl: NavController, private events: Events, public authService: AuthService, private navParams: NavParams, private modalCtrl: ModalController) {
    this.cargo = this.navParams.data['cargo'];
  }

  ngOnInit() {

    this.events.subscribe(EVENTS.CARGO_SET, this.onCargoSet);
    this.events.subscribe(EVENTS.OFFER_SET, this.onOfferSet);

    this.offerService
        .getOffersOfCargo(this.cargo)
        .subscribe(offers => {

          this.cargo.offers = offers;
          // this.events.publish(EVENTS.CARGO_SET, this.cargo);
        });

  }

  ngOnDestroy() {
    this.events.unsubscribe(EVENTS.CARGO_SET, this.onCargoSet);
    this.events.unsubscribe(EVENTS.OFFER_SET, this.onOfferSet);
  }

  edit() {
    this.modalCtrl.create(CargoPanel, {
      cargo: this.cargo,
      actionType: ActionType.edit
    }).present();
  }

  isOwner() {
    return this.authService.isUserEquals(this.cargo.owner);
  }

  isMyOffer() {

    if (!this.cargo.offers) {
      return false;
    }
    if (this.isOwner()) {
      return false;
    }
    return this.cargo.offers.some(o => this.authService.isUserEquals(o.transport.owner));
  }

  get offerCount() {
    if (!this.cargo.offers) return 0;
    return this.cargo.offers.length
  }

  getMyOffer() {
    if (!this.isMyOffer()) return;
    return this.cargo.offers.find(o => this.authService.isUserEquals(o.transport.owner));
  }

  doOffer() {
    if (!this.authService.isLoggedIn.getValue()) {
      return this.navCtrl.push(SignInPage);
    }
    this.modalCtrl.create(OfferPanel, {
      cargo: this.cargo,
      actionType: ActionType.create,
      relation: OfferRelation.TRANSPORT_TO_CARGO
    }).present();
  }

  offerPage(offer: IOffer) {
    this.navCtrl.push(OfferPage, {offer})
  }

  openMapPanel() {
    console.log('asdadasdas');
    this.modalCtrl.create(CargoMapPanel, {cargo: this.cargo})
        .present()
  }

}
