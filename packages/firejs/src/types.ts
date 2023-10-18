export type Props = Record<string, any>

export type DOMElement = HTMLElement | Text
export type DOMElementKeys = keyof HTMLElementTagNameMap
export type FireElementType = DOMElementKeys | Function | 'TEXT_NODE'
export type FireElement = string | Function | null | undefined

export type JSXElement<P extends Props = Props> = {
	type: FireElementType
	props: P & { children: JSXElement[]; nodeValue?: string }
}

export interface FunctionComponent<P extends Props = Props> {
	(props: P): FireElement
}

export function isFunctionComponent<P extends Props = Props>(
	element: FireElementType
): element is FunctionComponent<P> {
	return typeof element === 'function'
}

export type RefObject<T> = {
	current: T | null
}

export type Fiber = {
	type: FireElementType
	props: Props & { children: JSXElement[]; nodeValue?: string }
	dom: DOMElement
	parent?: Fiber
	child?: Fiber
	sibling?: Fiber
	alternate?: Fiber
	effectTag?: 'CREATE' | 'UPDATE' | 'DELETE'
}
