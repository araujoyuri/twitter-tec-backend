const Joi = require('joi')
const RestHapi = require('rest-hapi')

module.exports = function (server, mongoose, logger) {
  // Registration endpoint
  (function () {
    const Log = logger.bind('Register')
    const User = mongoose.model('user')

    Log.note('Generating Registration endpoint')

    server.route({
      method: 'POST',
      path: '/register',
      config: {
        handler: async function (request, h) {
          const { login, password } = request.payload
          return await RestHapi.create(User, { login, password }, Log)
        },
        auth: false,
        validate: {
          payload: {
            login: Joi.string()
              .lowercase()
              .required(),
            password: Joi.string().required()
          }
        },
        tags: ['api', 'register'],
        plugins: {
          'hapi-swagger': {}
        }
      }
    })
  })();

  // Login Endpoint
  (function () {
    const Log = logger.bind('Login')
    const User = mongoose.model('user')

    const Boom = require('boom')

    Log.note('Generating Login endpoint')

    const loginHandler = async function (request, h) {
      let response = {}

      let user = await User.findByCredentials(
        request.payload.login,
        request.payload.password,
        Log
      )

      if (!user) {
        throw Boom.unauthorized('Invalid Login or Password.')
      }

      delete user.password

      const token = server.methods.createToken(user)

      response = {
        user,
        token
      }

      return response
    }

    server.route({
      method: 'POST',
      path: '/login',
      config: {
        handler: loginHandler,
        auth: false,
        validate: {
          payload: {
            login: Joi.string()
              .lowercase()
              .required(),
            password: Joi.string().required()
          }
        },
        tags: ['api', 'login'],
        plugins: {
          'hapi-swagger': {}
        }
      }
    })
  })()
}
