var express = require('express');
var router = express.Router();
var session = require('express-session')
var io = require('socket.io')

//Gets the homepage
router.get('/', function(req, res) {
  //Verifies which tab is displayed on the homepage: Register, Login or Forgot Password
  var tab = req.session.tab;
  if (req.session.tab == null || req.session.tab == undefined)
  	tab = ''
  //Renders the jade with/without the errors/success messages
  res.render('index', {tab: tab,errorC: req.session.error,success:req.session.success});
  //Reset error and success message values
  req.session.error = null;
  req.session.success = null;
  req.session.tab = null;
  res.end();
});

//Gets the chats page with slug
router.get('/chat/:slug',function(req,res,next){
	//Verifies if the user is logged on
	if(req.session.logged_in === true){
		var Chatroom = require('../chatroom.js')
		if(req.params.slug !== null){
			Chatroom.findOne({name: req.params.slug,users: req.session.username},{users:1,name:1,admin:1,_id:0},function(err,result){
				if(err) throw err
				if(result === null){
					req.session.error = 'You are not a part of this channel or this channel does not exist'
					res.redirect('/menu')
					res.end()
				}
				else{
					//Renders the chat jade and sends critical information to the template
					req.session.room = req.params.slug			
					res.render('chat',{room: req.params.slug,participants: result.users,user: req.session.username,admins: result.admin});
					res.end();
					//Reset error and success message values
					req.session.error = null;
					req.session.success = null;
				}
			})
		}else{
			req.session.error = 'Invalid room';
			res.redirect('/menu')
			res.end()
		}	
	}else{
		req.session.error = 'Please login first';
		res.redirect('/login')
		res.end()
	}
})

//Gets the menu page
router.get('/menu',function(req,res){
	//Verifies if the user is logged on
	if(req.session.logged_in === true){
		var User = require('../user.js')
		User.find({username: req.session.username},function(err,result){
			if(err) throw err
			//Renders the menu page
			res.render('menu',{user: req.session.username,rooms: result.rooms,message: req.session.error})
			req.session.error = null;
			res.end()
		})
	}else{
		//Redirects back to the login page if the user is not logged on
		req.session.error = 'Please login first';
		res.redirect('/login')
		res.end()
	}
})

router.get('/login',function(req,res){
	//If the user is logged on
	if(req.session.logged_in){
		res.redirect('menu');
		res.end();
	}else{
		//If the user is not logged on
		var success = req.session.success;
		if(success != undefined && success != null)
			success += " Don't forget to check your spam folder!"
		//Renders the home page with/without error messages
		res.render('index',{success: success,error: req.session.error,tab: 'login'})
		//Reset error and success message values
		req.session.success = null;
		req.session.error = null;
		req.session.tab = null;
		res.end()
	}
})

//Logs out and redirects to login
router.get('/logout',function(req,res){
	req.session.destroy();
	res.redirect('/login');
	res.end();
})

//Gets the change password page with the unique link sent by email to the user
router.get('/change_password/:slug',function(req,res){
	var Forgot = require('../forgot.js')
	req.session.slug = req.params.slug;
	Forgot.findOne({key: req.params.slug},function(err,result){
		if(err) throw err
		if(result !== null){
			//Gets the time difference between the request to change the password and the time the page is opened
			var timeDifference = (Date.now() - result.date)/60000;
			//If the page is opened in less than 20 minutes, render the page
			if(timeDifference<20){
				res.render('change_password',{email: result.email,error: req.session.error});
				res.end();
				//Reset error and success message values
				req.session.error = null;
				req.session.success = null;
				req.session.tab = null;
			//If the link is clicked after 20 minutes of the email being sent, the key is expired
			}else{
				res.render('key_expired');
				res.end();
				//Reset error and success message values
				req.session.error = null;
				req.session.success = null;
				req.session.tab = null;
			}
		}else{
			res.render('key_expired');
			res.end();
			//Reset error and success message values
			req.session.error = null;
			req.session.success = null;
			req.session.tab = null;
		}
	})
})

//Gets the forgot password page
router.get('/forgot_password',function(req,res){
	req.session.tab = 'forgot'
	res.redirect('/forgot')
	//Reset error and success message values
	req.session.error = null;
	req.session.success = null;
	req.session.tab = null;
	res.end();
})

//Renders the homepage with the forgot tab
router.get('/forgot',function(req,res){
	res.render('index',{errorM: req.session.error,tab: 'forgot'})
	//Reset error and success message values
	req.session.success = null;
	req.session.error = null;
	req.session.tab = null;
	res.end()
})

//Renders the home page with the register tab
router.get('/home',function(req,res){
	res.redirect('index',{tab: 'register'})
	//Reset error and success message values
	req.session.error = null;
	req.session.success = null;
	req.session.tab = null;
	res.end();
})

//Renders the home page with the login tab
router.get('/log',function(req,res){
	res.redirect('login')
	//Reset error and success message values
	req.session.error = null;
	req.session.success = null;
	req.session.tab = null;
	res.end();
})

module.exports = router;
