'use strict';

/**
 * @ngdoc function
 * @name ngramApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ngramApp
 */
angular.module('ngramApp')
    .controller('MainCtrl', function (debounce, ngramAppConfig, $scope, $compile, $stateParams, $http, $state, $timeout) {


        /*******************************
         * CONFIGURATION SECTION START *
         *******************************/

        /**
         * gridConfig
         * @type {{collection: string, schema: string, facetFields: string, filtersFields: *[], rangeFacetFields: {mw: {field: string, name: string, unit: string, xmin: number, xmax: number, xtickscale: number, width: number, height: number}, acvalue: {field: string, name: string, unit: string, xmin: number, xmax: number, xtickscale: number, width: number, height: number}}, colNames: string[], colModel: *[]}}
         */
        $scope.gridConfig = {
            collection: 'bioactivity',
            schema: 'bioactivity',

            facetFields: [
                {displayname: 'Assay Type', name: 'aidtype', allowZeros: true},
                {displayname: 'Activity', name: 'actvty', allowZeros: true}
            ],
            stringFilterFields: [
                {
                    name: 'cmpdname',
                    label: 'Compound Name',
                    placeholder: ' filter by Compound Name ',
                    minimum: 2,
                    suggestions: function (val) {
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
                    }
                },
                {
                    name: 'aidname',
                    label: 'Assay Name',
                    placeholder: ' filter by Assay Name ',
                    minimum: 2,
                    suggestions: ['assay name 1', 'assay name 2', 'assay name 3']
                },
                {
                    name: 'aidname',
                    label: 'Assay Name 2',
                    placeholder: ' filter by Assay Name ',
                    minimum: 2,
                    suggestions: ['assay name 4', 'assay name 5', 'assay name 6']
                },
                {
                    name: 'cmpdname',
                    label: 'Compound Name',
                    placeholder: ' filter by Compound Name ',
                    minimum: 2,
                    suggestions: 'cmpdname'
                }
            ],
            rangeFacetFields: {
                mw: {
                    field: 'mw',
                    name: 'Molecular Weight',
                    unit: 'Molecular Weight, Daltons ',
                    xmin: 1,
                    xmax: 20,
                    xtickscale: 100,
                    width: window.innerWidth * 0.5 > 500 ? 500 : window.innerWidth * 0.5,
                    height: 100
                },
                acvalue: {
                    field: 'acvalue',
                    name: 'Activity Value ',
                    unit: 'Activity Value, μM',
                    xmin: 1,
                    xmax: 20,
                    xtickscale: 5,
                    width: window.innerWidth * 0.5 > 500 ? 500 : window.innerWidth * 0.5,
                    height: 100
                }
            },
            colModel: [
                {
                    name: 'aid',
                    label: 'AID',
                    tips: ' if you would like to configure a tip for this header, please set \"tips\" property\"',
                    width: 60,
                    align: 'right',
                    sortable: false
                },
                {
                    name: 'aidtype',
                    label: 'Assay Type',
                    tips: ' if you would like to configure a tip for this header, please set \"tips\" property\"',
                    sortable: false,
                    align: 'right',
                    search: false
                },
                {
                    name: 'cmpdname',
                    label: 'Compound Name',
                    tips: ' if you would like to configure a tip for this header, please set \"tips\" property\"',
                    sortable: false,
                    search: false,
                    align: 'right',
                    //searchoptions: {sopt: ['cn', 'nc']},
                    formatter: function (cellvalue, options, rowObject) {
                        if (rowObject && rowObject.cid) {
                            return '<a  analytics-label="link_label" class="jqgrid-ng-scope"  target="_blank" title="Link"' +
                                'ng-href="//url/' + rowObject.cid + '">' + cellvalue + '</a>';
                        }
                        return cellvalue;
                    }
                },
                {
                    name: 'actvty',
                    label: 'Activity',
                    tips: 'Activity',
                    width: 50,
                    search: false,
                    align: 'right',
                    sortable: true
                }],

            hideLastPager: true,
            adjustGridWidthOnWindowsResize: true,
            adjustGridWidthOnColumnChange: false,
            showHideColumns: true,
            headertitles: false
        };
        /**
         *  SolrBackEndConfigurations, no need for ngram backend
         *  this is the configuration for backend. It's recommended to configure this at solr backend where the /select was defined.
         *  but it's okay to override backend values from here for quick prototyping!
         * @type {{facet: string, [facet.field]: string[], [facet.limit]: number, [facet.range]: string[], [f.mw.facet.scale]: number, [f.mw.facet.range.start]: number, [f.mw.facet.range.end]: number, [f.mw.facet.range.gap]: number, [f.mw.facet.mincount]: number, [f.acvalue.facet.range.start]: number, [f.acvalue.facet.range.end]: number, [f.acvalue.facet.range.gap]: number, [f.acvalue.facet.mincount]: number}}
         */
        if (ngramAppConfig.serviceEngine === 'solr') {
            $scope.gridConfig.rangeFacetFields = [
                {
                    field: 'mw',
                    name: 'Molecular Weight',
                    unit: 'Molecular Weight, Daltons ',
                    xmin: 1,
                    xmax: 200,
                    xtickscale: 10,
                    width: window.innerWidth * 0.5 > 500 ? 500 : window.innerWidth * 0.5,
                    height: 100
                },
                {
                    field: 'acvalue',
                    name: 'Activity Value ',
                    unit: 'Activity Value, μM',
                    xmin: 1,
                    xmax: 100,
                    xtickscale: 1,
                    width: window.innerWidth * 0.5 > 500 ? 500 : window.innerWidth * 0.5,
                    height: 100
                },
                {
                    field: 'aidmdate',
                    name: 'Modified Date',
                    unit: 'Modified Date',
                    xmin: new Date(1996, 1, 1),
                    xmax: new Date(),
                    xUnits: (typeof d3 !== 'undefined') ? d3.time.months : null,
                    timeParser: (typeof d3 !== 'undefined') ? d3.time.format('%Y-%m-%dT%H:%M:%SZ').parse : null,
                    width: window.innerWidth * 0.5 > 500 ? 500 : window.innerWidth * 0.5,
                    height: 100
                }
            ];
            $scope.gridConfig.SolrBackEndConfigurations = {
                'facet': 'on',
                'facet.field': ['aidtype', 'actvty'],
                'facet.limit': 10,
                'facet.range': ['{!ex=mw}mw', '{!ex=acvalue}acvalue', '{!ex=aidmdate}aidmdate',],
                'f.mw.facet.scale': 1000,
                'f.mw.facet.range.start': 0,
                'f.mw.facet.range.end': 2000000,
                'f.mw.facet.range.gap': 10000,
                'f.mw.facet.mincount': 0,
                'f.aidmdate.facet.range.start': 'NOW/YEAR-20YEARS',
                'f.aidmdate.facet.range.end': 'NOW',
                'f.aidmdate.facet.range.gap': '+1MONTHS',
                'f.acvalue.facet.range.start': 0,
                'f.acvalue.facet.range.end': 200,
                'f.acvalue.facet.range.gap': 1,
                'f.acvalue.facet.mincount': 0
            };
        }

        /**********************
         * INIT SECTION START *
         **********************/

        /**
         * The following parameters are two way binding parameters used by master controller and  children controllers
         * */
        $scope.query = {matching: ''};
        /**
         * sample filters
         *
         [{name: 'refseq', count: '0',selected:true},
         {name: 'reference', count: '0',selected:false},
         {name: 'has_pdb', count: '0',selected:true}]

         * @type {Array}
         */
        $scope.filters = $scope.filters || {};
        /**
         * rangeFilters
         * @type {{}}
         * samples: {"acvalue": [10, 35], "mw": []};
         */
        $scope.rangeFilters = $scope.rangeFilters || {};


        /*******************************
         * ROUTING SECTION START *
         *******************************/
        if ($state.is('/')) {
            $scope.query.matching = $stateParams.matching;
            /**
             * add additional visible filters that will be shown on the UI
             */
            //if ($stateParams.report === 'gene') {
            //  $scope.filters = {tag: [{name: 'Gene Representative', selected: true}]};
            //} else if ($stateParams.report === 'target') {
            //  $scope.filters = {tag: []};
            //} else {
            //  $scope.filters = {tag: [{name: 'Annotated', selected: true}]};
            //}

        } else if ($stateParams.term) {
            //when this page routed by searching term, update the matching parameter
            $scope.query.matching = $stateParams.term;
        }


        $scope.startNewSearch = function () {
            $state.go('/', {report: $stateParams.report});
        };


        $scope.performSearch = function (event) {
            //default view when search nothing
            if ($scope.query.matching === '') {
                $state.transitionTo('/', {report: $stateParams.report}, {location: true, replace: true, notify: false});
                $scope.$broadcast('gridtable.reload', {matching: ''});
                return false;
            }
            //change the route, so to keep a state for each search
            if ($state.is('/')) {
                //important, only do the transition when the matching is changed in stateParams, or it's not yet set
                if (!$stateParams.matching || $stateParams.matching !== $scope.query.matching) {
                    $state.transitionTo('view.table', { //was /search
                        term: $scope.query.matching,
                        report: $stateParams.report
                    }, {location: true, replace: true, notify: true}); //was notify: false
                }
            } else if ($state.is('view') || $state.is('view.table')) {
                $state.go('view.table', {term: $scope.query.matching, report: $stateParams.report});
            }
            $timeout(function () {
                //lets reload the grid. Note the variable has been already passed on using two-way-binding
                $scope.$broadcast('gridtable.reload');
                //or reload other widgets
                $scope.$broadcast('cddinfo.reload');

            });
        };

        $scope.performSearchDebounced = debounce($scope.performSearch, 600, false);

        $scope.startOver = function (event) {
            $scope.query.matching = '';
            $scope.filters.resetAllFilters();
            $state.go('/', {report: $stateParams.report});
        };
        //this will do the initial load once the gridtable is ready,
        $scope.$on('gridtable.initialized', function (e, data) {
            $scope.performSearch(e);
        });


        $scope.$on('gridtable.columnUpdated', function (e, data) {
            console.info(e, data);
        });
    });
