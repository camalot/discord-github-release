'use strict';

const xconfig = require('../../config');
const merge = require('merge');

let config = {
  "github-release": {
    route: ['/github/release']
  }

};

module.exports = merge(xconfig, config);
