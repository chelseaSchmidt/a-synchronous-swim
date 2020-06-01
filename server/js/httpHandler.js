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
        res.writeHead(404, headers);
        res.end('image not found');
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
      readStream.on('end', () => {
        console.log('Image piped');
        next(res);
        res.end('Image piped');
      });

    }
    //POST BACKGROUND==========================================================
    if (req.method === 'POST'){

      //NON-MULTIPART DATA=====================================================
      if (req.headers === undefined) {
        console.log(req);
        let imageString = '';
        req.on('data', chunk => {
          imageString += chunk.toString('base64');
        });
        req.on('end', () => {
          fs.writeFile(module.exports.backgroundImageFile, imageString, 'base64', (err) => {
            if (err) {
              console.log('writeFile error on non-multipart image');
              res.writeHead(400, headers);
              res.end('writeFile error on non-multipart image');
              next(res);
              return;
            } else {
              console.log('non-multipart file written successfully');
              res.writeHead(201, headers);
              res.end('non-multipart file written successfully');
              next(res);
              return;
            }
          });
        });

      //MULTIPART DATA=========================================================
      } else if (req.headers['content-type'].indexOf('multipart/form-data') > -1) {
        let buffer = Buffer.alloc(0);
        req.on('data', chunk => {
          buffer = Buffer.concat([buffer, chunk]);
        });
        req.on('end', () => {
          let file = multipart.getFile(buffer);
          let fileData = file.data.toString('base64');
          fs.writeFile(module.exports.backgroundImageFile, fileData, 'base64', (err) => {
            if (err) {
              res.writeHead(400, headers);
              console.log('writeFile error on multipart image');
              res.end('writeFile error on multipart image');
              next(res);
              return;
            } else {
              res.writeHead(201, headers);
              console.log('multipart file written successfully');
              res.end('multipart file written successfully');
              next(res);
              return;
            }
          });
        });

      }
    }
  //OPTIONS REQUEST============================================================
  } else if (req.method === 'OPTIONS') {
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
