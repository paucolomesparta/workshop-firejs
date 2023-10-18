import isPropValid from '@emotion/is-prop-valid'

import { DOMElement, Fiber, FireElementType, JSXElement, Props } from './types'
import { deletions, nextUnitOfWork, wipRoot } from './globals'

function createTextNode(text: string): JSXElement {
	return { type: 'TEXT_NODE', props: { nodeValue: text, children: [] } }
}

export function createElement<P extends Props>(
	type: string,
	props: P,
	...children: JSXElement[]
): JSXElement<P> {
	return {
		type,
		props: {
			...props,
			children: children?.map((child) =>
				typeof child === 'string' ? createTextNode(child) : child
			),
		},
	}
}

export function cloneElement(element: JSXElement): JSXElement {
	if (typeof element === 'string') {
		return element
	}

	return {
		type: element.type,
		props: {
			...element.props,
			children: [...element.props.children],
		},
	}
}

const eventListenerRegex = /on([A-Z]{0,1}[a-z]+)/gm

function isEventListener(key: string) {
	return eventListenerRegex.test(key)
}

function getEventListenerKey(key: string) {
	return key.match(eventListenerRegex)[0].toLowerCase()
}

export function createDOMElement(element: Fiber): DOMElement {
	if (typeof element === 'string') {
		return document.createTextNode(element)
	}

	if (typeof element.type === 'function') {
		return
	}

	const node = document.createElement(element.type)

	if (element.props && Object.keys(element.props).length > 0) {
		for (const [key, value] of Object.entries(element.props)) {
			if (key === 'children') {
				continue
			}

			if (isEventListener(key)) {
				const domAttr = getEventListenerKey(key)

				node.addEventListener(domAttr, value)
			} else if (isPropValid(key)) {
				node.setAttribute(key, value.toString())
			} else {
				node[key] = value
			}
		}
	}

	return node
}

export function updateDOMElement(
	dom: DOMElement,
	prevProps: Props,
	nextProps: Props
) {
	// eliminar o cambiar props viejas
	for (const [key, value] of Object.entries(prevProps)) {
		if (
			key === 'children' ||
			(key in nextProps && prevProps[key] === nextProps[key])
		) {
			continue
		}

		if (isEventListener(key)) {
			const domAttr = getEventListenerKey(key)

			dom.removeEventListener(domAttr, value)
		} else if (isPropValid(key) && dom instanceof HTMLElement) {
			dom.removeAttribute(key)
		} else {
			dom[key] = ''
		}
	}

	// añadir nuevas props
	for (const [key, value] of Object.entries(nextProps)) {
		if (key === 'children' || prevProps[key] === nextProps[key]) {
			continue
		}

		if (isEventListener(key)) {
			const domAttr = getEventListenerKey(key)

			dom.addEventListener(domAttr, value)
		} else if (isPropValid(key) && dom instanceof HTMLElement) {
			dom.setAttribute(key, value.toString())
		} else {
			dom[key] = value
		}
	}
}

export const typeofJsxElement = (element: JSXElement): FireElementType =>
	typeof element === 'string' ? 'TEXT_NODE' : element.type

export function render(element: JSXElement, container: HTMLElement | Text) {
	wipRoot.current = {
		type: typeof element === 'string' ? element : element.type,
		dom: container,
		props: {
			children: [element],
			nodeValue: typeof element === 'string' ? element : undefined,
		},
		alternate: wipRoot.current,
	}

	nextUnitOfWork.current = wipRoot.current

	deletions.current = []
}
