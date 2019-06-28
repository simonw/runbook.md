const { h, Fragment } = require('hyperons');

const { RunbookEntry } = require('./components/input-fields');

const { ValidationResult } = require('./components/validation-result');

const StatusPage = ({
	hash,
	status,
	systemCode,
	placeholder,
	readOnly = true,
	content,
	message,
	parseData = {},
	parseErrors = [],
	validationErrors = {},
	updatedFields = {},
}) => (
	<Fragment>
		<div className="o-layout__sidebar" />
		<div className="o-layout__main o-layout-typography runbook-form">
			<h1 id="edit-form--title">Commit Status Report: {hash}</h1>
			{readOnly && (
				<ValidationResult
					status={status}
					systemCode={systemCode}
					message={message}
					parseData={parseData}
					parseErrors={parseErrors}
					validationErrors={validationErrors}
					updatedFields={updatedFields}
				/>
			)}
			<h2 id="runbook-input">Runbook Content</h2>
			<div className="o-grid-row fullwidth with-margin-bottom">
				<div data-o-grid-colspan="12">
					<RunbookEntry
						placeholder={placeholder}
						content={content}
						readOnly={readOnly}
					/>
				</div>
			</div>
		</div>
	</Fragment>
);

module.exports = StatusPage;
