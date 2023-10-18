import fire from "firejs";
import App from "./app";

const container = document.getElementById("root");

fire.render(fire.createElement(App, {}), container);
