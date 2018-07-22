import {IUser} from "./IUser";
import {IOffer} from "./IOffer";
import {Identity} from "./Identity";

export interface IMessage extends Identity {

  text: string

  created: string

  author: IUser

  offer?: IOffer

}