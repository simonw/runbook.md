const bizOpsSchema = require('@financial-times/biz-ops-schema');
const logger = require('@financial-times/lambda-logger');

bizOpsSchema.configure({
	baseUrl: process.env.SCHEMA_BASE_URL,
	updateMode: 'stale',
	logger,
});

module.exports = bizOpsSchema;
