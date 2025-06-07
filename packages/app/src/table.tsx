//
// Table component uses CSS classes styled with Sparta theme tokens from theme.css via app.css
//

export function Table({ products, tenors, prices, onRandomize }) {
	return (
		<div className="table-container">
			<table className="price-table">
				<thead>
					<tr>
						<th className="price-table-th">Product</th>
						{tenors.map(tenor => (
							<th className="price-table-th" key={tenor}>{tenor}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{products.map(product => (
						<tr key={product}>
							<td className="price-table-td">{product}</td>
							{tenors.map(tenor => (
								<td className="price-table-td" key={tenor}>
									{prices[product][tenor].toFixed(2)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			<button
				onClick={onRandomize}
				className="randomize-btn"
			>
				Randomize Prices
			</button>
		</div>
	);
} 