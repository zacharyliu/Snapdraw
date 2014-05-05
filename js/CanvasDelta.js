define('CanvasDelta', ['Canvas', 'utils', 'config'], function(Canvas, utils, config) {
    /**
     * Object representing a line segment on the canvas
     * @param start
     * @param end
     * @param color
     * @constructor
     */
    var CanvasDelta = function(start, end, color) {
        this.start = start;
        this.end = end;
        this.color = color;
    };

    CanvasDelta.prototype.render = function(canvas, context, timePassed) {
        context.strokeStyle = utils.fadeColor(this.color, timePassed / config.HISTORY_DURATION);
        context.beginPath();
        context.moveTo(this.start[0], this.start[1]);
        context.lineTo(this.end[0], this.end[1]);
        context.lineWidth = 5;
        context.stroke();
    };

    /**
     * Returns line segment data as a plain object
     * @returns {{start: *, end: *, color: *}}
     */
    CanvasDelta.prototype.toJSON = function() {
        return {
            start: this.start,
            end: this.end,
            color: this.color
        };
    };

    return CanvasDelta;
});