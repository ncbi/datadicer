'use strict';

/**
 * @ngdoc directive
 * @name seqrApp.directive:searchbar
 * @description
 * # searchbar
 */
angular.module('ngramApp')
    .directive('searchbar', function () {
        //var link = function (scope, elem, attr, ctrl) {
        //    scope.$on('searchbar.reset', function (e, data) {
        //        //http://stackoverflow.com/questions/12618342/ng-model-does-not-update-controller-value
        //
        //    });
        //};
        var controller = function ($scope) {
            //filters management should go here
            $scope.query = $scope.query || {matching: ''};
            $scope.placeholder = $scope.placeholder || 'what are you looking for ...';

            //console.info($scope.hasValidInput);
            $scope.hasValidInput = $scope.hasValidInput || function (lengthLimit) {
                    return ($scope.query && $scope.query.matching && $scope.query.matching.length > 0 );
                };
        };
        return {
            templateUrl: 'ddviews/searchbar.html',
            restrict: 'AE',
            scope: {
                query: '=?',
                filters: '=?',
                onSearch: '&', //when search button clicked
                onStartOver: '&', //when star over button clicked
                placeholder: '=?'

            },
            controller: controller
        };
    });
