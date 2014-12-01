/*

Created by Cassio Greco
Hosted on GitHub on December 1st 2014

*/

//Module Imports
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var http = require('http')
var mongoose = require('mongoose')
var routes = require('./routes/index');
var users = require('./routes/users');
var crypto = require('crypto')
var nodemailer = require('nodemailer');

var app = express();

//Database connection
mongoose.connect('mongodb://@localhost:27017/chat_db')

// view engine setup
app.set('port',process.env.PORT)
app.set('trust proxy',true);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'views/js')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('72ASFG4H-FFG2G-GGGGG2R-KAAJSD1I-1n3bASDHB2-123133'));
app.use(session({secret: 'ASDsad12rfFC-SD9jjg2-DSDAdg2i1-21X123X1-13EWClllp-112-1332A'}));

app.use('/', routes);
app.use('/users', users);
app.use('/login', users.authenticate)
app.use('/create_account',routes)
app.use('/chat/:slug',routes)
app.use('/menu',routes)
app.use('/logout',routes)
app.use('/change_password',routes)
app.use('/forgot_password',routes)

/************************************************************************
                               Posts API
************************************************************************/

//Creates an account
app.post('/create_account',function(req,res){
    var User = require('./user.js')
    var user = new User();
    user.name = req.body.name
    user.username = req.body.username
    user.email = req.body.email
    user.access_level = 1
    crypto.randomBytes(16,function(err,buf){
        if(err) throw err
        user.salt = buf.toString('hex')
        crypto.pbkdf2(req.body.password,user.salt,150000,32,function(err,password){
            if(err) throw err
            user.password = password.toString('hex')
            user.save(function(err,result){
                if(err){
                    req.session.error = 'Username or Email already exists';
                    req.session.tab = 'register'
                    res.redirect('/')
                    res.end();
                }else{
                console.log('User saved correctly!')
                //Send an email to the account's email address
                var transporter = nodemailer.createTransport();
                transporter.sendMail({
                    from: 'noreply@meanchat.com',
                    to: req.body.email,
                    subject: 'Account Created',
                    html: '<p>Hello,'+req.body.name+' you have created an account in our system.</p>\
                    <p>Please <a href="54.164.193.70/login" target="_blank">log in</a> so you can start using our webchat app!</p>\
                    <br><p>Chatter team.</p>'
                });
                req.session.success = 'User created successfully!';
                req.session.tab = "login";
                res.redirect('/')
                res.end()
            }
            })
        })
    })
})

//Deletes an account
app.post('/del_account',function(req,res){
    if(req.session.logged_in===true){
        req.session = null
        var User = require('./user.js')
        User.remove({username: user.user.username},function(err,result){
            if(err) throw err
            req.session.error = "Account deleted successfully!"
            res.redirect('/login')
            res.end()
        })
    }
})

//Handles a forgotten password. Sends the user an email with a unique link and creates a unique verification key
app.post('/forgot_password',function(req,res){
    //Verifies if the input if not null
    if(req.body.email === null || req.body.email === undefined){
        req.session.tab = 'forgot'
        req.session.error = "Invalid email";
        res.redirect('/');
        res.end();
    }else{
    var Forgot = require('./forgot.js');
    var forgot = new Forgot();
    var User = require('./user.js')
    User.findOne({email: req.body.email},function(err,result){
        if(err) throw err
        //If no email was found -> User does not exist
        if(result === null){
            req.session.tab = 'forgot'
            req.session.error = "Invalid email";
            res.redirect('/forgot');
            res.end();
        }else{
            forgot.date = Date.now();
            forgot.email = req.body.email;
            crypto.randomBytes(8,function(err,key){
                if(err) throw err
                forgot.key = key.toString('hex');
                Forgot.findOne({email: req.body.email},function(err,result){
                    if(err) throw err
                    //Checks to see if the user has already requested a password change.
                    //If the user has not
                    if(result===null){
                        //Adds the information to the collection
                        forgot.save(function(err,result){
                            if(err) throw err
                            //Sends an email to the user with a unique link
                            var transporter = nodemailer.createTransport();
                            transporter.sendMail({
                                from: 'noreply@meanchat.com',
                                to: req.body.email,
                                subject: 'Forgot Password',
                                html: '<p>Hello, it seems you have forgotten your password and requested to change your password in our system.</p>\
                                <p>Please <a href="54.164.193.70/change_password/'+forgot.key+'" target="_blank">click here</a> in the next <b>20</b> minutes to change your password.</p><p>If you did not request this change, please disregard this email.</p>\
                                <br><p>Mean Chat team.</p>'
                            });
                            req.session.success="Email sent successfully!";
                            res.redirect('/login');
                            res.end();
                        })
                    //If the user has already requested a password change
                    }else{
                        //Updates the information that is already in the collection
                        result.date = forgot.date;
                        result.key = forgot.key;
                        result.save(function(err,result){
                            if(err) throw err
                            //Sends an email to the user with a unique link
                            var transporter = nodemailer.createTransport();
                            transporter.sendMail({
                                from: 'noreply@meanchat.com',
                                to: req.body.email,
                                subject: 'Forgot Password',
                                html: '<p>Hello, it seems you have forgotten your password and requested to change your password in our system.</p>\
                                <p>Please <a href="54.164.193.70/change_password/'+forgot.key+'" target="_blank">click here</a> in the next <b>20</b> minutes to change your password.</p><p>If you did not request this change, please disregard this email.</p>\
                                <br><p>Mean Chat team.</p>'
                            });
                            req.session.success="Email sent successfully!";
                            res.redirect('/login');
                            res.end();
                        })
                    }
                })
            })
        }
       })
    }
})

//Changes the password of the user
app.post('/change_password',function(req,res){
    var Forgot = require('./forgot.js');
    var User = require('./user.js');
    //If one of the passwords is null
    if(req.body.password == null || req.body.confirmedPassword == null || req.body.password == "" || req.body.confirmedPassword == ""){
        req.session.error = 'Type in both passwords';
        res.redirect('/change_password/'+req.session.slug);
        res.end();
    //If both passwords are the same
    }else if(req.body.password === req.body.confirmedPassword){
        User.findOne({email: req.body.email},function(err,result){
            if(err) throw err
            crypto.pbkdf2(req.body.password,result.salt,150000,32,function(err,key){
                if(err) throw err
                User.update({email: req.body.email},{$set:{password:key.toString('hex')}},function(err,result){
                    if(err) throw err
                    Forgot.remove({email: req.body.email},function(err,result){
                        if(err) throw err;
                        req.session.success = 'Password changed successfully!';
                        res.redirect('/login')
                        res.end();
                    })
                })
            })
        })
    //If one of the passwords is not the same
    }else{
        req.session.error = 'Passwords must be the same';
        res.redirect('/change_password/'+req.session.slug);
        res.end();
    }
})


/************************************************************************
                                Error Handlers
************************************************************************/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
        res.end();
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
    res.end();
});

//Server creation
var server = http.createServer(app,function(req,res){
    console.log("Connection established!")
    res.writeHead(200,{'Content-type': 'text/html'})
    res.end();
});
server.listen(app.get('port'),function(req,res){
    console.log("Listening on port "+process.env.PORT)
});

/************************************************************************
                                WebSockets
************************************************************************/

//Vector of objects containing the sockets and user information
var lastMessages = [];

//Empty object constructor
function onlineUsers(){}

var io = require('socket.io').listen(server)

io.sockets.on('connection',function(socket){

    //Every 2 minutes the server will verify if the users are still online.
    //If the user has been inactive for at least 10 minutes, the user's status will be displayed as offline
    setInterval(function(){
        for(var i=0;i<lastMessages.length;i++) {
            if(Date.now() - lastMessages[i].date >= 600000) {
                io.to(lastMessages[i].room).emit('leave',{user: lastMessage.user})
                lastMessages.splice(i,1);
                break;
            }
        }
    },120000);

    //Send message to all sockets
    socket.on('message',function(data){
        io.emit('message',{'message': data.message})
    })

    //Socket joins a room. Creates a new online user object and populates itself with relevant data
    socket.on('join room',function(data){
        console.log(socket.id);
        socket.join(data.room)
        console.log("join room "+socket.id);
        lastMessage = new onlineUsers();
        lastMessage.date = Date.now();
        lastMessage.socket = socket.id;
        lastMessage.user = data.user;
        lastMessage.room = data.room;
        lastMessages.push(lastMessage);
        console.log(lastMessages);
        console.log("Room "+data.room+" joined!")
    })

    //Sends a message to the chatroom. Verifies if the user is already online.
    //If yes, updates the date of the last message sent.
    //If not, adds the user back to the online user vector.
    socket.on('send to room',function(data){
        console.log('message from: '+socket.id);
        console.log("Send msg "+socket.id);
        for(var i=0;i<lastMessages.length;i++){
            if(lastMessages[i].socket === socket.id){
                lastMessages[i].date = Date.now();
                break;
            }
            if(i===lastMessages.length-1) {
                lastMessage = new onlineUsers();
                lastMessage.date = Date.now();
                lastMessage.socket = socket.id;
                lastMessage.user = data.user;
                lastMessage.room = data.room;
                lastMessages.push(lastMessage);
                io.to(data.room).emit('im here',{user: data.user});
            }
        }
        if(lastMessages.length===0) {
            lastMessage = new onlineUsers();
            lastMessage.date = Date.now();
            lastMessage.socket = socket.id;
            lastMessage.user = data.user;
            lastMessage.room = data.room;
            lastMessages.push(lastMessage);
            io.to(data.room).emit('im here',{user: data.user});
        }
        io.to(data.room).emit('message',{message: data.message, user: data.user})
    })

    //Search for a chatroom
    socket.on('search',function(data){
        console.log(socket.id);
        console.log("Search "+socket.id);
        var Chatroom = require('./chatroom.js')
        Chatroom.find({name: new RegExp(data.query)},function(err,result){
            if(err) throw err
            if(result.length === 0)
                io.to(socket.id).emit('error searching',{message: 'No chatroom found'});
            else
                io.to(socket.id).emit('search',{result: result})
        })
    })

    //Adds user to a chatroom by inserting a password, after searching for the chatroom
    socket.on('join chatroom',function(data){
        console.log("Join "+socket.id);
        var Chatroom = require('./chatroom.js')
        chatroom = new Chatroom();

        if(data.password === null || data.password === undefined){
            io.to(socket.id).emit('error joining',{message: 'Please type in a password'});
        }else{
        Chatroom.findOne({name: data.chatroom},function(err,chatroom){
            if(err) throw err
            if(!chatroom){
            }else{
            crypto.pbkdf2(data.password.toString('hex'),chatroom.salt,150000,32,function(err,key){
                if(err) throw err
                if(key.toString('hex')===chatroom.password){
                    var User = require('./user')
                    User.update({username: data.username},{$push:{namespaces: chatroom.name}},function(err,result){
                        if(err) throw err
                        Chatroom.update({name: data.chatroom},{$push:{users: data.username}},function(err,result){
                            if(err) throw err
                            io.to(socket.id).emit('chatroom accepted', {chatroom: chatroom})
                            io.to(data.chatroom).emit('new user',{user: data.username});
                        })
                    })
                }else{
                    io.to(socket.id).emit('error joining',{message: 'Wrong password'});
                }
            })
            }
        })
        }
    })

    //Creates a new chatroom
    socket.on('create chatroom',function(data){
        console.log(socket.id);
        var User = require('./user.js')
        var user = new User();
        var Chatroom = require('./chatroom.js')
        var chatroom = new Chatroom();
        console.log(chatroom);
        //Names are unique 16bit hexes
        crypto.randomBytes(16,function(err,name){
            if(err) throw err
            chatroom.name = name.toString('hex')
            chatroom.users.push(data.username)
            chatroom.admin.push(data.username)
            crypto.randomBytes(8,function(err,salt){
                if(err) throw err
                chatroom.salt = salt.toString('hex')
                crypto.pbkdf2(data.password,chatroom.salt,150000,32,function(err,key){
                    if(err) throw err
                    chatroom.password = key.toString('hex')
                    chatroom.save(function(err,chatroom){
                        if(err) throw err
                        User.update({username: data.username},{$push:{rooms: {name:chatroom.name}}},function(err,result){
                            if(err) throw err
                            console.log('chatroom created')
                            io.to(socket.id).emit('chatroom created',{chatroom: chatroom})
                        })
                    })
                })
            })
        })
    })

    //Send the chatrooms the user is currently a part of
    socket.on('send chatrooms',function(data){
        console.log(socket.id);
        var Chatroom = require('./chatroom.js')
        Chatroom.find({users: data.username},function(err,result){
            if(err) throw err;
            io.to(socket.id).emit('send chatrooms',{query:result});
        });
    })

    //Deletes a chatroom
    socket.on('delete chatroom',function(data){
        console.log(socket.id);
        var User = require('./user.js');
        var Chatroom = require('./chatroom.js')
        User.update({username: data.user},{$pull:{rooms: data.chatroom}},function(err,result){
            if(err) throw err;
            Chatroom.update({name: data.chatroom},{$pull:{users: data.user,admin: data.user}},function(err,result){
                if(err) throw err;
                console.log('Chatroom removed');
            })
        });
    });

    //Makes a user an admin of the chatroom
    socket.on('make admin',function(data){
        console.log(socket.id);
        var Chatroom = require('./chatroom.js')
        chatroom = new Chatroom();
        Chatroom.update({name: data.room},{$push:{admin: data.user}},function(err,result){
            if(err) throw err;
            io.to(data.room).emit('new admin',{admin: data.user});
        });
    });

    //Sends a message to the room informing all sockets (users) that the particular socket (user) is online
    socket.on('im here',function(data){
        io.to(data.room).emit('im here',{user: data.user});
    });

})    




/************************************************************************
************************************************************************/

module.exports = app;