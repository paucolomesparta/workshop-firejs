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

export function createDOMElement(element: Fiber): DOMElement {
	if (typeof element === 'string') {
		return document.createTextNode(element)
	}

	if (typeof element.type === 'function') {
		return
	}

	const node = document.createElement(element.type)

	const eventListenerRegex = /on([A-Z]{0,1}[a-z]+)/gm

	if (element.props && Object.keys(element.props).length > 0) {
		for (const [key, value] of Object.entries(element.props)) {
			if (key === 'children') {
				continue
			}

			const isEventListener = eventListenerRegex.test(key)

			if (isEventListener) {
				const eventListenerKey = key.replace(
					eventListenerRegex,
					(_, eventName) => eventName.toLowerCase()
				)

				node.addEventListener(eventListenerKey, value)
			} else if (isPropValid(key)) {
				node.setAttribute(key, value.toString())
			} else {
				node[key] = value
			}
		}
	}

	// if (element.props.children) {
	// 	for (const child of element.props.children) {
	// 		node.appendChild(createHTMLNode(child))
	// 	}
	// }

	return node
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

	// const node = createDOMElement(element)

	// for (const child of element.props.children) {
	// 	render(child, node)
	// }

	// container.appendChild(node)
}
