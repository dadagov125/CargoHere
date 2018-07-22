import {IMessage} from "../../../common/models/IMessage";
import {Offer} from "./Offer";
import {User} from "./User";
import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm'

@Entity()
export class Message implements IMessage {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  text: string;
  @Column('timestamp')
  created: string;

  @ManyToOne(type => User, user => user.messages, {nullable: false})
  author: User;

  @ManyToOne(type => Offer, offer => offer.messages, {nullable: true})
  offer?: Offer

}