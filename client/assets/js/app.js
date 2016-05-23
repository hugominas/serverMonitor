'use strict';
var commonVal = {
	start: true,
	isInIframe : (window.location != window.parent.location) ? true : false
}
if(!commonVal.isInIframe){$('.urtype_sidebar').show();$('body').removeClass('inIframe')}


var app = angular
	.module("app", ['ui.router','ngResource', 'angular-growl',  'ui.grid', 'ui.grid.cellNav', 'ui.grid.edit', 'ui.grid.resizeColumns', 'ui.grid.pinning', 'ui.grid.selection', 'ui.grid.moveColumns', 'ui.grid.exporter', 'ui.grid.importer', 'ui.grid.grouping', 'ui.grid.pagination','ui.tinymce'])
	.config(function($stateProvider, $urlRouterProvider, growlProvider, $httpProvider, $interpolateProvider) {
		growlProvider.globalTimeToLive(5000);

	    $stateProvider
			.state('login', {
					url: "/login",
			        templateUrl: 'views/login.html',
			        controllerProvider: 'controllers/userCtrl.js'
		    	})
			.state('logout', {
					url: "/logout",
			        controller: function($http, $location) {
				 		$http.post('/user/logout').then(function(data){
							window.location="/login.html"
				 		});
				 	}
		    	})
			.state('register', {
					url: "/register",
			        templateUrl: 'views/register.html',
			        controllerProvider: 'controllers/userCtrl.js'
		    	})
			.state('install', {
					url: "/install",
			        controller: function($http, $location) {
						 		$http.post('/install').then(function(data){
						 			if (data.data.status === 'ok') {
						 				$location.url('/admin/');
						 			}
						 		});
						 	}
		    	})
			.state('admin', {
					url: "/{params:.*}",
			        templateUrl: 'views/admin.html',
			        controllerProvider: 'controllers/adminCtrl.js'
		    	});
	  $httpProvider.interceptors.push('checkHttpInterceptor');
		$urlRouterProvider.otherwise("/");
 		$interpolateProvider.startSymbol('{[{').endSymbol('}]}');
	});

//COMPILE HTML TO RELOAD EVENTS
app.directive('dynamic', function ($compile) {
  return {
    restrict: 'A',
    replace: true,
    link: function (scope, ele, attrs) {
      scope.$watch(attrs.dynamic, function(html) {
        ele.html(html);
        $compile(ele.contents())(scope);
      });
    }
  };
});
app.directive('onFinishRender', function ($timeout) {
return {
		restrict: 'A',
		link: function (scope, element, attr) {
			if (scope.$last === true) {
					$timeout(function () {
							scope.$emit('ngRepeatFinished');
					});
			}
		}
}
})
//PREVENT DEFAULT FOR LINKS WITH NG CLICK EVENTS
app.directive('a', function() {
    return {
        restrict: 'E',
        link: function(scope, elem, attrs) {
            if(attrs.ngClick || attrs.href === '' || attrs.href === '#'){
                elem.on('click', function(e){
                    e.preventDefault();
                });
            }
        }
   };
});

app.directive('fileModel', ['$parse', function ($parse) {
    return {
       restrict: 'A',
       link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel);
          var modelSetter = model.assign;

          element.bind('change', function(){
             scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
             });
          });
       }
    };
 }]);

 app.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl, callback){
       var fd = new FormData();
       fd.append('file', file);

       $http.post(uploadUrl, fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
       })
       .then(
		   //success
		   function(data) {
			   callback(data);
		   },
		   //error
		   function(data) {
			   callback(data);
		   }
   		);
    }
 }]);

app.factory('checkHttpInterceptor', function ($q, $location) {
    return {
        response: function (response) {
					// RUN SPECIFIC broadcast LIKE $rootScope.$broadcast('UpdateSytem');
					if(response.data.hasOwnProperty('logged')){
						if(response.data.logged){
							commonVal.logged = true;
						}else if(response.data.logged===false){
							commonVal.logged = false;
							window.location.href='/admin/#/login';
						}
					}
					return response;
				},
        responseError: function (response) {
            // do something on error
            return $q.reject(response);
        }
			}
	})



app.filter('orderBy', function(){
 return function(input, attribute) {
    if (!angular.isObject(input)) return input;

    var array = [];
    for(var objectKey in input) {
        array.push(input[objectKey]);
    }

    array.sort(function(a, b){
        a = parseInt(a[attribute]);
        b = parseInt(b[attribute]);
        return a - b;
    });
    return array;
 }
});

function uniq(a) {
	return Array.from(new Set(a));
}
function removefromArray(array, elment){
	var index = array.indexOf(elment);
	array.splice(index, 1);
}
