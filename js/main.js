require.config({
    baseUrl: 'js',
    paths: {
        jquery: 'vendor/jquery-1.10.2.min',
        modernizr: 'vendor/modernizr-2.6.2.min'
    },
    deps: ['modernizr']
});

require(['jquery', 'Canvas', 'CanvasDelta'], function($, Canvas, CanvasDelta) {
    $(function() {
        var canvas = new Canvas('#canvas');
        canvas.pushDelta(new CanvasDelta([0,0], [100, 100], '#123456'));
        canvas.init();
        $(document).keypress(function(){
            canvas.draw();
        });
    });
});
