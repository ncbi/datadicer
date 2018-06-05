'use strict';

/**
 * @ngdoc directive
 * @name ngramApp.directive:checkboxInline
 * @description
 * # checkboxInline
 */
angular.module('ngramApp')
    .directive('barchart', function () {
        return {
            templateUrl: 'ddviews/barchart.html',
            restrict: 'AE',
            scope: {
                config: '=?',
                filters: '=?',
                rangeFilters: '=?',
                onFilterChanges: '&' //use as on-tag-changes
            },

            controller: function ($scope, ngramAppConfig, $timeout) {

                //filters management should go here
                $scope.config = $scope.config || {
                        field: 'mw',
                        name: 'Molecular Weight',
                        unit: 'Molecular Weight, Daltons ',
                        xmin: 1,
                        xmax: 20,
                        xtickscale: 100,
                        width: window.innerWidth * 0.5 > 500 ? 500 : window.innerWidth * 0.5,
                        resizeWidth: function () {
                            return window.innerWidth * 0.5 > 500 ? 500 : window.innerWidth * 0.5;
                        },
                        height: 100
                    };
                $scope.rangeFilters = $scope.rangeFilters || [];

                //
                // var getDummyData = function () {
                //     var data = [];
                //     for (var i = 0; i < 100; i++) {
                //         data.push([i, 5 + Math.random() * 20]);
                //     }
                //     data = data.map(function (d) {
                //         return {
                //             key: d[0] * 2,
                //             value: d[1]
                //         };
                //     });
                //     return data;
                // };

                var singular = ngramAppConfig.SINGULAR;
                if (!singular) {
                    return;
                }
                var chart;
                $timeout(function () {

                    if ($scope.config.xmax && angular.isDate($scope.config.xmax)) {
                        chart = singular.createTimeSeriesBarChart($scope.config);
                    } else {
                        chart = singular.createBarChart($scope.config);
                    }
                    chart.margins($scope.config.margins || {
                        top: 10,
                        right: 50,
                        bottom: 20,
                        left: 80
                    });
                    //console.info(  document.getElementById('seqlen-chart').parentElement.offsetWidth);

                    //attach listener
                    chart.filterHandler(function () {
                        // here we update $scope.filters
                        var allfilters = singular.getAllFilters();

                        $scope.rangeFilters = allfilters[$scope.config.field] && angular.isArray(allfilters[$scope.config.field]) && allfilters[$scope.config.field].length > 0 ? allfilters[$scope.config.field][0] : [];
                        $timeout(function () {
                            $scope.onFilterChanges();
                        });
                        //console.info(singular.getAllFilters());
                        //console.info(JSON.stringify($scope.filters));
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
                        chart.filterAll();
                        dc.redrawAll();
                    };
                    $scope.$watch(function ($scope) {
                            return $scope.filters;
                        },
                        function (newValue) {
                            var data = [];
                            if (newValue && angular.isArray(newValue)) {
                                //only for non-time series
                                if ($scope.config.xtickscale && !($scope.config.xmax && angular.isDate($scope.config.xmax))) {
                                    data = newValue.map(function (d) {
                                        return {
                                            key: d.name / ($scope.config.xtickscale || 1 ),
                                            value: d.count
                                        };
                                    });
                                } else {
                                    data = newValue.map(function (d) {
                                        return {
                                            key: d.name,
                                            value: d.count
                                        };
                                    });
                                }
                            }
                            chart.load(data);
                        }/*, true*/
                    );
                });


            }
        };
    });
