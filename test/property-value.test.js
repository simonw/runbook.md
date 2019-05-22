const runbookmd = require('..');
const here = require('outdent').default;

test('boolean types are coerced to boolean', async () => {
	const { data } = await runbookmd.parseRunbookString(here`
		# name

		## Contains personal data
		yes

		## Contains sensitive data
		true

		## Downloadable personal data
		👍

		## Contactable individuals
		👎
	`);

	expect(data).toEqual({
		name: 'name',
		containsPersonalData: true,
		containsSensitiveData: true,
		// the headings for these are using the labels
		canDownloadPersonalData: true,
		canContactIndividuals: false,
	});
});

test('boolean fields with non-boolean contents are errors', async () => {
	const { data, errors } = await runbookmd.parseRunbookString(here`
		# name

		## Contains personal data
		sure
	`);

	expect(data).toEqual({
		name: 'name',
	});

	expect(errors.length).toBe(1);
});

test('string types are coerced to string', async () => {
	const { data } = await runbookmd.parseRunbookString(here`
		# name

		## more information

		hello

		## primary url

		hello
	`);

	expect(typeof data.moreInformation).toBe('string');
	expect(typeof data.primaryURL).toBe('string');
});

test('enums types correctly return their value', async () => {
	const { data } = await runbookmd.parseRunbookString(here`
		# name

		## Service tier
		platinum

	`);

	expect(data.serviceTier).toBe('Platinum');
});

test('enums types with incorrect values produce error', async () => {
	const { data, errors } = await runbookmd.parseRunbookString(here`
		# name

		## Service tier

		Cardboard
	`);

	expect(data.serviceTier).toBe(undefined);
	expect(errors.length).toBe(1);
});

// Before this test, we had links coming out wrapped in triangle brackets
test('urls should stay urls', async () => {
	const { data } = await runbookmd.parseRunbookString(here`
		# name

		## primary url
		https://snoot.club
	`);

	expect(data.primaryURL).toBe('https://snoot.club');
	expect(typeof data.primaryURL).toBe('string');
});

test('nested fields are coerced to string (the code)', async () => {
	const { data } = await runbookmd.parseRunbookString(here`
		# name

		## technical owner

		chee.rabbits
	`);

	expect(data.technicalOwner).toBe('chee.rabbits');
});

test('properties with hasMany are coerced to arrays', async () => {
	const { data } = await runbookmd.parseRunbookString(here`
		# name

		## known about by

		* chee.rabbits

		## dependencies

		ft-app-fruitcake

		## dependents

		* ft-app-fruitcake
		* apple-quicktime
	`);

	expect(data.knownAboutBy).toEqual(['chee.rabbits']);
	expect(data.dependencies).toEqual(['ft-app-fruitcake']);
	expect(data.dependents).toEqual(['ft-app-fruitcake', 'apple-quicktime']);
});

test('subdocuments have their headers reduced two levels', async () => {
	const { data } = await runbookmd.parseRunbookString(here`
		# name

		## more information

		### hello
	`);

	expect(data).toEqual({
		name: 'name',
		moreInformation: '# hello',
	});
});

test('date fields are coerced to iso strings', async () => {
	const naiveJavaScriptIsoStringRegex = /^\d{4}(?:-\d{2}){2}T(?:\d{2}:){2}\d{2}\.\d{3}Z$/;
	const { data } = await runbookmd.parseRunbookString(here`
		# name

		## last review date

		July 21 2018
	`);

	expect(data.lastServiceReviewDate).toMatch(naiveJavaScriptIsoStringRegex);
});

test('date fields keep the correct date', async () => {
	const { data } = await runbookmd.parseRunbookString(here`
		# name

		## last review date

		1965-09-17
	`);

	const date = new Date(data.lastServiceReviewDate);

	// gotta go fast
	expect(date.getFullYear()).toBe(1965);
	expect(date.getMonth()).toBe(8);
	expect(date.getDate()).toBe(17);
});

test('date fields with bad dates are an error', async () => {
	const { errors } = await runbookmd.parseRunbookString(here`
		# name

		## last review date

		mario's birthday
	`);

	expect(errors).toHaveLength(1);
});
