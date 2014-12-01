var chai = require('chai')

global.expect = chai.expect
global.AssertionError = chai.AssertionError
global.Assertion = chai.Assertion
global.Assert = chai.Assert

describe('Mongoose Schemas',function(){

	var user,chatroom,crypto,mongoose

	before(function(){
		User = require('../user.js')
		var user = new User();
		Chatroom = require('../chatroom.js')
		var chatroom = new Chatroom();
		crypto = require('crypto')
		mongoose = require('mongoose')
		mongoose.connect('mongodb://@localhost:27017/chat_db')
	})

	it('test',function(done){
		user.user.name = "test name"
		console.log(user.user.name)

		done()
	})

	it('should create a new user',function(done){
		user.name = "test name"
		user.username = "username"
		user.access_level = 1
		user.salt = "1"
		user.email = "test@email.com"
		crypto.pbkdf2("123",user.salt,1,32,function(err,key){
			if(err) throw err
			user.password = key.toString('hex')
			user.save(function(err,result){
				if(err) throw err
				done()
			})
		})

	})

	it('should create a new chatroom',function(done){
		chatroom.name = "test chatroom"
		chatroom.admin = "chatroom admin"
		chatroom.users = "chatroom user"
		chatroom.salt = "1"
		crypto.pbkdf2("123",chatroom.salt,1,32,function(err,key){
			if(err) throw err
			chatroom.password = key.toString('hex')
			chatroom.save(function(err,result){
				if(err) throw err
				done()
			})
		})

	})

	it('should login successfully',function(done){
		User.findOne({username: "username"},function(err,result){
			if(err) throw err
			if(result){
				crypto.pbkdf2("123","1",1,32,function(err,key){
					if(err) throw err
					if(key.toString('hex')===result.password) done()
				})
			}
		})
	})


})