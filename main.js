const kable = require('kable')
const uriParser = require('mongodb/lib/core/uri_parser')
const client = require('mongodb').MongoClient

const parseUri = (uriIn, opts) => {
    let host = ''
    let port = 0

    uriParser(uriIn, opts, (err, args) => {
        if (err) throw err
        if (args.hosts && args.hosts[0]) {
            const address = args.hosts[0]
            host = address.host
            port = address.port
        }
    })

    return {
        host
        , port
    }
}

const connect = (opts) => {
    const k = opts.k
    const uri = opts.uri
    const cliOptions = opts.cliOptions
    let retry = false

    client.connect(uri, cliOptions, (err, conn) => {
        if (err) {
            connect(opts)
            return
        }

        conn.on('serverClosed', () => {
            if (retry) return
            retry = true
            conn.close()
            k.stop('server closed')
            setTimeout(() => connect(opts))
        })

        k.start()
    })
}

const run = ({ uri, id, waitToRetryTime = 2000, key = null }) => {
    const cliOptions = { useUnifiedTopology: true }
    const { host, port } = parseUri(uri, options)
    const k = kable(id, { host, port, key })
    return k.run(true).then(() => connect({ k, uri, waitToRetryTime, cliOptions }))
}

module.exports = run 