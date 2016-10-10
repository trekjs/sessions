'use strict'

const { randomBytes } = require('crypto')

const PLUS = /\+/g
const SLASH = /\//g
const EQUAL = new RegExp('=', 'g')

module.exports = uid

// From https://www.npmjs.com/package/uid-safe
// Other https://github.com/zeit/uid-promise
function uid (len = 24, encoding = 'base64') {
  return new Promise((resolve, reject) => {
    randomBytes(len, (err, buffer) => {
      if (err) return reject(err)
      resolve(escape(now().toString(36) + buffer.toString(encoding)))
    })
  })
}

// https://en.wikipedia.org/wiki/Base64#RFC_4648
// From https://github.com/joaquimserafim/base64-url/blob/master/index.js#L11
function escape (str) {
  return str.replace(PLUS, '-').replace(SLASH, '_').replace(EQUAL, '')
}

// From https://www.npmjs.com/package/uniqid
function now () {
  const time = new Date().getTime()
  const last = now.last || time
  now.last = time > last ? time : last + 1
  return now.last
}
