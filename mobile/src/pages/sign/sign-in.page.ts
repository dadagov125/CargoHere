import {Component} from '@angular/core';
import {AlertController, NavController} from 'ionic-angular';
import {SignUpPage} from './sign-up.page';
import {AuthService} from "../../services/auth.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {regexEmail} from "../../../../common/Utils";

@Component({
  selector: 'sign-in-page',
  templateUrl: 'sign-in.page.html'
})
export class SignInPage {
  signinData = {
    email: 'user@user.ru',
    password: '123'
  };

  myGroup = {};

  constructor(public navCtrl: NavController, private authService: AuthService, private alertCtrl: AlertController) {
  }

  get group() {
    return this.myGroup
  }

  ngOnInit() {
    this.myGroup = new FormGroup({
      email: new FormControl('', [Validators.pattern(regexEmail), Validators.required, Validators.minLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(3)])

    })
  }

  async signin() {
    try {
      this.authService.signin(this.signinData.email, this.signinData.password)
          .then(res => {
            this.navCtrl.pop()
          })
          .catch(err => {
            let alert = this.alertCtrl.create({
              subTitle: 'Ощибка при авторизации',
              message: err.message,
              buttons: ['Закрыть'],
              enableBackdropDismiss: true
            });
            alert.present()
          })

    }
    catch (err) {
    }
  }

  goToSignup(params) {
    if (!params) params = {};
    this.navCtrl.push(SignUpPage);
  }
}
