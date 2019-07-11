const logger = require('@financial-times/lambda-logger');
const { get: getStoredResult } = require('./lib/dynamodb-client');
const { renderPage } = require('./lib/response');
const { createLambda } = require('./lib/lambda');

const template = require('./templates/status-page');

const statusPageHandler = async event => {
	logger.info({ event: 'STATUS_PAGE' });

	const { owner, repo, hash } = event.pathParameters;
	const repository = `${owner}/${repo}`;

	logger.info({ event: 'STATUS_PAGE_FETCHING_STORED_RESULT', hash });
	try {
		const storedResult = await getStoredResult(repository, hash);
		logger.info({
			event: 'STATUS_PAGE_RETRIEVED_STORED_RESULT',
			storedResult,
			hash,
		});

		const { content, details, runbookUrl } = storedResult;
		let { status } = storedResult;
		const commitUrl = `https://github.com/${owner}/${repo}/commit/${hash}`;

		let message = 'RUNBOOK.MD passed validation';
		if (
			status === 'success' &&
			Object.keys(details.validationErrors).length
		) {
			status = 'failure';
		}
		if (status === 'failure') {
			message = 'We encountered errors while validating RUNBOOK.MD';
		}

		return renderPage(
			template,
			{
				layout: 'docs',
				status,
				message,
				owner,
				repo,
				hash,
				commitUrl,
				runbookUrl,
				content,
				...details,
			},
			event,
		);
	} catch (error) {
		logger.error({
			event: 'STATUS_PAGE_FAILED_FETCH_STORED_RESULT',
			error: { ...error },
			hash,
		});
		// TODO error handling
	}
};

exports.handler = createLambda(statusPageHandler);
