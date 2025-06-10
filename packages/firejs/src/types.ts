export type Props = Record<string, any> | {};
export type InternalProps = Props & { children?: JSXElement[], nodeValue?: string, className?: string };

export type DOMElement = HTMLElement | Text;
export type DOMElementKeys = keyof HTMLElementTagNameMap;
export type FireElementType = DOMElementKeys | Function | "TEXT_ELEMENT";
export type FireElement = string | JSXElement;

export type JSXElement<P extends InternalProps = InternalProps> = {
	type: FireElementType;
	props: P;
};

export interface FunctionComponent<P extends Props = Props> {
	(props: P): JSXElement;
}

export type Hook = {
	state: any;
	queue: any[];
};

export type Fiber<P extends InternalProps = InternalProps> = {
	type?: FireElementType;
	props: P;
	dom: DOMElement;
	parent?: Fiber;
	child?: Fiber;
	sibling?: Fiber;
	alternate?: Fiber; // reference to old fiber
	effectTag?: "PLACEMENT" | "UPDATE" | "DELETION";
	hooks?: Hook[];
};

export declare namespace JSX {
	type Element = JSXElement;

	interface IntrinsicElements {
		[key: string]: Props;
	}

	interface IntrinsicAttributes {
		children?: FireElement[];
		style?: string;
		onClick?: () => void;
		[key: string]: any;
	}
}
