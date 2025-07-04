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
})({"i7B0l":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SERVER_PORT = 1234;
var HMR_SECURE = false;
var HMR_ENV_HASH = "439701173a9199ea";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "057dbc5b0e22dfc7";
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

},{}],"j59nl":[function(require,module,exports,__globalThis) {
// ─────────────────────────────────────────────────────────────────────────────
// transactions.js – Lógica completa con soporte offline/online + logging
// ─────────────────────────────────────────────────────────────────────────────
var _firebaseJs = require("./firebase.js");
var _auth = require("firebase/auth");
var _firestore = require("firebase/firestore");
var _idb = require("idb");
console.log('[Init] transactions.js loaded');
// ─────────────────────────────────────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────────────────────────────────────
const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5001/fintrack-1bced/us-central1/api' : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';
const DB_NAME = 'transactions-db';
const DB_VERSION = 1;
const STORE_TXS = 'txs';
const PAGE_SIZE = 20;
let currentPage = 1;
let allTxsGlobal = [];
// ─────────────────────────────────────────────────────────────────────────────
// IndexedDB
// ─────────────────────────────────────────────────────────────────────────────
async function openTxDB() {
    return (0, _idb.openDB)(DB_NAME, DB_VERSION, {
        upgrade (db) {
            if (!db.objectStoreNames.contains(STORE_TXS)) db.createObjectStore(STORE_TXS, {
                keyPath: 'transaction_id'
            });
        }
    });
}
async function cacheTransactions(txs) {
    const db = await openTxDB();
    const tx = db.transaction(STORE_TXS, 'readwrite');
    for (const t of txs)if (t.transaction_id) tx.store.put(t);
    await tx.done;
    console.log('[CACHE] Transacciones guardadas en IndexedDB:', txs.length);
}
async function getCachedTransactions() {
    const db = await openTxDB();
    const txs = await db.getAll(STORE_TXS);
    console.log('[CACHE] Transacciones obtenidas de IndexedDB:', txs.length);
    return txs;
}
async function writeToIndexedDB(key, value) {
    const db = await (0, _idb.openDB)('fintrack-db', 1);
    const tx = db.transaction('metadata', 'readwrite');
    tx.objectStore('metadata').put(value, key);
    await tx.done;
}
async function readFromIndexedDB(key) {
    const db = await (0, _idb.openDB)('fintrack-db', 1);
    return db.transaction('metadata').objectStore('metadata').get(key);
}
// ─────────────────────────────────────────────────────────────────────────────
// Renderizado
// ─────────────────────────────────────────────────────────────────────────────
function renderTxItem(tx) {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.innerHTML = `
    <span class="account-label">${tx.accountName}</span>
    <div class="desc">${tx.description}</div>
    <span class="date">${new Date(tx.date).toLocaleDateString()}</span>
    <span class="amount ${tx.amount < 0 ? 'debit' : 'credit'}">
      ${tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)} \u{20AC}
    </span>
  `;
    return div;
}
function renderChronoPage(txs) {
    const list = document.getElementById('transactions-list');
    list.innerHTML = '';
    txs.forEach((tx)=>list.appendChild(renderTxItem(tx)));
}
function renderGroupedPage(txs) {
    const list = document.getElementById('transactions-list');
    list.innerHTML = '';
    const groups = txs.reduce((acc, tx)=>{
        const cat = tx.category || "Sin categor\xeda";
        (acc[cat] = acc[cat] || []).push(tx);
        return acc;
    }, {});
    Object.entries(groups).forEach(([cat, items])=>{
        const sec = document.createElement('div');
        sec.className = 'category-group';
        sec.innerHTML = `<h3>${cat}</h3>`;
        items.forEach((tx)=>sec.appendChild(renderTxItem(tx)));
        list.appendChild(sec);
    });
}
function getFilteredTxs() {
    const month = document.getElementById('month-select').value;
    const year = document.getElementById('year-select').value;
    if (!month || !year) return allTxsGlobal;
    return allTxsGlobal.filter((tx)=>{
        const txDate = new Date(tx.date);
        const txMonth = String(txDate.getMonth() + 1).padStart(2, '0');
        const txYear = String(txDate.getFullYear());
        return txMonth === month && txYear === year;
    });
}
function updatePagination() {
    const total = getFilteredTxs().length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= pages;
    document.getElementById('page-info').textContent = `P\xe1gina ${currentPage} de ${pages}`;
}
function showPage() {
    console.log("[UI] Mostrando p\xe1gina actual:", currentPage);
    const arr = getFilteredTxs();
    const start = (currentPage - 1) * PAGE_SIZE;
    const slice = arr.slice(start, start + PAGE_SIZE);
    document.getElementById('toggle-view').checked ? renderGroupedPage(slice) : renderChronoPage(slice);
    updatePagination();
}
// ─────────────────────────────────────────────────────────────────────────────
// UI y eventos
// ─────────────────────────────────────────────────────────────────────────────
function setupEventListeners() {
    console.log('[UI] Inicializando eventos UI');
    // ─── Selectores de MES y AÑO ────────────────────────
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    const applyBtn = document.getElementById('apply-filter-btn');
    const clearBtn = document.getElementById('clear-filter-btn');
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYear = now.getFullYear();
    // Rellenar selector de años con opción por defecto
    if (yearSelect.options.length === 0) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = "A\xf1o";
        yearSelect.appendChild(defaultOption);
        for(let y = currentYear; y >= 2020; y--){
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            yearSelect.appendChild(opt);
        }
    }
    // Establecer mes y año como vacíos al cargar
    monthSelect.value = '';
    yearSelect.value = '';
    // ─── Aplicar filtro manualmente ─────────────────────
    if (applyBtn) applyBtn.addEventListener('click', ()=>{
        console.log("[FILTER] Aplicando filtro \u2192", yearSelect.value, monthSelect.value);
        currentPage = 1;
        showPage();
    });
    // ─── Borrar filtro y mostrar todas las transacciones ─
    if (clearBtn) clearBtn.addEventListener('click', ()=>{
        monthSelect.value = '';
        yearSelect.value = '';
        console.log('[FILTER] Filtro borrado. Mostrando todas las transacciones');
        currentPage = 1;
        showPage();
    });
    // ─── Paginación anterior ────────────────────────────
    const prevBtn = document.getElementById('prev-page');
    if (prevBtn) prevBtn.addEventListener('click', ()=>{
        if (currentPage > 1) {
            currentPage--;
            showPage();
        }
    });
    // ─── Paginación siguiente ───────────────────────────
    const nextBtn = document.getElementById('next-page');
    if (nextBtn) nextBtn.addEventListener('click', ()=>{
        const pages = Math.ceil(getFilteredTxs().length / PAGE_SIZE);
        if (currentPage < pages) {
            currentPage++;
            showPage();
        }
    });
    // ─── Cambiar vista por categoría ────────────────────
    const toggleView = document.getElementById('toggle-view');
    if (toggleView) toggleView.addEventListener('change', ()=>{
        currentPage = 1;
        showPage();
    });
}
async function renderUserName(user) {
    const nameEl = document.getElementById('user-name');
    if (!nameEl) return;
    let name = 'Usuario';
    try {
        if (!user || !user.uid) throw new Error("Usuario no v\xe1lido o no autenticado");
        if (!navigator.onLine) {
            console.warn('[USERNAME] Offline: recuperando nombre desde IndexedDB');
            const cachedName = await readFromIndexedDB(`userName-${user.uid}`);
            if (cachedName) name = cachedName;
        } else {
            const snap = await (0, _firestore.getDoc)((0, _firestore.doc)((0, _firebaseJs.db), 'users', user.uid));
            const data = snap.exists() ? snap.data() : {};
            name = [
                data.firstName,
                data.lastName
            ].filter(Boolean).join(' ') || 'Usuario';
            await writeToIndexedDB(`userName-${user.uid}`, name);
        }
        nameEl.textContent = name;
        console.log('[USERNAME] Mostrando saludo para:', name);
    } catch (e) {
        console.error('[USERNAME] Error cargando nombre de usuario:', e);
        nameEl.textContent = name;
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// Firestore y Plaid
// ─────────────────────────────────────────────────────────────────────────────
function subscribeHistoryItems(userId, callback) {
    console.log("[FIRESTORE] Subscribi\xe9ndose a history del usuario");
    const historyRef = (0, _firestore.collection)((0, _firebaseJs.db), 'users', userId, 'history');
    const summaryRef = (0, _firestore.collection)((0, _firebaseJs.db), 'users', userId, 'historySummary');
    let itemUnsubs = [];
    const seedMap = new Map();
    let monthsSet = new Set();
    function resubscribeItems() {
        itemUnsubs.forEach((unsub)=>unsub());
        itemUnsubs = [];
        seedMap.clear();
        const months = Array.from(monthsSet);
        months.forEach((monthId)=>{
            const itemsRef = (0, _firestore.collection)((0, _firebaseJs.db), 'users', userId, 'history', monthId, 'items');
            const unsub = (0, _firestore.onSnapshot)(itemsRef, (snap)=>{
                snap.docChanges().forEach((change)=>{
                    const docSnap = change.doc;
                    const id = docSnap.data().transaction_id || docSnap.id;
                    if (change.type === 'removed') seedMap.delete(id);
                    else seedMap.set(id, {
                        ...docSnap.data(),
                        transaction_id: id
                    });
                });
                callback(Array.from(seedMap.values()));
            });
            itemUnsubs.push(unsub);
        });
    }
    (0, _firestore.onSnapshot)(historyRef, (snap)=>{
        snap.docs.forEach((d)=>monthsSet.add(d.id));
        resubscribeItems();
    });
    (0, _firestore.onSnapshot)(summaryRef, (snap)=>{
        snap.docs.forEach((d)=>monthsSet.add(d.id));
        resubscribeItems();
    });
}
async function fetchTransactionsFromPlaid(userId) {
    console.log('[FETCH] Obteniendo transacciones desde Plaid');
    const res = await fetch(`${apiUrl}/plaid/get_transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId
        })
    });
    if (!res.ok) throw new Error('Error obteniendo transacciones');
    const data = await res.json();
    return data.transactions.map((tx)=>({
            ...tx,
            transaction_id: tx.transaction_id || tx.id
        }));
}
async function buildAccountMap(userId) {
    console.log('[FIRESTORE] Construyendo mapa de cuentas');
    const userSnap = await (0, _firestore.getDoc)((0, _firestore.doc)((0, _firebaseJs.db), 'users', userId));
    const accounts = userSnap.exists() ? userSnap.data().plaid?.accounts || [] : [];
    const map = {};
    for (const { accessToken } of accounts){
        const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accessToken
            })
        });
        if (!res.ok) continue;
        const data = await res.json();
        data.accounts.forEach((a)=>{
            map[a.account_id] = a.name || 'Cuenta';
        });
    }
    return map;
}
// ─────────────────────────────────────────────────────────────────────────────
// Carga principal
// ─────────────────────────────────────────────────────────────────────────────
async function loadTransactions(userId) {
    console.log("[TX] \u2192 Iniciando loadTransactions con userId:", userId);
    const hideLoading = ()=>{
        const loadingEl = document.getElementById('transactions-loading');
        if (loadingEl) loadingEl.style.display = 'none';
    };
    if (!navigator.onLine) {
        console.warn('[TX] Modo offline detectado. Esperando cache segura...');
        const cached = await getCachedTransactions();
        allTxsGlobal = cached;
        if (!window.hasInitializedUI) {
            setupEventListeners();
            window.hasInitializedUI = true;
        }
        // Asegura renderizado siempre
        showPage();
        hideLoading(); // ⬅️ Oculta el mensaje de carga
        return;
    }
    try {
        await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId
            })
        });
    } catch (e) {
        console.warn('[SYNC] error en sync_transactions_and_store', e);
    }
    let plaidTxs = [];
    try {
        plaidTxs = await fetchTransactionsFromPlaid(userId);
    } catch (e) {
        console.warn('[FETCH] Error obteniendo transacciones Plaid', e);
    }
    let accountMap = {};
    try {
        accountMap = await buildAccountMap(userId);
    } catch (e) {
        console.warn('[MAP] Error construyendo mapa de cuentas', e);
    }
    try {
        subscribeHistoryItems(userId, async (seedTxs)=>{
            const combined = Array.from(new Map([
                ...plaidTxs,
                ...seedTxs
            ].map((tx)=>[
                    tx.transaction_id,
                    tx
                ])).values()).sort((a, b)=>new Date(b.date) - new Date(a.date));
            allTxsGlobal = combined.map((tx)=>({
                    ...tx,
                    accountName: accountMap[tx.account_id] || 'Desconocida'
                }));
            await cacheTransactions(allTxsGlobal);
            if (!window.hasInitializedUI) {
                setupEventListeners();
                window.hasInitializedUI = true;
            }
            showPage();
            hideLoading(); // ⬅️ Oculta el mensaje de carga tras mostrar resultados
        });
    } catch (e) {
        console.warn("[FIRESTORE] Error en suscripci\xf3n a history", e);
        hideLoading(); // ⬅️ Ocúltalo incluso si hay fallo
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// Autenticación y eventos de red
// ─────────────────────────────────────────────────────────────────────────────
(0, _auth.onAuthStateChanged)((0, _firebaseJs.auth), (user)=>{
    console.log('[AUTH] Cambio de estado detectado. User:', user);
    if (user) {
        if (!navigator.onLine) {
            console.warn('[AUTH] Estamos OFFLINE, esperando un instante para cache');
            setTimeout(()=>loadTransactions(user.uid), 300);
        } else loadTransactions(user.uid);
        renderUserName(user);
    } else {
        const offlineUser = (0, _firebaseJs.auth).currentUser;
        if (offlineUser) {
            console.warn('[AUTH] auth.currentUser recuperado en modo offline:', offlineUser.uid);
            setTimeout(()=>loadTransactions(offlineUser.uid), 300);
            return;
        }
        readUserIdFromIndexedDB().then((cachedUid)=>{
            if (cachedUid) {
                console.warn('[AUTH] userId recuperado desde IndexedDB:', cachedUid);
                setTimeout(()=>loadTransactions(cachedUid), 300);
            } else {
                console.error("[AUTH] No hay sesi\xf3n ni userId en IndexedDB. Redirigiendo a login.");
                window.location.href = '../index.html';
            }
        });
    }
});
function showOfflineBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.style.display = 'block';
    console.log('[UI] Banner OFFLINE visible');
}
function hideOfflineBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.style.display = 'none';
    console.log('[UI] Banner OFFLINE oculto');
}
window.addEventListener('online', ()=>{
    hideOfflineBanner();
    if ((0, _firebaseJs.auth).currentUser) {
        console.log("[NET] Conexi\xf3n recuperada, recargando datos");
        loadTransactions((0, _firebaseJs.auth).currentUser.uid);
    }
});
window.addEventListener('offline', showOfflineBanner);
if (!navigator.onLine) showOfflineBanner();
function readUserIdFromIndexedDB() {
    return new Promise((resolve, reject)=>{
        const request = indexedDB.open('fintrack-db', 1);
        request.onsuccess = ()=>{
            const db = request.result;
            const tx = db.transaction('metadata', 'readonly');
            const store = tx.objectStore('metadata');
            const getReq = store.get('userId');
            getReq.onsuccess = ()=>{
                resolve(getReq.result || null);
                db.close();
            };
            getReq.onerror = ()=>{
                console.error('[IDB] Error leyendo userId:', getReq.error);
                resolve(null);
                db.close();
            };
        };
        request.onerror = ()=>{
            console.error('[IDB] Error abriendo base de datos:', request.error);
            resolve(null);
        };
    });
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

},{"./firebase.js":"24zHi","firebase/auth":"4ZBbi","firebase/firestore":"3RBs1","idb":"258QC"}],"258QC":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "deleteDB", ()=>deleteDB);
parcelHelpers.export(exports, "openDB", ()=>openDB);
parcelHelpers.export(exports, "unwrap", ()=>unwrap);
parcelHelpers.export(exports, "wrap", ()=>wrap);
const instanceOfAny = (object, constructors)=>constructors.some((c)=>object instanceof c);
let idbProxyableTypes;
let cursorAdvanceMethods;
// This is a function to prevent it throwing up in node environments.
function getIdbProxyableTypes() {
    return idbProxyableTypes || (idbProxyableTypes = [
        IDBDatabase,
        IDBObjectStore,
        IDBIndex,
        IDBCursor,
        IDBTransaction
    ]);
}
// This is a function to prevent it throwing up in node environments.
function getCursorAdvanceMethods() {
    return cursorAdvanceMethods || (cursorAdvanceMethods = [
        IDBCursor.prototype.advance,
        IDBCursor.prototype.continue,
        IDBCursor.prototype.continuePrimaryKey
    ]);
}
const transactionDoneMap = new WeakMap();
const transformCache = new WeakMap();
const reverseTransformCache = new WeakMap();
function promisifyRequest(request) {
    const promise = new Promise((resolve, reject)=>{
        const unlisten = ()=>{
            request.removeEventListener('success', success);
            request.removeEventListener('error', error);
        };
        const success = ()=>{
            resolve(wrap(request.result));
            unlisten();
        };
        const error = ()=>{
            reject(request.error);
            unlisten();
        };
        request.addEventListener('success', success);
        request.addEventListener('error', error);
    });
    // This mapping exists in reverseTransformCache but doesn't exist in transformCache. This
    // is because we create many promises from a single IDBRequest.
    reverseTransformCache.set(promise, request);
    return promise;
}
function cacheDonePromiseForTransaction(tx) {
    // Early bail if we've already created a done promise for this transaction.
    if (transactionDoneMap.has(tx)) return;
    const done = new Promise((resolve, reject)=>{
        const unlisten = ()=>{
            tx.removeEventListener('complete', complete);
            tx.removeEventListener('error', error);
            tx.removeEventListener('abort', error);
        };
        const complete = ()=>{
            resolve();
            unlisten();
        };
        const error = ()=>{
            reject(tx.error || new DOMException('AbortError', 'AbortError'));
            unlisten();
        };
        tx.addEventListener('complete', complete);
        tx.addEventListener('error', error);
        tx.addEventListener('abort', error);
    });
    // Cache it for later retrieval.
    transactionDoneMap.set(tx, done);
}
let idbProxyTraps = {
    get (target, prop, receiver) {
        if (target instanceof IDBTransaction) {
            // Special handling for transaction.done.
            if (prop === 'done') return transactionDoneMap.get(target);
            // Make tx.store return the only store in the transaction, or undefined if there are many.
            if (prop === 'store') return receiver.objectStoreNames[1] ? undefined : receiver.objectStore(receiver.objectStoreNames[0]);
        }
        // Else transform whatever we get back.
        return wrap(target[prop]);
    },
    set (target, prop, value) {
        target[prop] = value;
        return true;
    },
    has (target, prop) {
        if (target instanceof IDBTransaction && (prop === 'done' || prop === 'store')) return true;
        return prop in target;
    }
};
function replaceTraps(callback) {
    idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
    // Due to expected object equality (which is enforced by the caching in `wrap`), we
    // only create one new func per func.
    // Cursor methods are special, as the behaviour is a little more different to standard IDB. In
    // IDB, you advance the cursor and wait for a new 'success' on the IDBRequest that gave you the
    // cursor. It's kinda like a promise that can resolve with many values. That doesn't make sense
    // with real promises, so each advance methods returns a new promise for the cursor object, or
    // undefined if the end of the cursor has been reached.
    if (getCursorAdvanceMethods().includes(func)) return function(...args) {
        // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
        // the original object.
        func.apply(unwrap(this), args);
        return wrap(this.request);
    };
    return function(...args) {
        // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
        // the original object.
        return wrap(func.apply(unwrap(this), args));
    };
}
function transformCachableValue(value) {
    if (typeof value === 'function') return wrapFunction(value);
    // This doesn't return, it just creates a 'done' promise for the transaction,
    // which is later returned for transaction.done (see idbObjectHandler).
    if (value instanceof IDBTransaction) cacheDonePromiseForTransaction(value);
    if (instanceOfAny(value, getIdbProxyableTypes())) return new Proxy(value, idbProxyTraps);
    // Return the same value back if we're not going to transform it.
    return value;
}
function wrap(value) {
    // We sometimes generate multiple promises from a single IDBRequest (eg when cursoring), because
    // IDB is weird and a single IDBRequest can yield many responses, so these can't be cached.
    if (value instanceof IDBRequest) return promisifyRequest(value);
    // If we've already transformed this value before, reuse the transformed value.
    // This is faster, but it also provides object equality.
    if (transformCache.has(value)) return transformCache.get(value);
    const newValue = transformCachableValue(value);
    // Not all types are transformed.
    // These may be primitive types, so they can't be WeakMap keys.
    if (newValue !== value) {
        transformCache.set(value, newValue);
        reverseTransformCache.set(newValue, value);
    }
    return newValue;
}
const unwrap = (value)=>reverseTransformCache.get(value);
/**
 * Open a database.
 *
 * @param name Name of the database.
 * @param version Schema version.
 * @param callbacks Additional callbacks.
 */ function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
    const request = indexedDB.open(name, version);
    const openPromise = wrap(request);
    if (upgrade) request.addEventListener('upgradeneeded', (event)=>{
        upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
    });
    if (blocked) request.addEventListener('blocked', (event)=>blocked(// Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
        event.oldVersion, event.newVersion, event));
    openPromise.then((db)=>{
        if (terminated) db.addEventListener('close', ()=>terminated());
        if (blocking) db.addEventListener('versionchange', (event)=>blocking(event.oldVersion, event.newVersion, event));
    }).catch(()=>{});
    return openPromise;
}
/**
 * Delete a database.
 *
 * @param name Name of the database.
 */ function deleteDB(name, { blocked } = {}) {
    const request = indexedDB.deleteDatabase(name);
    if (blocked) request.addEventListener('blocked', (event)=>blocked(// Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
        event.oldVersion, event));
    return wrap(request).then(()=>undefined);
}
const readMethods = [
    'get',
    'getKey',
    'getAll',
    'getAllKeys',
    'count'
];
const writeMethods = [
    'put',
    'add',
    'delete',
    'clear'
];
const cachedMethods = new Map();
function getMethod(target, prop) {
    if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === 'string')) return;
    if (cachedMethods.get(prop)) return cachedMethods.get(prop);
    const targetFuncName = prop.replace(/FromIndex$/, '');
    const useIndex = prop !== targetFuncName;
    const isWrite = writeMethods.includes(targetFuncName);
    if (// Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))) return;
    const method = async function(storeName, ...args) {
        // isWrite ? 'readwrite' : undefined gzipps better, but fails in Edge :(
        const tx = this.transaction(storeName, isWrite ? 'readwrite' : 'readonly');
        let target = tx.store;
        if (useIndex) target = target.index(args.shift());
        // Must reject if op rejects.
        // If it's a write operation, must reject if tx.done rejects.
        // Must reject with op rejection first.
        // Must resolve with op value.
        // Must handle both promises (no unhandled rejections)
        return (await Promise.all([
            target[targetFuncName](...args),
            isWrite && tx.done
        ]))[0];
    };
    cachedMethods.set(prop, method);
    return method;
}
replaceTraps((oldTraps)=>({
        ...oldTraps,
        get: (target, prop, receiver)=>getMethod(target, prop) || oldTraps.get(target, prop, receiver),
        has: (target, prop)=>!!getMethod(target, prop) || oldTraps.has(target, prop)
    }));
const advanceMethodProps = [
    'continue',
    'continuePrimaryKey',
    'advance'
];
const methodMap = {};
const advanceResults = new WeakMap();
const ittrProxiedCursorToOriginalProxy = new WeakMap();
const cursorIteratorTraps = {
    get (target, prop) {
        if (!advanceMethodProps.includes(prop)) return target[prop];
        let cachedFunc = methodMap[prop];
        if (!cachedFunc) cachedFunc = methodMap[prop] = function(...args) {
            advanceResults.set(this, ittrProxiedCursorToOriginalProxy.get(this)[prop](...args));
        };
        return cachedFunc;
    }
};
async function* iterate(...args) {
    // tslint:disable-next-line:no-this-assignment
    let cursor = this;
    if (!(cursor instanceof IDBCursor)) cursor = await cursor.openCursor(...args);
    if (!cursor) return;
    cursor;
    const proxiedCursor = new Proxy(cursor, cursorIteratorTraps);
    ittrProxiedCursorToOriginalProxy.set(proxiedCursor, cursor);
    // Map this double-proxy back to the original, so other cursor methods work.
    reverseTransformCache.set(proxiedCursor, unwrap(cursor));
    while(cursor){
        yield proxiedCursor;
        // If one of the advancing methods was not called, call continue().
        cursor = await (advanceResults.get(proxiedCursor) || cursor.continue());
        advanceResults.delete(proxiedCursor);
    }
}
function isIteratorProp(target, prop) {
    return prop === Symbol.asyncIterator && instanceOfAny(target, [
        IDBIndex,
        IDBObjectStore,
        IDBCursor
    ]) || prop === 'iterate' && instanceOfAny(target, [
        IDBIndex,
        IDBObjectStore
    ]);
}
replaceTraps((oldTraps)=>({
        ...oldTraps,
        get (target, prop, receiver) {
            if (isIteratorProp(target, prop)) return iterate;
            return oldTraps.get(target, prop, receiver);
        },
        has (target, prop) {
            return isIteratorProp(target, prop) || oldTraps.has(target, prop);
        }
    }));

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}]},["i7B0l","j59nl"], "j59nl", "parcelRequire94c2")

//# sourceMappingURL=transactions.0e22dfc7.js.map
