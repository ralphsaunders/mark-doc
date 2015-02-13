'use strict'

var walk = require ('walk'),
    fs = require('fs');

module.exports = {
    crawl: function(path) {
        if(!path) {
            path = __dirname
        }

        var walker = walk.walk(path, {
            followLinks: false
        });

        walker.on('file', function(root, fileStat, next) {
            debugger;
        });
    }
}
