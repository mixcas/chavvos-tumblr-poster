var tumblr = require('tumblr.js'),
    chokidar = require('chokidar'),
    fs = require('fs');


// SET UP SOME VARIABLES FROM THE EN
var oauth = {
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
      token: process.env.TOKEN,
      token_secret: process.env.TOKEN_SECRET
    },
    blogName = process.env.BLOG;

// CONNECT TO TUMBLR
var blog = tumblr.createClient(oauth);

blog.userInfo(function(error, data) {
  if (error) {
    console.log(error);
  }
  console.log(data);
  console.log(data.user.blogs);
});

var watcher = chokidar.watch('./new', {
  ignored: '*.DS_Store',
  ignoreInitial: true,
  persistent: true
});

watcher.on('add', function(path) { 
  console.log('File', path, 'has been added'); 

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

  if(/\.gif/.exec(path) !== null) {
    console.log(path, 'is a gif');
    fs.readFile(path, 'base64', function(err, data) {
      if (err) throw err;

      var image = convertForTumblr(data, false);
      blog.photo(blogName, {
        source: image,
        caption: '<a href="http://chat.chavvos.com/">http://chat.chavvos.com</a>',
        link: 'http://chat.chavvos.com/',
        tags: '#CHAVVOS'
      }, function(err, result) {
        if (err) throw error;

        console.log('POSTED TO TUMBLR AS IMAGE. ID:');
        console.log(result);

      });
    });
  }
});

var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
function base64_decode(input){
  var output = new Array();
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;

  var orig_input = input;
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  if (orig_input != input)
    alert ("Warning! Characters outside Base64 range in input string ignored.");
  if (input.length % 4) {
    alert ("Error: Input length is not a multiple of 4 bytes.");
    return "";
  }

  var j=0;
  while (i < input.length) {

    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output[j++] = chr1;
    if (enc3 != 64)
      output[j++] = chr2;
    if (enc4 != 64)
      output[j++] = chr3;

  }
  return output;
}

// takes hex data with no seperator
function convert(data){

  // Now that we have raw hex data lets convert it
  // Each hex value is 2 characters
  var newhex = '';
  for(var i=0; i < data.length; i+=2){

    var substr = data.substr(i, 2);
    var val = parseInt(substr, 16); 

    if ((val <=46 && val >= 45) || (val <=57 && val >= 48) || (val <=90 && val >= 65) || (val == 95) || (val <=122 && val >= 97)) {
      newhex += String.fromCharCode(val);
    }else{
      newhex += '%' + substr.toUpperCase();
    }   

  }

  // dont convert tildes
  newhex = newhex.replace(/\%7E/g,'~');

  return newhex;
}

// http://tomeko.net/online_tools/base64.php
// Base64 to hex
var hD='0123456789ABCDEF';
function dec2hex(d){
  var h = hD.substr(d&15,1);
  while (d>15) {
    d>>=4;
    h=hD.substr(d&15,1)+h;
  }
  return h;
}

function convertForTumblr(imgURI,sep){
  var output = base64_decode(imgURI);
  var separator = "";
  if (sep){separator = "\\x";}
  var hexText = "";
  for (i=0; i<output.length; i++) {
    hexText = hexText + separator + (output[i]<16?"0":"") + dec2hex(output[i]);
  }

  var tumblrImage = convert(hexText);

  return tumblrImage;

}
