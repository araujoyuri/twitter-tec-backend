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
      create: {
        pre: function (payload, logger) {
          payload.password = mongoose
            .model('user')
            .generatePasswordHash(payload.password)

          return payload
        }
      }
    },

    generatePasswordHash: function (password) {
      const salt = bcrypt.genSaltSync(10)
      return bcrypt.hashSync(password, salt)
    },

    findByCredentials: async function (login, password) {
      const self = this

      const query = {
        login: login.toLowerCase()
      }

      const mongooseQuery = self.findOne(query)

      const user = await mongooseQuery.lean()

      if (!user) return false

      const source = user.password

      const passwordMatch = await bcrypt.compare(password, source)
      if (passwordMatch) return user
      else return false
    }
  }

  return Schema
}
