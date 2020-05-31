const fs = require('fs');
const path = require('path');
const headers = require('./cors');
const multipart = require('./multipartUtils');
const handler = require('./keypressHandler.js');
const q = require('./messageQueue.js');
const formidable = require('formidable');
const querystring = require('querystring');

// Path for the background image ///////////////////////
module.exports.backgroundImageFile = path.join(__dirname, 'background.jpg');
////////////////////////////////////////////////////////

let messageQueue = null;
module.exports.initialize = (queue) => {
  messageQueue = queue;
};

module.exports.router = (req, res, next = ()=>{}) => {
  console.log('Serving request type ' + req.method + ' for url ' + req.url);


  if (req.url === '/background') {
    //GET BACKGROUND===========================================================
    if (req.method === 'GET') {

      if ( !( fs.existsSync(module.exports.backgroundImageFile) ) ) {
        res.writeHead(404, {
          'Content-Type': 'image/jpeg',
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
          "access-control-allow-headers": "*",
          "access-control-max-age": 10
        });
        res.end();
        next(res);
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
        "access-control-allow-headers": "*",
        "access-control-max-age": 10
      });
      let readStream = fs.createReadStream(module.exports.backgroundImageFile);
      readStream.pipe(res);
      next(res);
      return;
    }
  }
  //POST BACKGROUND============================================================
  if (req.method === 'POST'){
    console.log(req._postData); //--> this is buffer data from spec
    let imageString = '';
    req.on('data', chunk => {
      imageString += chunk.toString('base64');
    });
    req.on('end', () => {
      console.log(imageString);
      fs.writeFile('test.jpg', imageString, 'base64', (err) => {
        if (err) {
          console.log('write error');
        } else {
          console.log('written');
        }
      });
    });
    const form = formidable();
    form.parse(req, (err, fields, files) => {
      if(err) {
        res.writeHead(400, headers);
        res.end();
        return;
      }
      let file = files['file'];
      let oldPath = file.path;
      let newPath = path.join(__dirname, 'background.jpg');
      fs.rename(oldPath, newPath, (err)=> {
        if(err){
          res.writeHead(400, headers);
          res.end();
          return;
        }
      });
    });
    res.writeHead(201, headers);
    res.end();
    return;
  }
  //OPTIONS REQUEST============================================================
  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end('');

  //GET SWIM COMMANDS==========================================================
  } else if (req.method === 'GET') {
    res.writeHead(200, headers);
    var dequeued = q.dequeue();
    res.end(dequeued);
    next(dequeued); // invoke next() at the end of a request to help with testing!

  //ALL OTHER REQUESTS=========================================================
  } else {
    res.writeHead(200, headers);
    res.end('Not an implemented method - please use OPTIONS, GET, or POST');
  }

};
