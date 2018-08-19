'use strict';

var should = require('should');
var sinon = require('sinon');
var MessagesController = require('../lib/messages');
var bitcore = require('bitcore-lib-mue');
var _ = require('lodash');

describe('Messages', function() {

  var privateKey = bitcore.PrivateKey.fromWIF('KgJ2MtbWfnm863aR9PhQkNyraVbgoEwGZrmsV7uKEioZycmSF1Xi');
  var address = '7XCv517xY6KpQ3pQzAjZf28UqBcRA4GjfF';
  var badAddress = '7RLkrBQ7LdJugWAotcu1VbwEYErDzVajSc';
  var signature = 'HBs9E60p/7oMKQw3x8lLZIq6MuQp84V8yUkDNiP09yDgFfQLbGQ7ZBbzX+mw9tL2krI/ynSTkFaV5rt5DC+dUyI=';
  var message = 'hello, world';

  it('will verify a message (true)', function(done) {

    var controller = new MessagesController({node: {}});

    var req = {
      body: {
        'address': address,
        'signature': signature,
        'message': message
      },
      query: {}
    };
    var res = {
      json: function(data) {
        data.result.should.equal(true);
        done();
      }
    };

    controller.verify(req, res);
  });

  it('will verify a message (false)', function(done) {

    var controller = new MessagesController({node: {}});

    var req = {
      body: {
        'address': address,
        'signature': signature,
        'message': 'wrong message'
      },
      query: {}
    };
    var res = {
      json: function(data) {
        data.result.should.equal(false);
        done();
      }
    };

    controller.verify(req, res);
  });

  it('handle an error from message verification', function(done) {
    var controller = new MessagesController({node: {}});
    var req = {
      body: {
        'address': badAddress,
        'signature': signature,
        'message': message
      },
      query: {}
    };
    var send = sinon.stub();
    var status = sinon.stub().returns({send: send});
    var res = {
      status: status,
    };
    controller.verify(req, res);
    status.args[0][0].should.equal(400);
    send.args[0][0].should.equal('Unexpected error: Checksum mismatch. Code:1');
    done();
  });

  it('handle error with missing parameters', function(done) {
    var controller = new MessagesController({node: {}});
    var req = {
      body: {},
      query: {}
    };
    var send = sinon.stub();
    var status = sinon.stub().returns({send: send});
    var res = {
      status: status
    };
    controller.verify(req, res);
    status.args[0][0].should.equal(400);
    send.args[0][0].should.match(/^Missing parameters/);
    done();
  });

});
