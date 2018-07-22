import {IOffer, OfferRelation, OfferStatus} from "../../../common/models/IOffer";
import {BeforeInsert, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Transport} from "./Transport";
import {Cargo} from "./Cargo";
import {Message} from "./Message";
import moment = require("moment");

@Entity()
export class Offer implements IOffer {


  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  price: number;

  @Column('timestamp')
  created: string;

  @ManyToOne(type => Transport, transport => transport.offers, {nullable: false})
  transport: Transport;

  @ManyToOne(type => Cargo, cargo => cargo.offers, {nullable: false})
  cargo: Cargo;

  @Column()
  relation: OfferRelation;

  @Column()
  status: OfferStatus;

  @OneToMany(type => Message, message => message.offer, {cascade: true, nullable: true})
  messages?: Set<Message>;

  @BeforeInsert()
  onCreate() {
    this.created = moment().format();
  }
}

