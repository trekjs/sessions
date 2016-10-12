'use strict'

const Sessions = require('./sessions')

module.exports = createSessions

function createSessions (options) {
  const s = new Sessions(options)

  async function sessionMiddleware (ctx, next) {
    if (ctx.sessionId) return next()

    const result = await s.process(ctx)

    ctx.session = result.session
    ctx.sessionId = result.sessionId

    return next()
  }

  return sessionMiddleware
}
