import { createDOMElement } from './vdom'

import type { Fiber, RefObject } from './types'
import { createRef } from './ref'

export const nextUnitOfWork: RefObject<Fiber> = createRef()

export function workLoop(deadline: IdleDeadline) {
	let shouldYield = false

	while (nextUnitOfWork && !shouldYield) {
		nextUnitOfWork.current = performUnitOfWork(nextUnitOfWork.current)

		shouldYield = deadline.timeRemaining() < 1
	}

	requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

export function performUnitOfWork(fiber: Fiber): Fiber | null {
	if (!fiber.dom) {
		fiber.dom = createDOMElement(fiber)
	}

	if (fiber.parent) {
		fiber.parent.dom?.appendChild(fiber.dom)
	}
}
