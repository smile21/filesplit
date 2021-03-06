[![Build Status](https://secure.travis-ci.org/aleafs/filesplit.png?branch=master)](http://travis-ci.org/aleafs/filesplit)

# About #
`filesplit` is a simple and high-speed text file splitor based on Node.js.
Always it has the same results as run command `cut -f x,x $filename[s]` before `split -n $rows` on Linux.

# Install #
```bash
$ npm install filesplit
```

# Usage #
```javascript
var splitor = require('filesplit');
var callor  = splitor.create([file1, file2, ..., filen], result_prefix);
callor(function (error, result) {
  console.log(result);
});
```

# Contributors #

Thanks goes to the people who have contributed code to this module, see the [GitHub Contributors page](https://github.com/iseeyou1987/filesplit/graphs/contributors).

# License #

(The MIT License)

  Copyright (c) 2012 iseeyou1987 and other filesplit contributors

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
      'Software'), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
