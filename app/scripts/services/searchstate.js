'use strict';

/**
 * @ngdoc service
 * @name ngramApp.searchState
 * @description
 * # searchState
 * Service in the ngramApp.
 */
angular.module('ngramApp')
  .service('searchState', function ($rootScope) {
    // AngularJS will instantiate a singleton by calling 'new' on this function
    var service = {
      model: {},
      SaveState: function () {
        sessionStorage.userService = angular.toJson(service.model);
      },
      RestoreState: function () {
        service.model = angular.fromJson(sessionStorage.userService);
      },
      initState: function () {
        service.model = {
          query: {
            sequence: ''
          },
          filters: {
            tags: []
          }};
      }
    };
    service.initState();
    $rootScope.$on('savestate', service.SaveState);
    $rootScope.$on('restorestate', service.RestoreState);
    if (sessionStorage.userService) {
      service.RestoreState();
    }
    return service;
  });
