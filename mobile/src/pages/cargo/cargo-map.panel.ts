import {Component} from "@angular/core";
import {NavParams, ViewController} from "ionic-angular";
import {ICargo} from "../../../../common/models/ICargo";
import {HERE} from "../../app/constants";
import {HttpClient} from "@angular/common/http";
import {GeolocationService} from "../../services/geolocation.service";
import {SocketService} from "../../services/socket.service";

@Component({
  selector: 'cargo-map-panel',
  templateUrl: './cargo-map.panel.html'
})
export class CargoMapPanel {

  cargo: ICargo;

  map: any;

  transportMarker: any;

  socket: any;

  platform: any;

  renderRoute = (result) => {
    let route,
        routeShape,
        startPoint,
        endPoint,
        linestring;
    if (result.response.route) {

      route = result.response.route[0];

      routeShape = route.shape;

      linestring = new H.geo.LineString();

      routeShape.forEach(function (point) {
        let parts = point.split(',');
        linestring.pushLatLngAlt(parts[0], parts[1]);
      });

      startPoint = route.waypoint[0].mappedPosition;
      endPoint = route.waypoint[1].mappedPosition;

      let routeLine = new H.map.Polyline(linestring, {
        style: {strokeColor: '#1c8691', lineWidth: 6, fillColor: 'rgba(0, 85, 170, 0.4)'}
      });

      let startMarker = new H.map.Marker({
        lat: startPoint.latitude,
        lng: startPoint.longitude
      }, {
        icon: new H.map.Icon('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="30px" height="30px">\n' +
            '<g>\n' +
            '\t<g>\n' +
            '\t\t<path d="M423.103,93.304C387.172,34.88,324.703,0,256,0C187.296,0,124.828,34.88,88.897,93.303    c-35.798,58.208-38.769,129.364-7.944,190.343c0.255,0.505,0.539,0.996,0.85,1.469l135.236,205.863    C225.686,504.141,240.25,512,256,512c15.749,0,30.315-7.859,38.962-21.021l135.235-205.863c0.311-0.473,0.595-0.964,0.85-1.469    C461.872,222.667,458.901,151.511,423.103,93.304z M256,294.327c-55.599,0-100.832-45.1-100.832-100.535    S200.401,93.256,256,93.256s100.832,45.1,100.832,100.536C356.832,249.227,311.599,294.327,256,294.327z" fill="#1202eb"/>\n' +
            '\t</g>\n' +
            '</g>\n' +
            '<g>\n' +
            '\t<g>\n' +
            '\t\t<path d="M298.844,161.868c-5.857-5.859-15.355-5.859-21.213-0.001l-29.616,29.615c-0.366,0.366-0.802,0.548-1.331,0.515    c-0.517-0.024-0.947-0.239-1.277-0.637l-10.094-12.184c-5.286-6.379-14.741-7.267-21.121-1.982    c-6.379,5.285-7.267,14.741-1.982,21.121l10.094,12.185c5.691,6.87,14.066,11.049,22.978,11.465    c0.493,0.023,0.984,0.035,1.476,0.035c8.393,0,16.512-3.345,22.471-9.304l29.615-29.615    C304.702,177.223,304.702,167.726,298.844,161.868z" fill="#1202eb"/>\n' +
            '\t</g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '</svg>\n')
      });


      let endMarker = new H.map.Marker({
        lat: endPoint.latitude,
        lng: endPoint.longitude
      }, {
        icon: new H.map.Icon('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="30px" height="30px">\n' +
            '<g>\n' +
            '\t<g>\n' +
            '\t\t<path d="M462.213,50.779c-3.203-5.409-9.439-8.246-15.621-7.108c-74.22,13.668-131.459-3.867-186.814-20.821    C194.281,2.787,132.416-16.163,55.985,22.053c-5.081,2.541-8.291,7.734-8.291,13.415v242.18l7.312-4.363    c0.319-0.192,0.646-0.37,0.979-0.537c76.43-38.212,138.296-19.265,203.793,0.797c55.356,16.956,112.599,34.489,186.814,20.821    c0.337-0.062,0.675-0.112,1.014-0.151l8.008-0.915l-90.491-107.794l95.814-117.613C464.907,63.019,465.416,56.187,462.213,50.779z    " fill="#1ca151"/>\n' +
            '\t</g>\n' +
            '</g>\n' +
            '<g>\n' +
            '\t<g>\n' +
            '\t\t<path d="M69.891,299.332l-22.196,13.248v151.022c0,3.98,1.583,7.798,4.398,10.612l33.437,33.399    c2.929,2.925,6.764,4.386,10.6,4.386c3.836,0,7.672-1.462,10.6-4.387l33.435-33.399c2.816-2.813,4.398-6.63,4.398-10.611V280.828    C120.715,281.077,96.267,286.232,69.891,299.332z" fill="#1ca151"/>\n' +
            '\t</g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '<g>\n' +
            '</g>\n' +
            '</svg>\n')
      });


      this.map.addObjects([routeLine, startMarker, endMarker]);


      this.map.setViewBounds(routeLine.getBounds());
    }
  };

  constructor(private http: HttpClient, private viewCtrl: ViewController, private navParams: NavParams, private geolocationService: GeolocationService, private socketService: SocketService) {
    this.cargo = navParams.data['cargo'] as ICargo;
    this.socket = socketService.socket;
    if (!this.cargo) throw Error('cargo')
  }

  ngOnInit() {

    this.platform = new H.service.Platform({
      'app_id': HERE.APP_ID,
      'app_code': HERE.APP_CODE
    });

    let defaultLayers = this.platform.createDefaultLayers();

    let lastPosition = this.geolocationService.lastPosition ? this.geolocationService.lastPosition : null;

    let center = lastPosition ? {lat: lastPosition.coords.latitude, lng: lastPosition.coords.longitude} : {
      lat: 55.45,
      lng: 37.37
    };


    this.map = new H.Map(document.getElementById('map'), defaultLayers.normal.map,
        {
          zoom: 13,
          center
        });
    let behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));

    this.switchMapLanguage(this.map, this.platform, defaultLayers);
    this.calculateRoute();

    this.socketInit();

  }

  ngOnDestroy() {
    this.socket.emit('leave', 'geo' + this.cargo.transport.id)
  }

  socketInit() {
    if (!this.cargo.transport) return;
    console.log(this.cargo.transport);
    console.log(this.socket);

    if (this.socket.disconnected) {
      this.socket.connect()
    }

    this.socket.emit('join', 'geo', this.cargo.transport.id);

    this.socket.on('connect', () => {
      console.log("connect");
      this.socket.emit('join', 'geo', this.cargo.transport.id);
    });

    this.socket.on('join', (data) => {
      console.log("join", data)
    });

    this.socket.on('leave', (data) => {
      console.log("leave", data)
    });

    this.socket.on('chat_geo' + this.cargo.transport.id, (data) => {
      console.log('chat_geo' + this.cargo.transport.id, data);
      this.trackTrancport(data)
    });

  }

  trackTrancport(geo: Array<number>) {

    if (!this.transportMarker) {
      this.transportMarker = new H.map.Marker({
            lat: geo[0],
            lng: geo[1]
          },
          {
            icon: new H.map.Icon('<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"  x="0px" y="0px"\n' +
                '                     width="30px" height="30px" viewBox="0 0 612 612" style="enable-background:new 0 0 612 612;" xml:space="preserve">\n' +
                '                            <g>\n' +
                '                                <g>\n' +
                '                                    <path d="M226.764,375.35c-28.249,0-51.078,22.91-51.078,51.16c0,28.166,22.829,51.078,51.078,51.078s51.078-22.912,51.078-51.078\n' +
                '                                        C277.841,398.26,255.013,375.35,226.764,375.35z M226.764,452.049c-14.125,0-25.54-11.498-25.54-25.541\n' +
                '                                        c0-14.123,11.415-25.539,25.54-25.539c14.124,0,25.539,11.416,25.539,25.539C252.302,440.551,240.888,452.049,226.764,452.049z\n' +
                '                                         M612,337.561v54.541c0,13.605-11.029,24.635-24.636,24.635h-26.36c-4.763-32.684-32.929-57.812-66.927-57.812\n' +
                '                                        c-33.914,0-62.082,25.129-66.845,57.812H293.625c-4.763-32.684-32.93-57.812-66.845-57.812c-33.915,0-62.082,25.129-66.844,57.812\n' +
                '                                        h-33.012c-13.606,0-24.635-11.029-24.635-24.635v-54.541H612L612,337.561z M494.143,375.35c-28.249,0-51.16,22.91-51.16,51.16\n' +
                '                                        c0,28.166,22.912,51.078,51.16,51.078c28.166,0,51.077-22.912,51.077-51.078C545.22,398.26,522.309,375.35,494.143,375.35z\n' +
                '                                         M494.143,452.049c-14.125,0-25.539-11.498-25.539-25.541c0-14.123,11.414-25.539,25.539-25.539\n' +
                '                                        c14.042,0,25.539,11.416,25.539,25.539C519.682,440.551,508.185,452.049,494.143,452.049z M602.293,282.637l-96.817-95.751\n' +
                '                                        c-6.159-6.077-14.453-9.526-23.076-9.526h-48.86v-18.313c0-13.631-11.004-24.635-24.635-24.635H126.907\n' +
                '                                        c-13.55,0-24.635,11.005-24.635,24.635v3.86L2.3,174.429l177.146,23.068L0,215.323l178.814,25.423L0,256.25l102.278,19.29\n' +
                '                                        l-0.007,48.403h509.712v-17.985C611.983,297.171,608.452,288.796,602.293,282.637z M560.084,285.839h-93.697\n' +
                '                                        c-2.135,0-3.86-1.724-3.86-3.859v-72.347c0-2.135,1.725-3.86,3.86-3.86h17.82c0.985,0,1.971,0.411,2.71,1.068l75.796,72.347\n' +
                '                                        C565.257,281.569,563.532,285.839,560.084,285.839z"/>\n' +
                '                                </g>\n' +
                '                            </g>\n' +
                '                            <g>\n' +
                '                            </g>\n' +
                '                            <g>\n' +
                '                            </g>\n' +
                '                            <g>\n' +
                '                            </g>\n' +
                '                            <g>\n' +
                '                            </g>\n' +
                '                            <g>\n' +
                '                            </g>\n' +
                '                            <g>\n' +
                '                            </g>\n' +
                '                            <g>\n' +
                '                            </g>\n' +
                '                            <g>\n' +
                '                            </g>\n' +
                '                            <g>\n' +
                '                            </g>\n' +
                '                            <g>\n' +
                '                            </g>\n' +
                '                            <g>\n' +
                '                            </g>\n' +
                '                            <g>\n' +
                '                            </g>\n' +
                '                            <g>\n' +
                '                            </g>\n' +
                '                            <g>\n' +
                '                            </g>\n' +
                '                            <g>\n' +
                '                            </g>\n' +
                '                    </svg>')
          });
      this.map.addObject(this.transportMarker);
    }

    this.transportMarker.setPosition({
      lat: geo[0],
      lng: geo[1]
    })


  }

  switchMapLanguage(map, platform, defaultLayers) {
    let mapTileService = platform.getMapTileService({
          type: 'base'
        }),

        chineseMapLayer = mapTileService.createTileLayer(
            'maptile',
            'normal.day',
            256,
            'png8',
            {lg: 'rus', ppi: 320}
        );
    map.setBaseLayer(chineseMapLayer);

    let ui = H.ui.UI.createDefault(map, defaultLayers, 'ru-RU');


  }

  calculateRoute() {
    try {
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


            let routingParameters = {

              'mode': 'fastest;car',

              'waypoint0': 'geo!' + waypoint0,

              'waypoint1': 'geo!' + waypoint1,

              'representation': 'display'
            };


            let router = this.platform.getRoutingService();

            router.calculateRoute(routingParameters, this.renderRoute,
                (error) => {
                  alert(error.message);
                });
          })
    } catch (err) {
      console.log(err)
    }

  }

  close() {
    this.viewCtrl.dismiss();
  }

}