//
// App component uses CSS classes styled with Sparta theme tokens from theme.css via app.css
//

import { Counter } from "./counter";
import { TableWidget } from "./table-widget";
import "./app.css";

export function App() {
	console.log("App rendered");

	return (
		<div className="app-root">
			<TableWidget />
			<Counter />
		</div>
	);
}
