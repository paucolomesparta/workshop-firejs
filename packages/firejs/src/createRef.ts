import type { RefObject } from "./types";

/**
 * Crea una referencia mutable
 */
export function createRef<T>(initialValue?: T): RefObject<T> {
	return { current: initialValue ?? null };
}
