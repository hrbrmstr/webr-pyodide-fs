---
{
  "title": "🧪 WebR + Pyodide and Emscripten's Filesystem",
  "description": "Sharing Data Between R and Python Contexts",
  "og" : {
    "site_name": "WebR Exeriments",
    "url": "https://rud.is/w/webr-pyodide-fs",
    "description": "Sharing Data Between R and Python Contexts",
    "image": {
      "url": "https://rud.is/w/webr-pyodide-fs",
      "height": "1170",
      "width": "1932",
      "alt": "example"
    }
  },
  "twitter": {
    "site": "@hrbrmstr",
    "domain": "rud.is"
  },
	"extra_header_bits": [
		"<link rel='apple-touch-icon' sizes='180x180' href='./favicon/apple-touch-icon.png'/>",
		"<link rel='icon' type='image/png' sizes='32x32' href='./favicon/favicon-32x32.png'/>",
		"<link rel='icon' type='image/png' sizes='16x16' href='./favicon/favicon-16x16.png'/>",
		"<link rel='manifest' href='./favicon/site.webmanifest'/>",
		"<link href='./src/index.css' rel='stylesheet'/>",
		"<link href='./src/components.css' rel='stylesheet'/>",
		"<script type='module' src='./src/main.js'></script>"
	],
	"extra_body_bits": [
		"<!-- extra body bits -->"
	]
}
---
# 🧪 WebR + Pyodide and Emscripten's Filesystem

<status-message id="webr-status" text="WebR Loading…"></status-message>

## Can We Share Data Between R and Python Contexts Via Emscripten's Filesystem?

Experiment hypothesis: It is not possible to share virtual filesystems across multiple WebR or Pyodide contexts.

Experiment parameters:

- Webr
- Pyodide
- Emscripten's Filesystem
- `R` template tag function
- <span class="pill">New!</span> `Python` template tag function
- Lit (web components)
- Vite (for building)

## Emscripten All The Things

If you're going to play in WebR, Pyodide, or other, similar WASM'd things, you're going to hear/see the word "[Emscripten](https://emscripten.org/)" because that's the magic that makes it possible to turn native beasties into something that can be run in a WASM context.

Emscripten is an open-source compiler toolchain that allows you to compile C and C++ code — or any language that uses LLVM (Low Level Virtual Machine) — to WebAssembly or `asm.js`, which can be run in web browsers or other JavaScript contexts. The Emscripten toolchain is based on said LLVM, which is a popular compiler infrastructure project, and provides a way to port existing C/C++ code to the web without having to rewrite it in JavaScript. I mention LLVM [quite a bit in my Daily Drops](https://dailyfinds.hrbrmstr.dev/archive?sort=search&search=llvm).

More to the point of today's WebR experiment, Emscripten also provides a virtual file system that allows WASM-ified things to access files and directories in the browser or in other JavaScript contexts. This file system can be used to load and store data from the browser's local storage, to read and write files to the browser's [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), and to access files that are part of the compiled code itself (such as assets and configuration files).

[By default](https://emscripten.org/docs/api_reference/Filesystem-API.html?highlight=web_user), Emscrpiten creates `/home/web_user` and `/tmp`, so they _would_ be common directories, if there was a single shared Emscripten in-browser filesystem.

## Experiment Results

Given that browser WASM contexts are [sandboxed](https://webassembly.org/docs/security/), I figured that each got its own Emscripten filesystem. It makes sense that they wouldn't, but it's also easy to prove one way or another. 

Some new bits to check out in the code:

- This `py.js` now has a Python tag function similar to the one I made for R
- This `r.js` now has `webR2`, a second, separate instantiation of WebR, so we can prove separate WebR contexts can't access each other

Below, there are three output blocks, they contain a recursive directory listing of `/home` in each context.

To have something to list, we "touch" some files:

```js
// "touch" two files in Python. Pyodide uses `pyodide` as the home dir, but Emscripten's
// default `/home/web_user` is also there. R uses that default, so if this filesystem was
// shared, anything we create in it here would show up there.
await Python`os.close(os.open("/home/web_user/py-new-file-web-user", os.O_CREAT))`
await Python`os.close(os.open("/home/pyodide/py-new-file-pyodide", os.O_CREAT))`

// "touch" a file in R; again, if shared, Python would see this b/c it has `/home/web_user`
await R`writeLines("", "/home/web_user/r-new-file-web-user")`

// list files/dirs (recursively) in python
const pyFiles = await Python`glob.glob("/home/**", recursive = True)`

// notice how so much better R is than Python since you 100% semantically know
// what this call to `list.files()` is doing. 🙃
const rFiles = await R`list.files("/home", full.names=TRUE, include.dirs=TRUE, recursive=TRUE)`
const r2Files = await (await webR2.evalR`list.files("/home", full.names=TRUE, include.dirs=TRUE, recursive=TRUE)`).toJs()
```

And, the results are in!

**WebR's `/home`**
<pre class="shiki" id="r-fs"></pre>

**Second instance of WebR's `/home`**
<pre class="shiki" id="r2-fs"></pre>

**Pyodide's `/home`**
<pre class="shiki" id="py-fs"></pre>

## Hack To Use WebR's "Data" In Pyodide

I don't _think_ there's (yet) an equivalent of Pyodide's [ability to access its parent JavaScript context from within Pyodide](https://pyodide.org/en/stable/usage/quickstart.html#accessing-javascript-scope-from-python). If I'm right about that, fear not, since it's almost a given that there will be an equivalent as WebR matures.

For now, you can hacky-access R's data from Pyodide this way:

```js
await R`hi <- "Hi from R!"`

console.log(await webPy.runPythonAsync(`
import js
res = await js.R("hi")
res + " Back at ya, from Python!"
`))
```

Open up your browser's Developer Tools console to see that the above does, indeed, work.

## FIN

The results were unsurprising, but hopefully this will save others some time down the road.

<p style="text-align: center">Brought to you by @hrbrmstr</p>
