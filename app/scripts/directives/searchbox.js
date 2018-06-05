'use strict';

/**
 * @ngdoc directive
 * @name seqrApp.directive:searchbox
 * @description
 * # searchbox
 */
angular.module('ngramApp')
    .directive('searchbox', function () {
        //var link = function (scope, elem, attr, ctrl) {
        //    scope.$on('searchbox.reset', function (e, data) {
        //        //http://stackoverflow.com/questions/12618342/ng-model-does-not-update-controller-value
        //
        //    });
        //};
        var controller = function ($scope) {
            //filters management should go here
            $scope.query = $scope.query || {matching: ''};

            //console.info($scope.hasValidInput);
            $scope.hasValidInput = $scope.hasValidInput || function (lengthLimit) {
                    return ($scope.query && $scope.query.matching && $scope.query.matching.length > 0 );
                };
        };
        return {
            templateUrl: 'ddviews/searchbox.html',
            restrict: 'AE',
            scope: {
                query: '=?',
                filters: '=?',
                onSearch: '&', //when search button clicked
                onStartOver: '&' //when star over button clicked

            },
            // link: link,
            controller: controller
        };
    });
