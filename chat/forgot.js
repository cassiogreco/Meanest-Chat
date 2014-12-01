//Mongoose schema for forgotten passwords

var mongoose = require('mongoose')

var forgotSchema = mongoose.Schema({
	email: {type: String, required: true},
	key: {type: String, required: true},
	date: {type: Date, required: true}
})

var Forgot = mongoose.model('Forgot',forgotSchema)

module.exports = Forgot