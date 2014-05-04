require.config({
    baseUrl: 'js',
    paths: {
        jquery: 'vendor/jquery-1.10.2.min',
        modernizr: 'vendor/modernizr-2.6.2.min'
    },
    deps: ['modernizr']
});

require(['jquery', 'Canvas'], function($, Canvas) {
    $(function() {
        var canvas = new Canvas('#canvas');
        $(document).keypress(function(){
            canvas.draw();
        });
    });
});
