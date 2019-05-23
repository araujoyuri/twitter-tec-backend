module.exports = function(mongoose) {
	let modelName = 'tweet'
	let Types = mongoose.Schema.Types
	let Schema = new mongoose.Schema(
		{
			text: {
				type: Types.String,
				required: true
			},
			author: {
				type: Types.ObjectId,
				ref: 'user'
			},
			createdAt: {
				type: Types.Date
			}
		},
		{ collection: modelName }
	)

	Schema.statics = {
		collectionName: modelName,
		routeOptions: {
			associations: {
				author: {
					type: 'MANY_ONE',
					model: 'user'
				}
			}
		}
	}

	return Schema
}
