import {Component, ViewChild} from '@angular/core';
import {Events, Nav, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {SignInPage} from '../pages/sign/sign-in.page';
import {SignUpPage} from '../pages/sign/sign-up.page';
import {AuthService} from "../services/auth.service";
import {CargoListPage} from "../pages/cargo/cargo-list.page";
import {TransportListPage} from "../pages/transports/transport-list.page";
import {ENV, EVENTS} from "./constants";
import {GeolocationService} from "../services/geolocation.service";
import {SocketService} from "../services/socket.service";
import {OfferService} from "../services/offer.service";
import {OfferStatus} from "../../../common/models/IOffer";
import {Geoposition} from "@ionic-native/geolocation";


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) navCtrl: Nav;
  rootPage: any;

  chats: Array<string>;

  version = ENV.VERSION;
  watchGeo = () => {

    this.chats = [];

    this.offerService.my(OfferStatus.ACCEPTED).subscribe(values => {
      values.forEach(offer => {
        if (this.authService.isUserEquals(offer.transport.owner)) {
          this.socketService.socket.emit('join', 'geo', offer.transport.id);
          this.chats.push('chat_geo' + offer.transport.id);
        }
      });
      console.log(this.chats);
      if (this.chats.length > 0)
        this.geolocationService.watchPosition()
            .subscribe((position: Geoposition) => {
              this.chats.forEach(chat => {
                this.socketService.socket.emit(chat, [position.coords.latitude, position.coords.longitude])
              })
            });
    })
  }

  logout() {
    try {
      this.authService.logout()
    } catch (err) {
    }
  }

  goToLogin(params) {
    if (!params) params = {};
    this.navCtrl.push(SignInPage);
  }

  goToSignup(params) {
    if (!params) params = {};
    this.navCtrl.setRoot(SignUpPage);
  }

  gotToCargoList() {

    this.navCtrl.setRoot(CargoListPage);
  }

  gotToTransportList() {
    this.navCtrl.setRoot(TransportListPage);
  }

  constructor(platform: Platform, private events: Events, statusBar: StatusBar, splashScreen: SplashScreen, public authService: AuthService, private geolocationService: GeolocationService, private socketService: SocketService, private offerService: OfferService) {
    platform.ready().then(() => {
      console.log('platform ready');
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      this.gotToCargoList();

      this.geolocationService.getCurrentAddres();

      events.subscribe(EVENTS.WATCH_GEO, () => {
        console.log('EVENTS', EVENTS.WATCH_GEO);
        setTimeout(() => {
          this.watchGeo();
        }, 1000);
      });

    });
  }

}
