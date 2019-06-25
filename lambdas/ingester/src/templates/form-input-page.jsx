const { h, Fragment } = require('hyperons');

const {
	SystemCode,
	WriteFlag,
	ApiKey,
	RunbookEntry,
} = require('./components/input-fields');

const {
	Message,
	ParseSuccess,
	ParseErrors,
	ValidationErrors,
	UpdatedFields,
} = require('./components/output-fields');

const ValidateForm = ({
	status,
	message,
	systemCode,
	writeToBizOps,
	bizOpsApiKey,
	exampleContent,
	content,
	parseData = {},
	parseErrors = [],
	validationErrors = {},
	updatedFields = {},
}) => {
	return (
		<Fragment>
			<div className="o-layout__sidebar" />
			<form
				method="POST"
				className="o-layout__main o-layout-typography"
				id="manualRunbookEntry"
			>
				<h1 id="edit-form--title">Parse, Validate and Import</h1>
				<h2 id="runbook-input">Runbook Content</h2>
				<div className="o-grid-row fullwidth">
					<div data-o-grid-colspan="12">
						<RunbookEntry
							exampleContent={exampleContent}
							content={content}
						/>
					</div>
				</div>
				<aside>
					<p>
						If you have enabled writing to Biz-Ops, this action will
						also update any valid System fields.
					</p>
					<p className="runbook-form__submit--error">
						Please complete all fields before submitting.
					</p>
					<button
						className="o-buttons o-buttons--primary o-buttons--mono o-buttons--big"
						type="submit"
						id="submitRunbookForm"
					>
						Submit
					</button>
				</aside>
				<h2 id="biz-ops-settings">Update Biz-Ops</h2>
				<div className="o-grid-row">
					<div data-o-grid-colspan="12">
						<WriteFlag writeToBizOps={writeToBizOps} />
					</div>
				</div>
				<div className="o-grid-row">
					<div data-o-grid-colspan="6">
						<SystemCode systemCode={systemCode} />
					</div>
					<div data-o-grid-colspan="6">
						<ApiKey bizOpsApiKey={bizOpsApiKey} />
					</div>
				</div>

				{message ? (
					<Message
						status={status}
						message={message}
						linkText={
							status === 200 && writeToBizOps
								? 'View updated Biz Ops record'
								: undefined
						}
						linkUrl={
							status === 200 && writeToBizOps
								? `${process.env.BIZ_OPS_URL}/System/${systemCode}`
								: undefined
						}
					/>
				) : null}
				{parseErrors.length ? (
					<ParseErrors errors={parseErrors} />
				) : null}
				{Object.entries(validationErrors).length ? (
					<ValidationErrors errors={validationErrors} />
				) : null}
				{Object.entries(parseData).length ? (
					<ParseSuccess data={parseData} />
				) : null}
				{Object.entries(updatedFields).length ? (
					<UpdatedFields data={updatedFields} />
				) : null}
			</form>
		</Fragment>
	);
};

module.exports = ValidateForm;
