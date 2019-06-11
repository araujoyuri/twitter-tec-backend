const jwtSecret = 'Qf&koIk3@ulZeQsv3Km1JSqRAUGAtpTOgAktx6TwY^&%jQ3KXQ!mD6vjEWR94CcC'
const strategy = 'jwt'

module.exports = {
    plugin: {
        name: 'auth',
        register
    },
    strategy
}

async function register (server, options) {
    await server.register(require('hapi-auth-jwt2'))

    const validate = (decodedToken, request, h) => {
        const { user } = decodedToken
        if (!user) return { isValid: false }
        return { isValid: true, credentials: { user } }
    }

    server.auth.strategy(strategy, strategy, {
        key: jwtSecret,
        validate,
        verifyOptions: { algorithms: ['HS256'] }
    })

    server.auth.default(strategy)

    server.method('createToken', createToken, {})
}

function createToken (user) {
    const JWT = require('jsonwebtoken')
    const { login, _id } = user

    token = JWT.sign({ user: { login, _id } }, jwtSecret, {
        algorithm: 'HS256',
        expiresIn: '1m'
    })

    return token
}