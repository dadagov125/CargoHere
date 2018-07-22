import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import {getHashBase64} from "../utils/Hash";
import {IUser} from "../../../common/models/IUser";
import {Role} from "../../../common/models/Role";
import {Cargo} from "./Cargo";
import {Transport} from "./Transport";
import {Message} from "./Message";

@Entity()
export class User implements IUser {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  email: string;
  @Column({})
  pswdHash: string;
  @Column({type: 'simple-json', default: Role.user})
  roles: Role[];
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column({unique: true})
  phone?: string;

  @OneToMany(type => Cargo, cargo => cargo.owner, {cascade: true})
  cargos: Cargo[];

  @OneToMany(type => Transport, transport => transport.owner, {cascade: true})
  transports: Transport[];


  @OneToMany(type => Message, message => message.author, {cascade: true, nullable: true})
  messages?: Message[];


  compirePassword(pswd: string) {
    const hash = getHashBase64(pswd);
    return this.pswdHash === hash

  }

  equalsUser(user: IUser): boolean {
    if (!user) return false;
    return this.equalsId(user.id);
  }

  equalsId(id: number): boolean {
    if (id === undefined || id === null) return false;
    return this.id === id;
  }

}
