var test = require('tape').test

test('can laod module "carom.js-middleware-domain"', function (t) {
    t.plan(1)
    t.is('function', typeof require('..')
      , 'var middleware = require("carom.js-middleware-domain")')
})
