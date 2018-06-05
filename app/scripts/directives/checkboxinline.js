'use strict';

/**
 * @ngdoc directive
 * @name ngramApp.directive:checkboxInline
 * @description
 * # checkboxInline
 */
angular.module('ngramApp')
    .directive('checkboxInline', function ($filter) {
        var controller = function ($scope) {
            $scope.zerosFilter = function (filter) {
                return $scope.allowZeros || filter.count > 0 || filter.selected;
            };
            $scope.limit = $scope.limitByNumber || 10;

        };
        return {
            templateUrl: 'ddviews/checkboxInline.html',
            restrict: 'AE',
            scope: {
                filters: '=',
                allowZeros: '=',
                limitByNumber: '=?',
                limitFilters: '=?',
                onFilterChanges: '&' //use as on-tag-changes
            },
            controller: controller
        };
    });
