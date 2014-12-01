//Mongoose schema for chatrooms

var mongoose = require('mongoose')

var chatroomSchema = mongoose.Schema({
	name: {type: String, required: true},
	users: [{type: String, required: true}],
	admin: [{type: String, required: true}],
	salt: {type: String, required: true},
	password: {type: String, required: true},
})

var ChatRoomModel = mongoose.model('ChatRoomModel',chatroomSchema)

module.exports = ChatRoomModel;