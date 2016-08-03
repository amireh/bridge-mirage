const supertest = require('supertest');
const connect = require('connect');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const api = require('../api');
const assert = require('assert');
const sinon = require('sinon');

describe('mirage API', function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('[GET] /mirage/ls', function() {
    it('works', function(done) {
      const app = connect();

      api(app, { bridgeBase: path.resolve(__dirname, '../../../../') });

      supertest(app.listen())
        .get('/mirage/ls')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, function(err, response) {
          assert(response.body.length > 0, 'It lists Bridge JS sources.');

          const vendorModules = response.body.filter(x =>x.match(/vendor/));
          assert.equal(vendorModules.length, 0, 'it filters vendor modules');

          const testModules = response.body.filter(x =>x.match(/__tests__/));
          assert.equal(testModules.length, 0, 'it filters test modules');

          done(err);
        })
      ;
    });
  });

  describe('[POST] /mirage/activate', function() {
    it('works', function(done) {
      const app = connect();

      sandbox.stub(fs, 'writeFileSync');

      app.use(bodyParser.json());
      api(app, { bridgeBase: path.resolve(__dirname, '../../../../') });

      supertest(app.listen())
        .post('/mirage/activate')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({
          filePath: 'foo',
          profile: 'react',
          params: {},
        })
        .expect(204, done)
      ;
    });
  });
});