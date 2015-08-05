var markDoc = require('./lib/markdoc'),
    fs = require('fs'),
    blacklist = [
        'node_modules',
        '.git',
        'bower_components'
    ];

markDoc.asMarkdown(__dirname, blacklist, function(string) {
    fs.writeFile('TOC.md', string, function(err) {
        if(err) throw err;

        return true;
    });
});
