define('Canvas', ['jquery', 'utils'], function($, utils) {
    var Canvas = function(selector) {
        this.canvas = $(selector)[0];
        this.context = this.canvas.getContext('2d');
        this.history = [];
        this.timeOffset = 0;
    };

    Canvas.HISTORY_DURATION = 30; // duration of maintained history in seconds
    Canvas.RENDER_FPS = 10;
    Canvas.SYNC_FPS = 3;

    /**
     * Clear the canvas
     * https://stackoverflow.com/a/4085780/133211
     */
    Canvas.prototype.clear = function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        var w = this.canvas.width;
        this.canvas.width = 1;
        this.canvas.width = w;
    };

    Canvas.prototype.draw = function() {
        if (this.canvas.getContext) {
            var ctx = this.canvas.getContext('2d');

            var offset = (Math.random() * 1000);
            var offset2 = (Math.random() * 1000);
            ctx.fillRect(25+offset,25+offset2,100,100);
            ctx.clearRect(45+offset,45+offset2,60,60);
            ctx.strokeRect(50+offset,50+offset2,50,50);
        }
    };

    /**
     * Trims out history entries that extend beyond the maintained duration.
     * Keeps items within HISTORY_DURATION*2 seconds due to timeshifting functionality.
     * @private
     */
    Canvas.prototype._trimHistory = function() {
        var now = utils.timestamp();
        var count = 0;
        while (this.history.length > 0) {
            if (this.history[0][0] < now - Canvas.HISTORY_DURATION * 2) {
                this.history.shift();
                count++;
            } else {
                break;
            }
        }
        return count;
    };

    Canvas.prototype.pushDelta = function(canvasDelta) {
        this.history.push([utils.timestamp(), canvasDelta]);
    };

    Canvas.prototype._loop = function() {
        this._trimHistory();
        var now = utils.timestamp();
        for (var i=0; i<this.history.length; i++) {
            var timestamp = this.history[i][0];
            if (timestamp > now - Canvas.HISTORY_DURATION - this.timeOffset
                && timestamp < now - this.timeOffset) {
                var canvasDelta = this.history[i][1];
                canvasDelta.render(this.canvas, this.context);
            }
        }
    };

    Canvas.prototype.setTimeOffset = function(timeOffset) {
        this.timeOffset = timeOffset;
        this._loop();
    };

    Canvas.prototype.init = function() {
        var that = this;
        this._loopInterval = setInterval(function() {
            that._loop();
        }, 1/Canvas.RENDER_FPS);
    };

    return Canvas;
});