require.config({
    baseUrl: 'js',
    paths: {
        bootstrap: 'vendor/bootstrap.min',
        jquery: 'vendor/jquery-1.10.2.min',
        'jquery-ui': 'vendor/jquery-ui-1.10.4.min',
        modernizr: 'vendor/modernizr-2.6.2.min',
        'jquery.eventemitter': 'vendor/jquery.eventemitter',
        'socket.io': 'http://clicktime.herokuapp.com/socket.io/socket.io.js'
    },
    shim: {
        'bootstrap': ['jquery'],
        'jquery-ui': ['jquery'],
        'jquery.eventemitter': ['jquery'],
        'socket.io': {
            exports: 'io'
        }
    },
    deps: ['bootstrap', 'jquery', 'jquery-ui', 'modernizr', 'jquery.eventemitter']
});

require(['jquery', 'socket.io', 'utils', 'config', 'Canvas', 'CanvasDelta'], function($, io, utils, config, Canvas, CanvasDelta) {
    $(function() {
        var base = 'http://clicktime.herokuapp.com:80/rooms/';
        var roomName = 'SnapDraw';    // Replace this with your own room name
        var socket = io.connect(base + roomName);

        var canvas;

        socket.on('welcome', function() {
            canvas = new Canvas('#canvas');
            canvas.init();

            socket.on('message', function(data) {
                switch (data.type) {
                    case 'draw':
                        for (var i=0; i<data.data.length; i++) {
                            canvas.pushDelta(new CanvasDelta(data.data[i].start, data.data[i].end, data.data[i].color));
                        }
                        break;
                }
            });

            var sendQueue = [];

            canvas.on('draw', function(e, canvasDelta) {
                sendQueue.push(canvasDelta);
            });

            var sendInterval = setInterval(function() {
                if (sendQueue.length > 0) {
                    socket.emit('message', {
                        type: 'draw',
                        data: sendQueue
                    });
                    sendQueue = [];
                }
            }, 1/config.SYNC_FPS*1000);

            var $time = $('#time');

            var dragging = true;
            $time.parent().mousedown(function(e) {
                dragging = true;
                $time.stop().css({width: e.pageX - this.offsetLeft});
            });
            $(window).mousemove(function(e) {
                if (dragging) {
                    $time.stop().css({width: e.pageX - $time[0].offsetLeft});
                }
            }).mouseup(function() {
                if (dragging) {
                    dragging = false;
                    $time.stop().animate({
                        width: "100%"
                    }, {
                        duration: 1000,
                        easing: 'easeOutExpo'
                    });
                }
            }).trigger('mouseup');

            setInterval(function() {
                var offset = ($time.parent().width() - $time.width()) / $time.parent().width() * config.HISTORY_DURATION;
                console.log(offset);
                canvas.setTimeOffset(offset);
            }, 100);
        });
    });
});
