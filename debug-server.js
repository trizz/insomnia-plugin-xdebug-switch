const http = require('http');

http.createServer(function (request, response) {
  const cookies = (() => {
    // Function based on https://stackoverflow.com/a/3409200.
    let list = {},
      rc = request.headers.cookie;

    rc && rc.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
  })();

  response.write('RECEIVED COOKIES:\n\n');

  for (let key in cookies) {
    if (!cookies.hasOwnProperty(key)) continue;
    response.write(key + " = " + cookies[key]);
    response.write('\n');
  }

  response.end();
}).listen(1602);

console.log('Server running at http://127.0.0.1:1602/');
console.log('You can make any request to this URL to validate the Xdebug cookies.');
