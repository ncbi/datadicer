'use strict';

/**
 * @ngdoc service
 * @name ngramApp.ngramAppConfig
 * @description
 * # ngramAppConfig
 * Constant in the ngramApp.
 */
angular.module('ngramApp')
    .constant('ngramAppConfig', {
        // ENGINE: 'solr', //solr,ngram
        // serviceQueryUrl: 'http://solrserver:8983/solr/core1/select?wt=json&indent=true&json.wrf=?',
        // SOLR_DOWNLOAD_URL: 'http://solrserver:8983/solr/core1/select?wt=csv',
        serviceEngine: 'ngram', //solr,ngram
        serviceQueryUrl: '//ngram_server/ngram?&callback=?',//jquery ajax
        serviceDownloadCallback: function (params) {
            console.warn('serviceDownloadCallback is required, parameters are: ', params);
        },
        SINGULAR: typeof Singular !== 'undefined' ? new Singular() : null
    });

