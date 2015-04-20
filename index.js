var tumblr = require('tumblr.js');
var imgur = require('imgur');
var chokidar = require('chokidar');
var fs = require('fs');

// SET UP SOME VARIABLES FROM THE EN
var tumblrOAuth = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  token: process.env.TOKEN,
  token_secret: process.env.TOKEN_SECRET,
};
var blogName = process.env.BLOG;

// CONNECT TO TUMBLR
var blog = tumblr.createClient(tumblrOAuth);

blog.userInfo(function(error, data) {
  if (error) {
    console.log(error);
  }

  console.log(data);
});

var watcher = chokidar.watch('./new', {
  ignored: '*.DS_Store',
  ignoreInitial: true,
  persistent: true
});

watcher.on('add', function(path) {
  if (/\.gif/.exec(path) !== null) {
    console.log('File', path, 'has been added');

    console.log('Uploading ' + path + ' to imgur…');
    imgur.uploadFile(path)
    .then(function(response) {
      blog.photo(blogName, {
        source: response.data.link,
        caption: '<a href="http://chat.chavvos.com/">http://chat.chavvos.com</a>',
        link: 'http://chat.chavvos.com/',
        tags: '#CHAVVOS'
      }, function(err, result) {
        if (err)
          console.log(err);
        else
          console.log('Posted to tumblr as image. ID:');
        console.log(result);

      });
    })
    .catch(function(err) {
      console.log(err.message);
    });
  }

  /*
  blog.text(blogName, {
    body: path
  }, function(error, result) {
    if (error) {
      console.log(error);
    }
    console.log('POSTED TO TUMBLR AS TEXT. ID:');
    console.log(result);
  });
*/
});
