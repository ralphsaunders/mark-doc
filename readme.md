markdoc
=======

Crawls directories for markdown files.

## Installation

    npm install markdoc --save

## Usage

markdoc can return filtered files as markdown in a string.

    var markdoc = require('./markdoc'),
        fs = require('fs');

    markdoc.asMarkdown(null, function(string) {
        fs.writeFile('test.md', string, function(err) {
            if(err) throw err;

            console.log('File written');
        });
    });

markdoc can return filtered files as an array of objects.

    var markdoc = require('./markdoc'),
        fs = require('fs');

    markdoc.asArray(null, function(arr) {
        console.log(arr);
    });

## Release

* 0.0.1 Initial Release
