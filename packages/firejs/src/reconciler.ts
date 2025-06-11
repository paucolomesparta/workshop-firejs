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

// 1. BASIC ELEMENT CREATION - Start here to understand JSX transformation
// This is the foundation - how JSX becomes our internal elements
function createElement(
	type: FireElementType,
	props: Props,
	...children: FireElement[]
) {
	// TODO: Return an object with type and props
	// - Spread props
	// - Add children to props, flattening array and converting strings to text elements
	// - Use createTextElement for string children
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

// 2. DOM CREATION - Learn how our elements become real DOM nodes
// Essential for understanding the connection between virtual and real DOM
function createDom(fiber: Fiber) {
	// TODO: Create actual DOM node from fiber
	// - Handle TEXT_ELEMENT case (createTextNode)
	// - Handle regular elements (createElement)
	// - Call updateDom to set initial properties
	// - Return the DOM node
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

// DOM UPDATE HELPER - Already implemented (used by createDom and commitWork)
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

// 3. INITIAL RENDER - Set up the fiber tree and start the work
// This is where React begins - creating the root fiber
function render(element: JSXElement, container: DOMElement) {
	// TODO: Initialize the fiber tree and start work
	// - Create root fiber with container as DOM
	// - Set props with element as child
	// - Set alternate to currentRoot
	// - Initialize deletions array
	// - Set nextUnitOfWork to start the work loop
}

// Global state for the reconciler
let nextUnitOfWork = null;
let currentRoot: Fiber = null;
let wipRoot: Fiber = null;
let deletions = null;

// 4. HOST COMPONENTS - Handle regular DOM elements
// Implement this early to get basic rendering working
function updateHostComponent(fiber: Fiber) {
	// TODO: Handle DOM elements
	// - Create DOM node if it doesn't exist
	// - Reconcile children
}

// 5. FUNCTION COMPONENTS - Handle components that are functions
// This introduces the concept of components as functions
function updateFunctionComponent(fiber: Fiber) {
	// TODO: Handle function components
	// - Set up hook context (wipFiber, hookIndex, hooks array)
	// - Call the function component with props to get children
	// - Reconcile the children
}

// 6. WORK SCHEDULING - The heart of Fiber's time slicing
// This is what makes React interruptible and non-blocking
function workLoop(deadline: IdleDeadline) {
	// TODO: Perform work units while time remains
	// - Loop while there's work and time remaining
	// - Call performUnitOfWork and get next unit
	// - Yield when time is up (< 1ms remaining)
	// - Commit when all work is done
	// - Schedule next work loop
}

// TODO: Start the work loop

// 7. WORK UNITS - The preorder traversal that builds the fiber tree
// This shows how React walks through components systematically
function performUnitOfWork(fiber: Fiber) {
	// TODO: update the fiber
	// - if function component, invoke updateFunctionComponent
	// - if host component, invoke updateHostComponent

	if (fiber.child) {
		return fiber.child;
	}

	// preorder traversal
	// process parent first, then siblings, then children
	// TODO: return next unit of work
	// - if there is a child, return it
	// - if there is a sibling, return it
	// - if there is a parent, return it
	// - if there is no more work, return null
}

// 8. RECONCILIATION - The diffing algorithm that makes React fast
// This is the core of React's performance - comparing old vs new
function reconcileChildren(wipFiber: Fiber, elements: JSXElement[]) {
	let index = 0;

	// access the previous fiber (if it exists)
	let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
	let prevSibling = null;

	// linear traversal
	while (index < elements.length || oldFiber != null) {
		const element = elements[index];
		let newFiber: Fiber | null = null;

		// TODO: update effect
		// - check if old fiber exists and is same type
		// - if same type, we update
		// - if type is different, we create a new element
		// - if there is an old fiber but the type is different, we delete it

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

// 9. COMMIT ROOT - Start the commit phase (applying all changes)
// This transitions from the render phase to the commit phase
function commitRoot() {
	// TODO: Apply all changes to the real DOM
	// - Process deletions first
	// - Process the work-in-progress tree
	// - Update currentRoot reference
	// - Clear wipRoot
}

// 10. COMMIT WORK - Apply changes to DOM (postorder traversal)
// This is where the virtual changes become real DOM changes
function commitWork(fiber: Fiber) {
	// TODO: Recursively commit changes to DOM (POSTORDER traversal)
	// - Find parent DOM node (may need to traverse up for function components)
	// - Handle different effect tags:
	//   * PLACEMENT: appendChild to DOM
	//   * UPDATE: call updateDom
	//   * DELETION: call commitDeletion
	// - Recursively commit child and sibling
}

// 11. COMMIT DELETION HELPER - Already implemented (postorder traversal)
function commitDeletion(fiber: Fiber, domParent: DOMElement) {
	if (fiber.dom) {
		domParent.removeChild(fiber.dom);
	} else {
		commitDeletion(fiber.child, domParent);
	}
}

// Global state for hooks
let wipFiber: Fiber = null;
let hookIndex: number = null;



// 12. HOOKS - The useState hook for state management
// This is the most complex part - how hooks maintain state
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
		// TODO: create a new fiber (unit of work)
		// - push state to the queue
		// - set wipRoot to the current root
		// - set nextUnitOfWork to wipRoot
		// - set deletions to an empty array
	};

	wipFiber.hooks.push(hook);
	hookIndex++;

	return [hook.state, setState];
}

export { createElement, render, useState };
