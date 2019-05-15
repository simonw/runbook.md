const bizOpsSchema = require('@financial-times/biz-ops-schema');

bizOpsSchema.configure({
	baseUrl: process.env.SCHEMA_BASE_URL,
	updateMode: 'stale',
	logger: new Proxy(
		{},
		{
			get() {
				return Function.prototype;
			},
		},
	),
});

module.exports = bizOpsSchema;
