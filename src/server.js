let Hapi = require('hapi')
let mongoose = require('mongoose')
let RestHapi = require('rest-hapi')

async function api(){
	try {
		let server = Hapi.Server({ port: 8080 })

		let config = {
			appTitle: "Twitter API",
			mongo: {
				URI: 'mongodb://localhost/twitter_db'
			}
		};

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
