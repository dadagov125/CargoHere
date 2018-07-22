import {Component} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {NavParams, ViewController} from "ionic-angular";
import {GeolocationService} from "../../services/geolocation.service";
import {AuthService} from "../../services/auth.service";
import {IOffer, OfferStatus} from "../../../../common/models/IOffer";
import {OfferService} from "../../services/offer.service";
import {CargoStatus} from "../../../../common/models/ICargo";

@Component({
  selector: 'cargo-details-panel',
  templateUrl: './cargo-details.panel.html'
})
export class CargoDetailsPanel {


  offer: IOffer;


  constructor(private offerService: OfferService, public authService: AuthService, private http: HttpClient, private viewCtrl: ViewController, private navParams: NavParams, private geolocationService: GeolocationService) {
    this.offer = navParams.data['offer'] as IOffer;
    if (!this.offer) throw Error('cargo')

  }


  close() {
    this.viewCtrl.dismiss();
  }


  isMyOffer() {

    return this.authService.isUserEquals(this.offer.transport.owner)
  }

  delivered() {
    this.offerService.delivery(this.offer)
        .subscribe(() => {
          this.offer.status = OfferStatus.COMPLETED;
          this.offer.cargo.status = CargoStatus.DELIVERED
        })
  }

}