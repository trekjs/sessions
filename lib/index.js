'use strict'

const Sessions = require('./sessions')

module.exports = createSessions

function createSessions (options) {
  const s = new Sessions(options)

  // memory
  if (s.available) return sessionMiddleware

  return new Promise((resolve, reject) => {
    s.store.on('end', () => {
      s.available = false
      reject(new Error('Redis server connection has closed'))
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
