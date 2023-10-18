import {
	currentRoot,
	deletions,
	hookIndex,
	nextUnitOfWork,
	wipFiber,
	wipRoot,
} from "./globals";
import { Hook } from "./types";

export function useState<T, SetStateAction = { (value: T): T }>(
	initialState?: T,
): [T, (action: SetStateAction) => void] {
	const oldHook = wipFiber.current?.hooks?.[hookIndex.current];
	const hook: Hook = {
		state: oldHook ? oldHook.state : initialState,
		queue: [],
	};

	const actions = oldHook ? oldHook.queue : [];

	for (const action of actions) {
		hook.state = action(hook.state);
	}

	const setState = (action: SetStateAction) => {
		hook.queue.push(action);

		wipRoot.current = {
			dom: currentRoot.current.dom,
			props: currentRoot.current.props,
			alternate: currentRoot.current,
		};

		nextUnitOfWork.current = wipRoot.current;

		deletions.current = [];
	};

	wipFiber.current.hooks.push(hook);
	hookIndex.current++;

	return [hook.state, setState];
}
