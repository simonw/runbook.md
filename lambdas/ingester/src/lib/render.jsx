const { h, render } = require('hyperons');
const Layout = require('../templates/layout/layout');

module.exports = (Template, props) => {
	return render(
		<Layout {...props}>
			<Template {...props} />
		</Layout>,
	);
};
