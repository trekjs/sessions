/*!
 * trek-sessions
 * Copyright(c) 2017 Fangdun Cai <cfddream@gmail.com> (https://fundon.me)
 * MIT Licensed
 */

'use strict'

const Sessions = require('./sessions')

module.exports = createSessions

function createSessions (options) {
  const s = new Sessions(options)

  // Memory
  if (s.available) return sessionMiddleware

  return new Promise((resolve, reject) => {
    s.store.on('end', () => {
      s.available = false
      reject(new Error('Session is closed'))
    })
    s.store.on('connect', () => {
      s.available = true
      resolve(sessionMiddleware)
    })
  })

  function sessionMiddleware (ctx, next) {
    ctx.sessions = s
    if (ctx.sessionId || !s.matchPath(ctx.req.path, s.path)) return next()
    return s.process(ctx, next)
  }
}
