'use strict';

/**
 * @ngdoc directive
 * @name seqrApp.directive:searchbar
 * @description
 * # searchbar
 */
angular.module('ngramApp')
    .directive('filterAsTab', function () {
        //var link = function (scope, elem, attr, ctrl) {
        //    scope.$on('searchbar.reset', function (e, data) {
        //        //http://stackoverflow.com/questions/12618342/ng-model-does-not-update-controller-value
        //
        //    });
        //};
        var controller = function ($scope) {
            //filters management should go here
            $scope.mylimit = $scope.limit || 6;
            $scope.tabChange = function (tab) {
                if (Array.isArray($scope.filter)) {
                    $scope.filter.forEach(function (d) {
                        d.selected = d.name === tab.name;
                        d.not4Counting = true;
                    });
                }
                $scope.onFilterChange();
            };

        };
        return {
            templateUrl: 'ddviews/filter-as-tab.html',
            restrict: 'AE',
            scope: {
                filter: '=?',
                limit: '=?',
                onFilterChange: '&'
            },
            // link: link,
            controller: controller
        };
    });
