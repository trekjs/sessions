'use strict'

const Sessions = require('./sessions')

module.exports = createSessions

function createSessions (options) {
  const s = new Sessions(options)

  return sessionMiddleware

  function sessionMiddleware (ctx, next) {
    if (ctx.sessionId) return next()
    return s.process(ctx, next)
  }
}
