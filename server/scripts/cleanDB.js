const MongoClient = require('mongodb').MongoClient
const config = require('../config')

MongoClient.connect(config.db)
.then( db => {
	return db.dropDatabase()
	.then( () => {
		console.log('DB is dropped.')
		db.close()
	})
})
.catch( e => {
	console.error(e)
})
