// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (
  modules,
  entry,
  mainEntry,
  parcelRequireName,
  distDir,
  publicUrl,
  devServer
) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var importMap = previousRequire.i || {};
  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        globalObject
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.require = nodeRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.distDir = distDir;
  newRequire.publicUrl = publicUrl;
  newRequire.devServer = devServer;
  newRequire.i = importMap;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  // Only insert newRequire.load when it is actually used.
  // The code in this file is linted against ES5, so dynamic import is not allowed.
  // INSERT_LOAD_HERE

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });
    }
  }
})({"2n8kV":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SERVER_PORT = 1234;
var HMR_SECURE = false;
var HMR_ENV_HASH = "439701173a9199ea";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "b11c4b09d262e0ca";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_SERVER_PORT, HMR_ENV_HASH, HMR_SECURE, HMR_USE_SSE, chrome, browser, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: {|[string]: mixed|};
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_SERVER_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var HMR_USE_SSE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData[moduleName],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData[moduleName] = undefined;
}
module.bundle.Module = Module;
module.bundle.hotData = {};
var checkedAssets /*: {|[string]: boolean|} */ , disposedAssets /*: {|[string]: boolean|} */ , assetsToDispose /*: Array<[ParcelRequire, string]> */ , assetsToAccept /*: Array<[ParcelRequire, string]> */ , bundleNotFound = false;
function getHostname() {
    return HMR_HOST || (typeof location !== 'undefined' && location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
}
function getPort() {
    return HMR_PORT || (typeof location !== 'undefined' ? location.port : HMR_SERVER_PORT);
}
// eslint-disable-next-line no-redeclare
let WebSocket = globalThis.WebSocket;
if (!WebSocket && typeof module.bundle.root === 'function') try {
    // eslint-disable-next-line no-global-assign
    WebSocket = module.bundle.root('ws');
} catch  {
// ignore.
}
var hostname = getHostname();
var port = getPort();
var protocol = HMR_SECURE || typeof location !== 'undefined' && location.protocol === 'https:' && ![
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
].includes(hostname) ? 'wss' : 'ws';
// eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if (!parent || !parent.isParcelRequire) {
    // Web extension context
    var extCtx = typeof browser === 'undefined' ? typeof chrome === 'undefined' ? null : chrome : browser;
    // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes('test.js');
    }
    var ws;
    if (HMR_USE_SSE) ws = new EventSource('/__parcel_hmr');
    else try {
        // If we're running in the dev server's node runner, listen for messages on the parent port.
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) {
            parentPort.on('message', async (message)=>{
                try {
                    await handleMessage(message);
                    parentPort.postMessage('updated');
                } catch  {
                    parentPort.postMessage('restart');
                }
            });
            // After the bundle has finished running, notify the dev server that the HMR update is complete.
            queueMicrotask(()=>parentPort.postMessage('ready'));
        }
    } catch  {
        if (typeof WebSocket !== 'undefined') try {
            ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/');
        } catch (err) {
            if (err.message) console.error(err.message);
        }
    }
    if (ws) {
        // $FlowFixMe
        ws.onmessage = async function(event /*: {data: string, ...} */ ) {
            var data /*: HMRMessage */  = JSON.parse(event.data);
            await handleMessage(data);
        };
        if (ws instanceof WebSocket) {
            ws.onerror = function(e) {
                if (e.message) console.error(e.message);
            };
            ws.onclose = function() {
                console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
            };
        }
    }
}
async function handleMessage(data /*: HMRMessage */ ) {
    checkedAssets = {} /*: {|[string]: boolean|} */ ;
    disposedAssets = {} /*: {|[string]: boolean|} */ ;
    assetsToAccept = [];
    assetsToDispose = [];
    bundleNotFound = false;
    if (data.type === 'reload') fullReload();
    else if (data.type === 'update') {
        // Remove error overlay if there is one
        if (typeof document !== 'undefined') removeErrorOverlay();
        let assets = data.assets;
        // Handle HMR Update
        let handled = assets.every((asset)=>{
            return asset.type === 'css' || asset.type === 'js' && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
        });
        // Dispatch a custom event in case a bundle was not found. This might mean
        // an asset on the server changed and we should reload the page. This event
        // gives the client an opportunity to refresh without losing state
        // (e.g. via React Server Components). If e.preventDefault() is not called,
        // we will trigger a full page reload.
        if (handled && bundleNotFound && assets.some((a)=>a.envHash !== HMR_ENV_HASH) && typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') handled = !window.dispatchEvent(new CustomEvent('parcelhmrreload', {
            cancelable: true
        }));
        if (handled) {
            console.clear();
            // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
            if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') window.dispatchEvent(new CustomEvent('parcelhmraccept'));
            await hmrApplyUpdates(assets);
            hmrDisposeQueue();
            // Run accept callbacks. This will also re-execute other disposed assets in topological order.
            let processedAssets = {};
            for(let i = 0; i < assetsToAccept.length; i++){
                let id = assetsToAccept[i][1];
                if (!processedAssets[id]) {
                    hmrAccept(assetsToAccept[i][0], id);
                    processedAssets[id] = true;
                }
            }
        } else fullReload();
    }
    if (data.type === 'error') {
        // Log parcel errors to console
        for (let ansiDiagnostic of data.diagnostics.ansi){
            let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
            console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
        }
        if (typeof document !== 'undefined') {
            // Render the fancy html overlay
            removeErrorOverlay();
            var overlay = createErrorOverlay(data.diagnostics.html);
            // $FlowFixMe
            document.body.appendChild(overlay);
        }
    }
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] \u2728 Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="${protocol === 'wss' ? 'https' : 'http'}://${hostname}:${port}/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, '') : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          \u{1F6A8} ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + '</div>').join('')}
        </div>
        ${diagnostic.documentation ? `<div>\u{1F4DD} <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ''}
      </div>
    `;
    }
    errorHTML += '</div>';
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if (typeof location !== 'undefined' && 'reload' in location) location.reload();
    else if (typeof extCtx !== 'undefined' && extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
    else try {
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) parentPort.postMessage('restart');
    } catch (err) {
        console.error("[parcel] \u26A0\uFE0F An HMR update was not accepted. Please restart the process.");
    }
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute('href', // $FlowFixMe
    href.split('?')[0] + '?' + Date.now());
    // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout || typeof document === 'undefined') return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href /*: string */  = links[i].getAttribute('href');
            var hostname = getHostname();
            var servedFromHMRServer = hostname === 'localhost' ? new RegExp('^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):' + getPort()).test(href) : href.indexOf(hostname + ':' + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === 'js') {
        if (typeof document !== 'undefined') {
            let script = document.createElement('script');
            script.src = asset.url + '?t=' + Date.now();
            if (asset.outputFormat === 'esmodule') script.type = 'module';
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === 'function') {
            // Worker scripts
            if (asset.outputFormat === 'esmodule') return import(asset.url + '?t=' + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + '?t=' + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension fix
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3 && typeof ServiceWorkerGlobalScope != 'undefined' && global instanceof ServiceWorkerGlobalScope) {
                        extCtx.runtime.reload();
                        return;
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle /*: ParcelRequire */ , asset /*:  HMRAsset */ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === 'css') reloadCSS();
    else if (asset.type === 'js') {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
            // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        }
        // Always traverse to the parent bundle, even if we already replaced the asset in this bundle.
        // This is required in case modules are duplicated. We need to ensure all instances have the updated code.
        if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        }
        // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id];
        // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    checkedAssets = {};
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
    // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else if (a !== null) {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) {
            bundleNotFound = true;
            return true;
        }
        return hmrAcceptCheckOne(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return null;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    if (!cached) return true;
    assetsToDispose.push([
        bundle,
        id
    ]);
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        assetsToAccept.push([
            bundle,
            id
        ]);
        return true;
    }
    return false;
}
function hmrDisposeQueue() {
    // Dispose all old assets.
    for(let i = 0; i < assetsToDispose.length; i++){
        let id = assetsToDispose[i][1];
        if (!disposedAssets[id]) {
            hmrDispose(assetsToDispose[i][0], id);
            disposedAssets[id] = true;
        }
    }
    assetsToDispose = [];
}
function hmrDispose(bundle /*: ParcelRequire */ , id /*: string */ ) {
    var cached = bundle.cache[id];
    bundle.hotData[id] = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData[id]);
    });
    delete bundle.cache[id];
}
function hmrAccept(bundle /*: ParcelRequire */ , id /*: string */ ) {
    // Execute the module.
    bundle(id);
    // Run the accept callbacks in the new version of the module.
    var cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        let assetsToAlsoAccept = [];
        cached.hot._acceptCallbacks.forEach(function(cb) {
            let additionalAssets = cb(function() {
                return getParents(module.bundle.root, id);
            });
            if (Array.isArray(additionalAssets) && additionalAssets.length) assetsToAlsoAccept.push(...additionalAssets);
        });
        if (assetsToAlsoAccept.length) {
            let handled = assetsToAlsoAccept.every(function(a) {
                return hmrAcceptCheck(a[0], a[1]);
            });
            if (!handled) return fullReload();
            hmrDisposeQueue();
        }
    }
}

},{}],"l1WLd":[function(require,module,exports,__globalThis) {
var _firebaseJs = require("./firebase.js");
var _auth = require("firebase/auth");
var _firestore = require("firebase/firestore");
console.log('[ANALYSIS] loaded');
document.addEventListener('DOMContentLoaded', ()=>{
    console.log('[ANALYSIS] DOMContentLoaded');
    const sidebar = document.getElementById('sidebar');
    document.getElementById('open-sidebar').addEventListener('click', ()=>sidebar.classList.add('open'));
    document.getElementById('close-sidebar').addEventListener('click', ()=>sidebar.classList.remove('open'));
    document.getElementById('logout-link').addEventListener('click', async (e)=>{
        e.preventDefault();
        await (0, _auth.signOut)((0, _firebaseJs.auth));
        window.location.href = '../index.html';
    });
    document.querySelectorAll('.filter-btn').forEach((btn)=>{
        btn.addEventListener('click', ()=>{
            document.querySelector('.filter-btn.active')?.classList.remove('active');
            btn.classList.add('active');
        });
    });
    document.getElementById('period-select').addEventListener('change', (e)=>{
        console.log('[ANALYSIS] period change:', e.target.value);
    });
    (0, _auth.onAuthStateChanged)((0, _firebaseJs.auth), (user)=>{
        if (!user) return window.location.href = '../index.html';
        reactiveAnalysis(user.uid);
    });
});
let trendChart, barChart, pieChart;
const groupColors = {
    'Agricultura y Medio Ambiente': '#A8D5BA',
    "Alimentos y Restauraci\xf3n": '#FFB6B9',
    'Arte y Cultura': '#FFD3B4',
    "Automoci\xf3n y Transporte": '#C3B1E1',
    'Belleza y Cuidado Personal': '#FFDAC1',
    "Bienes Ra\xedces y Vivienda": '#E2F0CB',
    'Compras y Retail': '#C0E8F9',
    "Deportes y Recreaci\xf3n": '#FFC3A0',
    "Educaci\xf3n y Capacitaci\xf3n": '#B5EAD7',
    'Entretenimiento y Ocio': '#D5AAFF',
    'Eventos y Celebraciones': '#FDCBBA',
    'Finanzas y Seguros': '#D4A5A5',
    "Gobierno y Servicios P\xfablicos": '#AED9E0',
    "Hogar y Jard\xedn": '#FFF5BA',
    'Industrial y Manufactura': '#F1C0E8',
    'Mascotas y Animales': '#B5B9F8',
    'Otros': '#D9D9D9',
    "Religi\xf3n y Comunidad": '#FFCBC1',
    'Salud y Medicina': '#BEE1E6',
    'Servicios Profesionales': '#E4BAD4',
    "Tecnolog\xeda e Internet": '#A2D2FF',
    "Viajes y Hosteler\xeda": '#FFC9DE',
    'Loan Payments': '#B0BEC5'
};
function reactiveAnalysis(userId) {
    console.log('[ANALYSIS] Start reactiveAnalysis for', userId);
    const db = (0, _firestore.getFirestore)((0, _firebaseJs.app));
    const histRef = (0, _firestore.collection)(db, 'users', userId, 'history');
    const sumRef = (0, _firestore.collection)(db, 'users', userId, 'historySummary');
    const txsByMonth = new Map();
    const catByMonth = new Map();
    let unsubscribeFns = [];
    initCharts();
    function renderAnalysis() {
        const months = Array.from(txsByMonth.keys()).sort();
        console.log('[RENDER] Months:', months);
        const revenue = months.map((mon)=>{
            const txs = txsByMonth.get(mon) || [];
            return txs.reduce((sum, tx)=>sum + (tx.amount > 0 ? tx.amount : 0), 0);
        });
        const spend = months.map((mon)=>{
            const txs = txsByMonth.get(mon) || [];
            return txs.reduce((sum, tx)=>sum + (tx.amount < 0 ? Math.abs(tx.amount) : 0), 0);
        });
        const netIncome = months.map((_, i)=>revenue[i] - spend[i]);
        const catMap = {};
        months.forEach((mon)=>{
            const catObj = catByMonth.get(mon) || {};
            console.log(`[RENDER] Categor\xedas para ${mon}:`, catObj);
            for (const [cat, amount] of Object.entries(catObj))catMap[cat] = (catMap[cat] || 0) + amount;
        });
        const catLabels = Object.keys(catMap);
        const catData = catLabels.map((c)=>+catMap[c].toFixed(2));
        const catColors = catLabels.map((label)=>groupColors[label] || '#999');
        const totalRev = revenue.reduce((a, b)=>a + b, 0);
        const totalSp = spend.reduce((a, b)=>a + b, 0);
        document.getElementById('kpi-revenue').textContent = `\u{20AC}${totalRev.toFixed(2)}`;
        document.getElementById('kpi-spend').textContent = `\u{20AC}${totalSp.toFixed(2)}`;
        const revChange = revenue.length > 1 ? (revenue.at(-1) - revenue.at(-2)) / Math.max(revenue.at(-2), 1) * 100 : 0;
        const spendChange = spend.length > 1 ? (spend.at(-1) - spend.at(-2)) / Math.max(spend.at(-2), 1) * 100 : 0;
        document.getElementById('kpi-revenue-change').textContent = `${revChange >= 0 ? '+' : ''}${revChange.toFixed(1)}% vs anterior mes`;
        document.getElementById('kpi-spend-change').textContent = `${spendChange >= 0 ? '+' : ''}${spendChange.toFixed(1)}% vs anterior mes`;
        trendChart.updateOptions({
            series: [
                {
                    name: 'Ingresos',
                    data: revenue
                },
                {
                    name: 'Gastos',
                    data: spend
                }
            ],
            xaxis: {
                categories: months
            }
        });
        barChart.updateOptions({
            series: [
                {
                    name: 'Saldo Neto',
                    data: netIncome
                }
            ],
            xaxis: {
                categories: months
            }
        });
        const pContainer = document.querySelector('#pieChart');
        pContainer.innerHTML = '';
        pieChart = new ApexCharts(pContainer, {
            chart: {
                type: 'pie',
                height: 220,
                animations: {
                    enabled: false
                }
            },
            series: catData,
            labels: catLabels,
            colors: catColors,
            legend: {
                position: 'bottom'
            },
            noData: {
                text: "Sin datos de categor\xedas",
                align: 'center',
                verticalAlign: 'middle',
                style: {
                    color: '#999',
                    fontSize: '14px'
                }
            }
        });
        pieChart.render();
    }
    function clearPreviousSubscriptions() {
        unsubscribeFns.forEach((unsub)=>unsub());
        unsubscribeFns = [];
    }
    function subscribeToMonth(mon) {
        const itemsRef = (0, _firestore.collection)(db, 'users', userId, 'history', mon, 'items');
        const unsubItems = (0, _firestore.onSnapshot)(itemsRef, (snap)=>{
            console.log('[ANALYSIS] items change in', mon, snap.docs.length);
            txsByMonth.set(mon, snap.docs.map((d)=>d.data()));
            renderAnalysis();
        });
        unsubscribeFns.push(unsubItems);
        const catDocRef = (0, _firestore.doc)(db, 'users', userId, 'historyCategorias', mon);
        const unsubCat = (0, _firestore.onSnapshot)(catDocRef, (snap)=>{
            if (snap.exists()) {
                const data = snap.data();
                delete data.updatedAt;
                catByMonth.set(mon, data);
                console.log(`[ANALYSIS] historyCategorias actualizadas para ${mon}:`, data);
            } else console.log(`[ANALYSIS] No hay historyCategorias para ${mon}`);
            renderAnalysis();
        });
        unsubscribeFns.push(unsubCat);
    }
    function refreshSubscriptions(months) {
        clearPreviousSubscriptions();
        months.forEach((mon)=>subscribeToMonth(mon));
    }
    const monthsSet = new Set();
    function updateSubscriptions() {
        const allMonths = Array.from(monthsSet).sort();
        console.log('[ANALYSIS] Subscribing to months:', allMonths);
        refreshSubscriptions(allMonths);
    }
    function collectMonthsFromSnapshot(snap) {
        const newMonths = new Set();
        snap.docs.forEach((d)=>newMonths.add(d.id));
        return newMonths;
    }
    (0, _firestore.onSnapshot)(histRef, (snap)=>{
        const newMonths = collectMonthsFromSnapshot(snap);
        newMonths.forEach((m)=>monthsSet.add(m));
        console.log('[ANALYSIS] history months updated:', Array.from(monthsSet));
        updateSubscriptions();
    });
    (0, _firestore.onSnapshot)(sumRef, (snap)=>{
        const newMonths = collectMonthsFromSnapshot(snap);
        newMonths.forEach((m)=>monthsSet.add(m));
        console.log('[ANALYSIS] summary months updated:', Array.from(monthsSet));
        updateSubscriptions();
    });
}
function initCharts() {
    console.log('[ANALYSIS] initCharts llamado');
    const tEl = document.querySelector('#trendChart');
    tEl.innerHTML = '';
    trendChart = new ApexCharts(tEl, {
        chart: {
            type: 'line',
            height: 240,
            toolbar: {
                show: false
            }
        },
        series: [],
        xaxis: {
            categories: []
        },
        yaxis: {
            labels: {
                formatter: (val)=>Math.round(val)
            }
        },
        colors: [
            '#4ADE80',
            '#F87171'
        ],
        stroke: {
            curve: 'smooth',
            width: 2
        },
        grid: {
            borderColor: '#eee'
        }
    });
    trendChart.render();
    const bEl = document.querySelector('#barChart');
    bEl.innerHTML = '';
    barChart = new ApexCharts(bEl, {
        chart: {
            type: 'bar',
            height: 200,
            toolbar: {
                show: false
            }
        },
        series: [],
        xaxis: {
            categories: []
        },
        yaxis: {
            labels: {
                formatter: (val)=>Math.round(val)
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                colors: {
                    ranges: [
                        {
                            from: -Infinity,
                            to: 0,
                            color: '#F87171'
                        },
                        {
                            from: 0.01,
                            to: Infinity,
                            color: '#4ADE80'
                        } // verde
                    ]
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        tooltip: {
            y: {
                formatter: (val)=>`\u{20AC}${val.toFixed(2)}`
            }
        },
        grid: {
            borderColor: '#eee'
        }
    });
    barChart.render();
    const pEl = document.querySelector('#pieChart');
    pEl.innerHTML = '';
    pieChart = new ApexCharts(pEl, {
        chart: {
            type: 'pie',
            height: 220,
            animations: {
                enabled: false
            }
        },
        series: [],
        labels: [],
        colors: [],
        legend: {
            position: 'bottom'
        },
        noData: {
            text: 'Cargando datos...',
            align: 'center',
            verticalAlign: 'middle',
            style: {
                color: '#999',
                fontSize: '14px'
            }
        }
    });
    pieChart.render();
}
let lastScrollTop = 0;
const nav = document.getElementById('bottom-nav');
window.addEventListener('scroll', ()=>{
    const currentScroll = window.scrollY;
    if (!nav) return;
    if (currentScroll > lastScrollTop && currentScroll > 60) nav.classList.add('hide');
    else nav.classList.remove('hide');
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}, {
    passive: true
});

},{"./firebase.js":"24zHi","firebase/auth":"4ZBbi","firebase/firestore":"3RBs1"}]},["2n8kV","l1WLd"], "l1WLd", "parcelRequire94c2")

//# sourceMappingURL=analysis.d262e0ca.js.map
