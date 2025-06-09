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
  function $parcel$resolve(url) {  url = importMap[url] || url;  return import.meta.resolve(distDir + url);}newRequire.resolve = $parcel$resolve;

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
})({"Ahhet":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SERVER_PORT = 8080;
var HMR_SECURE = false;
var HMR_ENV_HASH = "439701173a9199ea";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "006c3926a4cb3a81";
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

},{}],"9wRWw":[function(require,module,exports,__globalThis) {
// js/home.js
var _firebaseJs = require("./firebase.js");
var _firestore = require("firebase/firestore");
var _auth = require("firebase/auth");
console.log('[HOME] home.js loaded');
// ── URL de tu API (ajústala según entorno) ─────────────────────────────────
const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5001/fintrack-1bced/us-central1/api' : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';
// ── Registrar y programar periodicSync ─────────────────────────────────────
if ('serviceWorker' in navigator) window.addEventListener('load', async ()=>{
    try {
        const reg = await navigator.serviceWorker.register(require("f49e69e7fb1d94f5"), {
            scope: '/'
        });
        console.log('[SW] Registered with scope:', reg.scope);
        if ('periodicSync' in reg) try {
            await reg.periodicSync.register('sync-transactions', {
                minInterval: 86400000 // 24 h en ms
            });
            console.log('[SYNC] periodicSync registered');
        } catch (err) {
            console.warn('[SYNC] Could not register periodicSync:', err);
        }
    } catch (err) {
        console.error('[SW] Registration failed:', err);
    }
});
document.addEventListener('DOMContentLoaded', ()=>{
    console.log('[HOME] DOMContentLoaded');
    const userNameSpan = document.getElementById('user-name');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    const logoutLink = document.getElementById('logout-link');
    function updateWelcome(name) {
        console.log("[HOME] updateWelcome \u2192", name);
        userNameSpan.textContent = name;
    }
    (0, _auth.onAuthStateChanged)((0, _firebaseJs.auth), async (user)=>{
        console.log("[HOME] onAuthStateChanged \u2192 user:", user);
        if (!user) {
            console.log('[HOME] No user logged in, redirecting to index.html');
            window.location.href = '../index.html';
            return;
        }
        const db = (0, _firestore.getFirestore)((0, _firebaseJs.app));
        const uRef = (0, _firestore.doc)(db, 'users', user.uid);
        try {
            const snap = await (0, _firestore.getDoc)(uRef);
            const data = snap.exists() ? snap.data() : {};
            console.log('[HOME] Firestore user data:', data);
            const name = [
                data.firstName,
                data.lastName
            ].filter(Boolean).join(' ') || 'Usuario';
            updateWelcome(name);
            // ── Sincronización manual al inicio ────────────────────────────────
            console.log('[HOME] Starting manual sync');
            await doManualSync(user.uid);
            // ── Carga de saldos ────────────────────────────────────────────────
            console.log('[HOME] Loading balances');
            await loadBalances(user.uid);
            // ── Guardar UID en IndexedDB para Periodic Sync ───────────────────
            console.log('[HOME] Saving UID to IndexedDB');
            await saveUIDToIndexedDB(user.uid);
            // ── Cargar gráfica mensual ────────────────────────────────────────
            console.log('[HOME] Loading monthly chart');
            await loadMonthlyChart(user.uid);
        } catch (e) {
            console.error('[HOME] Error loading user from Firestore:', e);
            updateWelcome('Usuario');
        }
    });
    closeSidebar.addEventListener('click', ()=>{
        console.log('[HOME] closeSidebar clicked');
        sidebar.classList.remove('open');
    });
    logoutLink.addEventListener('click', async (e)=>{
        e.preventDefault();
        console.log('[HOME] logoutLink clicked, signing out');
        try {
            await (0, _auth.signOut)((0, _firebaseJs.auth));
            console.log('[HOME] User signed out');
            window.location.href = '../index.html';
        } catch (err) {
            console.error('[HOME] Error signing out:', err);
        }
    });
});
// ── Función para cargar saldos (sin cambios) ─────────────────────────────
async function loadBalances(userId) {
    console.log("[DEBUG] loadBalances \u2192 userId:", userId);
    const db = (0, _firestore.getFirestore)((0, _firebaseJs.app));
    const uRef = (0, _firestore.doc)(db, 'users', userId);
    let accounts = [];
    try {
        const snap = await (0, _firestore.getDoc)(uRef);
        accounts = snap.exists() ? snap.data().plaid?.accounts || [] : [];
        console.log('[DEBUG] Firestore accounts list:', accounts);
    } catch (err) {
        console.error('[DEBUG] Error fetching Firestore user document for balances:', err);
    }
    const slider = document.querySelector('.balance-slider');
    if (!slider) {
        console.warn("[DEBUG] loadBalances \u2192 .balance-slider not found in DOM");
        return;
    }
    slider.innerHTML = '';
    for (const [i, { accessToken }] of accounts.entries()){
        console.log(`[DEBUG] Processing account #${i}, accessToken:`, accessToken);
        try {
            const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accessToken
                })
            });
            const data = await res.json();
            console.log(`[DEBUG] get_account_details response for account #${i}:`, data);
            const { accounts: accs = [], institution } = data;
            const acc = accs[0] || {};
            const name = acc.name || 'Cuenta';
            const bal = acc.balances?.current ?? 0;
            let logoSrc = '/img/default_bank.png';
            if (institution?.logo) logoSrc = `data:image/png;base64,${institution.logo}`;
            else if (institution?.url) logoSrc = `${institution.url.replace(/\/$/, '')}/favicon.ico`;
            const slide = document.createElement('div');
            slide.className = 'balance-slide';
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
        <img src="${logoSrc}" class="card-logo" alt="Logo">
        <p class="card-title">${name}</p>
        <p class="card-subtitle">Saldo actual</p>
        <p class="card-balance">${bal.toFixed(2)} \u{20AC}</p>
      `;
            slide.appendChild(card);
            slider.appendChild(slide);
            console.log(`[DEBUG] Added slide for account #${i} (${name}) with balance ${bal}`);
        } catch (err) {
            console.error(`[ERROR] get_account_details for account #${i}:`, err);
        }
    }
    initBalanceSlider();
}
// ── Inicializa el slider de saldos ────────────────────────────────────────
function initBalanceSlider() {
    console.log('[SLIDER] initBalanceSlider start');
    const slider = document.querySelector('.balance-slider');
    const slides = Array.from(slider.children);
    const prev = document.getElementById('balance-prev');
    const next = document.getElementById('balance-next');
    const dots = document.getElementById('balance-dots');
    if (!slider || !prev || !next || !dots) {
        console.warn('[SLIDER] Missing DOM elements for slider');
        return;
    }
    let idx = 0;
    const total = slides.length;
    console.log('[SLIDER] total slides:', total);
    if (total < 2) return;
    dots.innerHTML = '';
    slides.forEach((_, i)=>{
        const d = document.createElement('div');
        d.className = 'slider-dot' + (i === 0 ? ' active' : '');
        d.addEventListener('click', ()=>{
            idx = i;
            update();
        });
        dots.appendChild(d);
    });
    prev.addEventListener('click', ()=>{
        idx = (idx - 1 + total) % total;
        update();
    });
    next.addEventListener('click', ()=>{
        idx = (idx + 1) % total;
        update();
    });
    function update() {
        slider.style.transform = `translateX(-${idx * 100}%)`;
        dots.childNodes.forEach((dot, i)=>dot.classList.toggle('active', i === idx));
        console.log("[SLIDER] update \u2192 current index:", idx);
    }
    update();
}
// ── Sincronización manual de transacciones a Firestore ─────────────────────
async function doManualSync(uid) {
    console.log('[SYNC] doManualSync start for', uid);
    const lastKey = `lastSync_${uid}`;
    const last = localStorage.getItem(lastKey);
    const now = Date.now();
    console.log('[SYNC] last:', last, 'now:', now);
    if (!last || now - parseInt(last) > 86400000) {
        console.log('[SYNC] Performing manual sync');
        try {
            const res = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: uid
                })
            });
            const result = await res.json();
            console.log('[SYNC] sync_transactions_and_store response:', result);
            if (res.ok && result.success) {
                localStorage.setItem(lastKey, now.toString());
                console.log('[SYNC] sync successful');
            }
        } catch (err) {
            console.error('[SYNC] Error in manual sync:', err);
        }
    } else console.log('[SYNC] Already synced within 24h');
}
// ── Guarda UID en IndexedDB ────────────────────────────────────────────────
async function saveUIDToIndexedDB(uid) {
    console.log("[DB] saveUIDToIndexedDB \u2192 uid:", uid);
    if (!('indexedDB' in window)) {
        console.warn('[DB] IndexedDB not supported');
        return;
    }
    const openReq = indexedDB.open('fintrack-db', 1);
    openReq.onupgradeneeded = ()=>{
        console.log('[DB] onupgradeneeded, creating store "metadata"');
        openReq.result.createObjectStore('metadata');
    };
    openReq.onsuccess = ()=>{
        const db = openReq.result;
        const tx = db.transaction('metadata', 'readwrite');
        tx.objectStore('metadata').put(uid, 'userId');
        tx.oncomplete = ()=>{
            console.log('[DB] UID stored');
            db.close();
        };
    };
    openReq.onerror = ()=>console.error('[DB] IndexedDB error:', openReq.error);
}
// ── Cargar y dibujar gráfica mensual con escala logarítmica ──────────────
async function loadMonthlyChart(userId) {
    console.log("[CHART] loadMonthlyChart \u2192 userId:", userId);
    const db = (0, _firestore.getFirestore)((0, _firebaseJs.app));
    const historyCol = (0, _firestore.collection)(db, 'users', userId, 'history');
    console.log('[CHART] Querying:', historyCol.path);
    let monthsSnap;
    try {
        monthsSnap = await (0, _firestore.getDocsFromServer)(historyCol);
    } catch  {
        monthsSnap = await (0, _firestore.getDocs)(historyCol);
    }
    console.log('[CHART] monthsSnap empty?', monthsSnap.empty);
    console.log('[CHART] monthsSnap docs:', monthsSnap.docs.map((d)=>d.id));
    const months = monthsSnap.docs.map((d)=>d.id).sort();
    console.log('[CHART] months sorted:', months);
    const expenses = [], incomes = [];
    for (const month of months){
        console.log('[CHART] processing month:', month);
        const itemsCol = (0, _firestore.collection)(db, 'users', userId, 'history', month, 'items');
        let itemsSnap;
        try {
            itemsSnap = await (0, _firestore.getDocsFromServer)(itemsCol);
        } catch  {
            itemsSnap = await (0, _firestore.getDocs)(itemsCol);
        }
        console.log(`[CHART] ${month} items count:`, itemsSnap.size);
        let e = 0, i = 0;
        itemsSnap.forEach((docSnap)=>{
            const tx = docSnap.data();
            const amt = tx.amount ?? 0;
            if (amt < 0) e += Math.abs(amt);
            else i += amt;
        });
        console.log(`[CHART] ${month} \u{2192} expenses: ${e}, incomes: ${i}`);
        expenses.push(e);
        incomes.push(i);
    }
    // Dibujar gráfica logarítmica
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Gastos',
                    data: expenses,
                    backgroundColor: '#FF6384'
                },
                {
                    label: 'Ingresos',
                    data: incomes,
                    backgroundColor: '#36A2EB'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'logarithmic',
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: "\u20AC (escala log)"
                    },
                    ticks: {
                        callback: (v)=>{
                            // Sólo mostrar potencias de 10
                            const remain = v / 10 ** Math.floor(Math.log10(v));
                            return remain === 1 ? `${v} \u{20AC}` : '';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: (ctx)=>`${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} \u{20AC}`
                    }
                }
            }
        }
    });
    console.log('[CHART] Logarithmic chart rendered');
}

},{"./firebase.js":"24zHi","firebase/firestore":"3RBs1","firebase/auth":"4ZBbi","f49e69e7fb1d94f5":"170CW"}],"170CW":[function(require,module,exports,__globalThis) {
module.exports = module.bundle.resolve("service-worker.js");

},{}]},["Ahhet","9wRWw"], "9wRWw", "parcelRequire94c2", "./", "/")

//# sourceMappingURL=home.a4cb3a81.js.map
