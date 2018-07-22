import {Component} from '@angular/core';
import {AlertController, NavController} from 'ionic-angular';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";

const regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


@Component({
  selector: 'sign-up-page',
  templateUrl: 'sign-up.page.html'
})
export class SignUpPage {
  signupData = {
    email: 'user@user.ru',
    password: '123',
    firstname: 'Магомед',
    lastname: 'Дадагов',
    phone: '+79280048881'
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
      password: new FormControl('', [Validators.required, Validators.minLength(3)]),
      firstname: new FormControl('', [Validators.required, Validators.minLength(2)]),
      lastname: new FormControl('', [Validators.required, Validators.minLength(2)]),
      phone: new FormControl('', [Validators.required, Validators.minLength(10)])
    })
  }

  async signup() {

    this.authService.signup({
      email: this.signupData.email,
      password: this.signupData.password,
      firstName: this.signupData.firstname,
      lastName: this.signupData.lastname,
      phone: this.signupData.phone
    })
        .then(res => {
          this.navCtrl.popToRoot();
        })
        .catch(err => {
          let alert = this.alertCtrl.create({
            subTitle: 'Ощибка при создании аккаунта',
            message: err.message,
            buttons: ['Закрыть'],
            enableBackdropDismiss: true
          });
          alert.present()
        })
  }


}
