'use strict';

/**
 * @ngdoc overview
 * @name ngramApp
 * @description
 * # ngramApp
 *
 * Main module of the application.
 */
angular.module('ngramApp', [
    'ui.bootstrap',
    'ngAnimate',
    'ngAria',
    'ui.router',
    'ngSanitize',
    'angular.filter'
    // ,'angulartics',
    // 'angulartics.google.analytics'
]).config(['ngramAppConfig', function (ngramAppConfig) {
    ngramAppConfig.trackingEnabled = true;
    ngramAppConfig.serviceEngine = 'solr'; //solr,ngram
    ngramAppConfig.serviceQueryUrl = 'http://solrserver:8983/solr/core1/select?wt=json&indent=true&json.wrf=?';
    ngramAppConfig.serviceDownloadCallback = function (params) {
        try {
            var url = ngramAppConfig.serviceQueryUrl.split('?')[0];
            url += '?q=' + ( params.q ? params.q : '*:*');
            url += '&rows=1000&wt=csv&start=0';
            if (params.filters && angular.isArray(params.filters)) {
                params.filters.forEach(function (d) {
                    url += '&fq=' + d;
                });
            }
            //console.warn(url, params);
            window.location.assign(url);
        } catch (e) {
            console.warn(e);
        }
    };
}]);
