const http = require('http');
const url = require('url');

const server = http.createServer((req, res ) => {
  const parsedUrl = url.parse(req.url);
  
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  //Get the http method
  const method = req.method.toLowerCase();

  // send the response
  res.end('hello world\n');

  // log the request path
  console.log(`Request received on path: ${trimmedPath} with method: ${method}`);
});

server.listen(3000, () => {
  console.log(`server listening on localhost:3000...`);
});