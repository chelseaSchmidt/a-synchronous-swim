
const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const server = require('./mockServer');
const messageQueue = require('../js/messageQueue.js');
const formidable = require('formidable');
const httpHandler = require('../js/httpHandler');



describe('server responses', () => {

  it('should respond to a OPTIONS request', (done) => {
    let {req, res} = server.mock('/', 'OPTIONS');

    httpHandler.router(req, res);
    expect(res._responseCode).to.equal(200);
    expect(res._ended).to.equal(true);
    expect(res._data.toString()).to.be.empty;

    done();
  });

  it('should respond to a GET request for a swim command', (done) => {
    let {req, res} = server.mock('/', 'GET');
    //add message manually to queue instead of by keypress
    messageQueue.enqueue('up');

    //set up place to store dequeued data
    let dequeued;

    httpHandler.router(req, res, (data) => {
      dequeued = data;
    }); //<----pass in callback to grab dequeued data and store
    expect(res._responseCode).to.equal(200);
    expect(res._ended).to.equal(true);
    expect(dequeued).to.equal('up');//<--test stored value above

    done();
  });

  it('should respond with 404 to a GET request for a missing background image', (done) => {
    httpHandlerTemp = httpHandler.backgroundImageFile;
    httpHandler.backgroundImageFile = path.join('.', 'spec', 'missing.jpg');
    let {req, res} = server.mock('/background', 'GET');

    httpHandler.router(req, res, (res) => {
      expect(res._responseCode).to.equal(404);
      expect(res._ended).to.equal(true);
      httpHandler.backgroundImageFile = httpHandlerTemp;
      done();
    });

  });

  it('should respond with 200 to a GET request for a present background image', (done) => {
    let {req, res} = server.mock('/background', 'GET');

    httpHandler.router(req, res, (res) => {
      expect(res._responseCode).to.equal(200);
      done();
    });
  });

  var postTestFile = path.join(__dirname, 'water-lg.jpg');

  it('should respond to a POST request to save a background image', (done) => {
    fs.readFile(postTestFile, (err, fileData) => {
      httpHandlerTemp = httpHandler.backgroundImageFile;
      httpHandler.backgroundImageFile = path.join(__dirname, 'temp.jpg');
      let {req, res} = server.mock('/background', 'POST', fileData);

      httpHandler.router(req, res, (resp) => {
        expect(resp._responseCode).to.equal(201);
        expect(resp._ended).to.equal(true);
        httpHandler.backgroundImageFile = httpHandlerTemp;
        done();
      });
    });
  });

  it('should send back the previously saved image', (done) => {
    fs.readFile(postTestFile, (err, fileData) => {
      httpHandler.backgroundImageFile = path.join('.', 'spec', 'temp.jpg');
      let post = server.mock('FILL_ME_IN', 'POST', fileData);

      httpHandler.router(post.req, post.res, () => {
        let get = server.mock('FILL_ME_IN', 'GET');
        httpHandler.router(get.req, get.res, () => {
          expect(Buffer.compare(fileData, get.res._data)).to.equal(0);
          done();
        });
      });
    });
  });
});
