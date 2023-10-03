import { Props, State } from './types'

export class Component<P extends Props, S extends State> {
	props: Props | undefined
	state: State = {} as State
	_pendingState: State | null = null

	constructor(props: Props) {
		this.props = props
	}

	_render() {
		
	}
}
