import { useState } from "firejs";
import { Widget } from "./widget";

export function Counter() {
	const [count, setCount] = useState(0);

	return (
		<div className="app-composition">
			<Widget
				title="Widget"
				children={
					<p className="counter-text">
						The count is <b>{`${count}`}</b>
					</p>
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
