import {Component, ViewChild} from '@angular/core';
import {Content, Events, ModalController, NavController, NavParams} from 'ionic-angular';
import {IOffer, OfferRelation, OfferStatus} from "../../../../common/models/IOffer";
import {IMessage} from "../../../../common/models/IMessage";
import {AuthService} from "../../services/auth.service";
import {CargoService} from "../../services/cargo.service";
import {CargoMapPanel} from "../cargo/cargo-map.panel";
import {CargoDetailsPanel} from "../cargo/cargo-details.panel";
import {TransportService} from "../../services/transport.service";
import {SocketService} from "../../services/socket.service";
import {EVENTS} from "../../app/constants";
import {OfferService} from "../../services/offer.service";
import moment = require("moment");


@Component({
  selector: 'offer-page',
  templateUrl: './offer.page.html'
})
export class OfferPage {

  @ViewChild(Content) content: Content;

  offer: IOffer;

  textInput: string;

  socket: any;

  constructor(private offerService: OfferService, private events: Events, private transportService: TransportService, public navCtrl: NavController, public navParams: NavParams, public authService: AuthService, private cargoService: CargoService, private modalCtrl: ModalController, private socketService: SocketService) {
    this.offer = navParams.data['offer'];

    this.cargoService.get(this.offer.cargo.id).subscribe(value => {
      this.offer.cargo = value;
    });

    this.transportService.get(this.offer.transport.id).subscribe(value => {
      this.offer.transport = value
    });

    if (!this.offer.messages) {
      this.offer.messages = new Set<IMessage>()
    }

    this.offerService.messages(this.offer.id)
        .subscribe(value => {
          this.offer.messages = new Set<IMessage>(value)
        });

    this.socket = socketService.socket;


  }

  ngOnInit() {

    // this.socket = io(SOCKET_URL, {
    //       transports: ['websocket'],
    //       autoConnect: true
    //     }
    // );
    // this.socket.connect();

    if (this.socket.disconnected) {
      this.socket.connect()
    }

    console.log(this.socket);

    this.socket.emit('join', 'offer', this.offer.id);

    this.socket.on('connect', () => {
      console.log("connect", this.socket);

      this.socket.emit('join', 'offer', this.offer.id)
    });

    this.socket.on('join', (data) => {
      console.log("join", data)

    });

    this.socket.on('leave', (data) => {
      console.log("leave", data)
    });

    this.socket.on('chat_offer' + this.offer.id, (data) => {

      this.offer.messages.add(data);
      console.log('chat_' + this.offer.id, data)
    });

    this.socket.on('message', (data) => {
      console.log("message", data)
    });

    this.socket.on('disconnect', () => {
      console.log("disconnect")
    });

    this.socket.on('error', (err) => {
      console.log("error", err)
    });

    this.socket.on('reconnect_error', (err) => {
      console.log("reconnect_error", err)
    });

    this.socket.on('connect_error', (err) => {
      console.log("connect_error", err)
    });


  }

  ngOnDestroy() {

  }

  get offerOwner() {
    if (this.offer.relation === OfferRelation.TRANSPORT_TO_CARGO) {
      return this.offer.transport.owner;
    } else if (this.offer.relation === OfferRelation.CARGO_TO_TRANSPORT) {
      return this.offer.cargo.owner;
    }
  }

  acceptOffer() {


  }

  isMyMessage(message: IMessage) {
    return this.authService.isUserEquals(message.author);
  }

  sendComment() {

    this.content.scrollTo(0, this.content.scrollHeight);

    let comment = {
      text: this.textInput,
      created: moment().format(),
      author: this.authService.user,
      offer: {id: this.offer.id}
    };

    this.socket.emit('chat_offer' + this.offer.id, comment);

    this.offer.messages.add(comment as IMessage);

    this.textInput = '';

    console.log('send comment', comment)
  }

  sortedByCreatedMessages() {

    return Array.from(this.offer.messages).sort(((a: IMessage, b: IMessage) => {

      let dateA = moment(a.created),
          dateB = moment(b.created);

      return moment.duration(moment(dateA).diff(dateB)).asSeconds();

    }))

  }

  isAccepted() {
    return this.offer.status === OfferStatus.ACCEPTED;
  }

  isRejected() {
    return this.offer.status === OfferStatus.REJECTED;
  }

  accept() {
    this.cargoService
        .acceptOffer(this.offer.cargo.id, this.offer.id)
        .subscribe((value) => {
          this.offer.status = value.offers.find((el) => el.id === this.offer.id).status;
          this.events.publish(EVENTS.WATCH_GEO);
        });

    console.log('accept')
  }

  reject() {
    this.cargoService
        .rejectOffer(this.offer.cargo.id, this.offer.id)
        .subscribe((value) => {
          this.offer.status = value.offers.find((el) => el.id === this.offer.id).status
        })
  }

  isMyOffer() {

    return this.authService.isUserEquals(this.offer.transport.owner);
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


  openMapPanel() {

    this.modalCtrl.create(CargoMapPanel, {cargo: this.offer.cargo, socket: this.socket})
        .present()
  }

  openDetailsPanel() {

    this.modalCtrl.create(CargoDetailsPanel, {offer: this.offer, socket: this.socket})
        .present()
  }

}
