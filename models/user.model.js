let Joi = require('joi')
const bcrypt = require('bcryptjs')
const RestHapi = require('rest-hapi')

module.exports = function(mongoose) {
  let modelName = 'user'
  let Types = mongoose.Schema.Types
  let Schema = new mongoose.Schema({
    login: {
      type: Types.String,
      unique: true,
      ref: 'login',
      required: true
    },
    password: {
      type: Types.String,
      required: true,
      exclude: true,
      allowOnUpdate: false
    }
  })

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      associations: {
        tweets: {
          type: 'ONE_MANY',
          foreignField: 'tweets',
          model: 'tweet'
        }
      },
      extraEndpoints: [
        // Password Update Endpoint
        function(server, model, options, logger) {
          const Log = logger.bind('Password Update')
          let Boom = require('boom')

          let collectionName = model.collectionDisplayName || model.modelName

          Log.note('Generating Password Update endpoint for ' + collectionName)

          let handler = async function(request, h) {
            try {
              let hashedPassword = model.generatePasswordHash(
                request.payload.password
              )

              await model.findByIdAndUpdate(request.params._id, {
                password: hashedPassword
              })

              return h.response('Password updated.').code(200)
            } catch (err) {
              Log.error(err)
              throw Boom.badImplementation(err)
            }
          }

          server.route({
            method: 'PUT',
            path: '/user/{_id}/password',
            config: {
              handler: handler,
              auth: null,
              description: "Update a user's password.",
              tags: ['api', 'User', 'Password'],
              validate: {
                params: {
                  _id: RestHapi.joiHelper.joiObjectId().required()
                },
                payload: {
                  password: Joi.string()
                    .required()
                    .description("The user's new password")
                }
              },
              plugins: {
                'hapi-swagger': {
                  responseMessages: [
                    { code: 200, message: 'Success' },
                    { code: 400, message: 'Bad Request' },
                    { code: 404, message: 'Not Found' },
                    { code: 500, message: 'Internal Server Error' }
                  ]
                }
              }
            }
          })
        }
      ],
      create: {
        pre: function(payload, logger) {
          payload.password = mongoose
            .model('user')
            .generatePasswordHash(payload.password)

          return payload
        }
      }
    },

    generatePasswordHash: function(password) {
      let salt = bcrypt.genSaltSync(10)
      return bcrypt.hashSync(password, salt)
    }
  }

  return Schema
}
