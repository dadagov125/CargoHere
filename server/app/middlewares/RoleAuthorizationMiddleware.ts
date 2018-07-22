import {
  AuthenticatedMiddleware,
  EndpointInfo,
  EndpointMetadata,
  IMiddleware,
  Next,
  OverrideMiddleware,
  Request
} from "@tsed/common";
import {Forbidden, Unauthorized} from "ts-httpexceptions";
import {User} from "../entities/User";
import {Role} from "../../../common/models/Role";


@OverrideMiddleware(AuthenticatedMiddleware)
export class RoleAuthorizationMiddleware implements IMiddleware {
  public async use(@EndpointInfo() endpoint: EndpointMetadata,
                   @Request() request: Express.Request,
                   @Next() next: Express.NextFunction) {


    if (!request.isAuthenticated()) {
      throw new Forbidden("Unauthenticated")
    }
    const user = await request.user as User;
    if (!user) {
      throw new Unauthorized("user")
    }
    if (user.roles.includes(Role.admin)) {
      return next();
    }

    const options = endpoint.get(AuthenticatedMiddleware) || {};
    if (!options || !options.roles) {
      throw new Unauthorized("role")
    }
    const roles: Array<string> = options.roles;

    if (user.roles.includes(Role.moderator) && (roles.includes(Role.moderator) || roles.includes(Role.user))) {
      return next()
    }

    if (!user.roles.some(value => roles.includes(value))) {
      throw new Unauthorized("role")
    }
    next();
  }
}