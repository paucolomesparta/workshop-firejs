import type { FireElement } from "firejs";

type Props = {
	title: string;
	children: FireElement;
};

export function Widget({ title, children }: Props) {
	return (
		<div className="widget-root">
			<div className="widget-header">
				<h3>{title}</h3>
			</div>
			<div>{children}</div>
		</div>
	);
}
