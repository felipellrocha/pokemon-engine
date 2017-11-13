require('babel-register');
require("babel-polyfill");

require('es6-promise').polyfill();
require('isomorphic-fetch');

require('./server.js');
