require.config({
    baseUrl: 'js',
    paths: {
        jquery: 'vendor/jquery-1.10.2.min',
        modernizr: 'vendor/modernizr-2.6.2.min',
        'jquery.eventemitter': 'vendor/jquery.eventemitter',
        'socket.io': 'http://clicktime.herokuapp.com/socket.io/socket.io.js'
    },
    shim: {
        'jquery.eventemitter': ['jquery'],
        'socket.io': {
            exports: 'io'
        }
    },
    deps: ['jquery', 'modernizr', 'jquery.eventemitter']
});

require(['jquery', 'socket.io', 'utils', 'config', 'Canvas', 'CanvasDelta'], function($, io, utils, config, Canvas, CanvasDelta) {
    $(function() {
        var base = 'http://clicktime.herokuapp.com:80/rooms/';
        var roomName = 'my-awesome-room-19312831237';    // Replace this with your own room name
        var socket = io.connect(base + roomName);

        var canvas = new Canvas('#canvas');

        socket.on('welcome', function() {
            canvas.init();
        });

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
    });
});
