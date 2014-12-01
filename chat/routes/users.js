var express = require('express');
var router = express.Router();
var crypto = require('crypto')
var session = require('express-session')

//User authentication

router.authenticate = function(req,res,next){
	var User = require('../user.js')
	//Verifies if both username and passwords were typed
	if(!req.body.password || !req.body.username){
		req.session.error = 'Please type both your username and password';
		res.redirect('/login')
		res.end()
	}
	else{
		//Id, email, name and __v are not returned
		User.findOne({username: req.body.username},{_id:0,email:0,name:0,__v:0},function(error,result){
		if(error) throw error
		//If no user is returned
		if(result===null){
			req.session.error = 'Incorrect username or password';
			res.redirect('/login')
			res.end()	
		} 
		else{
		crypto.pbkdf2(req.body.password,result.salt,150000,32,function(err,key){
			if(err) throw err
			if(key.toString('hex') === result.password){
				//Sets the session variables
				req.session.logged_in = true
				req.session.username = result.username
				req.session.access_level = result.access_level
				req.session.id_ = req.sessionID
				req.session.error = null;
				res.redirect('/menu')
				res.end()
			}else{
				req.session.error = 'Incorrect username or password'
				res.redirect('/login')
				res.end()
			}
		})
	}
	})
	}
}



module.exports = router;
