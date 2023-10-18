export type Props = Record<string, any>

export type DOMElement = HTMLElement | Text
export type FireElementType = string | Function | 'TEXT_NODE'
export type FireElement = string | Function | undefined

export type JSXElement<P extends Props = Props> = {
	type: FireElementType
	props: P & { children: JSXElement[]; nodeValue?: string }
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
