'use strict';


angular.module('ngramApp')
    /**
     * @ngdoc filter
     * @name ngramApp.filter:removeSpacesThenLowercase
     * @function
     * @description
     * # removeSpacesThenLowercase
     * Filter in the ngramApp.
     */
    .filter('removeSpacesThenLowercase', function () {
        return function (text) {
            var str = text.replace(/\s+/g, '');
            return str.toLowerCase();
        };
    })
    /**
     * @ngdoc filter
     * @name ngramApp.filter:sortAndFilterTags
     * @function
     * @description
     * # sortAndFilterTags
     * Filter in the ngramApp.
     */
    .filter('sortAndFilterTags', function () {
        return function (inputTags, tagNamesToBeLimited) {
            if (!tagNamesToBeLimited || tagNamesToBeLimited.length < 1) {
                return inputTags;
            }
            var result = [], item, i;
            for (i = 0; i < inputTags.length; i++) {
                item = inputTags[i];
                if (tagNamesToBeLimited.indexOf(item) !== -1 || tagNamesToBeLimited.indexOf(item.name) !== -1) {
                    result.push(item);
                }
            }
            var ordering = {};
            if (!angular.isArray(tagNamesToBeLimited)) {
                tagNamesToBeLimited = [tagNamesToBeLimited];
            }
            tagNamesToBeLimited.forEach(function (d, i) {
                ordering[d] = i;
            });

            if (result.length > 0 && result[0].name) {
                result.sort(function (a, b) {
                    return ordering[a.name] > ordering[b.name];
                });
            }
            return (result);
        };
    })
    /**
     * @ngdoc filter
     * @name ngramApp.filter:trustedUrl
     * @function
     * @description
     * # trustedUrl
     * Filter in the ngramApp.
     */
    .filter('trustedUrl', ['$sce', function ($sce) {
        return function (url) {
            return $sce.trustAsResourceUrl(url);
        };
    }])
    .filter('unsafe', ['$sce', function ($sce) {
        return $sce.trustAsHtml;
    }]);

