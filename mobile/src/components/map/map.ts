import {Component} from '@angular/core';
import {GeolocationService} from "../../services/geolocation.service";

@Component({
  selector: 'map',
  templateUrl: 'map.html'

})
export class MapComponent {

  map: ymaps.Map;


  constructor(private geolocationService: GeolocationService) {
    console.log('MapComponent Component');
  }

  ngOnInit() {


  }

  createMap(state) {
    this.map = new ymaps.Map('map', state);
  }

  ngOnDestroy() {
    if (this.map)
      this.map.destroy();
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter')
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter');
    if (!window['ymaps']) {
      return console.log("Перезапустите приложение")
    }


    ymaps.ready(() => {
      let controls = ['zoomControl', 'fullscreenControl', 'geolocationControl'];

      this.geolocationService.getCurrentPosition()
          .then(position => {
            this.createMap({
              center: [position.coords.latitude, position.coords.longitude],
              zoom: 12,
              controls: controls
            })
          })
          .catch(err => {
            this.createMap({
              center: [55.76, 37.64],
              zoom: 12,
              controls: controls
            })
          })
    });
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave')
  }

}
