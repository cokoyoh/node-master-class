const http = require('http');
const url = require('url');

const server = http.createServer((req, res ) => {
  const parsedUrl = url.parse(req.url);
  
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // send the response
  res.end('hello world\n');

  // log the request path
  console.log(`Request received on path: ${trimmedPath}`);
});

server.listen(3000, () => {
  console.log(`server listening on localhost:3000...`);
});