
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

angular.module('general',['values','sockets']).controller('MainController',function($scope,user,socket){
	$scope.chatroomName = null;
	$scope.chatroomsSearched = null;
	$scope.chatroomLooking = null;
	$scope.userChatrooms = null;
	$scope.creatingChatroom = false;
	$scope.errorMessage = null;
	$scope.errorSearch = null;

	function init(){
		$scope.username = user;
		socket.emit('send chatrooms',{username:user});
	}

	$scope.init = init;

	function logout(){
		//$http.get('logout');
	}

	$scope.logout = logout;

	function setChatroomLooking(chatroom){
		$scope.errorMessage = null;
		if($scope.chatroomLooking === chatroom)
			$scope.chatroomLooking = null;
		else
			$scope.chatroomLooking = chatroom;
	}

	function showOptions(chatroomId){
		return $scope.chatroomLooking !== null && chatroomId === $scope.chatroomLooking._id;
	}

	function searchChatroom(chatroomName){
		if(chatroomName === "")
			$scope.chatroomsSearched = "";
		else
			socket.emit('search',{query: chatroomName});
	}

	socket.on('search',function(data){
		var index;
		for(room in $scope.userChatrooms){
			for(room2 in data.result){
				if(data.result[room2].name === $scope.userChatrooms[room].name)
					data.result.splice(room2,1);
			}
		}
		$scope.chatroomsSearched = data.result;
	});

	$scope.searchChatroom = searchChatroom;
	$scope.showOptions = showOptions;
	$scope.setChatroomLooking = setChatroomLooking;

	function joinChatroom(chatroomName,password){
		socket.emit('join chatroom',{chatroom: chatroomName,password: password,username: $scope.username});
		$scope.password = "";
	}

	socket.on('chatroom accepted',function(data){
		$scope.userChatrooms.push(data.chatroom);
		var index = $scope.chatroomsSearched.indexOf(data.chatroom);
		if(index>-1)
			$scope.chatroomsSearched.splice(index,1);
		$scope.chatroomLooking = null;
	});

	$scope.joinChatroom = joinChatroom; 

	//$http.get('chat/:slug');

	function createChatroom(){
		$scope.creatingChatroom = true;
	}

	function cancelCreateChatroom(){
		$scope.creatingChatroom = false;
		//$scope.nickname = null;
		$scope.password = null;
	}

	function saveChatroom(password){
		socket.emit('create chatroom',{password: password,username: $scope.username});
		$scope.password = "";
		$scope.creatingChatroom = false;
		cancelCreateChatroom();
	}

	socket.on('chatroom created',function(data){
		$scope.userChatrooms.push(data.chatroom);
	});

	socket.on('send chatrooms',function(data){
		$scope.userChatrooms = data.query;
	});

	function deleteChatroom(chatroom){
		var index = $scope.userChatrooms.indexOf(chatroom);
		if(index>-1){
			$scope.userChatrooms.splice(index,1);
			socket.emit('delete chatroom',{chatroom: chatroom.name,user: $scope.username});
		}
	}


	socket.on('error joining',function(data){
		$scope.errorMessage = data.message;
		setTimeout(function(){
			$scope.errorMessage = null;
		},2200);
	});

	socket.on('error searching',function(data){
		$scope.chatroomsSearched = "";
		$scope.errorSearch = data.message;
		setTimeout(function(){
			$scope.errorSearch = null;
		},2200);
	});

	$scope.deleteChatroom = deleteChatroom;
	$scope.createChatroom = createChatroom;
	$scope.cancelCreateChatroom = cancelCreateChatroom;
	$scope.saveChatroom = saveChatroom;
	//$scope.modifyChatroom = modifyChatroom;

});