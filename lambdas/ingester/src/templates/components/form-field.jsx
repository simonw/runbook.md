const { h } = require('hyperons');
const { FieldMeta } = require('./field-meta');

exports.FormField = ({ title, info, id, content, optional }) => (
	<div
		className={`validation-${id} o-forms-field ${
			optional ? 'o-forms-field--optional' : ''
		}`}
		aria-labelledby={`${id}-title`}
		aria-describedby={`${id}-info`}
	>
		{title && info && <FieldMeta id={id} title={title} info={info} />}
		{content}
	</div>
);
