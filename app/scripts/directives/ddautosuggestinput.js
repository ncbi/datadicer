'use strict';

/**
 * @ngdoc directive
 * @name datadicerApp.directive:ddAutosuggestInput
 * @description
 * # ddAutosuggestInput

 Usage:


 $scope.config = {
                        name: 'cmpdname',
                        label: 'Compound Name',
                        placeholder: ' filter by Compound Name ',
                        minimum: 2
  };
 $scope.filterString = '';
 $scope.onFilterChange=function(){};
 $scope.getSuggestedName = function (val) { //return promises
                return $http.get('//maps.googleapis.com/maps/api/geocode/json', {
                    params: {
                        address: val,
                        sensor: false
                    }
                }).then(function (response) {
                    return response.data.results.map(function (item) {
                        return item.formatted_address;
                    });
                });
 };

 $scope.getSuggestions1 = function () { //return an array will work too!
                return ['a', 'b'];
 };

 <div dd-autosuggest-input  config="config"  filters="filterString"  get-suggestions="getSuggestedName(value)" on-filter-changes="onFilterChange()"></div>

 *
 *
 */
angular.module('ngramApp')
    .directive('ddAutosuggestInput', function () {
        var link = function (scope, elem, attr, ctrl) {
            scope.$on('autosuggest-input.reset', function (e, data) {
                scope.myForm = {_term: ''};
            });
        };
        var controller = function ($scope, $http) {
            $scope.config = $scope.config || {};
            $scope.config.minimum = $scope.config.minimum || 2;
            $scope.filters = $scope.filters || {};
            $scope.myForm = {};


            $scope.$watch(function ($scope) {
                    return $scope.filters;
                },
                function (newValue) {
                    if (newValue && newValue.length > 0) {
                        $scope.onFilterChanges();
                    } else if (!newValue || newValue === '') {
                        $scope.myForm._term = '';
                    }
                }
            );

            /**
             * getSuggestedName
             * @param value
             *
             *
             * why we do this? explanation can be found here
             * https://blog-it.hypoport.de/2013/11/06/passing-functions-to-angularjs-directives/
             */
            $scope.getSuggestedName = function (value) {
                return $scope.getSuggestions({value: value});
            };
        };
        return {
            templateUrl: 'ddviews/dd-autosuggest-input.html',
            restrict: 'AE',
            replace: false,
            scope: {
                config: '=?',
                filters: '=?',
                getSuggestions: '&',
                onFilterChanges: '&' //use as on-filter-changes
            },
            link: link,
            controller: controller
        };
    });
