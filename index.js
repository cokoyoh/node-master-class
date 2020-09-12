const http = require('http');
const https = require('https');
const url = require('url');
const { StringDecoder } = require('string_decoder');
const config = require('./lib/config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// Instatiating the http server
const httpServer = http.createServer((req, res ) => {
  unifiedServer(req, res);
});

// starting the http server
httpServer.listen(config.httpPort, () => {
  console.log(`server listening on port: ${config.httpPort}`);
});

// Instatiating https server
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpsServerOptions, (req, res ) => {
  unifiedServer(req, res);
});

// starting the http server
httpsServer.listen(config.httpsPort, () => {
  console.log(`server listening on port: ${config.httpsPort}`);
});

// all the server logic for pth http and https server
const unifiedServer = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  //Get the query string as an object
  const query = parsedUrl.query;

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
      query,
      method,
      headers,
      payload: helpers.parseJsonToObject(buffer)
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
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      
      // log the request path
      console.log('Returning this response: ', statusCode, payloadString);
    })
  });
}

// Define a request router
const router = {
  'notFound': handlers.notFound,
  'ping': handlers.ping,
  'users': handlers.users
};