define('utils', [''], function() {
    return {
        timestamp: function() {
            return Math.round(new Date()/1000);
        }
    };
});