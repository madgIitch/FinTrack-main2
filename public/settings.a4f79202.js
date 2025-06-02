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
})({"g803I":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SERVER_PORT = 8080;
var HMR_SECURE = false;
var HMR_ENV_HASH = "439701173a9199ea";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "7cc093d3a4f79202";
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

},{}],"6SdsI":[function(require,module,exports,__globalThis) {
// public/js/settings.js
var _firebaseJs = require("./firebase.js");
var _firestore = require("firebase/firestore");
var _auth = require("firebase/auth");
const db = (0, _firestore.getFirestore)((0, _firebaseJs.app));
// Si estamos en localhost, usamos el emulador o la URL local de Functions; 
// en producción, la URL clásica de Functions v1.
const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5001/fintrack-1bced/us-central1/api' : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';
document.addEventListener('DOMContentLoaded', ()=>{
    console.log('[settings.js] DOMContentLoaded');
    // ----------------------------
    // Referencias a elementos UI
    // ----------------------------
    const backBtn = document.getElementById('back-btn');
    const chkNotifPush = document.getElementById('notif-push');
    const chkNotifEmail = document.getElementById('notif-email');
    const chkReportPush = document.getElementById('report-push');
    const chkReportEmail = document.getElementById('report-email');
    const btnSave = document.getElementById('save-settings-btn');
    const budgetsContainer = document.getElementById('budgets-container');
    const addCategoryBtn = document.getElementById('add-category-btn');
    backBtn.addEventListener('click', ()=>{
        console.log('[settings.js] backBtn clicked');
        window.history.back();
    });
    // Cada fila de presupuesto tendrá:
    //  <div class="budget-row">
    //    <select class="category-select">...</select>
    //    <input type="number" class="budget-input" placeholder="0,00" min="0" step="0.01" />
    //    <button class="remove-btn">Eliminar</button>
    //  </div>
    let allCategories = []; // Aquí guardaremos la lista completa de nombres de la colección "groups".
    // Función que crea (y devuelve) una fila de presupuesto, pasándole opcionalmente:
    //   - selectedCategory: nombre de categoría ya seleccionado (string)
    //   - amount: número (el presupuesto que ya tenía configurado el usuario)
    function createBudgetRow(selectedCategory = '', amount = '') {
        // Contenedor principal
        const rowDiv = document.createElement('div');
        rowDiv.className = 'budget-row';
        // 1) SELECT para elegir categoría
        const select = document.createElement('select');
        select.className = 'category-select';
        // Agregamos una opción placeholder por defecto
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = "\u2014 Selecciona categor\xeda \u2014";
        placeholderOption.disabled = true;
        placeholderOption.selected = selectedCategory === '';
        select.appendChild(placeholderOption);
        // Luego, por cada categoría disponible, agregamos <option>
        allCategories.forEach((catName)=>{
            const opt = document.createElement('option');
            opt.value = catName;
            opt.textContent = catName;
            if (catName === selectedCategory) opt.selected = true;
            select.appendChild(opt);
        });
        // 2) INPUT tipo number para el monto
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'budget-input';
        input.placeholder = '0,00';
        input.min = '0';
        input.step = '0.01';
        if (amount !== '' && !isNaN(amount)) // Si amount viene como string o número, mostramos en el input
        input.value = parseFloat(amount).toFixed(2);
        // 3) BOTÓN para eliminar esta fila
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = 'Eliminar';
        removeBtn.addEventListener('click', ()=>{
            rowDiv.remove();
        });
        // Finalmente, montamos todo dentro de la fila
        rowDiv.appendChild(select);
        rowDiv.appendChild(input);
        rowDiv.appendChild(removeBtn);
        return rowDiv;
    }
    // Añade una fila vacía al contenedor
    addCategoryBtn.addEventListener('click', ()=>{
        budgetsContainer.appendChild(createBudgetRow());
    });
    // ----------------------------------------------------------------------
    // Función principal: cargar datos (notificaciones + presupuestos) del usuario
    // ----------------------------------------------------------------------
    (0, _auth.onAuthStateChanged)((0, _firebaseJs.auth), async (user)=>{
        console.log('[settings.js] onAuthStateChanged user:', user);
        if (!user) {
            console.log('[settings.js] No user, redirecting to index');
            window.location.href = '../index.html';
            return;
        }
        const uid = user.uid;
        const userRef = (0, _firestore.doc)(db, 'users', uid);
        console.log('[settings.js] Authenticated uid:', uid);
        // 1) Obtenemos TODAS las categorías desde Firestore → colección "groups"
        try {
            console.log('[settings.js] Loading all categories from Firestore...');
            const groupsSnapshot = await (0, _firestore.getDocs)((0, _firestore.collection)(db, 'groups'));
            allCategories = [];
            groupsSnapshot.forEach((docSnap)=>{
                // Cada docSnap.id es el nombre de la categoría (p.ej. "Agricultura y Medio Ambiente")
                // Si en tu colección tienes algún campo extra, podrías hacer docSnap.data().name, etc.
                allCategories.push(docSnap.id);
            });
            console.log('[settings.js] allCategories:', allCategories);
        } catch (err) {
            console.error('[settings.js] Error loading groups collection:', err);
            // Si falla al cargar categorías, dejamos el array vacío, pero la UI de presupuestos no se podrá poblar bien.
            allCategories = [];
        }
        // 2) Obtenemos los ajustes existentes (notificaciones, informes y también presupuestos)
        let loadedSettings = {};
        try {
            console.log('[settings.js] Fetching user settings from Firestore');
            const snap = await (0, _firestore.getDoc)(userRef);
            if (snap.exists()) {
                loadedSettings = snap.data().settings || {};
                console.log('[settings.js] loadedSettings:', loadedSettings);
            }
        } catch (e) {
            console.error('[settings.js] Error loading settings:', e);
            loadedSettings = {};
        }
        // ── Inicializar checkboxes de notificaciones/informes ─────────────────────
        const notifications = loadedSettings.notifications || {};
        const reports = loadedSettings.reports || {};
        chkNotifPush.checked = Boolean(notifications.push);
        chkNotifEmail.checked = Boolean(notifications.email);
        chkReportPush.checked = Boolean(reports.push);
        chkReportEmail.checked = Boolean(reports.email);
        console.log('[settings.js] Checkbox states:', {
            notifPush: chkNotifPush.checked,
            notifEmail: chkNotifEmail.checked,
            reportPush: chkReportPush.checked,
            reportEmail: chkReportEmail.checked
        });
        // ── POBLAR la sección “Presupuestos” con lo que ya existe ─────────────────
        // Supongamos que en Firestore guardamos algo como:
        //    settings.budgets = { "Automoción y Transporte": 500.00, "Ocio": 200.00, ... }
        const budgetsMap = loadedSettings.budgets || {};
        console.log('[settings.js] existing budgetsMap:', budgetsMap);
        // Limpiamos lo que hubiera en el contenedor
        budgetsContainer.innerHTML = '';
        // Por cada par (categoría → monto) preexistente, agregamos una fila
        Object.entries(budgetsMap).forEach(([catName, amount])=>{
            // Verificamos que catName siga existiendo en allCategories
            // Si no existe, igualmente lo mostramos, pero podría quedar al final.
            if (!allCategories.includes(catName)) allCategories.push(catName);
            const row = createBudgetRow(catName, amount);
            budgetsContainer.appendChild(row);
        });
        // Si no hay ningún presupuesto preconfigurado, mostramos al menos una fila vacía
        if (Object.keys(budgetsMap).length === 0) budgetsContainer.appendChild(createBudgetRow());
    });
    // ----------------------------------------------------------------------
    // Función “Guardar Ajustes” (alarma, informes y presupuestos)
    // ----------------------------------------------------------------------
    btnSave.addEventListener('click', async ()=>{
        // Deshabilitamos temporalmente el botón
        btnSave.disabled = true;
        const originalText = btnSave.textContent;
        btnSave.textContent = "Guardando\u2026";
        console.log('[settings.js] save-settings-btn clicked');
        // 1) Construimos el objeto “newSettings”
        const newSettings = {
            notifications: {
                push: chkNotifPush.checked,
                email: chkNotifEmail.checked
            },
            reports: {
                push: chkReportPush.checked,
                email: chkReportEmail.checked
            },
            budgets: {}
        };
        // 2) Recolectamos todos los rows dentro de budgetsContainer
        const rows = Array.from(budgetsContainer.querySelectorAll('.budget-row'));
        // Para evitar duplicados de categoría, usamos un Set
        const seenCategories = new Set();
        let valid = true; // Marcaremos false si encontramos algún error de validación
        let errorMessage = '';
        rows.forEach((row, idx)=>{
            const select = row.querySelector('.category-select');
            const input = row.querySelector('.budget-input');
            const cat = select.value;
            const amtStr = input.value.trim();
            // Si el usuario dejó el select en “placeholder” o no puso nada, omitimos esta fila
            if (!cat) return;
            // Validamos monto: debe ser un número >= 0
            const amtNum = parseFloat(amtStr);
            if (isNaN(amtNum) || amtNum < 0) {
                valid = false;
                errorMessage = `Fila ${idx + 1}: monto inv\xe1lido para "${cat}".`;
                return;
            }
            // Validamos duplicados en categoría
            if (seenCategories.has(cat)) {
                valid = false;
                errorMessage = `La categor\xeda "${cat}" est\xe1 repetida en presupuestos.`;
                return;
            }
            seenCategories.add(cat);
            newSettings.budgets[cat] = amtNum;
        });
        if (!valid) {
            alert(errorMessage);
            btnSave.textContent = 'Error, reintenta';
            setTimeout(()=>{
                btnSave.disabled = false;
                btnSave.textContent = originalText;
            }, 2000);
            return;
        }
        // 3) Guardamos en Firestore → doc(db, 'users', uid) { settings: newSettings }
        //    Aquí asumimos que “uid” sigue en scope (lo capturamos en onAuthStateChanged).
        const user = (0, _firebaseJs.auth).currentUser;
        if (!user) {
            console.error('[settings.js] No currentUser al guardar ajustes.');
            btnSave.textContent = 'Error, reintenta';
            setTimeout(()=>{
                btnSave.disabled = false;
                btnSave.textContent = originalText;
            }, 2000);
            return;
        }
        const userRef = (0, _firestore.doc)(db, 'users', user.uid);
        console.log('[settings.js] newSettings to save:', newSettings);
        try {
            await (0, _firestore.updateDoc)(userRef, {
                settings: newSettings
            });
            console.log('[settings.js] Settings successfully updated in Firestore');
            btnSave.textContent = "\xa1Guardado!";
            setTimeout(()=>{
                btnSave.disabled = false;
                btnSave.textContent = originalText;
            }, 1500);
        } catch (e) {
            console.error('[settings.js] Error updating settings in Firestore:', e);
            btnSave.textContent = 'Error, reintenta';
            setTimeout(()=>{
                btnSave.disabled = false;
                btnSave.textContent = originalText;
            }, 2000);
        }
    });
});

},{"./firebase.js":"24zHi","firebase/firestore":"3RBs1","firebase/auth":"4ZBbi"}]},["g803I","6SdsI"], "6SdsI", "parcelRequire94c2")

//# sourceMappingURL=settings.a4f79202.js.map
