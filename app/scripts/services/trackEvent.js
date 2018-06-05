'use strict';

/**
 * @ngdoc service
 * @name ngramApp.trackEvent
 * @description
 * # trackEvent
 * Logs a custom event to AppLog and GA via the NCBI pinger.
 *
 */
angular.module('ngramApp')
    .service('trackEvent', function () {
        return function (category, action, label, data) {
            if (!window.ncbi || !window.ncbi.sg) {
                return;
            }
            if (!data) {
                data = {
                    'jsevent': category,
                    'action': action,
                    'label': label
                };
            }
            if (window.ncbi.sg.ping) {
                window.ncbi.sg.ping(data);
            }
            if (window.ncbi.sg.getGA) {
                var ncbiGA = window.ncbi.sg.getGA();
                if (ncbiGA) {
                    ncbiGA('send', 'event', category, action, label);
                }
            }
        };
    });
