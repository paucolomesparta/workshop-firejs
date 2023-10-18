import {
	DOMElement,
	Fiber,
	FireElement,
	FireElementType,
	JSXElement,
	Props,
} from "./types";
import { deletions, nextUnitOfWork, wipRoot } from "./globals";
import {
	getEventListenerKey,
	getPropAttr,
	isEventListener,
	isPropValid,
	shouldSkipProp,
} from "./attrs";

function textNodeFactory(text: string): JSXElement {
	return { type: "TEXT_NODE", props: { nodeValue: text, children: [] } };
}

function functionalComponentFactory<P extends Props>(
	type: Function,
	props: P,
): JSXElement<P> {
	return { type, props: { ...props, children: [] } };
}

export function createElement<P extends Props>(
	type: FireElementType,
	props: P,
	...children: FireElement[]
): JSXElement<P> {
	return {
		type,
		props: {
			...props,
			children: children?.filter(Boolean).map(child => {
				if (typeof child === "string") {
					return textNodeFactory(child);
				}

				if (typeof child === "function") {
					return functionalComponentFactory(child, props);
				}

				return child;
			}),
		},
	};
}

export function cloneElement(element: JSXElement): JSXElement {
	if (typeof element === "string") {
		return element;
	}

	return {
		type: element.type,
		props: {
			...element.props,
			children: [...element.props.children],
		},
	};
}

export function createDOMElement(element: Fiber): DOMElement {
	if (typeof element === "string") {
		return document.createTextNode(element);
	}

	if (typeof element.type === "function") {
		return;
	}

	const node = document.createElement(element.type);

	updateDOMElement(node, {}, element.props);

	return node;
}

export function updateDOMElement(
	dom: DOMElement,
	prevProps: Props,
	nextProps: Props,
) {
	// eliminar o cambiar props viejas
	for (const [key, value] of Object.entries(prevProps)) {
		if (
			shouldSkipProp(key) ||
			(key in nextProps && prevProps[key] === nextProps[key])
		) {
			continue;
		}

		const attr = getPropAttr(key);

		if (isEventListener(key)) {
			dom.removeEventListener(attr, value);
		} else if (isPropValid(key) && dom instanceof HTMLElement) {
			dom.removeAttribute(key);
		} else {
			dom[key] = "";
		}
	}

	// añadir nuevas props
	for (const [key, value] of Object.entries(nextProps)) {
		if (shouldSkipProp(key) || prevProps[key] === nextProps[key]) {
			continue;
		}

		if (isEventListener(key)) {
			const domAttr = getEventListenerKey(key);

			dom.addEventListener(domAttr, value);
		} else if (isPropValid(key) && dom instanceof HTMLElement) {
			dom.setAttribute(key, value.toString());
		} else {
			dom[key] = value;
		}
	}
}

export const typeofJsxElement = (element: JSXElement): FireElementType =>
	typeof element === "string" ? "TEXT_NODE" : element.type;

export function render(element: JSXElement, container: HTMLElement | Text) {
	wipRoot.current = {
		type: typeof element === "string" ? element : element.type,
		dom: container,
		props: {
			children: [element],
			nodeValue: typeof element === "string" ? element : undefined,
		},
		alternate: wipRoot.current,
	};

	nextUnitOfWork.current = wipRoot.current;

	deletions.current = [];
}
