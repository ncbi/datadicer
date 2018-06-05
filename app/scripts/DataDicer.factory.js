'use strict';
/**
 * Created by hanl on 5/6/2016.
 *
 *this is the factory method to bootstrap a angular datadicer app
 **/
var DataDicer = (typeof DataDicer !== 'undefined') ? DataDicer : function () {
    return {
        version: '0.2.46',
        bootstrap: function (conf, div) {
            var dom = div ? document.getElementById(div) : document.body;
            var appName = div + 'App';
            angular.element(dom).append('<div class="app" ng-app=' + appName + '>' +
                '<div ng-controller=gridController>' +
                '<div class="row"><div searchbox query="query" filters="filters" on-search="performSearchDebounced()" on-start-over="startOver()"></div></div>' +
                '<advanced-options config="gridConfig" filters="filters" range-filters="rangeFilters" on-filter-change="performSearchDebounced()"></advanced-options>' +
                '<grid-table query=query config=gridConfig filters="filters" range-filters="rangeFilters"></grid-table>' +
                '</div></div>');
            angular.module(appName, ['ngramApp'])
                .controller('gridController', ['$scope', 'debounce', function ($scope, debounce) {
                    $scope.query = {
                        matching: conf.query
                    };
                    delete conf.query;
                    $scope.filters = $scope.filters || [];
                    $scope.rangeFilters = $scope.rangeFilters || {};
                    $scope.gridConfig = conf;
                    $scope.performSearchDebounced = debounce(function (event) {
                        $scope.$broadcast('gridtable.reload');
                    }, 600, false);
                    $scope.startOver = function (event) {
                        $scope.query.matching = '';
                        $scope.filters.resetAllFilters();
                        $scope.performSearchDebounced();
                    };
                }]);
        }
    };
};
