import {Identity} from "./Identity";
import {ITransport} from "./ITransport";
import {ICargo} from "./ICargo";
import {IMessage} from "./IMessage";

export interface IOffer extends Identity {

  text: string

  messages?: Set<IMessage>

  price: number

  relation: OfferRelation

  status: OfferStatus

  transport: ITransport

  created: string;

  cargo: ICargo

}

export enum OfferRelation {

  CARGO_TO_TRANSPORT = 0,
  TRANSPORT_TO_CARGO = 1

}

export enum OfferStatus {
  WAIT = 0,
  REJECTED = 1,
  ACCEPTED = 2,
  COMPLETED = 3
}