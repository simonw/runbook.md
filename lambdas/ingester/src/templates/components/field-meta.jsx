const { h } = require('hyperons');

exports.FieldMeta = ({ title, info, id }) => (
	<span className="o-forms-title" aria-hidden="true">
		<span className="o-forms-title__main" id={`${id}-title`}>
			{title}
		</span>
		{info && (
			<span className="o-forms-title__prompt" id={`${id}-info`}>
				{info}
			</span>
		)}
	</span>
);
