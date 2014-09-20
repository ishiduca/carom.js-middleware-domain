var domain = require('domain')

module.exports = function (onError) {
    if ('function' !== typeof onError)
        throw new TypeError('typeof "onError" must be "function"')

    return function middlewareDomain (req, res, next) {
        var context = this
        var d = this.d = domain.create()

        d.on('error', function domainOnError (err) {
            onError.apply(context, [err, req, res])
        })

        d.add(req)
        d.add(res)

        d.run(next)
    }
}
