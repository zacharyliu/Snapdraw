define('TimeSlider', ['jquery', 'config'], function($, config) {
    return function (timeElem, canvas) {
        var $time = $(timeElem);

        var dragging = true;
        $time.parent().mousedown(function (e) {
            dragging = true;
            $time.stop().css({width: e.pageX - this.offsetLeft});
        });
        $(window).mousemove(function (e) {
            if (dragging) {
                $time.stop().css({width: e.pageX - $time[0].offsetLeft});
            }
        }).mouseup(function () {
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

        setInterval(function () {
            var offset = ($time.parent().width() - $time.width()) / $time.parent().width() * config.HISTORY_DURATION;
            canvas.setTimeOffset(offset);
        }, 100);
    };
});