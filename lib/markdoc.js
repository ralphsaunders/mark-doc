var walk = require('walk'),
    util = require('util'),
    Path = require('path'),
    // Markdown filetypes
    fileTypes = [
        'md',
        'mkd',
        'markdown'
    ],
    // Default backlist
    blacklist = [
        'node_modules',
        '.git'
    ];

/**
 * Pop extension
 *
 * Returns extension for filename
 *
 * @return string
 */
function popExt(filename) {
    return filename.split('.').pop();
}

/*
 * Usage: repeatString("abc", 2) == "abcabc"
 * From: http://stackoverflow.com/a/17800645
 *
 * @return string
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

/**
 * Crawl path
 *
 * Crawls path for markdown files.
 * Ignores directories passed in docIgnore array.
 *
 * @return cb(array)
 */
function crawlPath(path, docIgnore, cb) {
    if(!path) {
        throw new ReferenceError('How can we crawl anything without a path?');
    }

    if(!Array.isArray(docIgnore)) {
        throw new TypeError('Ignored directories need to be provided as array');
    }

    if(!docIgnore.length) {
        docIgnore = blacklist;
    }

    var collection = [];

    // Initiate walker
    var walker = walk.walk(path, {
        followLinks: false,
        filters: docIgnore
    });

    // On every file
    walker.on('file', function (root, stat, next) {
        // If it's a markdown type file
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
        cb(collection);
    });
}

/**
 * Markdown format for file
 *
 * Returns markdown string containing relative link to file. Will also prepend
 * file with a heading matching parent directory name. This has the effect of
 * grouping files by directory in the resulting output.
 *
 * @return string
 */
function markdownFormat(file) {
    this.craftedString = '';

    if(this.lastParent !== file.parentDir) {
        // Creates heading
        this.craftedString = repeatString('#', file.depth) + ' ' + file.parentDir + '\n';

        // Dirty hack to ensure empty directories are included in
        // heading hierarchy
        if(file.path.split('/')[file.depth - 2] !== this.lastParent) {
            if(file.depth -1 > 0) {
                this.craftedString = repeatString('#', file.depth - 1) + ' ' +
                    file.path.split('/')[file.depth - 2] + '\n' +
                    this.craftedString;
            }
        }
    }

    this.lastParent = file.parentDir;

    return util.format(this.craftedString + '[%s](%s)', file.name, file.path);
}

module.exports = {
    /**
     * markdoc.asArray
     *
     * Crawls path and returns array of files in callback function
     *
     * @return cb(array)
     */
    asArray: function (path, docIgnore, cb) {
        if (!path) {
            path = __dirname;
        }

        crawlPath(path, docIgnore, function(files) {
            cb(files);
        });

        return cb;
    },

    /**
     * markdoc.asMarkdown
     *
     * Wraps asArray and then formats output as markdown.
     *
     * @return cb(string)
     */
    asMarkdown: function (path, docIgnore, cb) {
        this.asArray(path, docIgnore, function (files) {
            var lastParent = '',
                craftedString = '';

            cb(
                files.map(markdownFormat, lastParent, craftedString)
                    .join('\n')
            );
        });

        return cb;
    }
};
