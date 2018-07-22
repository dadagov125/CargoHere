import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {CargoStatus, ICargo} from "../../../common/models/ICargo";
import {User} from "./User";
import {Offer} from "./Offer";
import {Transport} from "./Transport";

@Entity()
export class Cargo implements ICargo {


  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  type: string;

  @Column()
  weight: number;

  @Column()
  volume: number;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column('float8')
  distance: number;

  @Column({nullable: true})
  price?: number;

  @Column('timestamp')
  dateTime: string;

  @Column()
  status: CargoStatus;

  @ManyToOne(type => User, user => user.cargos, {nullable: false})
  owner: User;

  @ManyToOne(type => Transport, transport => transport.cargos, {nullable: true})
  transport?: Transport;

  @OneToMany(type => Offer, offer => offer.cargo, {cascade: true})
  offers?: Offer[];

}