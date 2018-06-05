'use strict';

/**
 * @ngdoc service
 * @name ngramApp.trackSearch
 * @description
 * # trackSearch
 * Given filters and query data, track a search event.
 */
angular.module('ngramApp')
    .service('trackSearch', function (trackEvent) {
        // function getKeys(obj) {
        //     var keys = [];
        //     for (var key in obj) {
        //         if (!obj.hasOwnProperty(key)) {
        //             continue;
        //         }
        //         keys.push(key);
        //     }
        //     return keys;
        // }
        return function (filters, query) {
            var term = (query && query.matching) ? query.matching : '';
            // var dd_filters = getKeys(filters).join(",");
            // TODO: add getKeys and dd_filters when the next version of
            // AppLog has been released supporting the dd_filters comma-separated
            // field. Should be before end of Jan 2018.
            trackEvent('Search', 'ddsearchbar', term,
                {
                    'jsevent': 'search',
                    'search_form_name': 'ddsearchbar',
                    'ncbi_term': term
                });

        };

    });
