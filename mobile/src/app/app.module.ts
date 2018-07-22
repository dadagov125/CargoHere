import {ErrorHandler, LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {MyApp} from './app.component';
import {CargoListPage} from '../pages/cargo/cargo-list.page';
import {TransportListPage} from '../pages/transports/transport-list.page';
import {SignInPage} from '../pages/sign/sign-in.page';
import {SignUpPage} from '../pages/sign/sign-up.page';
import localeRu from '@angular/common/locales/ru';
import localeRuExtra from '@angular/common/locales/extra/ru';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {AuthService} from "../services/auth.service";
import {HttpClientModule, HttpClientXsrfModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {CargoService} from "../services/cargo.service";
import {CargoPanel} from "../pages/cargo/cargo.panel";
import {TransportService} from "../services/transport.service";
import {TransportPanel} from "../pages/transports/transport.panel";
import * as moment from "moment";
import {registerLocaleData} from "@angular/common";
import {CargoPage} from "../pages/cargo/cargo.page";
import {AutoCompleteModule} from "ionic2-auto-complete";
import {AddressAutoCompleteService} from "../services/addressAutoComplete.service";
import {GeolocationService} from "../services/geolocation.service";
import {ComponentsModule} from "../components/components.module";
import {OfferPage} from "../pages/offer/offer.page";
import {OfferPanel} from "../pages/offer/offer-panel";
import {OfferService} from "../services/offer.service";
import {CargoMapPanel} from "../pages/cargo/cargo-map.panel";
import {CargoDetailsPanel} from "../pages/cargo/cargo-details.panel";
import {SocketService} from "../services/socket.service";

moment.locale('ru');
registerLocaleData(localeRu, 'ru', localeRuExtra);

@NgModule({
  declarations: [
    MyApp,
    CargoListPage,
    TransportListPage,
    SignInPage,
    SignUpPage,
    CargoPage,
    CargoPanel,
    TransportPanel,
    OfferPage,
    OfferPanel,
    CargoMapPanel,
    CargoDetailsPanel
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AutoCompleteModule,
    HttpClientXsrfModule.withOptions({cookieName: 'session', headerName: 'session'}),
    FormsModule,
    ComponentsModule,
    IonicModule.forRoot(MyApp),

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    CargoListPage,
    TransportListPage,
    SignInPage,
    SignUpPage,
    CargoPanel,
    CargoPage,
    TransportPanel,
    OfferPage,
    OfferPanel,
    CargoMapPanel,
    CargoDetailsPanel
  ],
  providers: [
    {provide: LOCALE_ID, useValue: "ru"},
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService,
    CargoService,
    TransportService,
    AddressAutoCompleteService,
    GeolocationService,
    OfferService,
    SocketService
  ]
})
export class AppModule {
}