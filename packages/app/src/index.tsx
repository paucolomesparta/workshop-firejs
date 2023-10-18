import { createElement, render, useState } from "firejs";

const container = document.getElementById("root");

function App() {
	const [val, setVal] = useState("hola");

	return createElement("input", {
		onChange: e => setVal(e.target.value),
		value: val,
	});
}

render(createElement(App, {}), container);
