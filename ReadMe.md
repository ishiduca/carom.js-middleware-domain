# carom.js-middleware-domain

carom.js middleware to use Domain structure.

## synopsis

```js
var caromjs = require('carom.js')
var app     = Object.create(caromjs).constructor()

function onError (err, req, res) {
    console.error(String(err))
    err.stack && console.error(err.stack)

    res.stausCode = 500
    res.end(mes.message)
}

app.use('caromjs-middleware-domain', onError)
app.use('session', config.session) // write yourself
app.use('bodyParse')               // write yourself
app.use('router', {app: app})      // write yourself
app.use('404')                     // write yourself

app.router.POST('/register', function (req, res) {
    var context = this
    var body      = this.parsed
    var session   = this.session

// when use 'caromjs-middleware-domain'
// this.d is "domain"
    var intercept = this.d.intercept

    validator.validate('register', body, intercept(function (query) {
        dbAccount.get(query.name, intercept(function (password) {
            if (! password) {
                dbAccount.put(query.name, password, intercept(function () {
                    session.set(query.name, intercept(function () {
                        res.statusCode = 200
                        res.end(JSON.stringify({
                            ...
                        }))
                    }))
                }))
            }

            else {
                var err = new Error(query.name + ' is already registerd')
                err.name = 'RegisterError'
                err.code = 400

                throw err
            }
        }))
    }))
})
```

