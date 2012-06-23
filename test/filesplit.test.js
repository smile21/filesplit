/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var splitor = require(__dirname + '/../');

describe('file split', function () {

  /* {{{ should_callback_error_when_empty_filelist() */
  it('should_callback_error_when_empty_filelist', function (done) {
    var split = splitor.create();
    split(function (error, result) {
      should.ok(error);
      error.should.have.property('name', 'EmptyFileList');
      done();
    });
  });
  /* }}} */

});

