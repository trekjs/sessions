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

### `Sessions`


### `Store`

> Map like

```js
const store = new Store(provider, {
  expires: 86400,
  prefix: 'trek:sess:'
})
```

* `provider`

    The `sessions` are storing on the `provider`.

* `previx(sid)`

    Adds a prefix to `sid`.

* `async clear()`

    Removes all sessions.

* `async delete(sid)`

    Removes a `session` by the `sid`.

* `async has(sid)`

    Returns a boolean asserting whether a `session` has been associated to the `sid` in the `store` or not.

* `async get(sid)`

    Returns the `session` associated to the `sid`, or `undefined` if there is none.

* `async set(sid, sess)`

    Sets the `session` for the `sid` in the store.


### `Provider`



## Badges

[![Build Status](https://travis-ci.org/trekjs/sessions.svg?branch=master)](https://travis-ci.org/trekjs/sessions)
[![codecov](https://codecov.io/gh/trekjs/sessions/branch/master/graph/badge.svg)](https://codecov.io/gh/trekjs/sessions)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

---

> [fundon.me](https://fundon.me) &nbsp;&middot;&nbsp;
> GitHub [@fundon](https://github.com/fundon) &nbsp;&middot;&nbsp;
> Twitter [@_fundon](https://twitter.com/_fundon)
