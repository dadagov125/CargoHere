import {env} from "@app/env";

export const HOST = env.mode === 'prod' ? "ec2-18-219-235-24.us-east-2.compute.amazonaws.com" : 'ec2-18-219-235-24.us-east-2.compute.amazonaws.com';
export const PORT = env.mode === 'prod' ? 80 : 80;
export const API_URL = `http://${HOST}:${PORT}/rest`;
export const SOCKET_URL = `http://${HOST}:${PORT}`;

export const EVENTS = {
  CARGO_SET: 'CARGO_SET',
  OFFER_SET: 'OFFER_SET',
  WATCH_GEO: 'WATCH_GEO'
};

export const ENV = {
  MODE: env.mode,
  isDebug: env.isDebug,
  VERSION: require('../../package.json').version
};

export const HERE = {
  APP_ID: 'VQkWvrPf39sOfsUIMxfV',
  APP_CODE: 'qbgjdtx9AriDvj6LEVquCQ'
};