import * as pyodide from 'https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.mjs'
import { isProxy } from "./utils.js";

globalThis.webPy = await pyodide.loadPyodide({
	indexURL: "https://cdn.jsdelivr.net/pyodide/v0.22.1/full/",
	fullStdLib: true,
});

export let webPy = globalThis.webPy;

await webPy.loadPackage([ "micropip" ]);

export const micropip = webPy.pyimport("micropip");

globalThis.Python = async function R(strings, ...values) {

	let evaluated = "";
	for (let i = 0; i < strings.length; i++) {
		evaluated += strings[ i ];
		if (i < values.length) {
			evaluated += values[ i ];
		}
	}

	const ret = await webPy.runPython(evaluated)

	if (ret === undefined) {
		return
	} else if (isProxy(ret)) {
		return Promise.resolve(ret.toJs())
	} else {
		return ret
	}
	

}
