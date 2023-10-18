import isPropValid from '@emotion/is-prop-valid'

import { DOMElement, Fiber, FireElement, JSXElement, Props } from './types'
import { nextUnitOfWork } from './fiber'

function createTextNode(text: string): JSXElement {
	return { type: 'TEXT', props: { nodeValue: text, children: [] } }
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

export function cloneElement(element: FireElement): FireElement {
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

export function createDOMElement(element: JSXElement): DOMElement {
	if (typeof element === 'string') {
		return document.createTextNode(element)
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

export function render(element: JSXElement, container: HTMLElement | Text) {
	nextUnitOfWork.current = {
		dom: container,
		props: {
			children: [element],
		},
	}

	const node = createDOMElement(element)

	for (const child of element.props.children) {
		render(child, node)
	}

	container.appendChild(node)
}
