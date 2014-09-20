var path = require('path')
var url  = require('url')
var fs   = require('fs')
var http = require('http')
var test = require('tape').test

var app  = Object.create(require('carom.js')).constructor({
    extlib: path.join( __dirname, '..')
})

var port = 3002

function onerror (err, req, res) {
    res.statusCode = 500
    if ('URIError' === err.name) res.statusCode = 404
    res.end(err.message)
}


function main (req, res) {
    var pathname = url.parse(req.url).pathname

    if ('/' === pathname) {
        throw new Error('throw error')
    }

    if ('/process.nextTick' === pathname) {
        return process.nextTick(function () {
            throw new Error('throw error - inner process.nextTick')
        })
    }

    if ('/domain.intercept' === pathname) {
        return fs.readFile('./no-exists.js', 'utf8', this.d.intercept(function (data) {
            res.statusCode = 200
            res.end('dummy')
        }))
    }

    throw new URIError('Not Found - ' + pathname)
}

function setup () {
    app.use('index', onerror)
    app.use(main)

    app.server.listen(port, function (err) {
        if (err) {
            console.error(String(err))
            process.exit(1)
        }

        console.log('# server start to listen on port %d', port)

        start()
    })
}

function teardown() {
    console.log('# server.close()')
    app.server.close(function () {
        console.log('# server close ...')
    })
}

function getBody(res, cb) {
    res.setEncoding('utf8')
    var data = ''
    res.on('data', function (c) { data += c })
    res.on('end', function () {
        cb(data)
    })
}

function start () {
    test('http.get("http://localhost:' + port + '")', function (t) {
        http.get('http://localhost:' + port, function (res) {
            t.is(res.statusCode, 500, 'res.statusCode === 500')

            getBody(res, function (body) {
                t.is(body, 'throw error', 'res#body === "throw error"')
                t.end()
            })
        })
    })
    test('http.get("http://localhost:' + port + '/process.nextTick")', function (t) {
        http.get('http://localhost:' + port + '/process.nextTick', function (res) {
            t.is(res.statusCode, 500, 'res.statusCode === 500')

            getBody(res, function (body) {
                t.is(body, 'throw error - inner process.nextTick'
                , 'res#body === "throw error - inner process.nextTick"')
                t.end()
            })
        })
    })
    test('http.get("http://localhost:' + port + '/domain.intercept")', function (t) {
        http.get('http://localhost:' + port + '/domain.intercept', function (res) {
            t.is(res.statusCode, 500, 'res.statusCode === 500')

            getBody(res, function (body) {
                t.is(body, "ENOENT, open './no-exists.js'"
                , 'res#body === "ENOENT, open \'./no-exists.js\'"')
                t.end()
            })
        })
    })
    test('http.get("http://localhost:' + port + '/not_found_url")', function (t) {
        http.get('http://localhost:' + port + '/not_found_url', function (res) {
            t.is(res.statusCode, 404, 'res.statusCode === 404')

            getBody(res, function (body) {
                t.is(body, "Not Found - /not_found_url"
                , 'res#body === "not Found - /not_found_url"')
                t.end()
                teardown()
            })
        })
    })
}

setup()
