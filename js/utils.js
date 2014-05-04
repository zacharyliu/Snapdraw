define('utils', [''], function() {
    return {
        timestamp: function() {
            return new Date() / 1000;
        },
        /**
         * Fades a color to white by a certain percentage
         * https://stackoverflow.com/a/6444043/133211
         * @param {string} hex
         * @param {number} percent amount to fade, float between 0 and 1
         * @returns {string}
         */
        fadeColor: function(hex, percent){
            // strip the leading # if it's there
            hex = hex.replace(/^\s*#|\s*$/g, '');

            // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
            if(hex.length == 3){
                hex = hex.replace(/(.)/g, '$1$1');
            }

            var r = parseInt(hex.substr(0, 2), 16),
                g = parseInt(hex.substr(2, 2), 16),
                b = parseInt(hex.substr(4, 2), 16);

            return '#' +
                ((0|(1<<8) + r + (256 - r) * percent).toString(16)).substr(1) +
                ((0|(1<<8) + g + (256 - g) * percent).toString(16)).substr(1) +
                ((0|(1<<8) + b + (256 - b) * percent).toString(16)).substr(1);
        }
    };
});
