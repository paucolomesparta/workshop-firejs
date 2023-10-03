export type Props = Record<string, any>
export type State = Record<string, any>

export interface JSXElement<P extends Props = Props> {
	type: string
	props?: P
	children?: JSXElement[]
}

export type Patch = {
	
}
