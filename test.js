const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (e) => { console.error("PAGE ERROR:", e); });
virtualConsole.on("warn", (e) => { console.warn("PAGE ERROR:", e); });
virtualConsole.on("jsdomError", (e) => { console.error("PAGE JSDOM ERROR:", e); });
virtualConsole.on("log", (l) => { console.log("PAGE LOG:", l); });

JSDOM.fromURL("http://localhost:3000/", {
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
}).then(dom => {
  setTimeout(() => process.exit(0), 4000);
}).catch(err => console.error(err));
