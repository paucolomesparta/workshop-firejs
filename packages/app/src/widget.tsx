import type {FireElement} from "firejs"

import "./widget.css"

type Props = {
    title: string;
    children: FireElement;
}

export function Widget({title, children}: Props) {
    return (
        <div className="widget-root">
            <h1>{title}</h1>
            <div>{children}</div>
        </div>
    )
}