import type { RefObject } from './types'

export function createRef<T>(initialValue?: T): RefObject<T> {
	return { current: initialValue ?? null }
}
