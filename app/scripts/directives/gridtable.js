'use strict';


/**
 * @ngdoc directive
 * @name ngramApp.directive:gridTable
 * @description
 * # gridTable
 */
angular.module('ngramApp')
    .directive('gridTable', function (ngramAppConfig, BackendDriver, $stateParams, $state, $compile, $timeout, $rootScope, $uibModal, trackEvent) {


            var fixFor508AfterGridComplete = function () {
                /**
                 * 508 compliance
                 * Empty table header for the row column header
                 What It Means
                 A <th> (table header) contains no text.
                 Why It Matters
                 The <th> element helps associate table cells with the correct row/column headers. A <th> that contains no text may result in cells with missing or incorrect header information.
                 */
                $('.ui-jqgrid-hdiv .ui-jqgrid-htable th').attr('scope', 'col');
                //$('.ui-jqgrid-hdiv .ui-jqgrid-htable th.jqgh_rn').replaceTagName('td');
                $('.ui-jqgrid-hdiv .ui-jqgrid-htable th.jqgh_rn .s-ico').attr('style', null).text('#');
                $('.ui-jqgrid-hdiv .ui-jqgrid-htable th.jqgh_subgrid .s-ico').attr('style', null).text('.');
                $('.ui-widget-content .ui-pg-selbox').attr('aria-label', 'Records per Page').attr('title', null);
                /**
                 * 508 compliance
                 * Redundant title text for row number column
                 */
                $('.ui-jqgrid-bdiv .ui-jqgrid-btable td.jqgrid-rownum').attr('title', null);
                /**
                 * 508 compliance
                 * add label to checkbox from multiple selection
                 *
                 */
                $('.ui-jqgrid-bdiv td[role=gridcell] input.cbox').attr('aria-label', 'select a record');
                $('.ui-jqgrid-hdiv .ui-jqgrid-htable th.jqgh_cbox input.cbox').attr('aria-label', 'select/deselect all records');
                $('.ui-jqgrid-hdiv .ui-jqgrid-htable th.jqgh_cbox .s-ico').text('#');

                /**
                 * 508 compliance, drop the vialoation for role=presentation
                 */
                $('.ui-jqgrid-hbox > table[role="presentation"]').attr('role', null);
                $('.dd-autosuggest-input > input').attr('aria-expanded', null);
            };
            /**
             * guid: get unique id
             * @returns {string}
             */
            var guid = function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
            };

            /**
             * GridConfiguration
             * this is the class for grid configuration that will take care of configuration transformation
             * @constructor
             */

            var GridConfiguration = function ($grid, $scope) {

                /**
                 * default grid configuration that override jqgrid config
                 * @type {{datatype: string, iconSet: string, prmNames: {nd: null}, gridComplete: GridConfiguration._gridDefaultOptions.gridComplete, pager: (string|*), shrinkToFit: boolean, forceFit: boolean, viewrecords: boolean, hoverrows: boolean, width: string, height: string, minHeight: number, rowNum: number, rowList: number[], headertitles: boolean, sortable: boolean}}
                 */
                this._gridDefaultOptions = function () {
                    return {
                        datatype: 'local', // seqrConfiguration.isLocal ? 'json' : 'jsonp',//together with &json.wrf=? will turn on jsonp
                        iconSet: 'fontAwesome',
                        prmNames: {nd: null},//enable caching by setting nd=null
                        gridComplete: function () {
                            fixFor508AfterGridComplete();
                            //scan for dynamically changed dom! it's not ideal in angular world, but it seems a nice hack to make the dynamic dom scanned this way as we use other widgets
                            $('.jqgrid-ng-scope').each(function () {
                                var content = $(this);
                                var scope = angular.element(content).scope();
                                $compile(content)(scope);
                            });

                            var $el = $(this).closest('grid-table');
                            $el.find(
                                '.ui-pg-button'
                            ).each(function(){
                                var $btn = $(this);
                                if (!$btn.attr('aria-label') && $btn.attr('title')) {
                                    $btn.attr('aria-label', $btn.attr('title'));
                                }

                                if ($btn.hasClass('ui-state-disabled')) {
                                    $btn.attr('aria-disabled', true);
                                }
                                else {
                                    $btn.removeAttr('aria-disabled');
                                }
                            });
                            $el.find('.ui-pg-input').attr('aria-label', 'Page number');

                        },
                        /**
                         * beforeSelectRow
                         * this is the callback control on which click the row will be selected with respect of custom beforeSelectRow event handler.
                         * If the handler return true, the row will be selected. If you return false the row will be not selected.
                         *  The second parameter of beforeSelectRow is event object, e.target is the DOM element which was clicked. You can get the cell (<td>) in which the click done with $(e.target).closest('td'). Then you can use $.jgrid.getCellIndex to get the index of the cell insido of the row. The index in the colModel should point to the 'cb' column which contain the checkboxes.
                         * @param rowid
                         * @param e
                         * @returns {boolean}
                         */
                        beforeSelectRow: function (rowid, e) {
                            var $myGrid = $(this),
                                i = $.jgrid.getCellIndex($(e.target).closest('td')[0]),
                                cm = $myGrid.jqGrid('getGridParam', 'colModel');
                            //only allow the selection happens when the column is `cb` --checkbox
                            return (cm[i].name === 'cb');
                        },
                        pager: $grid.pagerID,
                        shrinkToFit: true,
                        forceFit: true,//http://www.trirand.com/jqgridwiki/doku.php?id=wiki:options
                        viewrecords: true,
                        hoverrows: false, //disable the row highlighting
                        width: 'auto',
                        height: 'auto',
                        minHeight: 168,
                        rowNum: 10,
                        rowList: [10, 20, 30],
                        headertitles: false,
                        sortable: true,
                        cmTemplate: {title: false}, //fix accessibility warning
                        onSelectAll: function (rowids, status) {
                            var selectedRows = $(this).jqGrid('getGridParam', 'selarrrow');
                            $timeout(function () {
                                $scope.selarrrow = selectedRows;
                            });
                            $scope.$emit('gridtable.allRowsOnPageBeingSelected', selectedRows, rowids, status);
                        },
                        onSelectRow: function (rowid, status) {
                            var selectedRows = $(this).jqGrid('getGridParam', 'selarrrow');
                            $timeout(function () {
                                $scope.selarrrow = selectedRows;
                            });
                            $scope.$emit('gridtable.oneRowBeingSelected', selectedRows, rowid, status);
                        },
                        onSortCol: function (colname, colnum, direction) {
                            if (ngramAppConfig.trackingEnabled) {
                                var colDisplayName = $(this).jqGrid('getGridParam', 'colNames')[colnum] || 'NONE';
                                trackEvent(
                                    'Column Sort', colDisplayName,
                                    direction, {
                                        jsevent: 'dd_columnsort',
                                        columnname: colDisplayName,
                                        direction: direction
                                    });
                            }

                        },
                        onPaging: function (button, details) {
                            if (ngramAppConfig.trackingEnabled) {
                                trackEvent(
                                    'dd_pagination',
                                    button, details.currentPage || 'NONE',
                                    {
                                        'jsevent': 'dd_pagination',
                                        'button': button,
                                        'current_page': details.currentPage || '',
                                        'last_page': details.lastPage || ''
                                    });
                            }
                        },
                    };
                };


                /**
                 * default grid configuration that introduced by datadicer, not for native jqgrid config
                 * @returns {{hideLastPager: boolean, adjustGridWidthOnWindowsResize: boolean, adjustGridWidthOnColumnChange: boolean, adjustGridWidthOnInit: boolean, showHideColumns: boolean, groupHeaders: boolean}}
                 * @private
                 */
                this._gridDefaultOptions_ByDataDicer = function () {
                    return {
                        hideLastPager: true,
                        adjustGridWidthOnWindowsResize: true,
                        adjustGridWidthOnColumnChange: false,
                        adjustGridWidthOnInit: true,
                        showHideColumns: false,
                        groupHeaders: false
                        /*
                         * [ {
                         useColSpanStyle: true,
                         groupHeaders:[
                         {startColumnName: 'id', numberOfColumns: 1, titleText: '#'},
                         {startColumnName: 'date', numberOfColumns: 8, titleText: 'Nice'},
                         ]
                         }]
                         * */
                    };
                };

                /**
                 * gridOnlyRequiredWhenUsingOurOwnBackendFn
                 *
                 * @returns {{url: *, jsonReader: *, postData: *, beforeRequest: gridTable.beforeRequest, loadComplete: gridTable.loadComplete}}
                 */
                var gridOnlyRequiredWhenUsingOurOwnBackendFn = function () {
                    var _backendDriver = BackendDriver.getDriver($grid, $scope);
                    return {
                        url: _backendDriver.url,
                        jsonReader: _backendDriver.jsonReader,
                        postData: _backendDriver.postData,
                        //onPaging:$scope.multipleSelectListenerOnPaging,
                        beforeRequest: function () {
                            //console.info('beforeRequest', $grid.getPostData());
                            var postData = $grid.getPostData();
                            for (var param in postData) {
                                //only process those with _array type
                                if (postData.hasOwnProperty(param) && /_array$/.test(param) && angular.isFunction(postData[param])) {
                                    var fqParam = null;
                                    try {
                                        var filterArray = JSON.parse(postData[param]());
                                        fqParam = param.replace('_array', '');
                                        if (!angular.isArray(filterArray) || filterArray.length <= 0) {
                                            $grid.setPostData(fqParam, []);
                                        } else {
                                            $grid.setPostData(fqParam, filterArray);
                                            //$grid.setPostData(param, '');
                                        }
                                    } catch (e) {
                                        $grid.setPostData(fqParam, []);
                                    } finally {
                                        return true;
                                    }
                                }
                            }
                            //$grid.setPostData('tfp', $grid.getPostData('fqs'));
                            //console.info('beforeRequest', $grid.getPostData());
                        },
                        loadComplete: function (data) {

                            /**
                             * 508 fixes goes here if it has to be fixed from JS
                             */
                            fixFor508AfterGridComplete();


                            /**
                             * customized user data
                             */

                            $scope.userData = $grid.jqGrid('getGridParam', 'userData');

                            /**
                             * subGridExpanded
                             *   only if the subgrid is allowed to expanded by default
                             */
                            if ($grid.configurations.subGridExpanded) {
                                var rowIds = $grid.getDataIDs();
                                $.each(rowIds, function (index, rowId) {
                                    $grid.expandSubGridRow(rowId);
                                });
                            }

                            /**
                             * facet data update from backend
                             */
                            _backendDriver.updateFacets(data);

                            /**
                             * error reporting section
                             * @type {boolean}
                             */

                            var gridtable_show_error_message = false;
                            var grid_search_backend_error = {
                                status: $scope.userData && $scope.userData.msg && !$scope.userData.msg.success,
                                msg: $grid.configurations.no_hits_message || 'No hits found. Would you like to refine your query?'
                            };
                            var totalNumberOfRecords = $grid.jqGrid('getGridParam', 'records');
                            var datatype = $grid.jqGrid('getGridParam', 'datatype');
                            if (/local/.test(datatype)) {//do not show error message for the grid initialization( when datatype===local )
                                gridtable_show_error_message = false;
                            } else if (totalNumberOfRecords <= 0) {
                                gridtable_show_error_message = true;
                            }

                            /**
                             * let's do the UI update according to the error status
                             * also, re-select rows after grid was reloaded and all selected rows are on page
                             * (this is specified through routeParams that are passed to server to
                             * sort rows the way selected once are on top, but we still need to update their look -
                             * checkbox & color)
                             */
                            $timeout(function () {//this will go to another digest loop!
                                $scope.gridtable_show_error_message = gridtable_show_error_message;
                                $scope.totalNumberOfRecords = totalNumberOfRecords;
                                $scope.grid_search_backend_error = grid_search_backend_error;
                                if (gridtable_show_error_message || totalNumberOfRecords <= 0) {
                                    return true;
                                }
                                if ($grid.configurations.adjustGridWidthOnWindowsResize) {
                                    $grid.adjustGridWidth();
                                }
                                if ($grid.configurations.hideLastPager) {
                                    $('#last_pager' + $scope.uniqueId).addClass('ui-state-disabled').hide();
                                    $('#last_t_grid' + $scope.uniqueId + '_toppager').addClass('ui-state-disabled').hide();
                                }
                                $scope.$emit('gridtable.ensureRowsSelected', $scope.selarrrow);
                            });
                            /*
                             done the grid rendering
                             */
                        }
                    };
                };
                /**
                 * this transformation function will determine if the "data" is local
                 * @returns {GridConfiguration}
                 */
                this._applyTransformation4LocalData = function () {
                    var me = this;
                    if (!me.data) {
                        angular.extend(me, gridOnlyRequiredWhenUsingOurOwnBackendFn());
                    } else if (angular.isDefined(me.data) && angular.isString(me.data)) {
                        try {
                            me.data = JSON.parse(me.data);
                        } catch (e) {
                            me.data = [];
                        }
                    }
                    return me;
                };

                /**
                 * this is to update the configuration using the new structure with backward compatibility
                 * @returns {GridConfiguration}
                 * @private
                 */
                this._portDisplayOptions = function () {
                    if (this.displayOptions) {
                        var displayOptions = {};
                        angular.copy(this.displayOptions, displayOptions);
                        delete this.displayOptions;
                        angular.extend(this, displayOptions);
                    }
                    if (this.fields && angular.isArray(this.fields)) {
                        this.colModel = this.fields.slice(0);
                        delete this.fields;
                    }
                    return this;

                };

                /**
                 * if subGridRowExpandedConfigCallback is defined, and subGridRowExpanded not defined, then generate a new subGridRowExpanded
                 * otherwise, ignore subGridRowExpandedConfigCallback
                 * @private
                 */
                this._suportSubGridRowExpandedCallback = function () {
                    var me = this;
                    if (me.subGridRowExpanded) {
                        return me;
                    } else if (me.subGridRowExpandedConfigCallback && angular.isFunction(me.subGridRowExpandedConfigCallback)) {
                        me.subGridRowExpanded = function (subgridId, rowId) {
                            var rowData = $grid.jqGrid('getRowData', rowId);
                            var _subgridId = (subgridId.split('.').join('\\.'));//required in order to get the id that jquery can access
                            var content = $('#' + _subgridId);
                            content.html('<div><span ng-click="open()" class="accessible-subgrid-title" ng-class="{visuallyhidden:config.accessibleTitleScreenReaderOnly}" >{{config.accessibleTitle | unsafe}}</span></div>' +
                                '<div class="subgridtablediv" aria-hidden="true" role="presentation">' +
                                '<h5>{{config.title}}</h5> ' +
                                '<grid-table query=query filters=filters config=config></grid-table>' +
                                '</div>');
                            var scope = $rootScope.$new();
                            scope.config = me.subGridRowExpandedConfigCallback ? me.subGridRowExpandedConfigCallback(_subgridId, rowId, rowData) : null;
                            scope.query = me.subGridRowExpandedQueryCallback ? me.subGridRowExpandedQueryCallback(_subgridId, rowId, rowData) : null;
                            scope.open = function () {
                                var modalInstance = $uibModal.open({
                                    animation: true,
                                    ariaLabelledBy: 'modal-title',
                                    ariaDescribedBy: 'modal-body',
                                    templateUrl: 'ddviews/subgrid-modal.html',
                                    controller: function ($scope, $uibModalInstance) {
                                        $scope.config = scope.config;
                                        $scope.filters = scope.filters;
                                        $scope.query = scope.query;
                                        $scope.ok = function () {
                                            $uibModalInstance.close();
                                        };
                                    },
                                    size: 'large'
                                });
                                modalInstance.result.then(function () {
                                }, function () {
                                });
                            };
                            $compile(content)(scope);
                            //scope.$apply();
                        };
                    }
                    return me;
                };
                /**
                 * apply all transformations
                 * @returns {GridConfiguration}
                 */
                this._applyTransformations = function () {
                    angular.extend(this, this._gridDefaultOptions(), this._gridDefaultOptions_ByDataDicer(), $scope.config);
                    return this._portDisplayOptions()
                        ._suportSubGridRowExpandedCallback()
                        ._applyTransformation4LocalData();
                };

                this._applyTransformations();
            };

            /** Link, this will run after controller. the exec order will be controller, prelink, postlink
             *   we can expose the events from link function here
             * @param scope: The scope of the directive
             * @param elem: Dom element where the directive is applied
             * @param attr: Collection of attributes of the Dom Element
             * @param ctrl: Array of controllers required by the directive
             */
            var link = function (scope, elem, attr, ctrl) {

                /**
                 * make sure to use unique id for jqtable binding !
                 */
                scope.uniqueId = guid();
                /**
                 * Reload the grid on event 'gridtable.reload'
                 */
                scope.$on('gridtable.reload', function (e, data) {
                    scope.gridtable_show_error_message = false;
                    scope.totalNumberOfRecords = 1;
                    scope.grid_search_backend_error = false;
                    $timeout(function () {
                        if (scope.reloadGrid) {
                            scope.reloadGrid(data);
                        }
                    });
                });

                /**
                 * expand all subgrids
                 *   usage: $scope.$broadcast('gridtable.expandSubgrid');
                 */
                scope.$on('gridtable.expandSubgrid', function (e, data) {
                    var rowIds = scope.gridObject.getDataIDs();
                    $.each(rowIds, function (index, rowId) {
                        scope.gridObject.expandSubGridRow(rowId);
                    });
                });

                /**
                 * collapse all subgrids
                 *   usage: $scope.$broadcast('gridtable.collapseSubgrid');
                 */
                scope.$on('gridtable.collapseSubgrid', function (e, data) {
                    var rowIds = scope.gridObject.getDataIDs();
                    $.each(rowIds, function (index, rowId) {
                        scope.gridObject.collapseSubGridRow(rowId);
                    });
                });

                /**
                 * deselect all
                 */
                scope.$on('gridtable.resetAllSelection', function (e) {
                    scope.gridObject.resetAllSelection();
                    $timeout(function () {
                        scope.selarrrow = [];
                    });
                });
                /**
                 * gridtable.selectRow
                 */
                scope.$on('gridtable.selectRow', function (e, data) {
                    try {
                        // console.log('Grid selecting rows');
                        data.forEach(function (d) {
                            scope.gridObject.setSelection(d, false);
                            if (scope.selarrrow.indexOf(d) <= -1) {
                                scope.selarrrow.push(d);
                            }
                        });
                    } catch (e) {
                        console.warn(e);
                    }
                });

                scope.$on('gridtable.ensureRowsSelected', function (e, data) {
                    try {

                        data.forEach(function (d) {
                            // check whether row is already selected
                            // don't so selection again, b/c it's actually toggles selection
                            var row = $('[id="' + d + '"]');
                            if (!row.hasClass('ui-state-highlight')) {
                                scope.gridObject.setSelection(d, false);
                                if (scope.selarrrow.indexOf(d) <= -1) {
                                    scope.selarrrow.push(d);
                                }
                            }
                        });
                    } catch (e) {
                        console.warn(e);
                    }
                });

                /**
                 * reset the grid on 'gridtable.reset'
                 */
                scope.$on('gridtable.reset', function () {
                    scope.gridtable_show_error_message = false;
                    scope.totalNumberOfRecords = 0;
                    scope.grid_search_backend_error = false;
                });

                /**
                 * 508: PD-1498: handle spacebar on pagination "buttons"
                 *
                 */
                $(elem).on(
                    'keypress',
                    '.ui-jqgrid .ui-pager-control *[role="button"]',
                    function(e) {
                        if (e.key === ' ') {
                            $(this).click();
                            e.preventDefault();
                        }
                    });
            };


            /**
             * this is the grid controller
             * @param $scope
             * @param $compile
             * @param $timeout
             */
            var controller = function ($scope, $compile, $timeout) {

                /**
                 * grid configuration
                 * @type {{colNames: null, colModel: null, facetFields: null, collection: string, schema: string}}
                 */
                $scope.config = $scope.config || {
                    autoLoad: false,
                    colModel: null,
                    facetFields: null
                };

                /**
                 * Query
                 * @type {{matching: string}}
                 */
                $scope.query = $scope.query || {matching: ''};

                /**
                 * filters
                 */
                $scope.filters = $scope.filters || {};
                $scope.rangeFilters = $scope.rangeFilters || {};


                /**
                 * Listener in jqgrid for selected rows
                 * @param rowIdOrRowIds
                 * @param status
                 * @returns {boolean}
                 */

                // $scope.multipleSelectListenerOnPaging = function () {
                //     var myGrid = $(this);
                //     //var data = myGrid.jqGrid('getRowData', rowid);
                //     console.info(myGrid.getGridParam('selarrrow'), $scope.selarrrow);
                //     myGrid.getGridParam('selarrrow').forEach(function (d) {
                //         if ($scope.selarrrow.indexOf(d) < 0) {
                //             try {
                //                 myGrid.jqGrid("resetSelection", d);
                //             } catch (e) {
                //             }
                //
                //         }
                //     });
                //
                //     return true;
                // };

                /**
                 * renderGrid
                 * @private
                 */
                $scope.renderGrid = function () {
                    var $scope = $scope || this;
                    /**
                     *  extend grid start
                     * @type {*|jQuery|HTMLElement}
                     */
                    var $grid = $('#grid' + $scope.uniqueId);
                    $grid.pagerID = '#pager' + $scope.uniqueId;


                    $grid.getPostData = function (name) {
                        var postData = $grid.jqGrid('getGridParam', 'postData');
                        if (!name) {
                            return postData;
                        } else {
                            return postData[name];
                        }
                    };
                    $grid.setPostData = function (name, value) {
                        if (!name) {
                            return;
                        }
                        var postData = $grid.getPostData();
                        postData[name] = value;
                        $grid.jqGrid('setGridParam', {postData: postData});
                    };
                    $grid.adjustGridWidth = function () {
                        var newWidth = $grid.closest('.ui-jqgrid').parent().width();
                        $grid.jqGrid('setGridWidth', newWidth, true);
                    };

                    $grid.handleColumnHeaderToolTips = function (colModel, groupHeaders) {
                        colModel = colModel ? colModel.slice(0) : [];
                        groupHeaders = groupHeaders ? groupHeaders.slice(0) : [];

                        var _addTip = function (element, tip) {
                            element.attr('uib-tooltip-html', '\'' + tip + '\'');
                            element.attr('tooltip-append-to-body', true);
                            //element.attr('tooltip-placement', position);
                            $compile(element)(angular.element(element).scope());
                        };
                        var _findObjInGroupHeaders = function (txt) {
                            var i = 0, obj = {},
                                _txtFilter = function () {
                                    return function (k) {
                                        return k.titleText && k.titleText === txt;
                                    };
                                };
                            if (groupHeaders && angular.isArray(groupHeaders)) {
                                for (i = 0; i < groupHeaders.length; i++) {

                                    if (groupHeaders[i].groupHeaders && angular.isArray(groupHeaders[i].groupHeaders)) {
                                        obj = groupHeaders[i].groupHeaders.filter(_txtFilter());
                                        if (obj && obj.length > 0) {
                                            return obj[0];
                                        }
                                    }
                                }
                            }
                            return obj;
                        };

                        if ($grid && $grid[0] && $grid[0].hasOwnProperty('grid')) {
                            var thd = jQuery('thead:first', $grid[0].grid.hDiv)[0];
                            $('tr.ui-jqgrid-labels th div', thd).each(function () {
                                var txt = $(this).text();
                                var obj = colModel.filter(function (d) {
                                    return d.label === txt;
                                });
                                if (obj && angular.isArray(obj) && obj.length > 0) {
                                    _addTip($(this), obj[0].tips || obj[0].name);
                                }
                            });
                            $('tr.ui-jqgrid-labels th:not(:has(div))', thd).each(function () {
                                var txt = $(this).text();
                                var obj = _findObjInGroupHeaders(txt);
                                _addTip($(this), obj.tips || obj.titleText);
                            });
                        }
                    };
                    $grid.getDisplayColumns = function () {
                        var mymodel = $grid.getGridParam('colModel'); // this get the colModel array
                        // loop the array and get the non hidden columns
                        var cols = [];
                        $.each(mymodel, function (i) {
                            if (this.hidden !== true && (this.name !== 'rn' && this.name !== 'cb')) {
                                cols.push(this.name);
                            }
                        });
                        return cols;
                    };
                    $grid.getAllColumns = function () {
                        var mymodel = $grid.getGridParam('colModel'); // this get the colModel array
                        // loop the array and get the non hidden columns
                        var cols = [];
                        $.each(mymodel, function (i) {
                            if (this.name !== 'rn' && this.name !== 'cb') {
                                cols.push(this.name);
                            }
                        });
                        return cols;
                    };


                    /**
                     more at http://www.trirand.com/jqgridwiki/doku.php?id=wiki:options
                     */




                    //we can extend the configuration of the following from $scope.config
                    //prmNames: {page: "page", rows: "rows"}, //no need to specify as those should be updated from postData
                    //toolbar: [true, 'top'],
                    //caption: '<i class="fa fa-table"></i>',
                    //subGrid: _customizedGridOptions.subGrid,
                    //subGridOptions: _customizedGridOptions.subGridOptions,
                    //subGridRowExpanded: _customizedGridOptions.subGridRowExpanded,

                    //colModel: _customizedGridOptions.colModel,
                    //hoverrows: false,//disable the row highlighting
                    //rownumbers: true,
                    //rownumWidth: 25,
                    // multiselect: true,
                    //sortname: 'id',
                    //sortorder: "desc",
                    //colNames: $scope.config.colNames ? $scope.config.colNames : ['ID', 'Assay Name', 'Compound Name', 'Activity'],
                    //colModel: $scope.config.colModel ? $scope.config.colModel : [{name: 'id'}, {name: 'aidname'}, {name: 'cmpdname'}, {name: 'actvty'}]


                    //configuration that hold all actual config
                    $grid.configurations = new GridConfiguration($grid, $scope);


                    /**
                     * selected rows, if it was predefined in selarrrow, then use it.
                     *
                     * Please turn on  multiselect: true, and multiPageSelection: true, and watch for $scope.selected
                     */

                    $scope.selarrrow = $grid.configurations.selarrrow && angular.isArray($grid.configurations.selarrrow) ? $grid.configurations.selarrrow.slice(0) : [];

                    $grid.GridUnload();
                    $grid.jqGrid($grid.configurations);
                    $grid.jqGrid('navGrid', $grid.pagerID, angular.extend({
                        edit: false,
                        add: false,
                        del: false,
                        search: false,
                        cloneToTop: true
                    }, $grid.configurations.pagerConfig));
                    if ($grid.configurations.showHideColumns) {
                        $grid.jqGrid('showHideColumnMenu', {
                            adjustGridWidth: $grid.configurations.adjustGridWidthOnColumnChange
                        });
                        $grid.jqGrid('navButtonAdd', {
                            caption: 'Choose Columns',
                            buttonicon: 'ui-icon ui-icon-newwin',
                            onClickButton: function (button) {
                                $grid.jqGrid('columnChooser', {
                                    width: 600,
                                    dialog_opts: {
                                        modal: true,
                                        minWidth: 400,
                                        minHeight: 400,
                                        show: 'blind',
                                        hide: 'blind',
                                        position: {my: 'center top', at: 'center top'}
                                    },
                                    done: function (perm) {
                                        if (!$grid.configurations.adjustGridWidthOnColumnChange) {
                                            $grid.handleColumnHeaderToolTips($grid.configurations.colModel, $grid.configurations.groupHeaders);
                                            $grid.trigger('resize');
                                            //the following is a hack to get the resize working when there was no columns visible
                                            var displayableColmns = $grid.getDisplayColumns();
                                            if (displayableColmns && displayableColmns.length <= 0) {
                                                $grid.trigger('reloadGrid');
                                            }
                                            //end of the hack
                                        }

                                        if (perm) {
                                            $grid.jqGrid('remapColumns', perm, true);
                                            $scope.$emit('gridtable.columnUpdated', $grid);
                                            //saveColumnState.call(this);
                                        }
                                    }
                                });

                            },
                            title: 'Columns',
                            cursor: 'pointer'
                        });
                    }
                    if ($grid.configurations.adjustGridWidthOnInit) {
                        $grid.adjustGridWidth();
                    }


                    //this does the trick to set the min-height to 168px
                    $grid.parents('div.ui-jqgrid-bdiv').css('min-height', $grid.configurations.minHeight || '168px');

                    //resizeable grid
                    // $grid.jqGrid('gridResize', {minWidth: 500, maxWidth: 1200, minHeight: 100, maxHeight: 800});
                    //load gird
                    // $grid.jqGrid('setGridParam', {datatype: 'jsonp'}).trigger('reloadGrid');
                    //attach the resize event to window's
                    if ($grid.configurations.adjustGridWidthOnWindowsResize) {
                        $(window).on('resize', function () {
                            $grid.adjustGridWidth();
                        });
                    }

                    if ($grid.configurations.groupHeaders && angular.isArray($grid.configurations.groupHeaders)) {
                        $grid.configurations.groupHeaders.forEach(function (d) {
                            $grid.jqGrid('setGroupHeaders', d);
                        });
                    }
                    $grid.handleColumnHeaderToolTips($grid.configurations.colModel, $grid.configurations.groupHeaders);

                    $scope.reloadGrid = function (params) {
                        //$grid.showCol('id');
                        //$grid.hideCol('id');
                        if (!$scope.config.data) {
                            $grid.jqGrid('setGridParam', angular.extend({
                                search: false,
                                datatype: ($scope.config.mtype && /^POST/i.test($scope.config.mtype)) ? 'json' : 'jsonp'
                                //,sortname: null
                            }, params)).trigger('reloadGrid', [{page: 1, current: true}]);
                        }
                    };

                    return $grid;
                };


                $timeout(function () {
                    $scope.gridObject = $scope.renderGrid();
                    /**
                     *  Now the grid is ready, let's either load the data or inform the grid is ready
                     *
                     */
                    if ($scope.gridObject.configurations.autoLoad) {
                        $scope.reloadGrid();
                    } else {
                        $scope.$emit('gridtable.initialized');
                    }

                });

                $scope.$watch(function () {
                    var myConfig = angular.copy($scope.config);
                    delete myConfig.advOpts;
                    return myConfig;
                }, function (newValue) {
                    $scope.renderGrid();
                    $scope.reloadGrid();
                }, true);


            };
            return {
                templateUrl: 'ddviews/gridTable.html',
                transclude: true,
                restrict: 'E',
                scope: {
                    query: '=?',
                    config: '=?',
                    filters: '=?',
                    rangeFilters: '=?',
                    selarrrow: '=?',
                    gridObject: '=?'
                },
                link: link,
                controller: controller
            };
        }
    )
;
