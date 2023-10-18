import { createRef } from './createRef'
import { Fiber } from './types'

export const nextUnitOfWork = createRef<Fiber>()
export const wipRoot = createRef<Fiber>()
export const currentRoot = createRef<Fiber>()
export const deletions = createRef<Fiber[]>()
