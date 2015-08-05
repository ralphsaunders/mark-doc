var walk = require('walk'),
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

/*
 * Usage: repeatString("abc", 2) == "abcabc"
 * From: http://stackoverflow.com/a/17800645
 */
function repeatString(x, n) {
    var s = '';
    for (;;) {
        if (n & 1) s += x;
        n >>= 1;
        if (n) x += x;
        else break;
    }
    return s;
}

module.exports = {
    asArray: function (path, callback) {
        // Use current path as a default
        if (!path) {
            path = __dirname
        }

        // Initiate walker
        var walker = walk.walk(path, {
            followLinks: false,
            filters: blacklist
        });

        var collection = [];

        walker.on('file', function (root, stat, next) {
            if (fileTypes.indexOf(popExt(stat.name)) >= 0) {
                var file = Path.relative(path, root).replace(/\\+/g, '/').split('/');
                collection.push({
                    name: stat.name,
                    path: Path.normalize(Path.relative(__dirname, root) + '/' + stat.name),
                    depth: file.length,
                    parentDir: file[file.length - 1],
                    file: file
                });
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
            var lastParent = '',
                craftedString;

            var string = files.map(function (file) {
                craftedString = '';

                if(lastParent !== file.parentDir) {
                    // Creates heading
                    craftedString = repeatString('#', file.depth) + ' ' + file.parentDir + '\n';

                    // Dirty hack to ensure empty directories are included in
                    // heading hierarchy
                    if(file.path.split('/')[file.depth - 2] !== lastParent) {
                        if(file.depth -1 > 0) {
                            craftedString = repeatString('#', file.depth - 1) + ' ' + file.path.split('/')[file.depth - 2] + '\n' + craftedString;
                        }
                    }
                }

                lastParent = file.parentDir;

                return util.format(craftedString + '[%s](%s)', file.name, file.path);

            }).join('\n');

            callback(string);
        });

        return callback;
    }
};
