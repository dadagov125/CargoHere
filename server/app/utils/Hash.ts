let {Whirlpool, encoders} = require('whirlpool-hash');

export function getHashBase64(text: string) {
  return encoders.toBase64(getHash(text))
}

export function getHash(text: string) {
  let wp = new Whirlpool();
  return wp.getHash(text)
}