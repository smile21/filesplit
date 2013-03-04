/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var should  = require('should');
var splitor = require(__dirname + '/../');
var fs = require('fs');

var cleanOutput = function (callback) {
  require('child_process').exec('/bin/rm -f ' + __dirname + '/res/output*', {}, callback);
};

describe('readstream for multibyte characters', function () {


  /* {{{ should_read_wrong_character_when_not_set_encoding() */
  it('should_read_wrong_character_when_not_set_encoding', function (done) {
    var reader  = fs.createReadStream(__dirname + '/res/test_multibyte_content.txt', {
      'bufferSize' : 15,
    });

    reader.on('end', function () {
      done();
    });

    var rows    = 0;
    reader.on('data', function (data) {
      data  = data.toString();
      rows += 1;
      switch (rows) {
        case 1:
          data.should.not.eql('1\tabcd\t我是a');
          break;

        case 2:
          data.should.not.eql('中文\n2\tabcd\t');
          break;

        default:
          break;
      }
    });
  });
  /* }}} */

  /* {{{ should_read_correct_character_when_set_encoding() */
  it('should_read_correct_character_when_set_encoding', function (done) {
    var reader  = fs.createReadStream(__dirname + '/res/test_multibyte_content.txt', {
      'encoding' : 'utf-8',
        'bufferSize' : 15,
    });

    reader.on('end', function () {
      done();
    });

    var rows    = 0;
    reader.on('data', function (data) {
      rows += 1;
      switch (rows) {
        case 1:
          data.should.eql('1\tabcd\t我是a');
          break;

        case 2:
          data.should.eql('中文\n2\tabcd\t');
          break;

        default:
          break;
      }
    });
  });
  /* }}} */

});

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
        'filters'   : [splitor.trim],
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

  it('should_field_handle_works_fine', function (done) {
    var _input  = [__dirname + '/res/test_input_1.txt', __dirname + '/res/test_input_2.txt'];
    var caller  = splitor.create(_input, __dirname + '/res/output', {
      'EOF' : String.fromCharCode(1),
      'bufferSize'    : 1024,
      'maxLines'      : 30,
      'routes'    : {'thedate' : 0},
      'fields'    : [1,0,4,3],
      'filters'   : [splitor.trim],
      'handles'   : [,,,_S]
    });
    function _S(str) {
      return ['$', str, '$'].join('');
    }
    caller(function (error, result) {
      should.ok(!error);
      var _content = fs.readFileSync(result['thedate=20120623'][0].file).toString().trim();
      _content.split('\n').forEach(function (l) {
        var fields = l.split(String.fromCharCode(1));
        fields.pop().should.match(/^\$.*\$$/);
      });
      done();
    });
  });

  it('should_field_handle_works_fine_when_no_fields_given', function (done) {
    var _input  = [__dirname + '/res/test_input_1.txt', __dirname + '/res/test_input_2.txt'];
    var caller  = splitor.create(_input, __dirname + '/res/output', {
      'EOF' : String.fromCharCode(1),
      'bufferSize'    : 1024,
      'maxLines'      : 30,
      'routes'    : {'thedate' : 0},
      'filters'   : [splitor.trim],
      'handles'   : [,,,,_S]
    });
    function _S(str) {
      return ['$', str, '$'].join('');
    }
    caller(function (error, result) {
      should.ok(!error);
      var _content = fs.readFileSync(result['thedate=20120623'][0].file).toString().trim();
      _content.split('\n').forEach(function (l) {
        var fields = l.split(String.fromCharCode(1));
        fields.pop().should.match(/^\$.*\$$/);
      });
      done();
    });
  });
});

