'use strict';
/*jshint camelcase: false */
/*jshint unused:false*/

/**
 * @ngdoc directive
 * @name ngramApp.directive:advancedOptions
 * @description
 * # advancedOptions
 */
angular.module('ngramApp')
    .directive('advancedOptions', function () {
        var link = function (scope, elem, attr, ctrl) {
            scope.$on('optnpanel.reset', function (e, data) {
                //http://stackoverflow.com/questions/12618342/ng-model-does-not-update-controller-value
            });
            scope.$watch('panel.open', function(isOpen) {
                if (isOpen) {
                    setTimeout(function(){$(elem).find('.filters-close').focus();}, 0);
                }
                else {
                    setTimeout(function(){$(elem).find('.filters-open').focus();}, 0);
                }
            });
        };
        var controller = function ($scope, $http, BackendDriver, $timeout) {

            var _backendDriver = BackendDriver.getDriver(null, $scope);
            var _defaultConf = {
                advOpts: {
                    open: false,
                    downloadBtn: {
                        hidden: false,
                        css: 'btn-default pull-right',
                        tips: 'Download (10k limit)',
                        tipsPlacement: 'top',
                        onClick: function () {
                            return _backendDriver.download($scope.selarrrow);
                        }
                    }
                }
            };
            $scope.config = $scope.config || _defaultConf;

            try {
                $scope.panel = {open: $scope.config.advOpts.open};
                $scope.config.advOpts.downloadBtn.onClick = $scope.config.advOpts.downloadBtn.onClick || _defaultConf.advOpts.downloadBtn.onClick;
            } catch (e) {
            }
            //sample config
            // $scope.config.filtersFields = $scope.config.filtersFields ||
            //     [{name: 'Assay Type', field: 'aidtype', allowZeros: true}, {
            //         name: 'Activity',
            //         field: 'actvty',
            //         allowZeros: true
            //     }];


            $scope.rangeFilters = $scope.rangeFilters || {};
            $scope.filters = $scope.filters || {};
            $scope.filters.filtersCount = $scope.filters.filtersCount || function (opts) {
                    var options = angular.extend({ignorePreDefinedFilter: true}, opts);
                    var counter = 0, key;
                    var tagFunc = function (tag) {
                        if (tag.selected && (!tag.not4Counting || !options.ignorePreDefinedFilter)) {
                            counter++;
                        }
                    };
                    if ($scope.filters) {
                        for (key in $scope.filters) {
                            if ($scope.filters.hasOwnProperty(key) && Array.isArray($scope.filters[key])) {
                                $scope.filters[key].forEach(tagFunc);
                            } else if ($scope.filters.hasOwnProperty(key) && angular.isString($scope.filters[key]) && $scope.filters[key].length > 0) {
                                counter++;
                            }
                        }
                    }
                    if ($scope.rangeFilters) {
                        for (key in $scope.rangeFilters) {
                            if ($scope.rangeFilters.hasOwnProperty(key) && Array.isArray($scope.rangeFilters[key]) && $scope.rangeFilters[key].length > 0) {
                                counter++;
                            }
                        }
                    }
                    return counter;
                };
            $scope.filters.resetAllFilters = $scope.filters.resetAllFilters || function (opts) {
                    var options = angular.extend({doSearch: false, ignorePreDefinedFilter: true}, opts);
                    var tagFunc = function (tag) {
                        if (tag.selected && (!tag.not4Counting || !options.ignorePreDefinedFilter)) {
                            tag.selected = false;
                        }
                    };
                    for (var key in $scope.filters) {
                        if ($scope.filters.hasOwnProperty(key) && Array.isArray($scope.filters[key])) {
                            $scope.filters[key].forEach(tagFunc);
                        } else if ($scope.filters.hasOwnProperty(key) && angular.isString($scope.filters[key])) {
                            delete $scope.filters[key];
                        }
                    }

                    //reset all chart filters!
                    if (dc && dc.filterAll) {
                        dc.filterAll();
                    }
                    $scope.$broadcast('gridtable.reset');
                    $scope.$broadcast('optnpanel.reset');

                    if (options.doSearch && $scope.onFilterChange) {
                        $timeout(function () {
                            $scope.onFilterChange();
                        });
                    }
                };
            $scope.resetAllSelection = $scope.resetAllSelection || function () {
                    $scope.$parent.$broadcast('gridtable.resetAllSelection');
                };


            var _populateGetSuggestionsFunctionsInStringFilterFields = function () {
                if (!$scope.config || !$scope.config.stringFilterFields) {
                    return null;
                }

                /**
                 * _updateSingleStringFilterField
                 * @param obj
                 *
                 *  obj = {
                        name: 'aidname',
                        label: 'Assay Name',
                        placeholder: ' filter by Assay Name ',
                        minimum: 2,
                        suggestions: function () {
                            return ['assay name 1', 'assay name 2', 'assay name 3'];
                        }
                    }

                 * @private
                 */
                var _updateSingleStringFilterField = function (obj) {
                    if (obj.suggestions && angular.isString(obj.suggestions)) { //this is a field name and we need to provide autosuggestion based on this field
                        obj.getSuggestions = ((function () {
                            return _backendDriver.getAutoSuggestion(obj.suggestions);
                        })());
                    } else if (angular.isArray(obj.suggestions)) { //this is a list of name suggestions, use them as it.
                        obj.getSuggestions = function () {
                            return obj.suggestions;
                        };
                    } else if (angular.isFunction(obj.suggestions)) {
                        obj.getSuggestions = obj.suggestions;
                    }
                };

                if (angular.isObject($scope.config.stringFilterFields)) {
                    for (var i in $scope.config.stringFilterFields) {
                        if ($scope.config.stringFilterFields.hasOwnProperty(i)) {
                            _updateSingleStringFilterField($scope.config.stringFilterFields[i]);
                        }
                    }
                } else if (angular.isArray($scope.config.stringFilterFields)) {
                    $scope.config.stringFilterFields.forEach(function (d) {
                        _updateSingleStringFilterField(d);
                    });
                }
            };

            _populateGetSuggestionsFunctionsInStringFilterFields();

        };
        return {
            templateUrl: 'ddviews/advanced-options.html',
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                query: '=?',
                config: '=?',
                filters: '=',
                rangeFilters: '=?',
                selarrrow: '=?',//selected rows
                onFilterChange: '&', //use as on-filter-change,
                resetAllSelection: '&'
            },
            link: link,
            controller: controller
        };
    });

