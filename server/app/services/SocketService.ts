import * as SocketIO from "socket.io";
import {Args, Input, IO, Nsp, Socket, SocketService, SocketSession} from "@tsed/socketio";
import {getManager} from "typeorm"
import {Session} from "../entities/Session";
import * as moment from "moment"
import {User} from "../entities/User";
import {IMessage} from "../../../common/models/IMessage";
import {Message} from "../entities/Message";

@SocketService()
export class SocketServerService {

  @Nsp nsp: SocketIO.Namespace;

  rooms: Map<string, Set<User>>;

  constructor(@IO public serverIO: SocketIO.Server) {

    serverIO.use(async (socket: SocketIO.Socket, next: Function) => {

      try {
        let cookie = require('cookie').parse(socket.handshake.headers.cookie);

        if (!cookie) throw new Error('Authentication: can not parse cookie');

        let sid = require('cookie-parser').signedCookie(cookie['session'], 'mysecretkey');

        if (!sid) throw new Error('Authentication: can not get signed cookie');

        let session: Session = await getManager().findOne(Session, {sid});

        if (!session) throw new Error('Authentication: can not find session');

        let minutesLeft = moment.duration(moment(session.expire).diff(moment())).asMinutes();

        if (minutesLeft < 1) {
          throw new Error('Authentication: session expires')
        }
        let user: User = await getManager().findOne(User, {id: session.sess['passport']['user']}, {
          select: ['id', 'email', 'roles', 'firstName', 'lastName', 'phone']
        });

        if (!user) throw new Error('Authentication: can not find user');

        socket.handshake['session'] = user;

      } catch (err) {
        console.log(err);
        return next(err);
      }
      next();
    });

    this.rooms = new Map<string, Set<User>>();
  }

  @Input("join")
  // @Emit("join") // or Broadcast or BroadcastOthers
  async join(@Args(0) jointType: any, @Args(1) id: any, @SocketSession session: SocketSession, @Socket socket: SocketIO.Socket, @Nsp nsp: SocketIO.Namespace) {

    console.log("join", jointType, id);

    const roomId = jointType + id;

    if (jointType.startsWith('offer')) {
      socket.on("chat_" + roomId, async (msg: IMessage) => {
        msg.created = moment().format();
        if (jointType === 'offer') {
          msg = await getManager().save(Message, msg);
        }
        socket.in(roomId).emit("chat_" + roomId, msg);
        console.log("chat_" + roomId, msg)
      });
    } else if (jointType.startsWith('geo')) {
      socket.on("chat_" + roomId, async (data: Array<number>) => {
        socket.in(roomId).emit("chat_" + roomId, data);
        console.log("chat_" + roomId, data)
      });
    }

    let set: Set<User>;

    if (!this.rooms.has(roomId)) {
      set = new Set<User>();
      this.rooms.set(roomId, set);
    } else {
      set = this.rooms.get(roomId);
    }

    set.add(session.get(socket.id));

    let result = {roomId, users: this.rooms.get(roomId)};

    socket.join(roomId);

    this.serverIO.in(roomId).emit('join', result);

  }

  @Input("leave")
  // @Emit("leave") // or Broadcast or BroadcastOthers
  async leave(@Args(0) roomId: any, @SocketSession session: SocketSession, @Socket socket: SocketIO.Socket, @Nsp nsp: SocketIO.Namespace) {

    console.log("leave", roomId);

    this.rooms.get(roomId).delete(session.get(socket.id));

    let result = {roomId, user: session.get(socket.id)};

    this.serverIO.in(roomId).emit('leave', result);

    socket.removeAllListeners('chat_' + roomId);

    socket.leave(roomId);
  }


  $onNamespaceInit(nsp: SocketIO.Namespace) {
    console.log("$onNamespaceInit", nsp.name)
  }

  $onConnection(@Args() args: any, @Socket socket: SocketIO.Socket, @SocketSession session: SocketSession) {

    session.set(socket.id, socket.handshake['session']);

    console.log('$onConnection', session);
  }


  $onDisconnect(@Socket socket: SocketIO.Socket, @SocketSession session: SocketSession) {
    console.log('$onDisconnect', socket.id);

    this.rooms.forEach((value: Set<User>, key: string) => {
      console.log(value);
      value.delete(session.get(socket.id))
    })

  }

}