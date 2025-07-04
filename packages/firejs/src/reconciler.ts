import isPropValid from "@emotion/is-prop-valid";
import type {
	DOMElement,
	Fiber,
	FireElement,
	FireElementType,
	FunctionComponent,
	Hook,
	InternalProps,
	JSXElement,
	Props,
} from "./types.js";

export function isFunctionComponent<P extends Props = Props>(
	element: FireElementType,
): element is FunctionComponent<P> {
	return element instanceof Function;
}

function createElement(
	type: FireElementType,
	props: Props,
	...children: FireElement[]
) {
	return {
		type,
		props: {
			...props,
			children: children.flat().map(child =>
				typeof child === "string" ? createTextElement(child) : child,
			),
		},
	};
}

function createTextElement(text: string) {
	return {
		type: "TEXT_ELEMENT",
		props: {
			nodeValue: text,
			children: [],
		},
	};
}

function createDom(fiber: Fiber) {
	const dom =
		fiber.type == "TEXT_ELEMENT"
			? document.createTextNode(fiber.props.nodeValue)
			: document.createElement(fiber.type as string);

	updateDom(dom, {}, fiber.props);

	return dom;
}

function isEventHandler(key: string) {
	return key.startsWith("on");
}

function getEventName(handler: string) {
	return handler.toLowerCase().replace(/^on/, "");
}

function isProperty(key: string) {
	return key !== "children" && !isEventHandler(key) && isPropValid(key);
}

function isNew(prev: Props, next: Props) {
	return (key: string) => prev[key] !== next[key];
}

function isGone(next: Props) {
	return (key: string) => !(key in next);
}

function updateDom(dom: DOMElement, prevProps: InternalProps, nextProps: InternalProps) {
	// Handle text content for text nodes
	if (dom.nodeType === Node.TEXT_NODE) {
		dom.nodeValue = nextProps.nodeValue || "";
		return;
	}

	const htmlElement = dom as HTMLElement;

	// Remove old or changed event listeners
	Object.keys(prevProps)
		.filter(isEventHandler)
		.filter(isNew(prevProps, nextProps))
		.forEach(name => {
			const eventType = getEventName(name);
			htmlElement.removeEventListener(eventType, prevProps[name]);
		});

	// Remove old properties
	Object.keys(prevProps)
		.filter(isProperty)
		.filter(isGone(nextProps))
		.forEach(name => {
			htmlElement.removeAttribute(name === "className" ? "class" : name);
		});

	// Set new or changed properties
	Object.keys(nextProps)
		.filter(isProperty)
		.filter(isNew(prevProps, nextProps))
		.forEach(name => {
			htmlElement.setAttribute(name === "className" ? "class" : name, nextProps[name]);
		});

	// Add event listeners
	Object.keys(nextProps)
		.filter(isEventHandler)
		.filter(isNew(prevProps, nextProps))
		.forEach(name => {
			const eventType = getEventName(name);
			htmlElement.addEventListener(eventType, nextProps[name]);
		});
}

/**
 * 1. remove elements that have been deleted
 * 2. add new elements
 * 3. the WIP root becomes the current root
 */
function commitRoot() {
	deletions.forEach(commitWork);
	commitWork(wipRoot.child);
	currentRoot = wipRoot;
	wipRoot = null;
}

/**
 * 1. find the parent element (it may have been deleted)
 * 2. depending on the effect type:
 *  - PLACEMENT: add to DOM
 *  - UPDATE: update the DOM
 *  - DELETION: remove from DOM
 * 3. traverse child and sibling
 */
function commitWork(fiber: Fiber) {
	if (!fiber) {
		return;
	}

	// postorder traversal
	// process children first, then siblings, then parent
	let domParentFiber = fiber.parent;
	while (!domParentFiber.dom) {
		domParentFiber = domParentFiber.parent;
	}
	const domParent = domParentFiber.dom;

	if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
		domParent.appendChild(fiber.dom);
	} else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
		updateDom(fiber.dom, fiber.alternate.props, fiber.props);
	} else if (fiber.effectTag === "DELETION") {
		commitDeletion(fiber, domParent);
	}

	commitWork(fiber.child);
	commitWork(fiber.sibling);
}

function commitDeletion(fiber: Fiber, domParent: DOMElement) {
	if (fiber.dom) {
		domParent.removeChild(fiber.dom);
	} else {
		commitDeletion(fiber.child, domParent);
	}
}

/**
 * 1. create the root fiber
 * 2. create the work unit
 */
function render(element: JSXElement, container: DOMElement) {
	wipRoot = {
		dom: container,
		props: {
			children: [element],
		},
		alternate: currentRoot,
	};
	deletions = [];
	nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let currentRoot: Fiber = null;
let wipRoot: Fiber = null;
let deletions = null;

/**
 *
 */
function workLoop(deadline: IdleDeadline) {
	let shouldYield = false;
	while (nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
		shouldYield = deadline.timeRemaining() < 1;
	}

	if (!nextUnitOfWork && wipRoot) {
		commitRoot();
	}

	requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

/**
 * 1. add element to DOM
 * 2. create element's children
 * 3. select next work unit
 */
function performUnitOfWork(fiber: Fiber) {
	if (isFunctionComponent(fiber.type)) {
		updateFunctionComponent(fiber);
	} else {
		updateHostComponent(fiber);
	}
	if (fiber.child) {
		return fiber.child;
	}

	// preorder traversal
	// process parent first, then siblings, then children
	let nextFiber = fiber;
	while (nextFiber) {
		if (nextFiber.sibling) {
			return nextFiber.sibling;
		}
		nextFiber = nextFiber.parent;
	}
}

let wipFiber: Fiber = null;
let hookIndex: number = null;

/**
 * 1. create the WIP fiber
 * 2. execute the component function
 * 3. reconcile children
 */
function updateFunctionComponent(fiber: Fiber) {
	wipFiber = fiber;
	hookIndex = 0;
	wipFiber.hooks = [];
	const children = [(fiber.type as Function)(fiber.props)];
	reconcileChildren(fiber, children);
}

function useState<T>(initial: T = null) {
	const oldHook = wipFiber?.alternate?.hooks?.[hookIndex];
	const hook: Hook = {
		state: oldHook ? oldHook.state : initial,
		queue: [],
	};

	const actions = oldHook ? oldHook.queue : [];
	actions.forEach(action => {
		hook.state = action(hook.state);
	});

	const setState = action => {
		hook.queue.push(action);
		wipRoot = {
			dom: currentRoot.dom,
			props: currentRoot.props,
			alternate: currentRoot,
		};
		nextUnitOfWork = wipRoot;
		deletions = [];
	};

	wipFiber.hooks.push(hook);
	hookIndex++;
	return [hook.state, setState];
}

/**
 * For DOM elements:
 * 1. create the element
 * 2. reconcile children
 */
function updateHostComponent(fiber: Fiber) {
	if (!fiber.dom) {
		fiber.dom = createDom(fiber);
	}
	reconcileChildren(fiber, fiber.props.children);
}

/**
 * for each child of the element:
 * 1. traverse in preorder
 * 2. compare with previous
 * 3. create new fiber
 */
function reconcileChildren(wipFiber: Fiber, elements: JSXElement[]) {
	let index = 0;

	// access the previous fiber (if it exists)
	let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
	let prevSibling = null;

	while (index < elements.length || oldFiber != null) {
		const element = elements[index];
		let newFiber: Fiber | null = null;

		const sameType = oldFiber && element && element.type == oldFiber.type;

		// if same type, we update
		if (sameType) {
			newFiber = {
				type: oldFiber.type,
				props: element.props,
				dom: oldFiber.dom,
				parent: wipFiber,
				alternate: oldFiber,
				effectTag: "UPDATE",
			};
		}

		// if type is different, we create a new element
		if (element && !sameType) {
			newFiber = {
				type: element.type,
				props: element.props,
				dom: null,
				parent: wipFiber,
				alternate: null,
				effectTag: "PLACEMENT",
			};
		}

		// if there is an old fiber but the type is different, we delete it
		if (oldFiber && !sameType) {
			oldFiber.effectTag = "DELETION";
			deletions.push(oldFiber);
		}

		// advance in the children list, it may not exist
		if (oldFiber) {
			oldFiber = oldFiber.sibling;
		}

		// if it's the first child, we set it as the child of the wip fiber
		if (index === 0) {
			wipFiber.child = newFiber;
		// if not the first child, we set it as the sibling of the previous sibling
		} else if (element) {
			prevSibling.sibling = newFiber;
		}

		prevSibling = newFiber;
		index++;
	}
}

export { createElement, render, useState };
