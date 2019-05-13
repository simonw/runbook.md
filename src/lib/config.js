const logger = require('@financial-times/lambda-logger');

const isRunningInLambda = !!(
	process.env.LAMBDA_TASK_ROOT && process.env.AWS_EXECUTION_ENV
);

const config = {
	NODE_ENV: process.env.NODE_ENV,
	ENVIRONMENT: process.env.ENVIRONMENT,
	BYPASS_S3O: process.env.BYPASS_S3O || false,
	STAGE: process.env.STAGE,
	BASE_HOST: isRunningInLambda
		? process.env.BASE_HOST
		: 'local.in.ft.com:3000',
	ES_HOST: process.env.ES_HOST,
	IS_LAMBDA: isRunningInLambda,
	AWS_ACCOUNT_ID: process.env.AWS_ACCOUNT_ID,
};

logger.info({ config }, 'Config');
logger.info(`NODE_ENV: ${config.NODE_ENV}`);

function get(key) {
	const value = config[key];
	if (value === 'true' || value === 'false') {
		return Boolean(value);
	}
	return value;
}

module.exports = {
	get,
};
