import {HeaderParams, IMiddleware, Middleware, Next, Request, Response} from "@tsed/common";
import {User} from "../entities/User";
import {authenticate} from "passport";

@Middleware()
export class BasicAuthenticationMiddleware implements IMiddleware {

  public use(@Request() request: Express.Request,
             @Response() response: Express.Response,
             @HeaderParams("Authorization") auth: string,
             @Next() next: Express.NextFunction) {

    if (request.isUnauthenticated() && auth) {
      authenticate("basic", (err, user: User) => {
        next()
      })(request, response, () => {

      });

    } else next()


  }

}