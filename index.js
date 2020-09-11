const http = require('http');
const url = require('url');

const server = http.createServer((req, res ) => {
  const parsedUrl = url.parse(req.url);
  
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  //Get the query string as an object
  const queryStringObject = parsedUrl.query;

  //Get the http method
  const method = req.method.toLowerCase();

  // Get the headers as an object
  const headers = req.headers;

  // send the response
  res.end('hello world\n');

  // log the request path
  console.log('Request received with these headers: ', headers);
});

server.listen(3000, () => {
  console.log(`server listening on localhost:3000...`);
});