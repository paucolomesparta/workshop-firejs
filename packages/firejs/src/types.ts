export type Props = Record<string, any>
export type State = Record<string, any>

export type JSXElement<P extends Props = Props> =
	| {
			type: string
			props: P & { children: JSXElement[] }
	  }
	| {
			type: 'TEXT'
			props: P & { nodeValue: string }
	  }

export type DOMElement = HTMLElement | Text
export type FireElement = JSXElement | string

export type Patch =
	| {
			type: 'REPLACE'
	  }
	| {
			type: 'REMOVE'
	  }
	| {
			type: 'UPDATE'
			props: Props
			children: Patch[]
	  }

export type RefObject<T> = {
	current: T | null
}

export type ComponentType = Function | string

export type Fiber = {
	dom: DOMElement
	parent?: Fiber
	child?: Fiber
	sibling?: Fiber
	// type: string
	props: Props & { children: JSXElement[] }
}
