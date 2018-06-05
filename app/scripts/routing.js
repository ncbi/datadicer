'use strict';
angular.module('ngramApp').config(function ($stateProvider, $urlRouterProvider) {
    // For any unmatched url, send to /
    $urlRouterProvider.otherwise('/');
    // Now set up the states
    $stateProvider
        .state('/', {
            url: '/',
            templateUrl: 'ddviews/view.html',
            controller: 'MainCtrl'
        })
        .state('view', {
            url: '/view/:term',
            abstract: true,
            templateUrl: 'ddviews/view.html',
            controller: 'MainCtrl'
        })
        .state('view.table', {
            url: '/:table',
            templateUrl: 'ddviews/view.table.html'
        });

    //$urlRouterProvider.when('/view/:gi', '/view/:gi/all');

});
