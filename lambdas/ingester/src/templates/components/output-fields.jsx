const { h } = require('hyperons');
const { Table } = require('./table');

exports.Message = ({ status, message, linkText, linkUrl }) => (
	<div
		className={`o-message o-message--alert ${
			status === 200 ? 'o-message--success' : 'o-message--error'
		}`}
		data-o-component="o-message"
	>
		<div className="o-message__container">
			<div className="o-message__content ">
				<p className="o-message__content-main">{message}</p>
				<div className="o-message__actions">
					<a
						href={`${linkUrl}`}
						className="o-message__actions__secondary"
					>
						{linkText}
					</a>
				</div>
			</div>
		</div>
	</div>
);

exports.UpdatedFields = ({ data }) => {
	const tableProps = {
		caption: 'Updated Biz Ops Fields',
		columns: ['Property', 'Value'],
		rows: Object.entries(data),
	};
	return (
		<div className="updated-fields">
			<Table {...tableProps} />
		</div>
	);
};

exports.ParseSuccess = ({ data }) => {
	const tableProps = {
		caption: 'Parsed Successfully',
		columns: ['Property', 'Value'],
		rows: Object.entries(data),
	};
	return (
		<div className="parsed-data">
			<Table {...tableProps} />
		</div>
	);
};

exports.ParseErrors = ({ errors }) => {
	const tableProps = {
		caption: 'Parse Errors',
		columns: ['Message'],
		rows: errors.map(({ line, message }) => [
			line ? `${message} on or around line ${line}` : message,
		]),
	};
	return (
		<div className="parsed-errors">
			<Table {...tableProps} />
		</div>
	);
};

exports.ValidationErrors = ({ errors }) => {
	const tableProps = {
		caption: 'Validation Errors',
		columns: ['Facet', 'Errors'],
		rows: Object.entries(errors).map(([facet, messages]) => [
			facet,
			{
				props: { className: 'with-line-breaks' },
				value: messages,
			},
		]),
	};
	return (
		<div className="validation-errors">
			<Table {...tableProps} />
		</div>
	);
};
