//Mongoose schema for user collection

var mongoose = require('mongoose')

var userSchema = mongoose.Schema({
	name: {type: String, required: true},
	email: {type: String, required: true, unique: true},
	username: {type: String, required: true, unique: true},
	password: {type: String, required: true},
	salt: {type: String, required: true},
	access_level: {type: Number, required: true},
	rooms: [{name: {type: String, required: true}}]
})

var User = mongoose.model('User',userSchema)

module.exports = User