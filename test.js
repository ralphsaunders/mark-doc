var markDoc = require('./markdown-crawler'),
    fs = require('fs');

markDoc.asMarkdown(null, function(string) {
    fs.writeFile('test.md', string, function(err) {
        if(err) throw err;

        console.log('File written');
    });
});
