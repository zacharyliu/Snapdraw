define('Canvas', ['jquery', 'utils', 'CanvasDelta', 'config'], function($, utils, CanvasDelta, config) {
    var Canvas = function(selector) {
        this.$canvas = $(selector);
        this.canvas = $(selector)[0];
        this.context = this.canvas.getContext('2d');
        this.history = [];
        this.timeOffset = 0;
        this.myColor = utils.randomColor();
    };

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
            if (this.history[0][0] < now - config.HISTORY_DURATION * 2) {
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

    Canvas.prototype._renderLoop = function() {
        this._trimHistory();
        this.clear();
        var now = utils.timestamp();
        for (var i=0; i<this.history.length; i++) {
            var timestamp = this.history[i][0];
            if (timestamp > now - config.HISTORY_DURATION - this.timeOffset
                && timestamp < now - this.timeOffset) {
                var canvasDelta = this.history[i][1];
                canvasDelta.render(this.canvas, this.context, now - this.timeOffset - timestamp);
            }
        }
    };

    Canvas.prototype.setTimeOffset = function(timeOffset) {
        this.timeOffset = timeOffset;
        this._renderLoop();
    };

    Canvas.prototype.init = function() {
        var that = this;

        // Mouse paint functions
        // TODO: refactor out into its own section
        var paint;
        var previousPosition;
        var previousTime;
        this.$canvas.mousedown(function(e) {
            previousPosition = [e.pageX - this.offsetLeft, e.pageY - this.offsetTop];
            previousTime = utils.timestamp();
            paint = true;
        }).mousemove(function(e) {
            var now = utils.timestamp();
            if (paint && previousTime < now - 1/config.DRAW_FPS) {
                var newPosition = [e.pageX - this.offsetLeft, e.pageY - this.offsetTop];
                that.pushDelta(new CanvasDelta(previousPosition, newPosition, that.myColor));
                previousPosition = newPosition;
                previousTime = now;
            }
        }).mouseup(function(e) {
            paint = false;
        }).mouseleave(function(e) {
            paint = false;
        });

        // Start render loop
        this._renderLoopInterval = setInterval(function() {
            that._renderLoop();
        }, 1/config.RENDER_FPS*1000);
    };

    return Canvas;
});