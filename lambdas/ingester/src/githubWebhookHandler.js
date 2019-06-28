const { serverless } = require('@probot/serverless-lambda');
const { webhookListener } = require('./commands/webhook');

process.env.APP_ID = process.env.GITHUB_APP_ID;
process.env.PRIVATE_KEY = JSON.parse(process.env.GITHUB_PRIVATE_KEY_STRING);
process.env.WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

exports.handler = serverless(webhookListener);
