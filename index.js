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
   * @配置项
   */
  var _options  = {
    'EOL'   : String.fromCharCode(10),      /**<    \n  */
    'EOF'   : String.fromCharCode(9),       /**<    tab */
    'encoding'      : null,
    'bufferSize'    : 4 * 1024 * 1024,
    'maxLines'      : 2000000,
    'fields'        : [],
    'routes'        : {},
  };
  for (var key in options) {
    _options[key] = options[key];
  }

  /* {{{ function _buildRow() */

  if (!Array.isArray(_options.fields) || _options.fields.length < 1) {
    var _buildRow = new Function('row', Util.format("return row.join('%s');", _options.EOF));
  } else {
    var _temp = [];
    _options.fields.forEach(function (k) {
      _temp.push(Util.format('row[%d]', k));
    });
    var _buildRow = new Function('row', 'return ' + _temp.join(Util.format(" + '%s' + ", _options.EOF)) + ';');
  }

  /* }}} */

  /* {{{ function _getRoute() */

  var _temp = [];
  for (var k in _options.routes) {
    _temp.push(Util.format("'%s=' + row[%d]", k, _options.routes[k]));
  }
  if (1 > _temp.length) {
    var _getRoute = new Function('row', 'return "";');
  } else {
    var _getRoute = new Function('row', 'return ' + _temp.join(" + ',' + ") + ';');
  }

  /* }}} */

  /**
   * @文件切分结果
   */
  var _result   = {};

  /* {{{ function _createWriter() */
  var _createWriter = function (idx) {
    if (!_result[idx]) {
      _result[idx] = [];
    }

    var num = 0;
    for (var i in _result) {
      num += _result[i].length;
    }

    var _fn = Util.format('%s.%s.%d_%d', prefix, idx, process.pid, num);
    _result[idx].push(_fn);

    return fs.createWriteStream(_fn);
  };
  /* }}} */

  /**
   * @ on complete
   */
  var _complete = function (error, filelist) {
    if (error) {
      throw error;
    }
  };

  var _writer   = {};       /**<    写入句柄, 每个路由值对应一个    */
  var _wcache   = {};       /**<    缓冲对象, 每个路由值对应一个    */
  var _wlines   = {};       /**<    写入行数, 每个路由值对应一个    */

  var _readfile = function (fname) {

    if (!fname) {
      for (var idx in _wcache) {
        _writer[idx].end(_wcache[idx]);
        delete _wcache[idx];
      }
      return _complete(null, _result);
    }

    var reader  = fs.createReadStream(fname, {
      'flags'   : 'r',
        'mode'  : 0666,
        'encoding'  : _options.encoding,
        'bufferSize': _options.bufferSize,
    });
    reader.on('error', function (error) {
      _complete(iError('StreamReadError', error.stack));
    });

    var _tail = '';
    reader.on('data', function (data) {
      var rows  = (_tail + data).split(_options.EOL);
      _tail  = rows.pop();

      for (var i = 0, m = rows.length; i < m; i++) {
        var row = rows[i].split(_options.EOF);
        var idx = _getRoute(row);
        var txt = _buildRow(row) + _options.EOL;

        if (undefined === _wcache[idx]) {
          _wcache[idx]  = txt;
          _writer[idx]  = _createWriter(idx);
          _wlines[idx]  = 0;
        } else {
          _wcache[idx] += txt;
        }

        _wlines[idx]++;

        if (_wcache[idx].length >= _options.bufferSize || _wlines[idx] >= _options.maxLines) {
          _writer[idx].write(_wcache[idx]);
          _wcache[idx]  = '';
          if (_wlines[idx] >= _options.maxLines) {
            _writer[idx].end();
            _writer[idx] = _createWriter(idx);
            _wlines[idx] = 0;
          }
        }
      }
    });

    reader.on('end', function () {
      _readfile(flist.shift());
    });
  };

  return function (callback) {
    _complete = callback;
    if (!Array.isArray(flist)) {
      flist = [flist];
    }

    _readfile(flist.shift());
  };
};

