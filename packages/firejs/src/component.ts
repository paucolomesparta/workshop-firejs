import { diff } from './reconciler'

import type { JSXElement, Props, State } from './types'

export abstract class Component<P extends Props, S extends State> {
	props: Props | undefined
	state: State = {} as State
	_pendingState: State | null = null
	_prevVDom: JSXElement
	_vDom: JSXElement

	constructor(props: Props) {
		this.props = props
	}

	abstract render(): JSXElement

	_render() {
		this._prevVDom = this._vDom

		this._vDom = this.render()

		const patches = diff(this._prevVDom, this._vDom)
	}

	setState(newState: State) {
		this._pendingState = newState
		this._render()
	}

	getSnapshotBeforeUpdate() {
		return null
	}
}
