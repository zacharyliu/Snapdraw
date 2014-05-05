require.config({
    baseUrl: 'js',
    paths: {
        jquery: 'vendor/jquery-1.10.2.min',
        modernizr: 'vendor/modernizr-2.6.2.min',
        'jquery.eventemitter': 'vendor/jquery.eventemitter'
    },
    shim: {
        'jquery.eventemitter': ['jquery']
    },
    deps: ['jquery', 'modernizr', 'jquery.eventemitter']
});

require(['jquery', 'Canvas', 'CanvasDelta'], function($, Canvas, CanvasDelta) {
    $(function() {
        var canvas = new Canvas('#canvas');
        canvas.init();
    });
});
