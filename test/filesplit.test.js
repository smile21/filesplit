/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var splitor = require(__dirname + '/../');

describe('file split', function () {

  /* {{{ should_result_empty_when_empty_filelist() */
  it('should_result_empty_when_empty_filelist', function (done) {
    var split = splitor.create([]);
    split(function (error, result) {
      should.ok(!error);
      var i = 0;
      for (var k in result) {
        ++i;
      }
      i.should.eql(0);
      done();
    });
  });
  /* }}} */

  /* {{{ should_open_file_error_works_fine() */
  it('should_open_file_error_works_fine', function (done) {
    var caller  = splitor.create(['/i/am/not/exists']);
    caller(function (error, result) {
      should.ok(error);
      error.should.have.property('name', 'FileOpenError');
      error.message.should.include('/i/am/not/exists');
      done();
    });
  });
  /* }}} */

});

