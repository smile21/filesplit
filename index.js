/* vim: set expandtab tabstop=2 shiftwidth=2 foldmethod=marker: */

var fs   = require('fs');
var Util = require('util');

var iError = function (name, message) {
  var _me   = new Error(message);
  _me.name  = name.toString().trim();
  return _me;
};

exports.trim = function (str) {
  var m = str.length;
  for (var i = 0; i < m && str.charCodeAt(i) < 33; i++) {
  }

  for (var j = m - 1; j > i && str.charCodeAt(j) < 33; j--) {
  }

  return str.substring(i, j + 1);
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
    'filters'       : [],
    'handles'       : [],                   /**<    产出列处理规则 */
    'fields'        : [],
    'routes'        : {},
  };
  for (var key in options) {
    _options[key] = options[key];
  }

  /* {{{ function _buildRow() */
  if (!Array.isArray(_options.fields) || _options.fields.length < 1) {
    function _deal(row) {
      row.forEach(function (f, i) {
        if (handles[i]) {
          row[i] = (handles[i])(f);
        }
      });
    }
    var _buildRow = new Function(['row', 'handles'], _deal.toString() + '\n_deal(row);\n' + Util.format("return row.join('%s');", _options.EOF));
  } else {
    function _fn(f, i) {
      if (handles[i]) {
        return (handles[i])(f);
      }
      return f;
    }
    var _temp = [];
    _options.fields.forEach(function (k, i) {
      _temp.push(Util.format('_fn(row[%d], %d)', k, i));
    });
    var _buildRow = new Function(['row', 'handles'], _fn.toString() + '\nreturn ' + _temp.join(Util.format(" + '%s' + ", _options.EOF)) + ';');
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
    _result[idx].push({'file' : _fn, 'rows' : 0});

    var _me = fs.createWriteStream(_fn);
    _me.on('error', function (error) {
      _complete(iError('StreamWriteError', error.stack));
    });

    return _me;
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

  /* {{{ function _afterRead() */

  var _tail = '';
  var _afterRead  = function (data) {
    if (_tail.length === 0 && data.length === 0) {
      return;
    }
    var rows  = (_tail + data).split(_options.EOL);
    if (data.length) {
      _tail = rows.pop();
    }

    for (var i = 0, m = rows.length; i < m; i++) {
      var row = rows[i].split(_options.EOF);
      _options.filters.forEach(function (fn, i) {
        if (fn) {
          row[i] = fn(row[i]);
        }
      });

      var idx = _getRoute(row);
      var txt = _buildRow(row, _options.handles) + _options.EOL;

      if (undefined === _wcache[idx]) {
        _wcache[idx]  = txt;
        _writer[idx]  = _createWriter(idx);
        _wlines[idx]  = 1;
      } else {
        _wcache[idx] += txt;
        _wlines[idx] += 1;
      }

      if (_wcache[idx].length >= _options.bufferSize || _wlines[idx] >= _options.maxLines) {
        _writer[idx].write(_wcache[idx]);
        _wcache[idx]  = '';
        if (_wlines[idx] >= _options.maxLines) {
          _writer[idx].end();
          (_result[idx][_result[idx].length - 1]).rows = _wlines[idx];
          _writer[idx] = _createWriter(idx);
          _wlines[idx] = 0;
        }
      }
    }
  };
  /* }}} */

  var _readfile = function (fname) {

    if (!fname) {
      for (var idx in _wcache) {
        _writer[idx].end(_wcache[idx]);
        (_result[idx][_result[idx].length - 1]).rows = _wlines[idx];
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
    reader.on('data', _afterRead);
    reader.on('end', function () {
      _afterRead('');
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

