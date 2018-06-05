'use strict';

/**
 * @ngdoc service
 * @name ngramApp.trackClick
 * @description
 * # trackClick
 * Given an event object, track a click event.
 */
angular.module('ngramApp')
    .service('trackClick', function(trackEvent) {
        return function(event, section){
            if (window.ncbi && window.ncbi.sg) {
                window.ncbi.sg.ping(event.target, event, 'click', {'dd_section': section});
                if(window.ncbi.sg.getGA) {
                    window.ncbi.sg.getGA()('send', 'event', 'Link Click', section, event.target.innerText || event.target.textContent || '');
                }
            }
        };
        
    });
