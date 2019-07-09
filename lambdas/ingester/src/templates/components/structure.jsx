const { h, Fragment } = require('hyperons');

const GraphvizLibrary = () => (
	<Fragment>
		<script src="https://d3js.org/d3.v4.min.js" />
		<script
			src="https://unpkg.com/viz.js@1.8.1/viz.js"
			type="javascript/worker"
		/>
		<script src="https://unpkg.com/d3-graphviz@2.6.1/build/d3-graphviz.js" />
	</Fragment>
);

module.exports = {
	GraphvizLibrary,
};
