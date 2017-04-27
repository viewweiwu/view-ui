(function($) {
    "use strict";

    ['width', 'height'].forEach(function(dimension) {

        var Dimension = dimension.replace(/./, function(m) {
            return m[0].toUpperCase();
        });

        //outerWidth or outerHeight

        $.fn['outer' + Dimension] = function(margin) {
            var elem = this;

            if (elem) {


                // elem.width(); or  elem.height();
                var size = elem[dimension]();

                var sides = {
                    'width': ['left', 'right'],
                    'height': ['top', 'bottom']
                };

                sides[dimension].forEach(function(side) {
                    if (margin) {
                        size += parseInt(elem.css('margin-' + side), 10);
                    }
                });

                return size;
            } else {
                return null;
            }
        }


    });
})(Zepto);