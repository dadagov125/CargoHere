import * as Passport from "passport";
import {Strategy} from "passport-local";
import {BasicStrategy} from "passport-http"


import {BadRequest, NotFound} from "ts-httpexceptions";
import {User} from "../entities/User";

import {
  AfterRoutesInit,
  BeforeRoutesInit,
  ExpressApplication,
  Inject,
  ServerSettingsService,
  Service,
} from "@tsed/common";
import {clone} from "lodash";

import {getHashBase64} from "../utils/Hash";
import {Role} from "../../../common/models/Role";
import {getManager} from "typeorm";


@Service()
export class AuthService implements BeforeRoutesInit, AfterRoutesInit {

  constructor(private serverSettings: ServerSettingsService,
              @Inject(ExpressApplication) private  expressApplication: ExpressApplication) {

    // used to serialize the user for the session
    Passport.serializeUser(AuthService.serialize);

    // used to deserialize the user
    Passport.deserializeUser(this.deserialize.bind(this));
  }

  static serialize(user: User, done: any) {
    done(null, user.id);
  }

  $beforeRoutesInit() {
    const options: any = this.serverSettings.get("passport") || {} as any;
    const {userProperty, pauseStream} = options;


    this.expressApplication.use(Passport.initialize({userProperty}));
    this.expressApplication.use(Passport.session({pauseStream}));
  }

  $afterRoutesInit() {
    this.initializeSignup();
    this.initializeLogin();
  }

  public async deserialize(id: number, done: any) {
    let user = await getManager().findOne(User, id);
    delete user.pswdHash;
    done(null, user);
  };

  public initializeSignup() {

    Passport
        .use("signup", new Strategy({
              // by default, local strategy uses username and password, we will override with email
              usernameField: "email",
              passwordField: "password",
              passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            (req, email, password, done) => {
              const firstName: string = req.body.firstName as string;
              const lastName: string = req.body.lastName as string;
              const phone: string = req.body.phone as string;
              // asynchronous
              // User.findOne wont fire unless data is sent back
              process.nextTick(() => {
                let usr: User = new User();
                usr.email = email;
                usr.pswdHash = getHashBase64(password);
                usr.firstName = firstName;
                usr.lastName = lastName;
                usr.roles = [Role.user, Role.admin];
                usr.phone = phone;

                this.signup(usr)
                    .then((user) => done(null, user))
                    .catch((err) => done(err));
              });
            }));

  }

  async signup(user: User) {

    const exists = await getManager().findOne(User, {email: user.email});

    if (exists) {
      throw new BadRequest("Email is already registered");
    }
    const manager = getManager();
    let newUser = await manager.save(User, user);
    delete newUser.pswdHash;
    return newUser
  }


  public initializeLogin() {
    Passport.use("login", new Strategy({
          // by default, local strategy uses username and password, we will override with email
          usernameField: "email",
          passwordField: "password",
          passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        (request: Express.Request, username, password, done) => {
          this.login(username, password)
              .then((user) => {
                request.logIn(user, (err) => {

                  if (err) {
                    done(err)
                  } else {

                    done(null, user)
                  }
                });
              })
              .catch((err) => done(err));
        }));


    Passport.use("basic",
        new BasicStrategy({
              realm: "realm",
              passReqToCallback: true
            },
            (req: Express.Request, username, password, done) => {

              this.login(username, password)
                  .then((user) => {
                    req.logIn(user, (err) => {
                      if (err) {
                        done(err)
                      } else {
                        done(null, user)
                      }
                    });
                  })
                  .catch((err) => done(err));
            }));
  }


  async login(email: string, password: string): Promise<User> {
    let user: User | undefined = await getManager().findOne(User, {email: email});

    if (!user) {
      throw new NotFound("User not found");
    }
    if (!user.compirePassword(password)) {
      throw new NotFound("Password invalid");
    }
    user = clone(user);
    delete user.pswdHash;

    return user
  };
}