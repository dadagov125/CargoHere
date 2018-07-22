"use strict";


import {authenticate} from "passport";

import {Authenticated, BodyParams, Controller, Get, Post, Req, Required, Res, Session} from "@tsed/common";
import {BadRequest} from "ts-httpexceptions";
import {User} from "../entities/User";

import {regexEmail} from "../../../common/Utils";
import {Role} from "../../../common/models/Role";


@Controller("/auth")
export class AuthCtrl {


  @Authenticated({roles: [Role.user]})
  @Get("/info")
  async info(@Req() request: Express.Request,
             @Res() response: Express.Response,
             @Session() session: any) {

    return await request.user as User;

  }

  @Post("/signin")
  async login(@Required() @BodyParams("email") email: string,
              @Required() @BodyParams("password") password: string,
              @Req() request: Express.Request,
              @Res() response: Express.Response,
              @Session() session: Express.Session) {

    this.validateEmail(email);

    return new Promise<any>((resolve, reject) => {
      authenticate("login", (err, user: User) => {
        if (err) {
          reject(err);
        }

        resolve(user);

      })(request, response, () => {

      });
    });
  }


  @Post("/signup")
  async signup(@Required() @BodyParams("email") email: string,
               @Required() @BodyParams("password") password: string,
               @Required() @BodyParams("firstName") firstName: string,
               @Required() @BodyParams("lastName") lastName: string,
               @Req() request: Express.Request,
               @Res() response: Express.Response) {

    this.validateEmail(email);

    return new Promise((resolve, reject) => {

      authenticate("signup", (err, user: User) => {

        if (err) {
          return reject(err);
        }

        if (!user) {
          return reject(!!err);
        }

        request.logIn(user, (err) => {

          if (err) {
            return reject(err);
          }
          resolve(user);
        });
      })(request, response, () => {


      });
    });
  }

  @Authenticated({roles: [Role.user]})
  @Get("/logout")
  public async logout(@Req() request: Express.Request) {
    console.log(request.isAuthenticated());
    request.logout();
    return {message: "disconnected"}
  }

  private validateEmail(email: string) {
    if (!(email && regexEmail.test(email))) {
      throw new BadRequest("Email is invalid");
    }
  }
}