import {Identity} from "./Identity";
import {IRoute} from "./IRoute";
import {IUser} from "./IUser";
import {IOffer} from "./IOffer";
import {ITransport} from "./ITransport";

export interface ICargo extends Identity, IRoute {

  description: string;

  type: string;

  weight: number;

  volume: number;

  owner: IUser;

  transport?: ITransport

  offers?: IOffer[];

  status: CargoStatus;

}

export const CargoTypes: Array<string> = [
  "Перевозка вещей, переезды",
  "Пассажирские перевозки",
  "Строительные грузы и оборудование",
  "Вывоз мусора",
  "Услуги эвакуаторы",
  "Услуги грузчиков",
  "Перевозка продуктов",
  "Услуги манипулятора, автокрана",
  "Мебель и бытовая техника",
  "Транспортные средства",
  "Перевозка животных",
  "Продукты питания, еда",
  "Другое",
];

export enum CargoStatus {
  NEW = 0,
  PENDING = 1,
  PROCESS = 2,
  DELIVERED = 3
}
