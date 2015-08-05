var walk = require('walk'),
    //fs = require('fs'),
    util = require('util'),
    Path = require('path'),
    fileTypes = [
        'md',
        'mkd',
        'markdown'
    ],
    blacklist = [
        'node_modules',
        '.git'
    ];

function popExt(filename) {
    return filename.split('.').pop();
}

function inBlacklist(folder) {
    return blacklist.indexOf(folder) >= 0;
}

module.exports = {
    asArray: function (path, callback) {
        // Use current path as a default
        if (!path) {
            path = __dirname
        }

        // Initiate walker
        var walker = walk.walk(path, {
            followLinks: false
        });

        var collection = [];

        walker.on('file', function (root, stat, next) {
            if (fileTypes.indexOf(popExt(stat.name)) >= 0) {
                if (!root.replace(/\\+/g, '/').split('/').some(inBlacklist)) {
                    var file = Path.relative(path, root).replace(/\\+/g, '/').split('/');
                    collection.push({
                        name: stat.name,
                        path: Path.normalize(Path.relative(__dirname, root) + '/' + stat.name),
                        position: file.length,
                        parent: file[file.length - 1],
                        file: file
                    });

                }
            }

            next();
        });

        // Send array of files back when finished
        walker.on('end', function () {
            callback(collection);
        });

        return callback;
    },

    asMarkdown: function (path, callback) {
        this.asArray(path, function (files) {
            var lastPos = 1, lastParent = '', pre;
            var string = files.map(function (file) {
                pre = '';

                var indent = '-  ';

                if (lastPos === file.position) {
                    if (lastParent !== file.parent) {
                        pre = indent + file.parent + '\n';
                    }

                } else {
                    if (file.position > (lastPos + 1)) {
                        lastPos++;
                    } else {
                        lastPos = file.position;
                    }

                    for (var i = lastPos; i > 1; i--) {
                        indent = '    ' + indent;
                    }

                    pre = indent + file.parent + '\n';
                    lastParent = file.parent;

                }

                return util.format(pre + indent + '[%s](%s)', file.name, file.path);

            }).join('\n');

            callback(string);
        });

        return callback;
    }
};
