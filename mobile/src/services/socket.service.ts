import {Injectable} from "@angular/core";
import {EVENTS, SOCKET_URL} from "../app/constants";
import * as io from "socket.io-client"
import {Events} from "ionic-angular";

@Injectable()
export class SocketService {

  public socket: any;

  constructor(private events: Events) {
    this.socketInit()
  }

  private socketInit() {

    if (this.socket && this.socket.connected) return;
    this.socket = io(SOCKET_URL, {
          transports: ['websocket'],
          autoConnect: false
        }
    );

    this.socket.connect();

    this.socket.on('connect', () => {
      console.log("connect", this.socket);
      this.events.publish(EVENTS.WATCH_GEO);

    });

  }


}