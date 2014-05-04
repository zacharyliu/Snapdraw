define('CanvasDelta', ['Canvas', 'utils', 'config'], function(Canvas, utils, config) {
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

    return CanvasDelta;
});