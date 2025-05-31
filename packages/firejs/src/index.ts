import isPropValid from "@emotion/is-prop-valid";
import type {
	DOMElement,
	Fiber,
	FireElement,
	FireElementType,
	FunctionComponent,
	Hook,
	JSXElement,
	Props,
} from "./types";

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
			children: children.map(child =>
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
			? document.createTextNode("")
			: document.createElement(fiber.type as string);

	updateDom(dom, {}, fiber.props);

	return dom;
}

function isEvent(key: string) {
	return key.startsWith("on");
}

function isProperty(key: string) {
	return key !== "children" && !isEvent(key) && isPropValid(key);
}

function isNew(prev: Props, next: Props) {
	return (key: string) => prev[key] !== next[key];
}

function isGone(next: Props) {
	return (key: string) => !(key in next);
}

function updateDom(dom: DOMElement, prevProps: Props, nextProps: Props) {
	//Remove old or changed event listeners
	Object.keys(prevProps)
		.filter(isEvent)
		.filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
		.forEach(name => {
			const eventType = name.toLowerCase().substring(2);
			dom.removeEventListener(eventType, prevProps[name]);
		});

	// Remove old properties
	Object.keys(prevProps)
		.filter(isProperty)
		.filter(isGone(nextProps))
		.forEach(name => {
			dom[name] = "";
		});

	// Set new or changed properties
	Object.keys(nextProps)
		.filter(isProperty)
		.filter(isNew(prevProps, nextProps))
		.forEach(name => {
			dom[name] = nextProps[name];
		});

	// Add event listeners
	Object.keys(nextProps)
		.filter(isEvent)
		.filter(isNew(prevProps, nextProps))
		.forEach(name => {
			const eventType = name.toLowerCase().substring(2);
			dom.addEventListener(eventType, nextProps[name]);
		});
}

/**
 * 1. eliminar los elementos que se han eliminado
 * 2. añadir los nuevos elementos
 * 3. la root WIP pasa a ser la root actual
 */
function commitRoot() {
	deletions.forEach(commitWork);
	commitWork(wipRoot.child);
	currentRoot = wipRoot;
	wipRoot = null;
}

/**
 * 1. buscar el padre del elemento (puede haberse eliminado)
 * 2. depende del tipo de efecto:
 * 	- PLACEMENT: añadir al DOM
 * 	- UPDATE: actualizar el DOM
 * 	- DELETION: eliminar del DOM
 * 3. recorrer hijo y hermano
 */
function commitWork(fiber: Fiber) {
	if (!fiber) {
		return;
	}

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
		domParent.removeChild(fiber.dom);
	}

	commitWork(fiber.child);
	commitWork(fiber.sibling);
}

/**
 * 1. se crea la root fiber
 * 2. se crea la unidad de trabajo
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
let currentRoot = null;
let wipRoot = null;
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
 * 1. añadir elemento al DOM
 * 2. crear los hijos del elemento
 * 3. seleccionar la siguiente unidad de trabajo
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
 * 1. se crea la fiber WIP
 * 2. se ejecuta la función del componente
 * 3. reconciliar los hijos
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
 * Para elementos del DOM:
 * 1. crear el elemento
 * 2. reconciliar los hijos
 */
function updateHostComponent(fiber: Fiber) {
	if (!fiber.dom) {
		fiber.dom = createDom(fiber);
	}
	reconcileChildren(fiber, fiber.props.children);
}

/**
 * para cada hijo del elemento:
 * 1. recorrer en preorden
 * 2. comparar con anterior
 * 3. crear nueva fiber
 */
function reconcileChildren(wipFiber: Fiber, elements: JSXElement[]) {
	let index = 0;
	// acceder a la anterior fiber (si la hay)
	let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
	let prevSibling = null;

	while (index < elements.length || oldFiber != null) {
		const element = elements[index];
		let newFiber: Fiber | null = null;

		const sameType = oldFiber && element && element.type == oldFiber.type;

		// si es el mismo tipo se actualiza
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

		// si existe nuevo elemento pero el tipo no coincide o no existe se crea
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

		// si existe elemento anterior pero el tipo no coincide se elimina
		if (oldFiber && !sameType) {
			oldFiber.effectTag = "DELETION";
			deletions.push(oldFiber);
		}

		// avanzar en la lista de hijos, puede ser que no exista
		if (oldFiber) {
			oldFiber = oldFiber.sibling;
		}

		if (index === 0) {
			wipFiber.child = newFiber;
		} else if (element) {
			prevSibling.sibling = newFiber;
		}

		prevSibling = newFiber;
		index++;
	}
}

export { createElement, render, useState };
