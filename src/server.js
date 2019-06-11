let Hapi = require('hapi')
let mongoose = require('mongoose')
let RestHapi = require('rest-hapi')
let Auth = require('./plugins/auth.plugin')

async function api() {
  try {
    let server = Hapi.Server({
      port: 5000
    })

    let config = {
      appTitle: 'Twitter API',
      mongo: {
        URI: 'mongodb://0.0.0.0/twitter_db'
      },
      authStrategy: Auth.strategy,
      modelPath: 'src/models',
      apiPath: 'src/api'
    }

    await server.register(Auth)
    await server.register({
      plugin: RestHapi,
      options: {
        mongoose,
        config
      }
    })

    await server.start()

    RestHapi.logUtil.logActionComplete(
      RestHapi.logger,
      'Server Initialized',
      server.info
    )

    return server
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('Error starting server:', err)
  }
}

module.exports = api()
