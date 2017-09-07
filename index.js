/*!
 * trek-sessions
 * Copyright(c) 2017 Fangdun Cai <cfddream@gmail.com> (https://fundon.me)
 * MIT Licensed
 */

'use strict'

const Sessions = require('./lib/sessions')

module.exports = createSessions

function createSessions(options) {
  const s = new Sessions(options)

  return sessionMiddleware

  async function sessionMiddleware(ctx, next) {
    ctx.sessions = s
    return s.process(ctx, next)
  }
}
