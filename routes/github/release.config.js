'use strict';

const xconfig = require('../../config');
const merge = require('merge');

let config = {
  "github-release": {
    route: ['/github/release'],
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET
  }

};

module.exports = merge(xconfig, config);
