'use strict';

/**
 * @ngdoc directive
 * @name ngramApp.directive:checkboxInline
 * @description
 * # checkboxInline
 */
angular.module('ngramApp')
    .directive('rowchart', function () {
        return {
            templateUrl: 'ddviews/rowchart.html',
            restrict: 'AE',
            scope: {
                config: '=?',
                filters: '=?',
                allowZeros: '=',
                limitByNumber: '=?',
                onFilterChanges: '&' //use as on-tag-changes
            },

            controller: function ($scope, ngramAppConfig, $timeout) {

                $scope.config = angular.extend({}, {
                    name: 'test',
                    label: 'label',
                    width: window.innerWidth * 0.5 > 500 ? 500 : window.innerWidth * 0.5,
                    height: 200,
                    resizeWidth: function () {
                        return window.innerWidth * 0.5 > 500 ? 500 : window.innerWidth * 0.5;
                    }
                    // colors:d3.scale.ordinal().domain(["a","b","test"]).range(["red","blue","#FFFF00"]),
                    // colorAccessor:function (d, i){return 0;}
                }, $scope.config);

                $scope.config.field = $scope.config.field || $scope.config.name;

                // var getDummyData = function () {
                //     var data = [];
                //     for (var i = 0; i < 5; i++) {
                //         data.push([i, Math.floor(Math.random() * 100)]);
                //     }
                //     return data.map(function (d) {
                //         return {
                //             key: d[0] * 2,
                //             value: d[1]
                //         };
                //     });
                // };

                var singular = ngramAppConfig.SINGULAR;
                if (!singular) {
                    return;
                }
                var chart;


                $timeout(function () {
                    chart = singular.createRowChart($scope.config);
                    chart.margins($scope.config.margins || {
                            top: 5,
                            right: 5,
                            bottom: 20,
                            left: 8
                        });
                    //console.info(  document.getElementById('seqlen-chart').parentElement.offsetWidth);
                    if ($scope.config && $scope.config.colorAccessor) {
                        chart.colorAccessor($scope.config.colorAccessor);
                    }


                    //loadChart(filterToData($scope.filters));
                    // console.info(document.getElementById('test-chart').parentElement.offsetWidth);
                    // // attach listener
                    chart.filterHandler(function () {
                        // here we update $scope.filters
                        var allFilters = singular.getAllFilters(),
                            selected = allFilters[$scope.config.field || $scope.config.name],
                            filters = $scope.filters.slice();
                        if (selected) {
                            filters.forEach(function (d) {
                                if (selected.indexOf(d.name) > -1) {
                                    d.selected = true;
                                } else {
                                    d.selected = false;
                                }
                            });
                        }else{
                            filters.forEach(function (d) {
                                    d.selected = false;
                            });
                        }
                        $timeout(function () {
                            $scope.filters = filters;
                            $scope.onFilterChanges();
                        });
                    });
                    //chart.load(getDummyData());
                    chart.load([]);
                    window.addEventListener('resize', function () {
                        if ($scope.config.resizeWidth && angular.isFunction($scope.config.resizeWidth)) {
                            chart.width($scope.config.resizeWidth()).render();
                        }
                        dc.redrawAll();
                    });

                    $scope.resetChart = function (item) {

                        $scope.filters.forEach(function (d) {
                            d.selected = false;
                        });
                        chart.filterAll();
                        dc.redrawAll();
                    };
                });

                $scope.$watch(function ($scope) {
                        return $scope.filters;
                    },
                    function (newValue, oldValue) {
                        var data = [];
                        if (newValue && angular.isArray(newValue)) {
                            data = newValue.slice();
                            if (!$scope.allowZeros) {
                                data = data.filter(function (d) {
                                    return d.count > 0;
                                });
                            }
                            if ($scope.limitByNumber) {
                                data = data.slice(0, $scope.limitByNumber);
                            }
                            data = data.map(function (d) {
                                return {
                                    key: d.name,
                                    value: d.count
                                };
                            });
                        }
                        if (chart && data) {
                            chart.load(data);
                        }
                    }, true
                );
            }
        };
    })
;
