'use strict';

/**
 * @ngdoc service
 * @name ngramApp.BackendDriver
 * @description
 * # BackendDriver
 * Service in the ngramApp.
 */
angular.module('ngramApp')
    .service('BackendDriver', function (ngramAppConfig, $http) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        /**
         * _sortByName
         * @param a
         * @param b
         * @returns {number}
         * @private
         */
        function _sortByName(a, b) {
            var aName = a.name && angular.isString(a.name) ? a.name.toLowerCase() : a.name;
            var bName = b.name && angular.isString(b.name) ? b.name.toLowerCase() : b.name;
            return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
        }

        /**
         * _serializeQueryString
         * @param obj
         * @returns {string}
         * @private
         */
            // var _serializeQueryString = function (obj) {
            //     var str = [];
            //     for (var p in obj) {
            //         if (obj.hasOwnProperty(p)) {
            //             str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
            //         }
            //     }
            //     return str.join('&');
            // };

        var me = this;
        me.backendDriver = undefined;
        me.serviceEngine = ngramAppConfig.serviceEngine;
        me.serviceUidFieldName = ngramAppConfig.serviceUidFieldName || 'id';
        me.serviceQueryUrl = ngramAppConfig.serviceQueryUrl;
        me.serviceDownloadCallback = ngramAppConfig.serviceDownloadCallback;

        me.getDriver = function ($grid, $scope) {
            me.serviceEngine = $scope.config.serviceEngine || me.serviceEngine;
            me.serviceUidFieldName = $scope.config.serviceUidFieldName || me.serviceUidFieldName;
            me.serviceQueryUrl = $scope.config.serviceQueryUrl || me.serviceQueryUrl;
            me.serviceDownloadCallback = $scope.config.serviceDownloadCallback || me.serviceDownloadCallback;
            if (me.serviceEngine === 'ngram') {
                me.backendDriver = me.ngram($grid, $scope);
            } else if (me.serviceEngine === 'solr') {
                me.backendDriver = me.solr($grid, $scope);
            } else if (me.serviceEngine === 'seqr') {
                me.backendDriver = me.solr($grid, $scope, true/*isSeqr*/);
            } else {
                console.warn('invalid/unsupported backend ENGINE : ' + me.serviceEngine);
            }
            return me.backendDriver;
        };

        me.solr = function ($grid, $scope, isSeqr) {
            if (jQuery && jQuery.ajaxSettings) {
                jQuery.ajaxSettings.traditional = true;
            }

            /**
             * This will be only used internally
             *  hold extra solr facet information, such as the scale parameter, where this can be configured from "f.mw.facet.scale": 1000,
             * @type {{}}
             */
            $scope._solrFacetsInfo = $scope._solrFacetsInfo || {};//{"mw": {"facetGap": 1000}};

            /**
             * this will update tags based on solr responses directly
             * @param data
             *    {refseq:12,reference:122}
             * @param field
             * @returns {boolean}
             * @private
             */
            var _updateOneFacet = function (data, field) {
                if (!field) {
                    console.error('field name is required for facets updating!');
                    return false;
                }
                var facetsHash = {}, i, facetGap = null;
                var solrResponseFacets = (data && data.facet_counts && data.facet_counts.facet_fields && data.facet_counts.facet_fields[field] ) ?
                    data.facet_counts.facet_fields[field] : [];
                if (solrResponseFacets.length < 1) {
                    solrResponseFacets = (data && data.facet_counts && data.facet_counts.facet_ranges && data.facet_counts.facet_ranges[field] && data.facet_counts.facet_ranges[field].counts) ?
                        data.facet_counts.facet_ranges[field].counts : [];
                    facetGap = (data && data.facet_counts && data.facet_counts.facet_ranges && data.facet_counts.facet_ranges[field] && data.facet_counts.facet_ranges[field].gap) ? data.facet_counts.facet_ranges[field].gap : null;
                }

                var facetScale = (data && data.responseHeader && data.responseHeader.params && data.responseHeader.params['f.' + field + '.facet.scale']) ?
                    data.responseHeader.params['f.' + field + '.facet.scale'] : null;

                if ($scope && facetGap && facetScale) {
                    $scope._solrFacetsInfo[field] = $scope._solrFacetsInfo[field] || {};
                    $scope._solrFacetsInfo[field].facetGap = facetGap;
                    $scope._solrFacetsInfo[field].facetScale = facetScale;
                } else {
                    delete $scope._solrFacetsInfo[field];
                }
                for (i = 0; i < solrResponseFacets.length; i += 2) {
                    if (facetGap && facetScale) {
                        solrResponseFacets[i] = Math.floor(parseFloat(solrResponseFacets[i])) / facetScale;
                    }
                    facetsHash[solrResponseFacets[i]] = solrResponseFacets[i + 1];

                }

                //get a clone of existing facet for this field, into newFacetArray
                var newFacetArray = $scope.filters[field] && angular.isArray($scope.filters[field]) ? $scope.filters[field].slice(0) : [];

                for (i = 0; i < newFacetArray.length; i++) {
                    newFacetArray[i].count = facetsHash[newFacetArray[i].name] || 0;
                    delete facetsHash[newFacetArray[i].name];
                }
                for (i in  facetsHash) {
                    if (facetsHash.hasOwnProperty(i)) {
                        newFacetArray.push({name: i, count: facetsHash[i]});
                    }
                }
                if (!facetGap) {//only sort if not range facet
                    newFacetArray.sort(_sortByName);
                }
                $scope.filters[field] = newFacetArray;
            };

            /**
             * this will update facets based on ngram responses directly
             *
             * @param data https://gist.github.com/lianyi/16790a3e5b8676dc52a1c87923153ef4
             * @private
             */
            var _updateFacetsBySolr = function (data) {
                if (data && data.facet_counts && data.facet_counts.facet_fields) {
                    var facetField;
                    for (facetField in  data.facet_counts.facet_fields) {
                        if (data.facet_counts.facet_fields.hasOwnProperty(facetField)) {
                            _updateOneFacet(data, facetField);
                        }
                    }
                    for (facetField in  data.facet_counts.facet_ranges) {
                        if (data.facet_counts.facet_ranges.hasOwnProperty(facetField)) {
                            _updateOneFacet(data, facetField);
                        }
                    }
                }
            };

            var _getFiltersExceptMatchingQuery = function (ignoreTheseFilters) {
                var solrFiltersArray = [];
                ignoreTheseFilters = ignoreTheseFilters || {};

                function checkField4filter(field) {
                    //multiple valued field
                    if (ignoreTheseFilters[field]) {
                        return true;
                    }
                    var queryFieldName = isSeqr ? field : '{!tag=' + field + '}' + field; //field if no tag needed

                    if ($scope.filters[field] && angular.isArray($scope.filters[field]) && $scope.filters[field].length > 0) {
                        var tagOption = [];//'actvty == ["unspecified","inactive"]'
                        $scope.filters[field].forEach(function (d) {
                            if (d.selected) {
                                tagOption.push('"' + d.name + '"');
                            }
                        });
                        if (tagOption.length > 0) {
                            solrFiltersArray.push(queryFieldName + ':(' + tagOption.join(' OR ') + ')');
                        }
                    }
                    //check single valued field
                    else if ($scope.filters[field] && angular.isString($scope.filters[field]) && $scope.filters[field].length > 0) {
                        solrFiltersArray.push(queryFieldName + ':"' + $scope.filters[field] + '"');
                    }

                    //now we need to add the range query
                    if ($scope.rangeFilters[field] && angular.isArray($scope.rangeFilters[field]) && $scope.rangeFilters[field].length === 2) {
                        var rangeFilters = $scope.rangeFilters[field].slice(0);
                        if ($scope._solrFacetsInfo[field] && $scope._solrFacetsInfo[field].facetScale) {
                            rangeFilters = rangeFilters.map(function (x) {
                                return x * $scope._solrFacetsInfo[field].facetScale;
                            });
                        }
                        solrFiltersArray.push(queryFieldName + ':[' + rangeFilters.join(' ') + ']');
                    }
                }

                //add single/multiple valued filters
                // console.info($scope.filters);
                for (var key in $scope.filters) {
                    if (!ignoreTheseFilters[key] && $scope.filters.hasOwnProperty(key)) {
                        checkField4filter(key);
                    }
                }
                /**
                 * add additional hidden filters that will not showing on the UI
                 *
                 * i.e: solrFiltersArray.push('archids:' + $stateParams.arch);
                 */
                return solrFiltersArray;
            };

            // var sampleSolrBackendConfigurations = {
            //     'facet': 'on',
            //     'facet.field': ['aidtype', 'actvty'],
            //     'facet.limit': 10,
            //     'facet.range': ['mw', 'acvalue'],
            //     "f.mw.facet.scale": 1000,
            //     'f.mw.facet.range.start': 0,
            //     'f.mw.facet.range.end': 2000000,
            //     'f.mw.facet.range.gap': 100000,
            //     'f.mw.facet.mincount': 0,
            //     'f.acvalue.facet.range.start': 0,
            //     'f.acvalue.facet.range.end': 100,
            //     'f.acvalue.facet.range.gap': 5,
            //     'f.acvalue.facet.mincount': 0
            // };

            var _postData = angular.extend({}, {
                q: function () {
                    var q = '*:*';
                    if ($scope.query && $scope.query.matching && $scope.query.matching.length > 0) {
                        //q = $scope.query.matching.replace(/([\!\*\+\&\|\(\)\[\]\{\}\^\~\?\:\"])/g, '\\$1');
                        q = isSeqr ? $scope.query.matching : encodeURIComponent($scope.query.matching);
                    }
                    return q;
                },
                start: function () {//hack for paging
                    var startRecordNumber = ($grid.jqGrid('getGridParam', 'page') - 1) * $grid.jqGrid('getGridParam', 'rowNum');
                    return startRecordNumber;
                },

                // fq: function () {
                //     var filterQuery = _getFiltersExceptMatchingQuery();
                //     return filterQuery.join(' AND ');
                // },
                //this will be sending fp=&fp=&fp=...
                fq_array: function () {
                    var filterQuery = _getFiltersExceptMatchingQuery();
                    return JSON.stringify(filterQuery);
                },
                sort: function () { //&sidx=seqlen&sord=desc"
                    var myPostData = $grid.getPostData();
                    if (!myPostData.sidx || myPostData.sidx === '') {
                        return '';
                    } else {
                        return myPostData.sidx + ' ' + myPostData.sord;
                    }
                }
            }, $scope.config.SolrBackEndConfigurations);

            /**
             *
             * @param ignoreTheseFilters
             * @returns {string}
             * @private
             */
            var _getDownloadQuery = function (ignoreTheseFilters) {
                var q = _postData.q();
                if ($scope.selarrrow && angular.isArray($scope.selarrrow) && $scope.selarrrow.length > 0) {
                    q = $scope.selarrrow.join(' ');
                }
                var allFilters = _getFiltersExceptMatchingQuery(ignoreTheseFilters);
                return {q: q, filters: allFilters};
            };

            /**
             * _solrFacetToHash
             * @param data  facet data returned from solr
             * @param facet_type  field facet
             * @param field_name  field name
             * @returns {_solrFacetToHash}
             */
            var _solrFacetToHash = function (data, field_name, facet_type) {
                field_name = field_name || 'blastname';
                facet_type = facet_type || 'facet_fields';
                var facetsHash = {},
                    facetsArray = [];
                try {
                    facetsArray = data && data.facet_counts && data.facet_counts.hasOwnProperty(facet_type) && data.facet_counts[facet_type].hasOwnProperty(field_name) ? data.facet_counts[facet_type][field_name] : [];//['refseq', 0, 'reference', 0]
                    for (var i = 0; i < facetsArray.length; i += 2) {
                        facetsHash[facetsArray[i]] = facetsArray[i + 1];
                    }
                } catch (e) {
                } finally {
                    return facetsHash;//{refseq:0,reference:0}
                }


            };

            var _getAutoSuggestion = function (field) {
                return function (value) {

                    var fqs = _getFiltersExceptMatchingQuery();
                    var q = _postData.q();
                    var url = me.serviceQueryUrl;
                    url = url.replace(/callback=\?/, '');
                    url = url.replace(/json\.wrf=\?/, '');
                    fqs.forEach(function (d) {
                        url += '&fq=' + d;
                    });
                    return $http.jsonp(url, {
                        params: {
                            q: q ? q : '*:*',
                            rows: 0,
                            'json.wrf': 'JSON_CALLBACK',
                            facet: 'on',
                            'facet.prefix': value || '',
                            'facet.limit': 10,
                            'facet.mincount': 1,
                            'facet.field': '{!ex=' + field + '}' + field
                        },
                        cache: true
                    }).then(function (response) {
                        return _solrFacetToHash(response.data, field);
                    }).then(function (response) {
                        return Object.keys(response || {});
                    });
                };
            };

            return {
                url: me.serviceQueryUrl,
                //this jsonReader is for jqgrid jsonReader conf
                /**
                 *
                 total    total pages for the query
                 page    current page of the query
                 records    total number of records for the query
                 rows    an array that contains the actual data
                 id    the unique id of the row
                 cell    an array that contains the data for a row

                 */
                jsonReader: {
                    repeatitems: false,
                    id: me.serviceUidFieldName,
                    root: function (obj) {
                        return obj && obj.response && obj.response.docs ? obj.response.docs : null;
                    },
                    page: function (obj) {
                        return Math.floor(( obj && obj.response && obj.response.start ? obj.response.start : 0 ) / $grid.jqGrid('getGridParam', 'rowNum')) + 1;
                    },
                    total: function (obj) {
                        try {
                            var totalNumberOfRecords = obj && obj.response && obj.response.numFound ? obj.response.numFound : 0;
                            return Math.ceil(totalNumberOfRecords / $grid.jqGrid('getGridParam', 'rowNum'));
                        } catch (e) {
                            return 0;
                        }
                    },
                    records: function (obj) {
                        return ( obj && obj.response && obj.response.numFound ? obj.response.numFound : 0);
                    },
                    userdata: function (obj) {
                        return {
                            maxScore: ( obj && obj.response && obj.response.maxScore ? obj.response.maxScore : 0),
                            docs: ( obj && obj.response && obj.response.docs ? obj.response.docs : []),
                            msg: obj,
                            maps: (function () {
                                var m = {};
                                if (obj.response && obj.response.docs) {
                                    obj.response.docs.forEach(function (d) {
                                        if (d._id) {
                                            m[d._id] = d;
                                        }
                                    });
                                }
                                return m;
                            }())

                        };
                    }
                },
                postData: _postData,
                updateFacets: _updateFacetsBySolr,
                getAutoSuggestion: _getAutoSuggestion,
                download: function () {
                    if (me.serviceDownloadCallback && angular.isFunction(me.serviceDownloadCallback)) {
                        me.serviceDownloadCallback(_getDownloadQuery());
                    } else {
                        console.warn('config.serviceDownloadCallback not provided for solr Engine!');
                    }
                }
            };
        };
        me.ngram = function ($grid, $scope) {

            /**
             * this will update facets based on ngram responses directly
             *
             * @param data https://gist.github.com/lianyi/16790a3e5b8676dc52a1c87923153ef4
             * @private
             */
            var _updateFacetsByNgram = function (data) {

                /**
                 *_getMapOfFacetData
                 * @param arrayData,  [ { "name": "active", "count": 4446691 }, { "name": "inactive", "count": 216388979 }
                 * @return {"active":{ "name": "active", "count": 4446691 },"inactive":{ "name": "inactive", "count": 216388979 }}
                 */
                var _getMapOfFacetData = function (arrayData) {
                    var mapData = {};
                    if (!angular.isArray(arrayData)) {
                        return mapData;
                    }
                    for (var i = 0; i < arrayData.length; i++) {
                        if (arrayData[i].name) {
                            mapData[arrayData[i].name] = arrayData[i];
                        }
                    }
                    return mapData;
                };

                if (data && data.ngout && data.ngout.hist) {
                    for (var facetField in  data.ngout.hist) {
                        if (data.ngout.hist.hasOwnProperty(facetField)) {
                            if (data.ngout.hist[facetField] && data.ngout.hist[facetField].values) {
                                var newFacetsMap = _getMapOfFacetData(data.ngout.hist[facetField].values);

                                //existing facets in array
                                var facetsArray = $scope.filters[facetField] ? $scope.filters[facetField].slice(0) : [];

                                //inherit .selected etc extra parameters from $scope.filters object if any
                                for (var i = 0; i < facetsArray.length; i++) {
                                    facetsArray[i].count = (newFacetsMap[facetsArray[i].name] && newFacetsMap[facetsArray[i].name].count) ? newFacetsMap[facetsArray[i].name].count : 0;
                                    delete newFacetsMap[facetsArray[i].name];
                                }

                                //put the new facet data back into existing facetArray
                                for (var j in  newFacetsMap) {
                                    if (newFacetsMap.hasOwnProperty(j)) {
                                        facetsArray.push(newFacetsMap[j]);
                                    }
                                }
                                //order the facetArray before set it back to scope filters
                                $scope.filters[facetField] = facetsArray.sort(_sortByName);
                            }
                        }
                    }
                }
            };


            var _getFiltersExceptMatchingQuery = function (ignoreTheseFilters) {
                var solrFiltersArray = [];
                ignoreTheseFilters = ignoreTheseFilters || {};

                function checkField4filter(field) {
                    //multiple valued field
                    if (ignoreTheseFilters[field]) {
                        return true;
                    }

                    if ($scope.filters[field] && angular.isArray($scope.filters[field]) && $scope.filters[field].length > 0) {
                        var tagOption = [];//'actvty == ["unspecified","inactive"]'
                        $scope.filters[field].forEach(function (d) {
                            if (d.selected) {
                                tagOption.push('"' + d.name + '"');
                            }
                        });
                        if (tagOption.length > 0) {
                            solrFiltersArray.push(field + '==[' + tagOption.join(',') + ']');
                        }
                    }
                    //check single valued field
                    else if ($scope.filters[field] && angular.isString($scope.filters[field]) && $scope.filters[field].length > 0) {
                        solrFiltersArray.push(field + '=="' + $scope.filters[field] + '"');
                    }

                    //now we need to add the range query
                    if ($scope.rangeFilters[field] && angular.isArray($scope.rangeFilters[field]) && $scope.rangeFilters[field].length === 2) {
                        solrFiltersArray.push(field + '>="' + $scope.rangeFilters[field][0] + '"');
                        solrFiltersArray.push(field + '<="' + $scope.rangeFilters[field][1] + '"');
                    }
                }

                //add single/multiple valued filters
                // console.info($scope.filters);
                for (var key in $scope.filters) {
                    if (!ignoreTheseFilters[key] && $scope.filters.hasOwnProperty(key)) {
                        checkField4filter(key);
                    }
                }
                /**
                 * add additional hidden filters that will not showing on the UI
                 *
                 * i.e: solrFiltersArray.push('archids:' + $stateParams.arch);
                 */
                return solrFiltersArray;
            };


            var _ngramQuery = {
                from: function () {
                    return '.from(' + ($scope.config.NgramBackEndConfigurations.collection || $scope.config.collection ) + ')' +
                        '.usingschema(/schema/' + ($scope.config.NgramBackEndConfigurations.schema || $scope.config.schema) + ')';
                },
                matching: function (ignoreTheseFilters, isDownload) {
                    var q = '', allFilters = _getFiltersExceptMatchingQuery(ignoreTheseFilters);
                    if (isDownload && $scope.selarrrow && angular.isArray($scope.selarrrow) && $scope.selarrrow.length > 0) {
                        allFilters.push('q=="' + encodeURIComponent($scope.selarrrow.join(' ')) + '"');
                    } else if ($scope.query && $scope.query.matching && $scope.query.matching.length > 0) {
                        allFilters.push('q=="' + encodeURIComponent($scope.query.matching) + '"');
                    } else if (!$scope.query) {
                        console.info('query parameter wasn\'t defined: possibility missing query=query in <advanced-options>');
                    }
                    if (allFilters.length > 0) {
                        q = '.matching(' + allFilters.join(' and ') + ')';//'.matching(cid==2244)';
                    }
                    return q;
                },

                /**
                 * Sorting
                 * @returns {string}
                 */
                sort: function () {
                    var q = '';
                    try {
                        var myPostData = $grid.getPostData();
                        if (myPostData.sidx && myPostData.sidx && myPostData.sord) {
                            var _sort = myPostData.sidx.trim() + ' ' + myPostData.sord.trim().toLowerCase();
                            _sort = _sort.replace(/\s+/g, ',');
                            _sort = _sort.replace(/,+/g, ',');
                            q += '.sort(' + _sort + ')';
                        }
                    } catch (e) {
                        console.warn(e);
                    }
                    return q;
                }
            };
            var _getNgramQueryParameter = function () {
                var listOfFacetsField = [];
                var collector = function (item) {
                    if (item && item.field) {
                        listOfFacetsField.push(item.field);
                    } else if (item && item.name) {
                        listOfFacetsField.push(item.name);
                    }
                };
                if (angular.isArray($scope.config.facetFields)) {
                    $scope.config.facetFields.forEach(collector);
                }

                if (angular.isArray($scope.config.rangeFacetFields)) {
                    $scope.config.rangeFacetFields.forEach(collector);
                }


                var q = '[display()' + (listOfFacetsField && listOfFacetsField.length > 0 ? ',hist(' + listOfFacetsField.join(',') + ')' : '') + ']';

                //schema from info
                q += _ngramQuery.from();
                //matching query
                q += _ngramQuery.matching();
                //sorting
                q += _ngramQuery.sort();

                // console.info(q);
                //paging will be taken care in postData function, or here too //.start(0).limit(20)
                return q;

            };


            /**
             *
             * @param ignoreTheseFilters
             * @returns {string}
             * @private
             */
            var _getDownloadQuery = function (ignoreTheseFilters) {
                return '[display()]' + _ngramQuery.from() + _ngramQuery.matching(null, true);//true when used this for download
            };

            var _getAutoSuggestion = function (field) {
                return function (value) {
                    var q = 'autosuggest(' + field + ',"' + value + '")';
                    q += _ngramQuery.from();
                    q += _ngramQuery.matching();
                    return $http({
                        url: me.serviceQueryUrl,
                        method: 'POST',
                        data: {q: q}
                    }).then(function (response) {
                        try {
                            if (response.data.ngout.hist[field].values) {
                                return response.data.ngout.hist[field].values.map(function (d) {
                                    return d.name || '';
                                });
                            }
                        } catch (e) {
                            return [];
                        }
                    });
                };
            };

            return {
                url: me.serviceQueryUrl,
                //this jsonReader is for jqgrid jsonReader conf
                /**
                 *
                 total    total pages for the query
                 page    current page of the query
                 records    total number of records for the query
                 rows    an array that contains the actual data
                 id    the unique id of the row
                 cell    an array that contains the data for a row

                 */
                jsonReader: {
                    repeatitems: false,
                    id: me.serviceUidFieldName,
                    root: function (obj) {
                        return obj && obj.ngout && obj.ngout.data && obj.ngout.data.content ? obj.ngout.data.content : [];
                    },
                    total: function (obj) {
                        try {
                            var totalNumberOfRecords = obj && obj.ngout && obj.ngout.data && obj.ngout.data.totalCount ? obj.ngout.data.totalCount : 0;
                            return Math.ceil(totalNumberOfRecords / $grid.jqGrid('getGridParam', 'rowNum'));
                        } catch (e) {
                            return 0;
                        }
                    },
                    records: function (obj) {
                        return ( obj && obj.ngout && obj.ngout.data && obj.ngout.data.totalCount ? obj.ngout.data.totalCount : 0);
                    },
                    userdata: function (obj) {
                        function _mappedData() {
                            var m = {};
                            if (obj && obj.ngout && obj.ngout.data && obj.ngout.data.content) {
                                obj.ngout.data.content.forEach(function (d) {
                                    if (d._id) {
                                        m[d._id] = d;
                                    }
                                });
                            }
                            return m;
                        }

                        return {
                            docs: obj && obj.ngout && obj.ngout.data && obj.ngout.data.content ? obj.ngout.data.content : [],
                            msg: obj,
                            maps: _mappedData()

                        };
                    }
                },
                postData: {
                    start: function () {//start of the records for paging
                        return ($grid.jqGrid('getGridParam', 'page') - 1) * $grid.jqGrid('getGridParam', 'rowNum');
                    },
                    limit: function () {
                        return $grid.jqGrid('getGridParam', 'rowNum');
                    },
                    q: _getNgramQueryParameter
                },
                updateFacets: _updateFacetsByNgram,
                getAutoSuggestion: _getAutoSuggestion,
                download: function () {
                    var formData = {
                        q: _getDownloadQuery() || '',
                        limit: 10000,
                        download: 'csv'
                    };
                    if (me.serviceDownloadCallback && angular.isFunction(me.serviceDownloadCallback)) {
                        me.serviceDownloadCallback(formData);
                    } else {
                        console.warn('config.serviceDownloadCallback not provided for ngram Engine!');
                    }
                }
            };
        };
    })
;
