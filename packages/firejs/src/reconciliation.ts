import { cloneElement } from './vdom'

import type { JSXElement } from './types'

// DFS traversal in preorder
export function diff(
	oldTree: JSXElement | undefined,
	newTree: JSXElement
): JSXElement {
	if (!oldTree || oldTree.type !== newTree.type) {
		return cloneElement(newTree)
	}

	const reconciledProps = { ...oldTree.props, ...newTree.props }

	const reconciledChildren: JSXElement[] = []

	const maxChildrenLength = Math.max(
		oldTree.children?.length ?? 0,
		newTree.children?.length ?? 0
	)

	for (let i = 0; i < maxChildrenLength; i++) {
		const oldChild = oldTree.children?.[i]
		const newChild = newTree.children?.[i]

		if (!newChild) {
			continue
		}

		reconciledChildren.push(diff(oldChild, newChild))
	}

	return {
		type: newTree.type,
		props: reconciledProps,
		children: reconciledChildren,
	}
}
