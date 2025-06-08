import { useState } from "firejs";
import { Widget } from "./widget";

export function Counter() {
	const [count, setCount] = useState(0);

	console.log("Counter rendered");

	return (
		<div className="app-composition">
			<Widget
				title="Widget"
				children={
					<h2>
						The count is <b>{count}</b>
					</h2>
				}
			/>
			<button onClick={() => setCount(x => x + 1)} className="randomize-btn">
				Increment
			</button>
			<button onClick={() => setCount(x => x - 1)} className="randomize-btn">
				Decrement
			</button>
		</div>
	);
}
