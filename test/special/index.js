// require core module
require('fs');

// require a module from inside a valid dependency
// NOT RECOMMENDED but we need to handle it
require('restify/lib/router');

// require a module with a "." in the name
require('big.js');
