angular.module('sockets',[]).factory('socket',function($rootScope){
	var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

angular.module('chatrooms',['sockets','chatValues']).controller('ChatController',function($scope,user,socket,participants,admins,chatroom/*,$http,user*/){
  
  $scope.messages = [];
  $scope.participants = [];
  $scope.chatroom = null;
  $scope.user = null;
  $scope.admins = null;
  $scope.selectedParticipant = null;
  $scope.present = [];

  function init(){
    $scope.participants = participants;
    $scope.chatroom = chatroom;
    $scope.user = user;
    $scope.admins = admins;
    $scope.present.push(user);
    socket.emit('join room',{room: $scope.chatroom,user:$scope.user});
    socket.emit('im here',{user: $scope.user,room: $scope.chatroom});
  }

  $scope.init = init;


  function sendMessage(message){
      socket.emit('send to room',{message: message,room: $scope.chatroom,user: $scope.user});
  }

  socket.on('message',function(data){
    console.log('message received');
    var date = new Date();
    if(date.getMinutes()<10){
      data.time = date.getHours() + ":0" + date.getMinutes();
    }
    else
      data.time = date.getHours() + ":" + date.getMinutes();
    $scope.messages.push(data);
    setTimeout(function(){
      $("#messages").scrollTop($("#messages")[0].scrollHeight);
    },50);
  });

  $scope.sendMessage = sendMessage;

  function isAdmin(user){
    var index = $scope.admins.indexOf(user);
    if(index>-1){
      return true;
    }
    return false;
  }

  function selectParticipant(participant){
    if($scope.selectedParticipant === participant)
      $scope.selectedParticipant = null;
    else
      $scope.selectedParticipant = participant;
  }

  function showMakeAdmin(participant){
    return !isAdmin(participant) && $scope.selectedParticipant === participant && isAdmin($scope.user);
  }

  function makeAdmin(participant){
    socket.emit('make admin',{user: participant,room: $scope.chatroom});
    $scope.selectedParticipant = null;
  }

  function messageFromSelf(user){
    if($scope.user===user)
      return true;
    return false;
  }

  function messageFromOther(user){
    if($scope.user===user)
      return false;
    return true;
  }

  socket.on('new admin',function(data){
    $scope.admins.push(data.admin);
  });

  socket.on('new user',function(data){
    $scope.participants.push(data.user);
  });

  socket.on('im here',function(data){
    var index = $scope.present.indexOf(data.user);
    if(index === -1) {
      $scope.present.push(data.user);
      if(statusParticipant($scope.user))
        socket.emit('im here',{user: $scope.user,room: $scope.chatroom});
    }
  });

  function statusParticipant(participant) {
    var index = $scope.present.indexOf(participant);
    if(index === -1){
      return false;
    }
    return true;
  }

  socket.on('leave',function(data){
    var index = $scope.present.indexOf(data.user);
    $scope.present.splice(index,1);
    console.log('removed too');
  });

  $scope.statusParticipant = statusParticipant;
  $scope.messageFromSelf = messageFromSelf;
  $scope.messageFromOther = messageFromOther;
  $scope.makeAdmin = makeAdmin;
  $scope.showMakeAdmin = showMakeAdmin;
  $scope.isAdmin = isAdmin;
  $scope.selectParticipant = selectParticipant;

});