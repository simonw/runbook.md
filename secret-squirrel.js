module.exports = {
	files: {
		allow: [
			'lambdas/ingester/Makefile'
		],
		allowOverrides: []
	},
	strings: {
		deny: [],
		denyOverrides: [
			'b62f4580-81f6-11e9-8f9b-7d694d159e85',
			'b62f4580-81f6-11e9-8f9b-7d694d159e85', // README.md:9
		]
	}
};
