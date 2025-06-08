import { createElement } from "./index.js";

export { createElement };

export function jsx(type, props, key) {
  const { children, ...restProps } = props || {};
  if (children) {
    return createElement(type, { ...restProps, key }, ...(Array.isArray(children) ? children : [children]));
  }
  return createElement(type, { ...restProps, key });
}

export function jsxs(type, props, key) {
  const { children, ...restProps } = props || {};
  if (children) {
    return createElement(type, { ...restProps, key }, ...(Array.isArray(children) ? children : [children]));
  }
  return createElement(type, { ...restProps, key });
}

export function jsxDEV(type, props, key, isStaticChildren, source, self) {
  const { children, ...restProps } = props || {};
  if (children) {
    return createElement(type, { ...restProps, key }, ...(Array.isArray(children) ? children : [children]));
  }
  return createElement(type, { ...restProps, key });
}
