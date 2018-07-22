import {Column, Entity, PrimaryGeneratedColumn} from "typeorm"

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  expire: Date;
  @Column({type: 'simple-json'})
  sess: string;
  @Column({unique: true})
  sid: string
}