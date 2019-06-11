const Hapi = require('hapi')
const mongoose = require('mongoose')
const RestHapi = require('rest-hapi')
const Auth = require('./plugins/auth.plugin')

async function api(){
	try {
		let server = Hapi.Server({ port: 3000 })

		let config = {
			appTitle: "Twitter API",
			mongo: {
				URI: 'mongodb://localhost/twitter_db'
			},
			authStrategy: Auth.strategy,
			modelPath: 'src/models',
			apiPath: 'src/api'
		};

		await server.register(Auth)
		await server.register({
			plugin: RestHapi,
			options: {
				mongoose,
				config
			}
		})

		await server.start()

		console.log("Server ready", server.info)

		return server
	} catch (err) {
		console.log("Error starting server:", err);
	}
}

module.exports = api()
