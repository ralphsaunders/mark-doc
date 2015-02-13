var markDoc = require('./markdoc'),
    fs = require('fs');

markDoc.asMarkdown(null, function(string) {
    fs.writeFile('test.md', string, function(err) {
        if(err) throw err;

        console.log('File written');
    });
});
