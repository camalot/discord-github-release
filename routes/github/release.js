"use strict";
const { json } = require('body-parser');
const express = require('express');
const config = require('./release.config.js')
const debug = require('debug')('discord-github-release:release');
const router = express.Router();
const request = require("axios");
const crypto = require('crypto');
const async = require("async");

// https://discord.com/developers/docs/resources/webhook#execute-webhook-jsonform-params

router.get("/", (req, resp, next) => {
  return resp.json(req.body);
})

function verifyPostData(req, res, next) {
  const payload = JSON.stringify(req.body)
  if (!payload) {
    return next(new Error('Request body empty'));
  }

  const sigHeader = "X-Hub-Signature";
  const sig = req.get(sigHeader) || ''
  const hmac = crypto.createHmac('sha1', config["github-release"].webhookSecret)
  const digest = Buffer.from('sha1=' + hmac.update(payload).digest('hex'), 'utf8')
  const checksum = Buffer.from(sig, 'utf8')
  if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
    return next(new Error(`Request body digest (${digest}) did not match ${sigHeader} (${checksum})`))
  }
  return next()
}

router.post("/", verifyPostData, (req, resp, next) => {
  if (!req.body) {
    console.log('POST Request received, but no body!');
    return _respond(resp, "skipping release that is not published");
  }
  let payload = req.body;

  if (payload.hook) {
    console.log("initialize hook");
    return _respond(resp, "Successfully Registered Hook");
  }

  if (payload.release.draft || payload.action !== "published") {
    console.log("skipping release that is not published");
    return _respond(resp, "skipping release that is not published");
  }

  let dpayload = _createDiscordWebhookPayload(payload);
  async.each(config.discord.webhooks, (hook, nextItem) => {
    request.post(hook, dpayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        return nextItem();
      })
      .catch((err) => {
        return nextItem(err);
      });
  }, (err) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    return _respond(resp, "Notify Discord of Release");
  })
});


function _respond(res, message) {
  if (res && message) {
    if (message.isArray) {
      return res.json({ messages: JSON.stringify(message) });
    } else {
      return res.json({ message: message });
    }
  }
}

function _createDiscordWebhookPayload(payload) {
  let outPayload = {
    // nonce: payload.release.node_id,
    embeds: [_createEmbed(payload)],
    // allowed_mentions: ["SOFTWARE UPDATES", "everyone"]
  };

  return outPayload;
}

function _createEmbed(payload) {
  let betaTag = payload.release.prerelease ? " [PRE-RELEASE]" : "";

  let fields = [{
    name: "**PROJECT**",
    value: payload.repository.name,
    inline: true
  },
  {
    name: "**VERSION**",
    value: payload.release.tag_name,
    inline: true
  },
  {
    name: "**RELEASED**",
    value: payload.release.published_at,
    inline: false
  },
  {
    name: "**URL**",
    value: `<${payload.release.html_url}>`,
    inline: false
  }];
  let assets = payload.release.assets;
  for (let x = 0; x < assets.length; ++x) {
    fields.push({
      name: `**${assets[x].name}**`,
      value: `:floppy_disk:<${assets[x].browser_download_url}>`,
      inline: true
    });
  }

  let outPayload = {
    title: `${payload.repository.name} ${payload.release.tag_name}${betaTag}`,
    // type: "rich",
    description: payload.release.body,
    timestamp: payload.release.published_at,
    url: payload.release.html_url,
    color: payload.release.prerelease ? config.discord.PRERELEASE_COLOR : config.discord.RELEASE_COLOR,
    footer: {

    },
    fields: fields
  };

  return outPayload;
}

module.exports = router;