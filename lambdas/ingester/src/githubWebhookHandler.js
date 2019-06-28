const { serverless } = require('@probot/serverless-lambda');
const { webhookListener } = require('./commands/webhook');

const privateKey = process.env.GITHUB_PRIVATE_KEY_STRING;

process.env.APP_ID = process.env.GITHUB_APP_ID;
process.env.PRIVATE_KEY = privateKey.replace('"', '').replace(/\\n/g, '\n');
process.env.WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

exports.handler = serverless(webhookListener);
