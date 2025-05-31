import { createElement, useState } from "firejs";

import "./app.css";

export function App() {
	const [val, setVal] = useState(1);

	return createElement(
		"div",
		{
			style:
				"display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 1em; height: 100vh; font-family: Vodafone Rg, Helvetica;",
		},
		// @ts-ignore
		createElement(
			"h1",
			{
				style: "font-family: Vodafone Rg, Helvetica; font-weight: 200;",
			},
			`value is ${val}`,
		),
		createElement(
			"div",
			{
				style:
					"display: flex; gap: 1em; align-items: center; justify-content: center; flex-direction: row",
			},
			// @ts-ignore
			createElement(
				"button",
				{
					onClick: () => setVal(value => value - 1),
					style:
						"font-family: Vodafone Rg, Helvetica; background-color: red; border-radius: 6px; border: none; color: white; padding: 1rem; cursor: pointer; font-size: 1em",
				},
				"Decrease",
			),
			createElement(
				"button",
				{
					onClick: () => setVal(value => value + 1),
					style:
						"font-family: Vodafone Rg, Helvetica; background-color: red; border-radius: 6px; border: none; color: white; padding: 1rem; cursor: pointer; font-size: 1em",
				},
				"Add",
			),
		),
	);
}
