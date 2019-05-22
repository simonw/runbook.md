const { ingest } = require('../src/ingestHandler');

test('Ingest is available and runs when all parameters are provided', async () => {
	const request = {
		systemCode: 'geoff',
		writeToBizOps: false,
		bizOpsApiKey: 'dummy',
		content: '# this is a name',
	};
	const result = await ingest('dummyUser', request);
	expect(result.statusCode).toBe(200);
	const body = JSON.parse(result.body);
	expect(body.message).toBe(
		'Parse & Validation Complete; Biz Ops Was NOT Updated at your request',
	);
	expect(body.parseData).toHaveProperty('name', 'this is a name');
});

test('Ingest fails when systemCode field is omitted', async () => {
	const request = {
		writeToBizOps: false,
		bizOpsApiKey: 'dummy',
		content: '# this is a name',
	};
	const result = await ingest('dummyUser', request);
	expect(result.statusCode).toBe(400);
	const body = JSON.parse(result.body);
	expect(body.message).toBe('Please supply a systemCode');
});

test('Ingest does not fail when writeToBizOps field is omitted since the default is false', async () => {
	const request = {
		systemCode: 'geoff',
		bizOpsApiKey: 'dummy',
		content: '# this is a name',
	};
	const result = await ingest('dummyUser', request);
	expect(result.statusCode).toBe(200);
	const body = JSON.parse(result.body);
	expect(body.message).toBe(
		'Parse & Validation Complete; Biz Ops Was NOT Updated at your request',
	);
});

test('Ingest fails when api key field is omitted if writeToBizOps is true', async () => {
	const request = {
		systemCode: 'geoff',
		writeToBizOps: true,
		content: '# this is a name',
	};
	const result = await ingest('dummyUser', request);
	expect(result.statusCode).toBe(400);
	const body = JSON.parse(result.body);
	expect(body.message).toBe(
		'Unable to update Biz Ops. No API key was been provided',
	);
});

test('Ingest does not fail when api key field is omitted if writeToBizOps is false', async () => {
	const request = {
		systemCode: 'geoff',
		writeToBizOps: false,
		content: '# this is a name',
	};
	const result = await ingest('dummyUser', request);
	expect(result.statusCode).toBe(200);
	const body = JSON.parse(result.body);
	expect(body.message).toBe(
		'Parse & Validation Complete; Biz Ops Was NOT Updated at your request',
	);
});

test('Ingest fails when content field is omitted', async () => {
	const request = {
		systemCode: 'geoff',
		writeToBizOps: false,
		bizOpsApiKey: 'dummy',
	};
	const result = await ingest('dummyUser', request);
	expect(result.statusCode).toBe(400);
	const body = JSON.parse(result.body);
	expect(body.message).toBe('Please supply RUNBOOK.MD content');
});
