import "express-session"
import "passport"
import "express"
import "rxjs"
import "reflect-metadata"
import {GlobalAcceptMimesMiddleware, ServerLoader, ServerSettings} from '@tsed/common'
import * as path from 'path'
import {$log} from "ts-log-debug";
import {BasicAuthenticationMiddleware} from "./middlewares/BasicAuthenticationMiddleware";
import {createConnection} from "typeorm"
import "@tsed/socketio"

const morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    pg = require('pg'),
    session = require("express-session"),
    pgSession = require('connect-pg-simple')(session),
    cors = require('cors');

const env = process.env.NODE_ENV;
var isProd = env === 'prod';
const rootDir = path.resolve(__dirname);

const unhandledRejections = new Map();

process.on('unhandledRejection', (reason, p: Promise<any>) => {

  unhandledRejections.set(p, reason);
  p.catch((err) => {
    console.log(err)
  })
});

process.on('rejectionHandled', (p) => {
  unhandledRejections.delete(p);
});

$log.info("========== ENV ", env);

$log.info("========== rootDir ", rootDir);


@ServerSettings({

  logger: {
    debug: !isProd,
    logRequest: !isProd,
    requestFields: ["method", "url", "headers", "body", "query", "params", "duration"]
  },
  debug: false,
  port: isProd ? 80 : 3000,
  rootDir,
  mount: {
    "/rest": `${rootDir}/controllers/**/**.js`
  },
  componentsScan: [
    `${rootDir}/middlewares/**/**.js`,
    `${rootDir}/services/**/**.js`,
    `${rootDir}/controllers/**/**.js`
  ],
  acceptMimes: ["application/json"],
  passport: {}
})

export class Server extends ServerLoader {
  [x: string]: any;

  constructor() {
    super()
  }

  async $onInit() {
    $log.info("========== Version: ", require('../package.json').version);
    $log.info('========== $onInit');
    const connection = await createConnection();

    let dbOpt: any = connection.options;
    $log.info(`DB connected
                                           ====================
                                           type: ${dbOpt.type} 
                                           connection name: ${connection.name} 
                                           host: ${dbOpt.host} 
                                           port: ${dbOpt.port} 
                                           db: ${dbOpt.database} 
                                           user: ${dbOpt.username}
                                           =====================
      `);

    let pgPool = new pg.Pool({
      user: dbOpt.username,
      database: dbOpt.database,
      password: dbOpt.password,
      port: dbOpt.port,
      host: dbOpt.host
    });

    const sessionPgClient = await pgPool.connect();

    this.use(session({
      secret: "mysecretkey",
      name: "session",
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 3600000 * 24,
      },
      store: new pgSession({
        pool: pgPool
      })
    }));

    this.sessionPgClient = sessionPgClient;
    this.typeormConnection = connection;


  }

  async $onMountingMiddlewares() {
    $log.info('==========$onMountingMiddlewares');
    this
        .use(morgan('dev'))
        .use(GlobalAcceptMimesMiddleware)
        .use(cookieParser())
        .use(compress({}))
        .use(methodOverride())
        .use(bodyParser.json())
        .use(bodyParser.urlencoded({
          extended: true
        }))
        .use(bodyParser.raw())
        .use(bodyParser.text())
        .use(cors())
        .use(BasicAuthenticationMiddleware)
  }


  $afterRoutesInit() {
    $log.info('==========$afterRoutesInit');
  }

  $onReady() {
    $log.info('==========$onReady');
  }

  $onServerInitError(error: any): any {
    $log.info('==========$onServerInitError');
    $log.error('Server encounter an error =>', error);
    try {
      this.sessionPgClient.close();
    } catch (err) {
    }
    try {
      this.typeormConnection.close();
    } catch (err) {
    }


  }


}



