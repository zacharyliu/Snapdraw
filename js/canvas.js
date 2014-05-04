define('Canvas', ['jquery'], function($) {
    var Canvas = function(selector) {
        this.canvas = $(selector)[0];
        console.log(this.canvas);
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

    return Canvas;
});