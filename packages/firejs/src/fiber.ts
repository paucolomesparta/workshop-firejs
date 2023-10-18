import { createDOMElement, updateDOMElement } from "./vdom";

import { isFunctionComponent, type Fiber, type JSXElement } from "./types";
import { currentRoot, deletions, nextUnitOfWork, wipRoot } from "./globals";

/**
 * Sincroniza la raíz actual con el DOM
 */
export function commitRoot() {
	deletions.current?.forEach(commitWork);

	commitWork(wipRoot.current.child);
	currentRoot.current = wipRoot.current;
	wipRoot.current = null;
}

/**
 * Sincroniza la unidad de trabajo con el DOM
 */
export function commitWork(fiber: Fiber | null) {
	if (!fiber) {
		return;
	}

	const domParent = fiber.parent?.dom;

	switch (fiber.effectTag) {
		case "CREATE":
			if (fiber.dom) {
				domParent?.appendChild(fiber.dom);
			}
			break;
		case "UPDATE":
			if (fiber.dom) {
				updateDOMElement(fiber.dom, fiber.alternate?.props, fiber.props);
			}
			break;
		case "DELETE":
			domParent?.removeChild(fiber.dom!);
			break;
	}

	commitWork(fiber.child);
	commitWork(fiber.sibling);
}

/**
 * Bucle que programa las unidades de trabaho para ser ejecutadas cuando el navegador está inactivo.
 * Si se cumple la deadline se cede el trabajo hasta el siguiente tiempo inactivo.
 */
export function workLoop(deadline: IdleDeadline) {
	let shouldYield = false;

	while (nextUnitOfWork.current && !shouldYield) {
		nextUnitOfWork.current = performUnitOfWork(nextUnitOfWork.current);

		shouldYield = deadline.timeRemaining() < 1;
	}

	if (!nextUnitOfWork.current && wipRoot.current) {
		commitRoot();
	}

	requestIdleCallback(workLoop);
}

/**
 * empieza el bucle
 */
requestIdleCallback(workLoop);

/**
 * Realizar unidad de trabajo actual
 */
export function performUnitOfWork(fiber: Fiber): Fiber | null {
	if (isFunctionComponent(fiber.type)) {
		updateFunctionComponent(fiber);
	} else {
		updateHostComponent(fiber);
	}

	if (fiber.child) {
		return fiber.child;
	}

	let nextFiber: Fiber | null = fiber;

	while (nextFiber) {
		if (nextFiber.sibling) {
			return nextFiber.sibling;
		}

		nextFiber = nextFiber.parent;
	}
}

/**
 * Actualiza el componente funcional pasando el JSXElement como children y reconciliando los hijos de la unidad de trabajo
 */
function updateFunctionComponent(fiber: Fiber) {
	const children = [(fiber.type as Function)(fiber.props)];

	reconcileChildren(fiber, children);
}

/**
 * Actualiza el componente host creando el DOMElement si no existe y reconciliando los hijos de la unidad de trabajo
 */
function updateHostComponent(fiber: Fiber) {
	if (!fiber.dom) {
		fiber.dom = createDOMElement(fiber);
	}

	reconcileChildren(fiber, fiber.props.children);
}

/**
 * Reconcilia los hijos del fiber, cambiando el tipo de Fiber según estado
 */
function reconcileChildren(wipFiber: Fiber, elements: JSXElement[]) {
	let index = 0;
	let oldFiber = wipFiber.alternate?.child;
	let prevSibling = null;

	while (index < elements.length || oldFiber != null) {
		const element = elements[index];

		let newFiber: Fiber | null = null;

		const isSameType = oldFiber && element && element.type === oldFiber.type;

		// actualizar el nodo
		if (isSameType) {
			newFiber = {
				type: element.type,
				props: element.props,
				dom: oldFiber!.dom,
				parent: wipFiber,
				alternate: oldFiber,
				effectTag: "UPDATE",
			};
		}

		if (element && !isSameType) {
			newFiber = {
				type: element.type,
				props: element.props,
				dom: null,
				parent: wipFiber,
				alternate: null,
				effectTag: "CREATE",
			};
		}

		if (oldFiber && !isSameType) {
			oldFiber.effectTag = "DELETE";
		}

		// si es primer hijo se asigna al child del fiber padre
		if (index === 0) {
			wipFiber.child = newFiber;
		} else {
			// si no es el primer hijo se asigna al sibling del ultimo hijo
			wipFiber.sibling = newFiber;
		}

		prevSibling = newFiber;
	}
}
