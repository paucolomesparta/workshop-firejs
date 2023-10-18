import { createElement, render } from "./vdom";
import { useState } from "./hooks";

const FireJS = {
	createElement,
	render,
	useState,
};

export { createElement, render, useState };
export default FireJS;
export type { JSXElement } from "./types";
