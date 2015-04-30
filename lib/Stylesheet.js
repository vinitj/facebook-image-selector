// stylesheet-mixin.js
var Stylesheet = {
    loadStylesheet: function (url) {
        var head = document.getElementsByTagName('head')[0],
        	link = document.createElement('link');

        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', url);
        link.setAttribute('type', 'text/css');
        head.appendChild(link);
    }
};

module.exports = Stylesheet;