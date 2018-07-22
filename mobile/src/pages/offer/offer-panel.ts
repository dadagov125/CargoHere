import {Component} from '@angular/core';
import {Events, NavController, NavParams, ViewController} from 'ionic-angular';
import {ICargo} from "../../../../common/models/ICargo";
import {IOffer, OfferRelation, OfferStatus} from "../../../../common/models/IOffer";
import {ActionType} from "../../../../common/models/ActionType";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ITransport} from "../../../../common/models/ITransport";
import {TransportService} from "../../services/transport.service";
import {AuthService} from "../../services/auth.service";
import {OfferService} from "../../services/offer.service";
import {EVENTS} from "../../app/constants";


@Component({
  selector: 'offer-panel',
  templateUrl: './offer-panel.html',
})
export class OfferPanel {


  offer: IOffer;

  relation: OfferRelation;

  actionType: ActionType;

  form: FormGroup;

  transports?: ITransport[];

  cargos?: ICargo[];

  constructor(public events: Events, private offerService: OfferService, private authService: AuthService, private transportService: TransportService, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {

    let cargo: ICargo = this.navParams.data['cargo'];
    let transport: ITransport = this.navParams.data['transport'];

    this.relation = this.navParams.data['relation'];
    this.actionType = this.navParams.data['actionType'];


    if (this.actionType === ActionType.create) {
      this.offer = {
        text: '',
        price: 0,
        relation: this.relation,
        status: OfferStatus.WAIT,
        cargo: cargo,
        transport: transport,
        created: null
      }
    } else {
      this.offer = Object.assign({}, navParams.data['offer']);
    }

    if (this.relation === OfferRelation.TRANSPORT_TO_CARGO) {
      this.transportService
          .getTransportsOfUser(this.authService.user)
          .subscribe(list => {
            this.transports = list;
          })
    } else if (this.relation === OfferRelation.CARGO_TO_TRANSPORT) {

    }

  }

  get relationName() {
    return this.relation === OfferRelation.TRANSPORT_TO_CARGO ? 'Предложение транспорта' : 'Предложение груза';
  }

  ngOnInit() {
    this.form = new FormGroup({
      text: new FormControl(this.offer.text, [Validators.required, Validators.minLength(3)]),
      price: new FormControl(this.offer.price, [Validators.required, Validators.min(0)]),
      transport: new FormControl(this.offer.transport, [Validators.required]),
      cargo: new FormControl(this.offer.cargo, [Validators.required])
    });

  }

  ngOnDestroy() {

  }

  ok() {

    if (this.relation === OfferRelation.TRANSPORT_TO_CARGO) {
      this.offer.transport.owner = this.authService.user;

    } else if (this.relation === OfferRelation.CARGO_TO_TRANSPORT) {
      this.offer.cargo.owner = this.authService.user;
    }

    switch (this.actionType) {
      case ActionType.create:

        this.offerService
            .create(this.offer)
            .subscribe(offer => {
              this.events.publish(EVENTS.OFFER_SET, offer);
              this.close();
            });

        break;

      case ActionType.edit:
        this.offerService
            .save(this.offer)
            .subscribe(() => {
              this.events.publish(EVENTS.OFFER_SET, this.offer);
              this.close();
            });
        break;

    }
  }

  close() {
    this.viewCtrl.dismiss();
  }

}
