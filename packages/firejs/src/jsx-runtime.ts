import { createElement } from "./index.js";

export { createElement };

export function jsx(type, props, key) {
  return createElement(type, { ...props, key });
}

export function jsxs(type, props, key) {
  return createElement(type, { ...props, key });
}

export function jsxDEV(type, props, key, isStaticChildren, source, self) {
  return createElement(type, { ...props, key });
}
