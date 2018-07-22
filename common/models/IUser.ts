import {Role} from "./Role";
import {Identity} from "./Identity";

export interface IUser extends Identity {

  email: string;

  pswdHash: string;

  roles: Role[];

  firstName: string;

  lastName: string;

  phone?: string;


}