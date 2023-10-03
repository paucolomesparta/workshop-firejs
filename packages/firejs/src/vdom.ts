import isPropValid from '@emotion/is-prop-valid'

import { JSXElement, Props } from './types'

export function createElement<P extends Props>(
	type: string,
	props: P,
	...children: JSXElement[]
): JSXElement<P> {
	return { type, props, children }
}

export function cloneElement(element: JSXElement): JSXElement {
	return {
		type: element.type,
		props: { ...element.props },
		children: element.children ? [...element.children] : undefined,
	}
}

export function createHTMLNode(element: JSXElement): HTMLElement | Text {
	if (typeof element === 'string') {
		return document.createTextNode(element)
	}

	const node = document.createElement(element.type)

	if (element.props && Object.keys(element.props).length > 0) {
		for (const [key, value] of Object.entries(element.props)) {
			if (key === 'children') {
				continue
			}

			if (isPropValid(key)) {
				node.setAttribute(key, value.toString())
			} else {
				node[key] = value
			}
		}
	}

	if (element.children) {
		for (const child of element.children) {
			node.appendChild(createHTMLNode(child))
		}
	}

	return node
}

export function render(element: JSXElement, container: HTMLElement) {
	const node = createHTMLNode(element)

	container.appendChild(node)
}
