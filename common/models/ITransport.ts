import {Identity} from "./Identity";
import {IRoute} from "./IRoute";
import {IUser} from "./IUser";
import {IOffer} from "./IOffer";
import {ICargo} from "./ICargo";

export interface ITransport extends Identity {

  model: string;

  mark: string;

  type: string;

  routes: IRoute[];

  geoposition?: string;

  owner: IUser;

  cargos?: ICargo[]

  offers?: IOffer[];


}

export const transportTypes: Array<string> = [
  "Стекловоз",
  "Автобус",
  "Манипулятор, кран",
  "Автовоз",
  "Авторефрижератор",
  "Тентованный",
  "Цельномет, Изотерм",
  "Автосцепка",
  "Контейнеровоз",
  "Открытая бортовая платформа",
  "Открытая платформа",
  "Платформа для негабаритных грузов",
  "Автоцистерна",
  "Микроавтобус",
  "Зерновоз",
  "Самосвал",
  "Лесовоз",
  "Мусоровоз",
  "Тягач",
  "Эвакуатор",
  "Цистерна, бочка",
  "Негабарит",
  "Фургон",
  "Гозовоз",
  "Миксер, битоновоз",
  "Скотовоз",
  "Цементовоз",
  "Бинзовоз",
  "Муковоз"
];

