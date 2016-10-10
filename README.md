# sessions

Sessions middleware.


## Installation

```
$ npm install trek-sessions --save
```


## Examples

```js

const Engine = require('trek-engine')
const sessions = require('trek-sessions')

async function start (port = 3000) {

  const app = new Engine()

  app.config.set('cookie', {
    keys: ['trek', 'engine']
  })

  app.use(sessions({
    cookie: {
      signed: false,
      maxAge: 60 * 1000 // 1 minutes
    }
  }))

  app.use((ctx, next) => {
    ctx.res.body = ctx.session
  })

  app.run(port)
}

start().catch(console.error)
```


## API



## Badges

[![Build Status](https://travis-ci.org/trekjs/sessions.svg?branch=master)](https://travis-ci.org/trekjs/sessions)
[![codecov](https://codecov.io/gh/trekjs/sessions/branch/master/graph/badge.svg)](https://codecov.io/gh/trekjs/sessions)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

---

> [fundon.me](https://fundon.me) &nbsp;&middot;&nbsp;
> GitHub [@fundon](https://github.com/fundon) &nbsp;&middot;&nbsp;
> Twitter [@_fundon](https://twitter.com/_fundon)
