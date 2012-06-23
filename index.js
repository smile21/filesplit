/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var fs   = require('fs');
var Util = require('util');

var iError = function (name, message) {
  var _me   = new Error(message);
  _me.name  = name.toString().trim();
  return _me;
};

exports.create = function (flist, prefix, options) {

  /**
   * @文件切分结果
   */
  var _result   = {};

  /**
   * @配置项
   */
  var _options  = {
    'bufferSize' : 4 * 1024 * 1024,
  };

  /**
   * @ on complete
   */
  var _complete = function (error, filelist) {
  };

  /**
   * @ start to split a new file
   */
  var _readfile = function (fname) {

    if (!fname) {
      return _complete(null, _result);
    }

    fs.open(fname, 'r', 0666, function (error, fd) {
      if (error) {
        return _complete(iError('FileOpenError', error.stack));
      }

      var chunk = new Buffer(_options.bufferSize);
      var _read = function () {
        fs.read(fd, chunk, 0, _options.bufferSize, -1, function (error, size, data) {
          if (error) {
            fs.closeSync(fd);
            fd  = null;
            return _complete(iError('FileReadError', error.stack));
          }

          if (size < _options.bufferSize) {
            fs.closeSync(fd);
            fd  = null;
            _readfile(flist.shift());
          }
        });
      };
    });
  };

  return function (callback) {
    _complete = callback;
    _readfile(flist.shift());
  };
};

