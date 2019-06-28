const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB({
	apiVersion: '2012-08-10',
	region: 'eu-west-1',
});

const put = (repository, commitHash, result) =>
	dynamodb
		.putItem({
			Item: {
				CommitHash: {
					S: commitHash,
				},
				Repository: {
					S: repository,
				},
				ResultJson: {
					S: JSON.stringify(result),
				},
			},
			ReturnConsumedCapacity: 'TOTAL',
			TableName: 'biz-ops-runbook-md.results',
		})
		.promise();

const get = (repository, commitHash) =>
	dynamodb
		.getItem({
			Key: {
				CommitHash: {
					S: commitHash,
				},
				Repository: {
					S: repository,
				},
			},
			ReturnConsumedCapacity: 'TOTAL',
			TableName: 'biz-ops-runbook-md.results',
		})
		.promise()
		.then(({ Item: { ResultJson: { S: result } } }) => JSON.parse(result));

module.exports = {
	put,
	get,
};
