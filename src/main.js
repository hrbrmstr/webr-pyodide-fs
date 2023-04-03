import './status-message.js'

let webrMessage = document.getElementById("webr-status");
webrMessage.text = ""

import './r.js'
import './py.js'

webrMessage.text = "WebR + Pyodide Loaded!"

const pyFs = document.getElementById("py-fs")
const rFs = document.getElementById("r-fs")
const r2Fs = document.getElementById("r2-fs")

await Python`
import glob
import os
`

await Python`os.close(os.open("/home/web_user/py-new-file-web-user", os.O_CREAT))`
await Python`os.close(os.open("/home/pyodide/py-new-file-pyodide", os.O_CREAT))`

await R`writeLines("", "/home/web_user/r-new-file-web-user")`

const pyFiles = await Python`glob.glob("/home/**", recursive = True)`

const rFiles = await R`list.files("/home", full.names=TRUE, include.dirs=TRUE, recursive=TRUE)`
const r2Files = await (await webR2.evalR`list.files("/home", full.names=TRUE, include.dirs=TRUE, recursive=TRUE)`).toJs()

rFs.innerText = rFiles.join("\n")
r2Fs.innerText = r2Files.values.join("\n")
pyFs.innerText = pyFiles.join("\n")

await R`hi <- "Hi from R!"`

console.log(await webPy.runPythonAsync(`
import js
res = await js.R("hi")
res + " Back at ya, from Python!"
`))