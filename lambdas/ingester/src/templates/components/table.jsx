const { h } = require('hyperons');

exports.Table = ({ caption, columns, rows }) => (
	<table
		className="o-table o-table--horizontal-lines"
		data-o-component="o-table"
	>
		<caption className="o-table__caption">
			<h2 className="o-typography-heading-level-2">{caption}</h2>
		</caption>
		<thead>
			<tr>
				{columns.forEach(column =>
					column.props && column.value ? (
						<th {...column.props}>{column.value}</th>
					) : (
						<th scope="col" role="columnheader">
							{column}
						</th>
					),
				)}
			</tr>
		</thead>
		<tbody>
			{rows.forEach(row => (
				<tr>
					{row.forEach(cell =>
						cell.props && cell.value ? (
							<td {...cell.props}>{cell.value}</td>
						) : (
							<td>{cell}</td>
						),
					)}
				</tr>
			))}
		</tbody>
	</table>
);
