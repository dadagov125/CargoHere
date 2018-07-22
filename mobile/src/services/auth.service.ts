import {Injectable} from "@angular/core";
import {HttpClient} from '@angular/common/http';
import {IUser} from "../../../common/models/IUser";

import {BehaviorSubject} from "rxjs";
import {RestPoint, RestService} from "./rest";

@Injectable()
@RestPoint('auth')
export class AuthService extends RestService {
  user: IUser;
  isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(http: HttpClient) {
    super(http);
    this.userInfo()
  }


  async userInfo() {
    console.log('userInfo');
    return new Promise<boolean>((resolve, reject) => {
      this.http.get<IUser>(this.restUrl + 'info')
          .subscribe((user: IUser) => {
            console.debug(this.restUrl + 'info', user);
            this.onUserLoaded(user);
            resolve(this.isLoggedIn.getValue())
          }, (err) => {
            console.error(this.restUrl + 'info', err);
            this.onUserDisconnected();
          })
    })
  }

  async signin(email: string, password: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.http.post<IUser>(this.restUrl + 'signin', {
        email,
        password
      }).subscribe((user: IUser) => {
        console.debug(this.restUrl + 'signin', user);
        this.onUserLoaded(user);
        resolve(this.isLoggedIn.getValue())
      }, (err) => {
        reject(err);
        console.error(this.restUrl + 'signin', err);
      })
    })


  }

  async signup(user: any) {
    return new Promise<boolean>((resolve, reject) => {
      this.http.post<IUser>(this.restUrl + 'signup', user)
          .subscribe((user: IUser) => {
            console.debug(this.restUrl + 'signup', user);
            this.onUserLoaded(user);
            resolve(this.isLoggedIn.getValue())
          }, (err) => {
            reject(err);
            console.error(this.restUrl + 'signup', err);
          })
    })

  }

  async logout() {
    return new Promise<boolean>((resolve, reject) => {
      this.http.get(this.restUrl + 'logout').subscribe((data: any) => {
        console.debug(this.restUrl + 'logout', data);
        this.onUserDisconnected();
        resolve(!this.isLoggedIn.getValue())
      }, (err) => {
        console.error(this.restUrl + 'logout', err);
      })
    })

  }

  isUserEquals(user: IUser) {
    if (!this.isLoggedIn.getValue()) return false;
    if (!user || user.id === undefined) return false;
    return this.user.id === user.id;
  }

  //private methods

  private onUserLoaded(user: IUser) {
    if (user) {
      this.user = user;
      this.isLoggedIn.next(true)
    }
  }

  private onUserDisconnected() {
    this.user = null;
    this.isLoggedIn.next(false)
  }

}