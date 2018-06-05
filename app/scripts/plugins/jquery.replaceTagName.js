'use strict';
/**
 * http://stackoverflow.com/questions/2815683/jquery-javascript-replace-tag-type
 */
(function ($) {
    $.fn.replaceTagName = function (replaceWith) {
        var tags = [],
            i = this.length;
        while (i--) {
            var newElement = document.createElement(replaceWith),
                me = this[i],
                myAttrs = me.attributes;
            for (var a = myAttrs.length - 1; a >= 0; a--) {
                var attribute = myAttrs[a];
                newElement.setAttribute(attribute.name, attribute.value);
            }
            newElement.innerHTML = me.innerHTML;
            $(me).after(newElement).remove();
            tags[i] = newElement;
        }
        return $(tags);
    };
})(window.jQuery);
