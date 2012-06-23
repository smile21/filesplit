/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var fs   = require('fs');
var Util = require('util');

var iError = function (name, message) {
  var _me   = new Error(message);
  _me.name  = name.toString().trim();
  return _me;
};

exports.create = function (flist, prefix, options) {

  var _result   = {};

  /**
   * @ on complete
   */
  var _complete = function (error, filelist) {
  };

  /**
   * @ start to split a new file
   */
  var start = function (i) {
    var _fn = flist[i];

    if (!flist[i + 1]) {
      return _complete(null, _result);
    }

    start(i + 1);
  };

  return function (callback) {
    _complete = callback;
    if (!Array.isArray(flist) || !flist[0]) {
      return _complete(iError('EmptyFileList', 'file list is required.'));
    }
    start(0);
  };
};

