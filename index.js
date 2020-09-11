const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');

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

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', (data) => {
    buffer += decoder.write(data);
  })

  req.on('end', () => {
    buffer += decoder.end()

    // chose the handler to handle the request, if one is not found use the not found  handler
    const chosenHandler = router[trimmedPath] ?? router.notFound;

    //construct the data object to send to the handler
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer
    }

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      // use the status code called back by the handler or default to 200
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

      // use the payload called by the handler or default to {}
      payload = typeof (payload) == 'object' ? payload : {};

      // convert payload to strung
      const payloadString = JSON.stringify(payload);

      // return the response
      res.writeHead(statusCode);
      res.end(payloadString); 
      
      // log the request path
      console.log('Returning this response: ', statusCode, payloadString);
    })
  })
});

server.listen(3000, () => {
  console.log(`server listening on localhost:3000...`);
});

//Define handlers, lately known as controllers
const handlers = {};

handlers.sample = (data, callback) => {
  // callback a http status code, and a payload object
  callback(406, { 'name': 'sample controller' });
};

// Not found controller
handlers.notFound = (data, callback) => {
  callback(404);
};

// Define a request router
const router = {
  'sample': handlers.sample,
  'notFound' : handlers.notFound
};