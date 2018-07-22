import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {ITransport} from "../../../common/models/ITransport";
import {User} from "./User";
import {IRoute} from "../../../common/models/IRoute";
import {Offer} from "./Offer";
import {Cargo} from "./Cargo";

@Entity()
export class Transport implements ITransport {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  model: string;

  @Column()
  mark: string;

  @Column()
  type: string;

  @Column({nullable: true})
  geoposition?: string;

  @ManyToOne(type => User, user => user.transports, {nullable: false})
  owner: User;

  @OneToMany(type => Cargo, cargo => cargo.transport, {cascade: true})
  cargos: Cargo[];

  @OneToMany(type => Offer, offer => offer.transport, {cascade: true})
  offers?: Offer[];

  @Column({type: 'simple-json'})
  routes: IRoute[];

}