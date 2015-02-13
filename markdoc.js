'use strict'

var walk = require ('walk'),
    fs = require('fs'),
    util = require('util'),
    fileTypes = [
        'md',
        'mkd',
        'markdown'
    ]

module.exports = {
    asArray: function(path, callback) {
        // Use current path as a default
        if(!path) {
            path = __dirname
        }

        // Initiate walker
        var walker = walk.walk(path, {
            followLinks: false
        });

        var mdFiles = []; // Holds files that match
        walker.on('file', function(root, stat, next) {
            // Match files that are in fileTypes array
            if(fileTypes.indexOf(stat.name.split('.').pop()) >= 0) {
                mdFiles.push({
                    name: stat.name,
                    path: root + '/' + stat.name
                })
            }

            next();
        });

        // Send array of files back when finished
        walker.on('end', function() {
            callback(mdFiles);
        });

        return callback;
    },

    asMarkdown: function(path, callback) {
        this.asArray(path, function(files) {
            var string = files.map(function(file) {
                return util.format('[%s](%s)', file.name, file.path);
            }).join('\n\n');

            callback(string);
        });

        return callback;
    }
}
