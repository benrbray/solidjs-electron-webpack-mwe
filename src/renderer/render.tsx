import { render } from "solid-js/dom";
import { createSignal, onCleanup, createEffect, createState } from "solid-js";

class Renderer {
	// ui elements
	_react:null | any;

	constructor() {
		this._react = null;
	}

	init() {
		const App = () => {
			// create solid state
			let [state, setState] = createState({filePath:"not reactive!"});
			this._react = { state, setState }

			// print file path on change
			createEffect(()=>console.log("\n\nfilePath:", state.filePath, "\n\n\n"));

			const [count, setCount] = createSignal(0),
			timer = setInterval(() => setCount(count() + 1), 1000);
			onCleanup(() => clearInterval(timer));

			// components
			const AppSidebar = () => {
				return (<div id="sidebar">
					<div class="explorer" id="explorer"></div>
				</div>);
			}

			const AppContent = () => {
				return (<div id="content">Counter: {count()}</div>);
			}

			const AppFooter = () => {
				return (
					<div id="footer" onClick={() => setState("filePath", l => l + "!")}>
						<div id="title">{state.filePath}</div>
					</div>
				);
			}

			return (<div id="app">
				<AppSidebar />
				<AppContent />
				<AppFooter />
			</div>)
		}

		render(() => <App />, document.body);
	}
}

export default Renderer;