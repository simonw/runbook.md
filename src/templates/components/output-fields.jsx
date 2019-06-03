const { h } = require('hyperons');

const Message = ({ status, message, linkText, linkUrl }) => (
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

const UpdatedFields = ({ data }) => (
	<div className="parsed-data">
		<table
			className="o-table o-table--horizontal-lines "
			data-o-component="o-table"
		>
			<caption className="o-table__caption">
				<h2 className="o-typography-heading-level-2">
					Updated Biz Ops Fields
				</h2>
			</caption>
			<thead>
				<tr>
					<th scope="col" role="columnheader">
						Property
					</th>
					<th scope="col" role="columnheader">
						Value
					</th>
				</tr>
			</thead>
			<tbody>
				{Object.entries(data).map(([property, value]) => (
					<tr>
						<td>{property}</td>
						<td>{value}</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);

const ParseSuccess = ({ data }) => (
	<div className="parsed-data">
		<table
			className="o-table o-table--horizontal-lines "
			data-o-component="o-table"
		>
			<caption className="o-table__caption">
				<h2 className="o-typography-heading-level-2">
					Parse Successes
				</h2>
			</caption>
			<thead>
				<tr>
					<th scope="col" role="columnheader">
						Property
					</th>
					<th scope="col" role="columnheader">
						Value
					</th>
				</tr>
			</thead>
			<tbody>
				{Object.entries(data).map(([name, value]) => (
					<tr>
						<td>{name}</td>
						<td>{value}</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);

const ParseErrors = ({ errors }) => (
	<div className="parsed-errors">
		<table
			className="o-table o-table--horizontal-lines "
			data-o-component="o-table"
		>
			<caption className="o-table__caption">
				<h2 className="o-typography-heading-level-2">Parse Errors</h2>
			</caption>
			<thead>
				<tr>
					<th scope="col" role="columnheader">
						Message
					</th>
					<th scope="col" role="columnheader">
						Line
					</th>
				</tr>
			</thead>
			<tbody>
				{errors.map(error => (
					<tr>
						<td>{error.message}</td>
						<td>{error.line}</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);

const ValidationErrors = ({ errors }) => (
	<div className="validation-errors">
		<table
			className="o-table o-table--horizontal-lines "
			data-o-component="o-table"
		>
			<caption className="o-table__caption">
				<h2 className="o-typography-heading-level-2">
					Validation Errors
				</h2>
			</caption>
			<thead>
				<tr>
					<th scope="col" role="columnheader">
						Facet
					</th>
					<th scope="col" role="columnheader">
						Errors
					</th>
				</tr>
			</thead>
			<tbody>
				{Object.entries(errors).map(([facet, messages]) => (
					<tr>
						<td>{facet}</td>
						<td className="with-line-breaks">
							{messages.join('\n')}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);

module.exports = {
	Message,
	ParseSuccess,
	ParseErrors,
	UpdatedFields,
	ValidationErrors,
};
