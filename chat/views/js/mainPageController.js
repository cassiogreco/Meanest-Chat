angular.module('mainPage',['values']).controller('MainPageController',function($scope,tab){
	$scope.register = true;
	$scope.sign = false;
	$scope.forgot = false;
	//$scope.successMessage = null;
	//$scope.errorMessage = null;

	function init(){
		switch(tab){
			case 'login':
				signIn();
				break;
			case 'register':
				registering();
				break;
			case 'forgot':
				forgetting();
				break;
			default:
				registering();
				break;
		}/*
		if(error){
			$scope.errorMessage = error;
			setTimeout(function(){
				$scope.errorMessage = null;
			},2200);
		}
		if(errorM){
			$scope.errorMessage = errorM;
			setTimeout(function(){
				$scope.errorMessage = null;
			},2200);
		}
		if(errorC){
			$scope.errorMessage = errorC;
			setTimeout(function(){
				$scope.errorMessage = null;
			},2200);
		}
		if(success){
			$scope.successMessage = success;
			setTimeout(function(){
				$scope.successMessage = null;
			},2200);
		}
	*/
	}

	function signIn(){
		$scope.sign = true;
		$scope.register = false;
		$scope.forgot = false;
		//$scope.errorMessage = null;
		//$scope.successMessage = null;
	}

	function registering(){
		$scope.sign = false;
		$scope.register = true;
		$scope.forgot = false;
		//$scope.errorMessage = null;
		//$scope.successMessage = null;
	}

	function forgetting(){
		$scope.sign = false;
		$scope.register = false;
		$scope.forgot = true;
		//$scope.errorMessage = null;
		//$scope.successMessage = null;
	}

	function Sign(){
		return $scope.sign;
	}

	function Register(){
		return $scope.register;
	}

	function Forgot(){
		return $scope.forgot;
	}

	$scope.init = init;
	$scope.Sign = Sign;
	$scope.Register = Register;
	$scope.Forgot = Forgot;
	$scope.signIn = signIn;
	$scope.registering = registering;
	$scope.forgetting = forgetting;

});