import type { JSXElement, Patch } from './types'
import { createDOMElement } from './vdom'

const propResolutions: Record<string, string> = {
	className: 'class',
	htmlFor: 'for',
}

// DFS traversal in preorder
export function diff(oldTree: JSXElement, newTree: JSXElement): Patch | null {
	if (oldTree === newTree || (oldTree === null && newTree === null)) {
		return null
	}

	if (typeof newTree === 'string') {
		if (oldTree !== newTree) {
			return {
				type: 'UPDATE',
				props: {},
				children: [],
			}
		}

		return null
	}

	if (typeof oldTree !== typeof newTree || typeof oldTree === 'string') {
		return {
			type: 'REPLACE',
		}
	}

	const patch: Patch = {
		type: 'UPDATE',
		props: {},
		children: [],
	}

	const allProps = { ...oldTree.props, ...newTree.props }

	for (const propKey of Object.keys(allProps)) {
		const oldProp = oldTree.props?.[propKey]
		const newProp = newTree.props?.[propKey]

		if (typeof newProp === 'undefined') {
			patch.props[propKey] = null
		} else if (oldProp !== newProp) {
			patch.props[propKey] = newProp
		}
	}

	const maxLength = Math.max(
		oldTree.children?.length ?? 0,
		newTree.children?.length ?? 0
	)

	for (let i = 0; i < maxLength; i++) {
		const oldChild = oldTree.children?.[i]
		const newChild = newTree.children?.[i]

		if (!oldChild || !newChild) continue

		const childPatch = diff(oldChild, newChild)

		if (childPatch) {
			patch.children.push(childPatch)
		}
	}

	return patch
}

// export function patch(container: JSXElement, patches: Patch[]) {
// 	for (const patch of patches) {
// 		if (patch.type === 'REPLACE') {
// 			container = createHTMLNode(container)
// 		} else if (patch.type === 'UPDATE') {
// 			for (const [key, value] of Object.entries(patch.props)) {
// 				if (value === null) {
// 					container.removeAttribute(key)
// 				} else {
// 					container.setAttribute(key, value.toString())
// 				}
// 			}

// 			for (const [i, childPatch] of patch.children.entries()) {
// 				patch(container.children[i] as JSXElement, childPatch)
// 			}
// 		} else {
// 			container.remove()
// 		}
// 	}
// }
