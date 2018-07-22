import {Component, NgZone} from '@angular/core';
import {Events, NavParams, ViewController} from 'ionic-angular';
import {CargoStatus, CargoTypes, ICargo} from "../../../../common/models/ICargo";
import {ActionType, getActionText} from "../../../../common/models/ActionType";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CargoService} from "../../services/cargo.service";
import {AuthService} from "../../services/auth.service";
import {AddressAutoCompleteService} from "../../services/addressAutoComplete.service";
import {GeolocationService} from "../../services/geolocation.service";
import {EVENTS, HERE} from "../../app/constants";
import {HttpClient} from "@angular/common/http";
import moment = require("moment-timezone");


@Component({
  selector: 'cargo-panel',
  templateUrl: './cargo.panel.html',
})
export class CargoPanel {
  cargo: ICargo;
  actionType: ActionType;
  form: FormGroup;
  cargoTypes: string[] = CargoTypes;

  maxYear: string;
  minYear: string;
  monthShortNames: Array<string>;

  isDistanceCalculation = false;
  isCurrentAddressLoading = false;

  constructor(private  http: HttpClient, public events: Events, private geolocationService: GeolocationService, private zone: NgZone, public autoCompleteAddressService: AddressAutoCompleteService, private cargoService: CargoService, private authService: AuthService, public viewCtrl: ViewController, public navParams: NavParams) {

    if (!navParams.data['actionType']) {
      throw new Error('Unrecognized operation')
    }
    if (!navParams.data['data']) {
      // throw new Error('Empty data')
    }

    this.actionType = navParams.data['actionType'];
    if (this.actionType === ActionType.create) {
      this.cargo = {
        description: null,
        type: null,
        weight: null,
        volume: null,
        from: null,
        to: null,
        distance: null,
        price: null,
        dateTime: moment().format(),
        owner: null,
        status: CargoStatus.NEW

      }
    } else if (this.actionType === ActionType.edit) {
      this.cargo = Object.assign({}, navParams.data['cargo']);
      this.cargo.dateTime ? this.cargo.dateTime = moment(this.cargo.dateTime).format() : this.cargo.dateTime = moment().format();
    }

    this.maxYear = moment().add('year', 1).format('YYYY');
    this.minYear = moment().subtract('year', 1).format('YYYY');
    this.monthShortNames = moment.monthsShort();
  }

  get actionText() {
    return getActionText(this.actionType);
  }

  ngOnDestroy() {

  }

  ngOnInit() {
    this.form = new FormGroup({
      description: new FormControl(this.cargo.description, [Validators.required]),
      type: new FormControl(this.cargo.type, [Validators.required]),
      weight: new FormControl(this.cargo.weight, [Validators.required, Validators.min(0.01)]),
      volume: new FormControl(this.cargo.volume, [Validators.required, Validators.min(0.01)]),
      from: new FormControl(this.cargo.from, [Validators.required, Validators.minLength(2)]),
      to: new FormControl(this.cargo.to, [Validators.required, Validators.minLength(2)]),
      distance: new FormControl(this.cargo.distance, [Validators.required, Validators.min(0)]),
      price: new FormControl(this.cargo.price, [Validators.min(0)]),
      dateTime: new FormControl(this.cargo.dateTime, [])

    });
    if (this.actionType === ActionType.create)
      this.getCurrentAddress(false);
  }

  changeMode(actionType: ActionType) {
    this.actionType = actionType
  }

  isOwner() {
    return this.authService.isUserEquals(this.cargo.owner);
  }

  ok() {
    switch (this.actionType) {
      case ActionType.create:
        this.cargoService.create(this.cargo).subscribe(cargo => {
          this.events.publish(EVENTS.CARGO_SET, cargo);
          this.close();
        });
        break;
      case ActionType.edit:
        this.cargoService.save(this.cargo).subscribe(() => {
          this.events.publish(EVENTS.CARGO_SET, this.cargo);
          this.close();
        });
        break;
    }
  }

  close() {
    this.viewCtrl.dismiss();
  }

  canCalculateDistance() {
    return this.form.controls['from'].valid && this.form.controls['to'].valid
  }

  calculateDistance() {
    if (this.isDistanceCalculation) {
      this.isDistanceCalculation = false;
    }
    this.isDistanceCalculation = true;

    Promise.all([
      this.http.get('https://geocoder.cit.api.here.com/6.2/geocode.json\n' +
          `?app_id=${HERE.APP_ID}\n` +
          `&app_code=${HERE.APP_CODE}\n` +
          `&searchtext=${this.cargo.from}`).toPromise(),
      this.http.get('https://geocoder.cit.api.here.com/6.2/geocode.json\n' +
          `?app_id=${HERE.APP_ID}\n` +
          `&app_code=${HERE.APP_CODE}\n` +
          `&searchtext=${this.cargo.to}`).toPromise()
    ])
        .then(result => {


          let waypoint0 = result[0]['Response']['View'][0]['Result'][0]['Location']['DisplayPosition'];
          waypoint0 = [waypoint0.Latitude, waypoint0.Longitude];
          let waypoint1 = result[1]['Response']['View'][0]['Result'][0]['Location']['DisplayPosition'];
          waypoint1 = [waypoint1.Latitude, waypoint1.Longitude];
          console.log(waypoint0, waypoint1);

          this.http.get(`https://route.cit.api.here.com/routing/7.2/calculateroute.json?app_id=${HERE.APP_ID}&app_code=${HERE.APP_CODE}` +
              `&waypoint0=geo!${waypoint0}` +
              `&waypoint1=geo!${waypoint1}` +
              `&mode=fastest;car;traffic:disabled`
          )
              .subscribe(value => {
                let distance = value['response']['route'][0]['summary']['distance'];
                distance = Number.parseFloat((distance / 1000).toFixed(1));

                this.zone.run(() => {
                  this.isDistanceCalculation = false;
                  this.cargo.distance = distance;
                })
              })
        })
  }

  ionAutoInput(control, value) {
    console.log(control, value);
    this.zone.run(() => {
      this.form.controls[control].setValue(value);
    })

  }

  getCurrentAddress(hard?: boolean) {
    try {
      if (this.geolocationService.lastAddress && !hard) {
        this.isCurrentAddressLoading = false;
        this.cargo.from = this.geolocationService.lastAddress;
        return this.ionAutoInput('from', this.geolocationService.lastAddress)
      }
      if (this.isCurrentAddressLoading) {
        return this.isCurrentAddressLoading = false;
      }
      this.isCurrentAddressLoading = true;
      this.geolocationService.getCurrentAddres()
          .then(value => {
            console.info("Current Addres", value);
            this.ionAutoInput('from', value);
            this.isCurrentAddressLoading = false;
          }).catch((err) => {
        console.log(err);
        this.isCurrentAddressLoading = false;
      })

    } catch (err) {
      this.isCurrentAddressLoading = false;
      console.log(err)
    }

  }


}
