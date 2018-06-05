'use strict';

/**
 * @ngdoc service
 * @name ngramApp.debounce
 * @description
 *
 * based on http://stackoverflow.com/questions/13320015/how-to-write-a-debounce-service-in-angularjs
 * but an improved version
 * # debounce
 * Factory in the ngramApp.
 */
angular.module('ngramApp')
// Create an AngularJS service called debounce
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
  .factory('debounce', function ($timeout, $q) {
    return function (func, wait, immediate) {
      var timeout;
      var deferred = $q.defer();
      return function () {
        var context = this, args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) {
            deferred.resolve(func.apply(context, args));
            deferred = $q.defer();
          }
        };
        var callNow = immediate && !timeout;
        if (timeout) {
          $timeout.cancel(timeout);
        }
        timeout = $timeout(later, wait);
        if (callNow) {
          deferred.resolve(func.apply(context, args));
          deferred = $q.defer();
        }
        return deferred.promise;
      };
    };
  });
//
//$scope.lookupDebounced = debounce($scope.lookup, 2000, false);
//
//$scope.promise = null;
//$scope.logLookupDebounced = function(msg) {
//  // Log that we have called the function
//  console.log('Log: ', msg);
//  // Call the debounced function
//  var promise = $scope.lookupDebounced(msg);
//  // If the promise is different to the one we have stored
//  if ( promise !== $scope.promise ) {
//    // Then we ditch the other one and use this one
//    $scope.promise = promise;
//    // When this promise is resolved we log its return
//    $scope.promise.then(function(value) {
//      console.log('Resolved:', value);
//      // And clear out the promise for next time
//      $scope.promise = null;
//    });
//  }
//};
