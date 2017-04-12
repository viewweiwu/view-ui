/* rem */
(function(_D) {
    var _self = {};
    _self.Html = _D.getElementsByTagName("html")[0];
    _self.widthProportion = function() { var p = (_D.body && _D.body.clientWidth || _self.Html.offsetWidth) / 750; return p > 1 ? 1 : p < 0.4 ? 0.4 : p; };
    _self.changePage = function() { _self.Html.setAttribute("style", "font-size:" + _self.widthProportion() * 100 + "px !important"); }
    _self.changePage();
    setInterval(_self.changePage, 100);
})(document);