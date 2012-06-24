/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var splitor = require(__dirname + '/../');

var cleanOutput = function (callback) {
  require('child_process').exec('/bin/rm -f ' + __dirname + '/res/output*', {}, callback);
};

describe('file split', function () {

  beforeEach(function (done) {
    cleanOutput(done);
  });

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

  /* {{{ should_file_split_works_fine() */
  it('should_file_split_works_fine', function (done) {
    var _input  = [__dirname + '/res/test_input_1.txt', __dirname + '/res/test_input_2.txt'];
    var caller  = splitor.create(_input, __dirname + '/res/output', {
      'EOF' : String.fromCharCode(1),
        'bufferSize'    : 1024,
        'maxLines'      : 30,
        'routes'    : {'thedate' : 0},
        'fields'    : [1,0,4,3],
    });
    caller(function (error, result) {
      should.ok(!error);
      JSON.stringify(result).should.eql(JSON.stringify({
        'thedate=20120623'  : [
      {'file' : __dirname + '/res/output.thedate=20120623.' + process.pid + '_0',   'rows'  : 30},
        {'file' : __dirname + '/res/output.thedate=20120623.' + process.pid + '_3', 'rows'  : 12},
        ],
        'thedate=20120624'  : [
      {'file' : __dirname + '/res/output.thedate=20120624.' + process.pid + '_1', 'rows' : 30},
      {'file' : __dirname + '/res/output.thedate=20120624.' + process.pid + '_4', 'rows' : 10},
        ],
        'thedate=20120625'  : [
      {'file' : __dirname + '/res/output.thedate=20120625.' + process.pid + '_2', 'rows' : 28},
        ],
      }));
      done();
    });
  });
  /* }}} */

});

