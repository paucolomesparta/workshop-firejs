import { Counter } from "./counter";
import { TableWidget } from "./table-widget";
import "./app.css";

export function App() {
	return (
		<div className="app-root">
			<TableWidget />
			<Counter />
		</div>
	);
}
