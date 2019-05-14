const { h, Fragment } = require('hyperons');

const ValidateForm = ({ systemCode, writeToBizOps, bizOpsApiKey, content }) => {
	return (
		<Fragment>
			<h1 id="edit-form--title">Content Validator and Importer</h1>
			<form action="/" method="POST">
				<div className="o-grid-container">
					<div className="o-grid-row">
						<div data-o-grid-colspan="3">
							<div className="validation-code">
								<label
									className="o-forms__label"
									htmlFor="systemCode"
								>
									The System Code
								</label>
								<description className="description-text o-forms__additional-info">
									The code of the system to which the
									RUNBOOK.MD is associated.
								</description>
								<input
									type="text"
									className="o-forms__text"
									name="systemCode"
									id="systemCode"
									value={systemCode}
								/>
							</div>
						</div>
						<div data-o-grid-colspan="3">
							<div className="validation-write">
								<label
									className="o-forms__label"
									htmlFor="writeFlag"
								>
									Write to BizOps?
								</label>
								<description className="description-text o-forms__additional-info">
									Choose Yes to have the results written into
									biz-ops; default in No.
								</description>
								<select
									name="writeFlag"
									id="writeFlag"
									className="o-forms__select"
								>
									<option
										value={false}
										selected={
											writeToBizOps === false
												? 'selected'
												: null
										}
									>
										No
									</option>
									<option
										value
										selected={
											writeToBizOps === true
												? 'selected'
												: null
										}
									>
										Yes
									</option>
								</select>
							</div>
						</div>
						<div data-o-grid-colspan="4">
							<div className="validation-key">
								<label
									className="o-forms__label"
									htmlFor="apiKey"
								>
									Your Biz Ops API Key
								</label>
								<description className="description-text o-forms__additional-info">
									The Api Key to be used to read/write to Biz
									Ops.
									<br />
									<br />
								</description>
								<input
									type="text"
									className="o-forms__text"
									name="apiKey"
									id="apiKey"
									value={bizOpsApiKey}
								/>
							</div>
						</div>
					</div>
				</div>
				<p />
				<div className="validation-content o-forms o-forms--wide">
					<label className="o-forms__label" htmlFor="content">
						The RUNBOOK.MD Content
					</label>
					<description className="description-text o-forms__additional-info">
						The text from RUNBOOK.MD.
					</description>
					<textarea
						className="o-forms__textarea"
						name="content"
						id="content"
						rows="20"
					>
						{content}
					</textarea>
				</div>
				<p />
				<button
					className="o-buttons o-buttons--primary o-buttons--mono o-buttons--big"
					type="submit"
				>
					Validate
				</button>
			</form>
		</Fragment>
	);
};

module.exports = ValidateForm;
