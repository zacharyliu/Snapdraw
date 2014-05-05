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

            var paired = false,
                synced = false;
            socket.on('message', function(data) {
                switch (data.type) {
                    case 'draw':
                        for (var i=0; i<data.data.length; i++) {
                            canvas.pushDelta(new CanvasDelta(data.data[i].start, data.data[i].end, data.data[i].color));
                        }
                        break;

                    /** Following code handles initial peer-to-peer pair-and-sync,
                     * to send current canvas history data to new clients.
                     *
                     * First, the newly loaded script sends a "request-broadcast" event to all others.
                     * All others reply back with a "request-broadcast-reply" event,
                     *   specifically targeted at the new client, offering to pair.
                     * The first event reply received by the new client is the chosen pair,
                     *   and a "request-data" event is sent specifically to them.
                     * The chosen pair then replies back with a "request-data-reply" event
                     *   containing a serialized export of the history with relative timestamps.
                     * This export data is then imported by the new client.
                     *
                     * If no "request-broadcast-reply" event is received within the timeout period,
                     *   it assumes that no other clients are connected and starts with a blank canvas.
                     *
                     * Although the sync protocol is not perfect, since the history operates on a rolling basis,
                     *   any errors in initial sync will soon disappear anyway.
                     **/
                    case 'request-broadcast':
                        if (synced) {
                            socket.emit('message', {
                                type: 'request-broadcast-reply',
                                data: {
                                    myColor: canvas.myColor
                                }
                            })
                        }
                        break;
                    case 'request-broadcast-reply':
                        if (!paired) {
                            console.log('Paired with and requesting sync with ' + data.data.myColor);
                            paired = true;
                            socket.emit('message', {
                                type: 'request-data',
                                data: {
                                    targetColor: data.data.myColor,
                                    myColor: canvas.myColor
                                }
                            });
                        }
                        break;
                    case 'request-data':
                        if (synced && data.data.targetColor == canvas.myColor) {
                            console.log('Sending sync data to ' + data.data.myColor);
                            var exportData = canvas.exportData();
                            socket.emit('message', {
                                type: 'request-data-reply',
                                data: {
                                    targetColor: data.data.myColor,
                                    myColor: canvas.myColor,
                                    exportData: JSON.stringify(exportData)
                                }
                            })
                        }
                        break;
                    case 'request-data-reply':
                        if (paired && !synced && data.data.targetColor == canvas.myColor) {
                            console.log('Got sync data from ' + data.data.myColor);
                            canvas.importData(JSON.parse(data.data.exportData));
                            synced = true;
                        }
                        break;
                }
            });
            socket.emit('message', {
                type: 'request-broadcast'
            });
            setTimeout(function() {
                // if no pair reply received in a reasonable time, assume it's the only connected client
                if (!paired) {
                    synced = true;
                }
            }, 2000);

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
                canvas.setTimeOffset(offset);
            }, 100);
        });
    });
});
