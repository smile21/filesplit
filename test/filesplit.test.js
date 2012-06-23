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
      error.should.have.property('name', 'StreamReadError');
      error.message.should.include('/i/am/not/exists');
      done();
    });
  });
  /* }}} */

  it('should_file_split_works_fine', function (done) {
    var _input  = [__dirname + '/test_input_1.txt', __dirname + '/test_input_2.txt'];
    var caller  = splitor.create(_input, __dirname + '/output/test_input', {
      'EOF' : String.fromCharCode(1),
        'bufferSize'    : 1024,
        'maxLines'      : 30,
        'routes'    : {'thedate' : 0},
        'fields'    : [1,0,4,3],
    });
    caller(function (error, result) {
      done();
    });
  });
});

