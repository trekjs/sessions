'use strict'

const { randomBytes } = require('crypto')

module.exports = uid

// From https://www.npmjs.com/package/uid-safe
// Other https://github.com/zeit/uid-promise
function uid (len = 24, encoding = 'base64') {
  return new Promise((resolve, reject) => {
    randomBytes(len, (err, buffer) => {
      err ? reject(err) : resolve(escape(buffer.toString(encoding)) + now().toString(36))
    })
  })
}

// https://en.wikipedia.org/wiki/Base64#RFC_4648
// From https://github.com/joaquimserafim/base64-url/blob/master/index.js#L11
function escape (str) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// From https://www.npmjs.com/package/uniqid
function now () {
  const time = new Date().getTime()
  const last = now.last || time
  now.last = time > last ? time : last + 1
  return now.last
}
