'use strict';

/**
 * @ngdoc directive
 * @name ngramApp.directive:checkboxInline
 * @description
 * # checkboxInline
 */
angular.module('ngramApp')
    .directive('advancedOptionsSelectedButton', function () {
        return {
            templateUrl: 'ddviews/advanced-options-selected-button.html',
            restrict: 'AE',
            scope: {
                advOpts: '=',
                selarrrow: '=?',
                resetAllSelection: '&'
            }
        };
    });
