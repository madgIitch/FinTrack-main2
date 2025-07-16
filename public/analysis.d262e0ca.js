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
// ───── Archivo: analysis.js ─────
// Este archivo gestiona la vista de análisis financiero en FinTrack.
// Maneja pestañas (General, Crecimiento, Comparación), escucha al usuario autenticado,
// coordina la carga de datos desde Firestore y destruye/reinicializa los gráficos al cambiar de pestaña.
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// ───── Utilidad: ejecutar callback cuando un elemento es visible y activo ─────
parcelHelpers.export(exports, "whenVisible", ()=>whenVisible);
var _firebaseJs = require("./firebase.js");
var _auth = require("firebase/auth");
var _generalJs = require("./general.js");
var _growthJs = require("./growth.js");
var _comparisonJs = require("./comparison.js"); // 👈 Nuevo
let userUid = null;
let selectedPeriod = localStorage.getItem('selectedPeriod') || 'month';
console.log('[ANALYSIS] Archivo analysis.js cargado');
function whenVisible(el, callback) {
    if (!el) {
        console.warn('[Observer] Elemento no encontrado');
        return;
    }
    console.log('[Observer] Observando visibilidad de', el.id);
    const observer = new IntersectionObserver((entries, obs)=>{
        entries.forEach((entry)=>{
            const isVisible = entry.isIntersecting && getComputedStyle(el).display !== 'none' && el.classList.contains('active');
            console.log(`[Observer] entry para ${el.id} \u{2192} isIntersecting=${entry.isIntersecting}, display=${getComputedStyle(el).display}, active=${el.classList.contains('active')}`);
            if (isVisible) {
                console.log(`[Observer] ${el.id} visible y activo \u{2192} ejecutando callback`);
                callback();
                obs.disconnect(); // Detengo la observación tras ejecutarse una vez
            }
        });
    });
    observer.observe(el);
}
// ───── Lógica principal: espera al DOM y prepara la vista ─────
document.addEventListener('DOMContentLoaded', ()=>{
    const sidebar = document.getElementById('sidebar');
    const periodSelect = document.getElementById('period-select');
    // Eventos para abrir/cerrar el sidebar
    document.getElementById('open-sidebar').addEventListener('click', ()=>sidebar.classList.add('open'));
    document.getElementById('close-sidebar').addEventListener('click', ()=>sidebar.classList.remove('open'));
    // Logout
    document.getElementById('logout-link').addEventListener('click', async (e)=>{
        e.preventDefault();
        await (0, _auth.signOut)((0, _firebaseJs.auth));
        window.location.href = '../index.html';
    });
    // Cambio de periodo en el selector de "Este mes", "Esta semana", etc.
    periodSelect.addEventListener('change', (e)=>{
        selectedPeriod = e.target.value;
        localStorage.setItem('selectedPeriod', selectedPeriod);
        if (userUid) (0, _generalJs.loadGeneral)(userUid, selectedPeriod); // recarga la pestaña General con el nuevo periodo
    });
    // Navegación entre pestañas
    document.querySelectorAll('.filter-btn').forEach((btn)=>{
        btn.addEventListener('click', async ()=>{
            const selected = btn.dataset.filter;
            const panel = document.getElementById(`panel-${selected}`);
            console.log(`[UI] Click en pesta\xf1a: ${selected}`);
            if (!panel) {
                console.warn(`[UI] No se encontr\xf3 panel para: ${selected}`);
                return;
            }
            // Reseteo estilo activo de todas las pestañas
            document.querySelectorAll('.filter-btn').forEach((b)=>b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach((p)=>p.classList.remove('active'));
            btn.classList.add('active');
            panel.classList.add('active');
            // Solo la pestaña General muestra el selector de periodo
            periodSelect.style.display = selected === 'overview' ? 'block' : 'none';
            if (!userUid) return;
            // Cambio de lógica y render según pestaña activa
            switch(selected){
                case 'overview':
                    console.log("[UI] \u2192 Mostrando pesta\xf1a General");
                    destroyGrowthCharts();
                    destroyComparisonCharts();
                    (0, _generalJs.initCharts)();
                    (0, _generalJs.renderAnalysis)();
                    break;
                case 'growth':
                    console.log("[UI] \u2192 Mostrando pesta\xf1a Crecimiento");
                    destroyGeneralCharts();
                    destroyComparisonCharts();
                    try {
                        await (0, _growthJs.loadGrowth)();
                    } catch (e) {
                        console.error('[GROWTH] Error al cargar crecimiento:', e);
                    }
                    break;
                case 'compare':
                    console.log("[UI] \u2192 Mostrando pesta\xf1a Comparaci\xf3n");
                    destroyGeneralCharts();
                    destroyGrowthCharts();
                    try {
                        await (0, _comparisonJs.loadComparison)(userUid, selectedPeriod);
                    } catch (e) {
                        console.error("[COMPARE] Error al cargar comparaci\xf3n:", e);
                    }
                    break;
            }
        });
    });
    // ───── Detecta usuario autenticado y activa pestaña por defecto ─────
    (0, _auth.onAuthStateChanged)((0, _firebaseJs.auth), async (user)=>{
        if (user) {
            userUid = user.uid;
            console.log('[AUTH] Usuario autenticado:', userUid);
            const savedPeriod = localStorage.getItem('selectedPeriod') || 'month';
            document.getElementById('period-select').value = savedPeriod;
            selectedPeriod = savedPeriod;
            document.querySelector('.filter-btn[data-filter="overview"]').click(); // inicia en General
        } else window.location.href = '../index.html';
    });
});
// ───── Destrucción de gráficas anteriores para evitar overlays ─────
function destroyChart(instance, name) {
    if (instance && typeof instance.destroy === 'function') try {
        instance.destroy();
        console.log(`[CLEAN] ${name} destruido`);
    } catch (e) {
        console.warn(`[CLEAN] Error al destruir ${name}:`, e);
    }
}
// Gráficas de la pestaña General (línea, barras, pastel)
function destroyGeneralCharts() {
    destroyChart(window.trendChart, 'trendChart');
    destroyChart(window.barChart, 'barChart');
    destroyChart(window.pieChart, 'pieChart');
    window.trendChart = null;
    window.barChart = null;
    window.pieChart = null;
}
// Gráficas de la pestaña Crecimiento (evolución mensual, heatmap, stack)
function destroyGrowthCharts() {
    destroyChart(window.growthChart, 'growthChart');
    destroyChart(window.categoryTrendChart, 'categoryTrendChart');
    destroyChart(window.categoryHeatmap, 'categoryHeatmap');
    window.growthChart = null;
    window.categoryTrendChart = null;
    window.categoryHeatmap = null;
}
// Gráfica de la pestaña Comparación
function destroyComparisonCharts() {
    destroyChart(window.compareBarChart, 'compareBarChart');
    window.compareBarChart = null;
}

},{"./firebase.js":"24zHi","firebase/auth":"4ZBbi","./general.js":"lGg7R","./growth.js":"4z1LS","./comparison.js":"1xXBN","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"lGg7R":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// ───── Utilidad: Ejecutar una función cuando un elemento sea visible en el viewport ─────
// La uso para asegurar que los gráficos se renderizan solo cuando la pestaña está activa
parcelHelpers.export(exports, "whenVisible", ()=>whenVisible);
// ───── Función principal de renderizado de análisis financiero ─────
parcelHelpers.export(exports, "renderAnalysis", ()=>renderAnalysis);
// ───── Función para inicializar todos los gráficos de la pestaña de análisis ─────
parcelHelpers.export(exports, "initCharts", ()=>initCharts);
parcelHelpers.export(exports, "loadGeneral", ()=>loadGeneral);
var _firebaseJs = require("./firebase.js");
var _firestore = require("firebase/firestore");
var _auth = require("firebase/auth");
console.log('[ANALYSIS] Archivo analysis.js cargado');
// ───── Inicializo Firestore y declaro variables globales ─────
const db = (0, _firestore.getFirestore)((0, _firebaseJs.app));
let trendChart, barChart, pieChart; // Instancias de gráficos
let userId = null; // UID del usuario actual
let selectedPeriod = 'month'; // Periodo actual seleccionado
// Estructuras auxiliares para caching y control
const monthsSet = new Set(); // Guarda los meses ya procesados
let unsubscribeFns = []; // Para cancelar listeners de Firebase cuando haga falta
const catByMonth = new Map(); // Map mes → categorías con gasto
const daysOfCurrentWeek = new Map(); // Para análisis por día en la semana actual
const subscribedWeeks = new Set(); // Para evitar múltiples subscripciones a la misma semana
let lastRevenue = []; // Ingresos anteriores para comparar
let lastSpend = []; // Gastos anteriores para comparar
let lastCatMapStr = ''; // Stringified de último mapa de categorías (para evitar renders redundantes)
let summaryByMonth = new Map(); // Map mes → resumen de ingresos/gastos
// ───── Colores de cada grupo de categoría para las gráficas ─────
const groupColors = {
    'Agricultura y Medio Ambiente': '#A8D5BA',
    "Alimentos y Restauraci\xf3n": '#FFB6B9',
    'Arte y Cultura': '#D2B4F8',
    "Automoci\xf3n y Transporte": '#B4C5F8',
    'Belleza y Cuidado Personal': '#FDC5F5',
    "Bienes Ra\xedces y Vivienda": '#B0EACD',
    'Compras y Retail': '#FFE29A',
    "Deportes y Recreaci\xf3n": '#FFDAC1',
    "Educaci\xf3n y Capacitaci\xf3n": '#C3FBD8',
    'Entretenimiento y Ocio': '#D8C2FF',
    'Eventos y Celebraciones': '#FFD6A5',
    'Finanzas y Seguros': '#E6C9A8',
    "Gobierno y Servicios P\xfablicos": '#BCD9EA',
    "Hogar y Jard\xedn": '#F3F798',
    'Industrial y Manufactura': '#F2C6DE',
    'Mascotas y Animales': '#C5C6F1',
    'Otros': '#D9D9D9',
    "Religi\xf3n y Comunidad": '#FAD4C0',
    'Salud y Medicina': '#C9F2F2',
    'Servicios Profesionales': '#E4BAD4',
    "Tecnolog\xeda e Internet": '#B0D9F8',
    "Viajes y Hosteler\xeda": '#FFC9DE',
    'Loan Payments': '#B0BEC5' // Gris azulado Material Design
};
// ───── Inicio del DOM: Configuro eventos y autenticación ─────
document.addEventListener('DOMContentLoaded', ()=>{
    console.log('[ANALYSIS] DOM cargado'); // [DEBUG]
    const sidebar = document.getElementById('sidebar');
    // Evento: marcar botón de filtro activo visualmente
    document.querySelectorAll('.filter-btn').forEach((btn)=>{
        btn.addEventListener('click', ()=>{
            console.log("[DEBUG] Bot\xf3n de filtro clicado:", btn.textContent);
            document.querySelector('.filter-btn.active')?.classList.remove('active');
            btn.classList.add('active');
        });
    });
    // Evento: cambio de periodo (semana, mes, año)
    document.getElementById('period-select').addEventListener('change', (e)=>{
        selectedPeriod = e.target.value;
        localStorage.setItem('selectedPeriod', selectedPeriod);
        console.log('[ANALYSIS] Periodo seleccionado cambiado a:', selectedPeriod); // [DEBUG]
        if (userId) {
            console.log('[DEBUG] Reaplicando filtro tras cambio de periodo'); // [DEBUG]
            applyPeriodFilter(userId, selectedPeriod);
        }
    });
    // Evento: cuando el estado de auth cambia (login/logout)
    (0, _auth.onAuthStateChanged)((0, _firebaseJs.auth), async (user)=>{
        if (user) {
            userId = user.uid;
            console.log('[ANALYSIS] Usuario autenticado:', userId); // [DEBUG]
            // Restaura el periodo guardado en localStorage
            const savedPeriod = localStorage.getItem('selectedPeriod') || 'month';
            selectedPeriod = savedPeriod;
            document.getElementById('period-select').value = savedPeriod;
            console.log('[DEBUG] Periodo restaurado desde localStorage:', selectedPeriod);
            // Inicio del sistema reactivo
            reactiveAnalysis(userId);
            // Aplico filtro tras un pequeño timeout para asegurar que los datos ya están renderizados
            setTimeout(()=>{
                console.log('[DEBUG] Ejecutando applyPeriodFilter tras timeout inicial');
                applyPeriodFilter(userId, selectedPeriod);
            }, 200);
        } else {
            console.log('[ANALYSIS] Usuario no autenticado. Redirigiendo...');
            window.location.href = '../index.html';
        }
    });
});
function whenVisible(el, callback) {
    if (!el) {
        console.warn('[Observer] Elemento no encontrado');
        return;
    }
    console.log('[Observer] Observando visibilidad de', el.id);
    const observer = new IntersectionObserver((entries, obs)=>{
        entries.forEach((entry)=>{
            const isVisible = entry.isIntersecting && getComputedStyle(el).display !== 'none' && el.classList.contains('active');
            console.log(`[Observer] entry para ${el.id} \u{2192} isIntersecting=${entry.isIntersecting}, display=${getComputedStyle(el).display}, active=${el.classList.contains('active')}`);
            if (isVisible) {
                console.log(`[Observer] ${el.id} visible y activo \u{2192} ejecutando callback`);
                callback();
                obs.disconnect(); // Una vez que se ve, dejo de observarlo
            }
        });
    });
    observer.observe(el);
}
// ───── Función principal reactiva: suscribe a history e historySummary ─────
async function reactiveAnalysis(userId) {
    console.log('[RENDER] Entrando en renderAnalysis con periodo:', selectedPeriod); // [DEBUG]
    const histRef = (0, _firestore.collection)(db, 'users', userId, 'history');
    const sumRef = (0, _firestore.collection)(db, 'users', userId, 'historySummary');
    // Inicializo las instancias de los gráficos (los vacía si ya existen)
    initCharts();
    // Marcadores para saber cuándo ambos listeners han respondido al menos una vez
    let sourcesReady = {
        history: false,
        summary: false
    };
    return new Promise((resolve)=>{
        // Función que se ejecuta cada vez que uno de los dos listeners responde
        const checkIfReadyToRender = ()=>{
            if (sourcesReady.history && sourcesReady.summary) {
                console.log('[ANALYSIS] Datos cargados. Aplicando filtro de periodo...');
                applyPeriodFilter(userId, selectedPeriod); //Se renderiza solo cuando tengo ambos conjuntos
                resolve(); // Marco la promesa como completada
            }
        };
        // Utilidad para manejar un snapshot recibido (ya sea de history o de summary)
        const updateSubscriptionsFromSnapshot = (type, snap)=>{
            const newMonths = new Set();
            // Si es de summary, limpio el mapa actual
            if (type === 'summary') summaryByMonth.clear();
            snap.docs.forEach((doc)=>{
                newMonths.add(doc.id);
                // Si es summary, guardo el documento completo para KPIs
                if (type === 'summary') summaryByMonth.set(doc.id, doc.data());
            });
            // Guardo en el conjunto global de meses detectados
            newMonths.forEach((m)=>monthsSet.add(m));
            sourcesReady[type] = true;
            checkIfReadyToRender();
        };
        // Suscripción reactiva al historial de transacciones (estructura base)
        (0, _firestore.onSnapshot)(histRef, (snap)=>{
            console.log('[ANALYSIS] Snapshot recibido para history:', snap.docs.length);
            updateSubscriptionsFromSnapshot('history', snap);
        });
        // Suscripción reactiva al resumen mensual (estructura agregada)
        (0, _firestore.onSnapshot)(sumRef, (snap)=>{
            console.log('[ANALYSIS] Snapshot recibido para summary:', snap.docs.length);
            updateSubscriptionsFromSnapshot('summary', snap);
        });
    });
}
// ───── Filtro según el periodo seleccionado (semana, mes, año) ─────
function applyPeriodFilter(userId, period) {
    console.log('[ANALYSIS] Aplicando filtro para periodo:', period);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}-${month}`;
    let monthsToSubscribe = [];
    // Si el periodo es semana o mes, solo me interesa el mes actual
    if (period === 'week' || period === 'month') monthsToSubscribe = Array.from(monthsSet).filter((m)=>m.startsWith(prefix));
    else if (period === 'year') monthsToSubscribe = Array.from(monthsSet).filter((m)=>m.startsWith(`${year}-`));
    console.log('[ANALYSIS] Meses a suscribirse:', monthsToSubscribe);
    // 🔁 Actualizo las suscripciones con los meses pertinentes
    refreshSubscriptions(monthsToSubscribe, userId);
}
// ───── Se encarga de limpiar y volver a suscribirse a los datos por mes y semana ─────
function refreshSubscriptions(months, userId) {
    console.log('[ANALYSIS] Refrescando suscripciones...');
    // Elimina listeners antiguos para evitar fugas de memoria y duplicados
    clearPreviousSubscriptions();
    months.forEach((mon)=>{
        // Suscribo a los datos de categorías para este mes
        subscribeToMonth(mon, userId);
        // Si el periodo es semana o mes, también me suscribo a los datos diarios de cada semana
        if (selectedPeriod === 'month' || selectedPeriod === 'week') for(let i = 1; i <= 5; i++){
            const weekId = `S${i}`;
            // Ruta: historySummary/{mon}/weeks/{Sx}/days
            const daysRef = (0, _firestore.collection)(db, 'users', userId, 'historySummary', mon, 'weeks', weekId, 'days');
            // Me suscribo a los documentos de cada día de esa semana
            const unsubDays = (0, _firestore.onSnapshot)(daysRef, (snap)=>{
                console.log(`[ANALYSIS] Snapshot d\xedas para ${mon}/weeks/${weekId}:`, snap.docs.length);
                for (const doc of snap.docs){
                    const fullKey = `${mon}/weeks/${weekId}/${doc.id}`; // identificador único del día
                    daysOfCurrentWeek.set(fullKey, doc.data());
                }
                // ⚡ Re-renderizo cada vez que llegan nuevos días
                renderAnalysis();
            });
            // Registro la función para poder desuscribirme luego
            unsubscribeFns.push(unsubDays);
        }
    });
}
// ───── Limpia todos los listeners previos antes de nuevas suscripciones ─────
function clearPreviousSubscriptions() {
    console.log('[ANALYSIS] Limpiando suscripciones anteriores');
    // Llamo a cada función de desuscripción activa
    unsubscribeFns.forEach((unsub)=>unsub());
    // Reinicio los arrays y sets de control
    unsubscribeFns = [];
    subscribedWeeks.clear();
}
// ───── Suscribe a los datos de categorías agregadas para un mes concreto ─────
function subscribeToMonth(mon, userId) {
    console.log("[ANALYSIS] Subscribiendo a mes (solo categor\xedas):", mon);
    const catDocRef = (0, _firestore.doc)(db, 'users', userId, 'historyCategorias', mon);
    // Escucho el documento de categorías para el mes dado
    const unsubCat = (0, _firestore.onSnapshot)(catDocRef, (snap)=>{
        console.log("[ANALYSIS] Snapshot categor\xedas:", mon, snap.exists());
        if (snap.exists()) {
            const data = snap.data();
            delete data.updatedAt; // No necesito este campo para renderizar
            catByMonth.set(mon, data);
        }
        // 🔁 Actualizo la visualización al recibir nuevos datos
        renderAnalysis();
    });
    // Guardo el listener para desuscribirlo después
    unsubscribeFns.push(unsubCat);
}
function renderAnalysis() {
    console.log("[ANALYSIS] Renderizando an\xe1lisis...");
    // Si estamos en modo semana o mes pero no tenemos datos diarios, no tiene sentido continuar
    if ((selectedPeriod === 'month' || selectedPeriod === 'week') && daysOfCurrentWeek.size === 0) {
        console.log('[ANALYSIS] No hay datos diarios disponibles');
        return;
    }
    // Inicializo las estructuras de datos base
    let xLabels = [], revenue = [], spend = [], netIncome = [];
    // ───── Agrupación por semanas (cuando el periodo es mensual) ─────
    if (selectedPeriod === 'month') {
        const semanas = [
            'S1',
            'S2',
            'S3',
            'S4',
            'S5'
        ];
        xLabels = semanas;
        revenue = new Array(5).fill(0);
        spend = new Array(5).fill(0);
        for (const [key, entry] of daysOfCurrentWeek.entries()){
            if (!key || typeof key !== 'string') continue;
            const parts = key.split('/');
            const weekIdx = semanas.indexOf(parts[2]); // Ej: key = "2025-07/weeks/S3/2025-07-15"
            if (weekIdx === -1) continue;
            // Sumo ingresos/gastos en la semana correspondiente
            revenue[weekIdx] += entry?.totalIncomes || 0;
            spend[weekIdx] += entry?.totalExpenses || 0;
        }
    } else if (selectedPeriod === 'week') {
        const dias = [
            'Lun',
            'Mar',
            "Mi\xe9",
            'Jue',
            'Vie',
            "S\xe1b",
            'Dom'
        ];
        xLabels = dias;
        revenue = new Array(7).fill(0);
        spend = new Array(7).fill(0);
        for (const [key, entry] of daysOfCurrentWeek.entries()){
            const dateStr = key.split('/').at(-1); // Extraigo la fecha
            const date = new Date(dateStr);
            const idx = (date.getDay() + 6) % 7; // Ajuste para que Lunes sea 0
            revenue[idx] += entry?.totalIncomes || 0;
            spend[idx] += entry?.totalExpenses || 0;
        }
    } else if (selectedPeriod === 'year') {
        const year = new Date().getFullYear().toString();
        const months = [
            ...summaryByMonth.keys()
        ].filter((k)=>k.startsWith(year)).sort();
        if (months.length === 0) {
            console.log("[ANALYSIS] No hay datos mensuales para el a\xf1o actual");
            return;
        }
        xLabels = months.map((m)=>m.split('-')[1]); // Extraigo número de mes
        revenue = months.map((m)=>summaryByMonth.get(m)?.totalIncomes || 0);
        spend = months.map((m)=>summaryByMonth.get(m)?.totalExpenses || 0);
    }
    // ───── Evito renders innecesarios si los datos no han cambiado ─────
    if (selectedPeriod !== 'week' && arraysEqual(revenue, lastRevenue) && arraysEqual(spend, lastSpend)) {
        console.log('[ANALYSIS] No hay cambios en ingresos/gastos. Render omitido.');
        return;
    }
    // Calculo el saldo neto como diferencia ingreso - gasto
    netIncome = revenue.map((r, i)=>r - spend[i]);
    const totalRev = revenue.reduce((a, b)=>a + b, 0);
    const totalSpd = spend.reduce((a, b)=>a + b, 0);
    // Actualizo KPIs absolutos
    document.getElementById('kpi-revenue').textContent = `\u{20AC}${totalRev.toFixed(2)}`;
    document.getElementById('kpi-spend').textContent = `\u{20AC}${totalSpd.toFixed(2)}`;
    // ───── Cálculo del % de variación respecto al periodo anterior ─────
    let revChange = 0, spdChange = 0;
    if (selectedPeriod === 'year' || selectedPeriod === 'month') {
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
        const currSummary = summaryByMonth.get(currentMonthKey);
        const prevSummary = summaryByMonth.get(prevMonthKey);
        const currRev = currSummary?.totalIncomes || 0;
        const prevRev = prevSummary?.totalIncomes || 0;
        const currSpd = currSummary?.totalExpenses || 0;
        const prevSpd = prevSummary?.totalExpenses || 0;
        revChange = (currRev - prevRev) / Math.max(prevRev, 1) * 100;
        spdChange = (currSpd - prevSpd) / Math.max(prevSpd, 1) * 100;
        console.log('[KPI] Comparando mes actual:', currentMonthKey, 'vs anterior:', prevMonthKey);
        console.log('[KPI] Ingresos: actual', currRev, ', anterior', prevRev);
        console.log('[KPI] Gastos: actual', currSpd, ', anterior', prevSpd);
    } else if (selectedPeriod === 'week') {
        function getWeekDates(baseDate = new Date()) {
            const weekday = baseDate.getDay();
            const startCurrentWeek = new Date(baseDate);
            startCurrentWeek.setDate(baseDate.getDate() - (weekday + 6) % 7); // Lunes actual
            const startPrevWeek = new Date(startCurrentWeek);
            startPrevWeek.setDate(startPrevWeek.getDate() - 7); // Lunes anterior
            const thisWeekDates = [], lastWeekDates = [];
            for(let i = 0; i < 7; i++){
                thisWeekDates.push(new Date(startCurrentWeek.getTime() + i * 86400000).toISOString().split('T')[0]);
                lastWeekDates.push(new Date(startPrevWeek.getTime() + i * 86400000).toISOString().split('T')[0]);
            }
            return [
                thisWeekDates,
                lastWeekDates
            ];
        }
        const [thisWeekDates, lastWeekDates] = getWeekDates();
        let thisWeekRev = 0, lastWeekRev = 0, thisWeekSpd = 0, lastWeekSpd = 0;
        for (const [key, entry] of daysOfCurrentWeek.entries()){
            const dateKey = key.split('/').pop();
            if (thisWeekDates.includes(dateKey)) {
                thisWeekRev += entry?.totalIncomes || 0;
                thisWeekSpd += entry?.totalExpenses || 0;
            } else if (lastWeekDates.includes(dateKey)) {
                lastWeekRev += entry?.totalIncomes || 0;
                lastWeekSpd += entry?.totalExpenses || 0;
            }
        }
        revChange = (thisWeekRev - lastWeekRev) / Math.max(lastWeekRev, 1) * 100;
        spdChange = (thisWeekSpd - lastWeekSpd) / Math.max(lastWeekSpd, 1) * 100;
        console.log('[KPI] Comparando semana actual vs anterior');
        console.log('[KPI] Ingresos: actual', thisWeekRev, ', anterior', lastWeekRev);
        console.log('[KPI] Gastos: actual', thisWeekSpd, ', anterior', lastWeekSpd);
    }
    // Actualizo los elementos de cambio de KPI (con signo + o -)
    document.getElementById('kpi-revenue-change').textContent = `${revChange >= 0 ? '+' : ''}${revChange.toFixed(1)}% vs periodo anterior`;
    document.getElementById('kpi-spend-change').textContent = `${spdChange >= 0 ? '+' : ''}${spdChange.toFixed(1)}% vs periodo anterior`;
    console.log("[ANALYSIS] KPI actualizados. Redibujando gr\xe1ficas...");
    // ───── Renderizo las gráficas de ingresos/gastos y saldo neto ─────
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
            categories: xLabels
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
            categories: xLabels
        }
    });
    // Guardo los datos actuales para detectar futuros cambios
    lastRevenue = [
        ...revenue
    ];
    lastSpend = [
        ...spend
    ];
    //Renderizo el gráfico de pastel para el periodo actual
    renderPieChartForCurrentPeriod();
    console.log('[RENDER] renderAnalysis completado.');
}
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for(let i = 0; i < a.length; i++)if (Math.abs(a[i] - b[i]) > 0.0001) return false;
    return true;
}
function initCharts() {
    console.log("[ANALYSIS] Inicializando gr\xe1ficos");
    // ───── Gráfico de línea: Ingresos vs Gastos ─────
    trendChart = new ApexCharts(document.querySelector('#trendChart'), {
        chart: {
            type: 'line',
            height: 240,
            toolbar: {
                show: false
            } // Oculto el menú interactivo
        },
        series: [],
        xaxis: {
            categories: [],
            tickPlacement: 'between',
            labels: {
                style: {
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            labels: {
                formatter: (val)=>Math.round(val) // Simplifico etiquetas Y
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
            borderColor: '#eee',
            padding: {
                left: 20,
                right: 10
            }
        },
        legend: {
            show: false // Oculto leyenda del gráfico, se pone manual más abajo
        }
    });
    // Renderizo el gráfico de línea en pantalla
    trendChart.render();
    // ───── Leyenda personalizada para Ingresos y Gastos ─────
    const trendLegend = document.getElementById('trendLegend');
    if (trendLegend) trendLegend.innerHTML = `
      <div class="legend-item">
        <span class="legend-color" style="background:#4ADE80"></span> Ingresos
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background:#F87171"></span> Gastos
      </div>
    `;
    // ───── Gráfico de barras: Saldo neto (Ingresos - Gastos) ─────
    barChart = new ApexCharts(document.querySelector('#barChart'), {
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
                        } // Positivo → verde
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
    // Renderizo gráfico de barras
    barChart.render();
    // ───── Gráfico de pastel: Distribución por categoría ─────
    pieChart = new ApexCharts(document.querySelector('#pieChart'), {
        chart: {
            type: 'pie',
            height: 220,
            animations: {
                enabled: false
            } // Evito animaciones para que no se rompa al cambiar de pestaña
        },
        series: [],
        labels: [],
        colors: [],
        legend: {
            position: 'bottom' // Coloco leyenda abajo para facilitar lectura en móviles
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
    // Renderizo gráfico de pastel
    pieChart.render();
}
// Devuelve la semana del mes actual ('S1' a 'S5') según el día del mes
function getCurrentWeekInMonth() {
    const today = new Date();
    const day = today.getDate();
    if (day <= 7) return 'S1';
    if (day <= 14) return 'S2';
    if (day <= 21) return 'S3';
    if (day <= 28) return 'S4';
    return 'S5';
}
// Renderiza gráfico de pastel (por categoría) según el periodo seleccionado
async function renderPieChartForCurrentPeriod() {
    console.log(`[PieChart] Iniciando render seg\xfan periodo: ${selectedPeriod}`);
    const catMap = {};
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}-${month}`;
    const semanas = [
        'S1',
        'S2',
        'S3',
        'S4',
        'S5'
    ];
    if (selectedPeriod === 'month') {
        // Leer directamente el doc mensual
        const monthRef = (0, _firestore.doc)(db, 'users', userId, 'historyCategorias', prefix);
        try {
            const snap = await (0, _firestore.getDoc)(monthRef);
            if (snap.exists()) {
                const data = snap.data();
                console.log(`[PieChart] Categor\xedas mensuales para ${prefix}:`, data);
                for (const [cat, val] of Object.entries(data)){
                    if (cat === 'weeks') continue; // saltar referencia a subcolección
                    catMap[cat] = val;
                }
            } else console.warn(`[PieChart] No existe el documento mensual ${prefix}`);
        } catch (err) {
            console.error(`[PieChart] Error al leer ${prefix}:`, err);
        } finally{
            renderPieFinal(catMap);
        }
    } else if (selectedPeriod === 'week') {
        console.log("[PieChart] \u2192 Modo semana activado");
        const selectedWeek = getCurrentWeekInMonth();
        const weekRef = (0, _firestore.doc)(db, 'users', userId, 'historyCategorias', prefix, 'weeks', selectedWeek);
        try {
            const snap = await (0, _firestore.getDoc)(weekRef);
            if (snap.exists()) {
                const data = snap.data();
                if (!data || Object.keys(data).length === 0) console.warn(`[PieChart] Semana ${selectedWeek} existe pero sin datos`);
                else {
                    console.log(`[PieChart] Datos de ${prefix}/weeks/${selectedWeek}:`, data);
                    for (const [cat, val] of Object.entries(data))catMap[cat] = val;
                }
            } else console.warn(`[PieChart] No existe el documento de semana ${selectedWeek}`);
        } catch (err) {
            console.error(`[PieChart] Error al leer semana ${selectedWeek}:`, err);
        } finally{
            console.log("[PieChart] Acumulado semanal \u2192", catMap);
            renderPieFinal(catMap);
        }
    } else if (selectedPeriod === 'year') {
        const months = Array.from(monthsSet).filter((m)=>m.startsWith(year));
        console.log(`[PieChart] Procesando meses del a\xf1o: ${months.join(', ')}`);
        let pendingMonths = months.length;
        if (pendingMonths === 0) {
            console.warn('[PieChart] No hay meses en monthsSet');
            return renderPieFinal(catMap);
        }
        months.forEach((m)=>{
            const monthRef = (0, _firestore.doc)(db, 'users', userId, 'historyCategorias', m);
            (0, _firestore.getDoc)(monthRef).then((snap)=>{
                if (snap.exists()) {
                    const data = snap.data();
                    console.log(`[PieChart] A\xf1o\u{2192} ${m}:`, data);
                    for (const [cat, val] of Object.entries(data)){
                        if (cat === 'weeks') continue;
                        catMap[cat] = (catMap[cat] || 0) + val;
                    }
                } else console.warn(`[PieChart] No existe el mes ${m}`);
            }).catch((err)=>{
                console.error(`[PieChart] Error al leer mes ${m}:`, err);
            }).finally(()=>{
                if (--pendingMonths === 0) {
                    console.log("[PieChart] Acumulado anual \u2192", catMap);
                    renderPieFinal(catMap);
                }
            });
        });
    }
}
function renderPieFinal(catMap) {
    const currentCatMapStr = JSON.stringify(catMap);
    if (currentCatMapStr === lastCatMapStr) {
        console.log("[PieChart] Sin cambios en categor\xedas. Render omitido.");
        return;
    }
    lastCatMapStr = currentCatMapStr;
    const catLabels = Object.keys(catMap);
    const catData = catLabels.map((cat)=>+catMap[cat].toFixed(2));
    if (catLabels.length === 0) {
        console.log("[PieChart] No hay datos de categor\xedas. Render cancelado.");
        return;
    }
    console.log('[PieChart] Etiquetas a mostrar:', catLabels);
    console.log("[PieChart] Valores por categor\xeda:", catData);
    const catColors = catLabels.map((label)=>groupColors[label] || '#999');
    const pieContainer = document.querySelector('#pieChart');
    if (!pieContainer) {
        console.warn("[PieChart] No se encontr\xf3 el contenedor #pieChart");
        return;
    }
    // ─── Destruir gráfico anterior si existe ──────────────────────
    if (pieChart && typeof pieChart.destroy === 'function') try {
        pieChart.destroy();
        console.log("[PieChart] Gr\xe1fico anterior destruido");
    } catch (err) {
        console.warn("[PieChart] Error al destruir gr\xe1fico anterior:", err);
    }
    pieChart = new ApexCharts(pieContainer, {
        chart: {
            type: 'pie',
            height: 260,
            animations: {
                enabled: false
            }
        },
        series: catData,
        labels: catLabels,
        colors: catColors,
        legend: {
            show: false
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
    pieChart.render().then(()=>{
        console.log("[PieChart] Gr\xe1fico renderizado correctamente");
        const legendContainer = document.getElementById('pieLegend');
        if (!legendContainer) return;
        const total = catData.reduce((acc, val)=>acc + val, 0);
        legendContainer.innerHTML = catLabels.map((label, idx)=>{
            const value = catData[idx];
            const percentage = total > 0 ? (value / total * 100).toFixed(1) : '0.0';
            return `
        <div style="display:flex;align-items:center;margin-bottom:4px;font-size:0.85rem">
          <span style="display:inline-block;width:12px;height:12px;background:${catColors[idx]};margin-right:6px;border-radius:2px;"></span>
          ${label} (${percentage}%)
        </div>
      `;
        }).join('');
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
function loadGeneral(userId, selectedPeriod) {
    console.log("[TAB] \u2192 loadGeneral() invocado con:", {
        userId,
        selectedPeriod
    }); // [DEBUG]
    reactiveAnalysis(userId, selectedPeriod).then(()=>{
        const overviewPanel = document.getElementById('panel-overview');
        if (!overviewPanel) {
            console.warn("[TAB] No se encontr\xf3 el panel-overview"); // [DEBUG]
            return;
        }
    });
    initCharts();
    reactiveAnalysis(userId).then(()=>{
        renderAnalysis(); // ✅ Solo renderizas una vez los datos están listos
    });
}

},{"./firebase.js":"24zHi","firebase/firestore":"3RBs1","firebase/auth":"4ZBbi","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"4z1LS":[function(require,module,exports,__globalThis) {
// growth.js – Pestaña de Crecimiento (con carga de categorías por endpoint separado)
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "loadGrowth", ()=>loadGrowth);
var _firebaseJs = require("./firebase.js");
var _auth = require("firebase/auth");
var _analysisJs = require("./analysis.js");
console.log("[GROWTH] M\xf3dulo growth.js cargado");
const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5001/fintrack-1bced/us-central1/api' : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';
const groupColors = {
    'Agricultura y Medio Ambiente': '#A8D5BA',
    "Alimentos y Restauraci\xf3n": '#FFB6B9',
    'Arte y Cultura': '#D2B4F8',
    "Automoci\xf3n y Transporte": '#B4C5F8',
    'Belleza y Cuidado Personal': '#FDC5F5',
    "Bienes Ra\xedces y Vivienda": '#B0EACD',
    'Compras y Retail': '#FFE29A',
    "Deportes y Recreaci\xf3n": '#FFDAC1',
    "Educaci\xf3n y Capacitaci\xf3n": '#C3FBD8',
    'Entretenimiento y Ocio': '#D8C2FF',
    'Eventos y Celebraciones': '#FFD6A5',
    'Finanzas y Seguros': '#E6C9A8',
    "Gobierno y Servicios P\xfablicos": '#BCD9EA',
    "Hogar y Jard\xedn": '#F3F798',
    'Industrial y Manufactura': '#F2C6DE',
    'Mascotas y Animales': '#C5C6F1',
    'Otros': '#D9D9D9',
    "Religi\xf3n y Comunidad": '#FAD4C0',
    'Salud y Medicina': '#C9F2F2',
    'Servicios Profesionales': '#E4BAD4',
    "Tecnolog\xeda e Internet": '#B0D9F8',
    "Viajes y Hosteler\xeda": '#FFC9DE',
    'Loan Payments': '#B0BEC5' // Gris azulado Material Design
};
async function loadGrowth() {
    console.log("[GROWTH] \u2699\uFE0F Iniciando carga de datos para crecimiento");
    const isOnline = navigator.onLine;
    const months = getLast12Months();
    const summaryData = [];
    const categoryData = new Map();
    if (!isOnline) {
        console.warn("[GROWTH] \u26A0\uFE0F Est\xe1s offline. No se puede cargar crecimiento desde Firestore.");
        return;
    }
    try {
        const userId = await getCurrentUserId();
        if (!userId) throw new Error('Usuario no autenticado');
        // ───── Obtener datos de resumen de ingresos/gastos ─────
        const summaryRes = await fetch(`${apiUrl}/plaid/get_growth_history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId
            })
        });
        if (!summaryRes.ok) throw new Error(`HTTP ${summaryRes.status} en get_growth_history`);
        const { summary } = await summaryRes.json();
        for (const month of months)if (summary[month]) {
            const ingresos = summary[month].totalIncomes || 0;
            const gastos = summary[month].totalExpenses || 0;
            summaryData.push({
                month,
                ingresos,
                gastos
            });
            console.log(`[GROWTH] \u{2705} Datos cargados para ${month}`);
        } else console.log(`[GROWTH] \u{23ED}\u{FE0F} No hay datos para ${month}, se omite`);
        if (summaryData.length === 0) throw new Error('No hay meses con datos disponibles');
        // ───── Obtener datos de categorías agregadas ─────
        const catRes = await fetch(`${apiUrl}/plaid/get_category_trends`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId
            })
        });
        if (!catRes.ok) throw new Error(`HTTP ${catRes.status} en get_category_trends`);
        const { categoryTrends } = await catRes.json();
        console.log("[GROWTH] \uD83D\uDD0E categoryTrends completos:", categoryTrends);
        for (const month of months){
            console.log(`[GROWTH] \xbfHay datos para ${month}?`, categoryTrends[month]);
            if (categoryTrends[month]) categoryData.set(month, categoryTrends[month]);
        }
        console.log("[GROWTH] \u2705 Datos finalizados, esperando visibilidad de pesta\xf1a para renderizar KPIs y gr\xe1ficas...");
        (0, _analysisJs.whenVisible)(document.getElementById('panel-growth'), ()=>{
            console.log("[GROWTH] \uD83D\uDC40 Pesta\xf1a visible, renderizando KPIs y gr\xe1ficas");
            renderGrowthKPIs(summaryData);
            renderGrowthChart(summaryData);
            renderCategoryTrendChart(summaryData.map((d)=>d.month), categoryData);
            renderCategoryHeatmap(months, categoryData);
        });
    } catch (e) {
        console.error("[GROWTH] \u274C Error al obtener datos de crecimiento:", e.message);
    }
}
async function getCurrentUserId() {
    return new Promise((resolve, reject)=>{
        const unsubscribe = (0, _auth.onAuthStateChanged)((0, _firebaseJs.auth), (user)=>{
            unsubscribe();
            if (user) resolve(user.uid);
            else reject(new Error('No hay usuario autenticado'));
        }, (error)=>{
            reject(error);
        });
    });
}
function getLast12Months() {
    const months = [];
    const today = new Date();
    for(let i = 11; i >= 0; i--){
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push(date.toISOString().slice(0, 7));
    }
    return months;
}
function renderGrowthKPIs(data) {
    const len = data.length;
    if (len < 2) return;
    const prev = data[len - 2];
    const curr = data[len - 1];
    const growthIncomes = (curr.ingresos - prev.ingresos) / (prev.ingresos || 1) * 100;
    const growthExpenses = (curr.gastos - prev.gastos) / (prev.gastos || 1) * 100;
    const bestMonth = data.reduce((acc, m)=>{
        const ahorro = m.ingresos - m.gastos;
        return ahorro > (acc.ahorro || 0) ? {
            ...m,
            ahorro
        } : acc;
    }, {});
    document.getElementById('kpi-growth-revenue').textContent = growthIncomes.toFixed(2) + '%';
    document.getElementById('kpi-growth-spend').textContent = growthExpenses.toFixed(2) + '%';
    document.getElementById('kpi-best-month').textContent = bestMonth.month || '-';
    console.log('[GROWTH] KPIs renderizados');
}
function renderGrowthChart(data) {
    const categories = data.map((e)=>e.month);
    const incomes = data.map((e)=>e.ingresos);
    const expenses = data.map((e)=>e.gastos);
    const savings = data.map((e)=>e.ingresos - e.gastos);
    const options = {
        chart: {
            type: 'line',
            height: 420,
            toolbar: {
                show: false
            },
            animations: {
                enabled: false
            }
        },
        series: [
            {
                name: 'Ingresos',
                data: incomes
            },
            {
                name: 'Gastos',
                data: expenses
            },
            {
                name: 'Ahorro',
                data: savings
            }
        ],
        xaxis: {
            categories,
            tickPlacement: 'between',
            labels: {
                rotate: -45,
                style: {
                    fontSize: '11px'
                }
            }
        },
        yaxis: {
            labels: {
                formatter: (val)=>Math.round(val),
                style: {
                    fontSize: '11px'
                }
            }
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        markers: {
            size: 4
        },
        dataLabels: {
            enabled: false
        },
        colors: [
            '#00C49F',
            '#FF4C4C',
            '#0074D9'
        ],
        legend: {
            show: true,
            position: 'bottom',
            fontSize: '12px',
            horizontalAlign: 'center',
            markers: {
                width: 10,
                height: 10
            },
            itemMargin: {
                horizontal: 8,
                vertical: 4
            }
        },
        grid: {
            borderColor: '#eee',
            padding: {
                left: 20,
                right: 10,
                bottom: 100 // ✅ Añadimos espacio para leyenda y etiquetas X
            }
        },
        noData: {
            text: 'No hay datos disponibles',
            align: 'center',
            verticalAlign: 'middle',
            style: {
                color: '#999',
                fontSize: '14px'
            }
        }
    };
    try {
        const el = document.querySelector('#growthChart');
        if (!el) {
            console.warn("[GROWTH] \u26A0\uFE0F growthChart container NO ENCONTRADO");
            return;
        }
        if (window.growthChart) {
            console.log("[GROWTH] \uD83D\uDD01 Destruyendo gr\xe1fico anterior");
            window.growthChart.destroy();
        }
        window.growthChart = new ApexCharts(el, options);
        window.growthChart.render();
        console.log("[GROWTH] \uD83D\uDCC8 growthChart renderizado correctamente");
    } catch (e) {
        console.error("[GROWTH] \u274C Error al renderizar growthChart:", e);
    }
}
function renderCategoryTrendChart(months, categoryData) {
    console.log("[GROWTH] \uD83D\uDD0D Iniciando renderCategoryTrendChart...");
    console.log("[GROWTH] \uD83D\uDCC6 Meses a mostrar:", months);
    console.log("[GROWTH] \uD83D\uDCCA Datos de categor\xeda:", categoryData);
    const allGroups = new Set();
    months.forEach((m)=>{
        const data = categoryData.get(m);
        if (data) Object.keys(data).forEach((g)=>allGroups.add(g));
    });
    const sortedGroups = Array.from(allGroups).sort();
    const series = sortedGroups.map((group)=>({
            name: group,
            data: months.map((m)=>categoryData.get(m)?.[group] || 0)
        }));
    console.log("[GROWTH] \uD83E\uDDE9 Series generadas:", series);
    const colors = sortedGroups.map((group)=>groupColors[group] || '#D9D9D9');
    const options = {
        chart: {
            type: 'area',
            height: 320,
            stacked: true,
            toolbar: {
                show: false
            },
            animations: {
                enabled: true
            }
        },
        series,
        colors,
        xaxis: {
            categories: months,
            labels: {
                rotate: -45
            }
        },
        yaxis: {
            labels: {
                formatter: (val)=>Math.round(val)
            }
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            show: false
        },
        noData: {
            text: 'No hay datos disponibles',
            align: 'center',
            verticalAlign: 'middle',
            style: {
                color: '#999',
                fontSize: '14px'
            }
        }
    };
    try {
        const el = document.querySelector('#categoryTrendChart');
        const legendEl = document.querySelector('#categoryTrendLegend');
        if (!el) return console.warn("[GROWTH] \u26A0\uFE0F categoryTrendChart container NO ENCONTRADO");
        if (!legendEl) return console.warn("[GROWTH] \u26A0\uFE0F categoryTrendLegend container NO ENCONTRADO");
        if (window.categoryTrendChart) {
            console.log("[GROWTH] \uD83D\uDD01 Destruyendo gr\xe1fico anterior");
            window.categoryTrendChart.destroy();
        }
        window.categoryTrendChart = new ApexCharts(el, options);
        window.categoryTrendChart.render().then(()=>{
            console.log("[GROWTH] \u2705 categoryTrendChart renderizado correctamente");
            // Leyenda externa renderizada manualmente
            legendEl.innerHTML = sortedGroups.map((group, i)=>`
        <div class="legend-item">
          <div class="legend-color" style="background-color: ${colors[i]}"></div>
          <span class="legend-label">${group}</span>
        </div>
      `).join('');
        });
    } catch (e) {
        console.error("[GROWTH] \u274C Error al renderizar categoryTrendChart:", e);
    }
}
function renderCategoryHeatmap(months, categoryData) {
    console.log("[GROWTH] \uD83D\uDFE1 Generando heatmap por categor\xeda...");
    // ─── Paso 1: Detectar todos los grupos únicos ────────────────
    const allGroups = new Set();
    months.forEach((month)=>{
        const data = categoryData.get(month);
        if (data && typeof data === 'object') Object.keys(data).forEach((group)=>allGroups.add(group));
    });
    // ─── Paso 2: Construir y limpiar series ──────────────────────
    const rawSeries = Array.from(allGroups).map((group)=>{
        const data = months.map((month)=>{
            const raw = categoryData.get(month)?.[group];
            const value = typeof raw === 'number' && isFinite(raw) ? raw : 0;
            return {
                x: month,
                y: parseFloat(value.toFixed(2))
            };
        });
        return {
            name: group,
            data
        };
    });
    // ─── Paso 3: Filtrar series inválidas ────────────────────────
    const series = rawSeries.filter((s)=>s && Array.isArray(s.data) && s.data.length === months.length);
    if (!series.length) {
        console.warn("[GROWTH] \u274C No hay series v\xe1lidas para renderizar el heatmap");
        return;
    }
    console.log("[GROWTH] \uD83D\uDD2C Series finales para heatmap:", series);
    // ─── Paso 4: Configuración del gráfico ───────────────────────
    const options = {
        chart: {
            height: 420,
            type: 'heatmap',
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            heatmap: {
                shadeIntensity: 0.5,
                colorScale: {
                    ranges: [
                        {
                            from: 0,
                            to: 100,
                            color: '#DCE775',
                            name: '0 - 100'
                        },
                        {
                            from: 101,
                            to: 500,
                            color: '#FFF176',
                            name: '101 - 500'
                        },
                        {
                            from: 501,
                            to: 1000,
                            color: '#FFB74D',
                            name: '501 - 1000'
                        },
                        {
                            from: 1001,
                            to: 999999,
                            color: '#F44336',
                            name: "\u2265 1001" // 👈 lo importante es este `name`
                        }
                    ]
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            type: 'category',
            categories: months
        },
        series
    };
    // ─── Paso 5: Renderizar en el DOM ────────────────────────────
    const el = document.querySelector('#categoryHeatmap');
    if (!el) {
        console.warn("[GROWTH] \u26A0\uFE0F Contenedor #categoryHeatmap no encontrado");
        return;
    }
    if (window.categoryHeatmap && typeof window.categoryHeatmap.destroy === 'function') {
        console.log("[GROWTH] \uD83D\uDD01 Destruyendo gr\xe1fico de heatmap anterior");
        window.categoryHeatmap.destroy();
    }
    window.categoryHeatmap = new ApexCharts(el, options);
    window.categoryHeatmap.render();
    console.log("[GROWTH] \u2705 Heatmap renderizado correctamente");
}

},{"./firebase.js":"24zHi","firebase/auth":"4ZBbi","./analysis.js":"l1WLd","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"1xXBN":[function(require,module,exports,__globalThis) {
// ───── Archivo: comparison.js ─────
// Pestaña "Comparación" – compara dos meses seleccionables (ingresos, gastos y categorías)
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "loadComparison", ()=>loadComparison);
var _analysisJs = require("./analysis.js");
console.log("[COMPARE] M\xf3dulo comparison.js cargado");
const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5001/fintrack-1bced/us-central1/api' : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';
let summaryData = {};
let categoryData = {};
async function loadComparison(userId) {
    console.log("[COMPARE] \u2699\uFE0F Cargando comparaci\xf3n...");
    if (!navigator.onLine) {
        console.warn("[COMPARE] \u26A0\uFE0F Est\xe1s offline. No se puede comparar sin conexi\xf3n");
        return;
    }
    try {
        const [summaryResp, categoryResp] = await Promise.all([
            fetch(`${apiUrl}/plaid/get_growth_history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId
                })
            }).then((res)=>res.json()),
            fetch(`${apiUrl}/plaid/get_category_trends`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId
                })
            }).then((res)=>res.json())
        ]);
        summaryData = summaryResp.summary || {};
        categoryData = categoryResp.categoryTrends || {};
        const months = Object.keys(summaryData).sort().reverse();
        console.log("[COMPARE] \uD83D\uDDD3\uFE0F Meses disponibles:", months);
        populateMonthSelectors(months);
        setupEventListeners();
        // Inicial por defecto: comparar dos últimos meses
        if (months.length >= 2) renderComparison(months[0], months[1]);
    } catch (e) {
        console.error("[COMPARE] \u274C Error al obtener datos:", e);
    }
}
// ───── Pinta opciones en los dropdowns del DOM ─────
function populateMonthSelectors(months) {
    const selectA = document.getElementById('compare-month-a');
    const selectB = document.getElementById('compare-month-b');
    if (!selectA || !selectB) {
        console.warn('[COMPARE] No se encontraron los selectores de mes');
        return;
    }
    months.forEach((month)=>{
        const optA = document.createElement('option');
        const optB = document.createElement('option');
        optA.value = optB.value = month;
        optA.textContent = optB.textContent = formatMonthLabel(month);
        selectA.appendChild(optA);
        selectB.appendChild(optB);
    });
    selectA.selectedIndex = 0;
    selectB.selectedIndex = 1;
}
// ───── Vincula eventos para cambiar comparación ─────
function setupEventListeners() {
    const selectA = document.getElementById('compare-month-a');
    const selectB = document.getElementById('compare-month-b');
    if (!selectA || !selectB) return;
    selectA.addEventListener('change', ()=>{
        renderComparison(selectA.value, selectB.value);
    });
    selectB.addEventListener('change', ()=>{
        renderComparison(selectA.value, selectB.value);
    });
}
// ───── Dibuja KPIs y gráfico con dos meses concretos ─────
function renderComparison(monthA, monthB) {
    console.log(`[COMPARE] Comparando ${monthB} vs ${monthA}`);
    const dataA = summaryData[monthA] || {
        totalIncomes: 0,
        totalExpenses: 0
    };
    const dataB = summaryData[monthB] || {
        totalIncomes: 0,
        totalExpenses: 0
    };
    renderKPIs(dataB, dataA, monthA);
    renderCompareBarChart(categoryData[monthB] || {}, categoryData[monthA] || {}, monthB, monthA);
    renderCompareRadarChart(categoryData[monthB] || {}, categoryData[monthA] || {}, monthB, monthA);
}
// ───── Renderizado de KPIs ─────
function renderKPIs(actual, anterior, labelAnterior) {
    const ingresos = actual.totalIncomes || 0;
    const gastos = actual.totalExpenses || 0;
    const ahorro = ingresos - gastos;
    const ingresosPrev = anterior.totalIncomes || 0;
    const gastosPrev = anterior.totalExpenses || 0;
    const ahorroPrev = ingresosPrev - gastosPrev;
    setKPI('compare-revenue', ingresos, ingresosPrev, labelAnterior);
    setKPI('compare-spend', gastos, gastosPrev, labelAnterior);
    setKPI('compare-savings', ahorro, ahorroPrev, labelAnterior);
}
function setKPI(id, actual, anterior, labelAnterior) {
    const valorEl = document.getElementById(`kpi-${id}`);
    const diffEl = document.getElementById(`kpi-${id}-diff`);
    if (!valorEl || !diffEl) return;
    valorEl.textContent = `\u{20AC}${actual.toFixed(2)}`;
    const diferencia = actual - anterior;
    const porcentaje = anterior === 0 ? 100 : diferencia / anterior * 100;
    const texto = `${diferencia >= 0 ? '+' : ''}${porcentaje.toFixed(1)}% vs ${labelAnterior}`;
    diffEl.textContent = texto;
    diffEl.style.color = diferencia >= 0 ? '#4ADE80' : '#F87171';
}
// ───── Gráfico comparativo de barras por categoría ─────
function renderCompareBarChart(currentMap, prevMap, labelActual, labelAnterior) {
    const allKeys = new Set([
        ...Object.keys(currentMap),
        ...Object.keys(prevMap)
    ]);
    const categories = Array.from(allKeys).sort();
    const dataActual = categories.map((k)=>currentMap[k] || 0);
    const dataAnterior = categories.map((k)=>prevMap[k] || 0);
    const options = {
        chart: {
            type: 'bar',
            height: 300,
            toolbar: {
                show: false
            }
        },
        series: [
            {
                name: labelAnterior,
                data: dataAnterior
            },
            {
                name: labelActual,
                data: dataActual
            }
        ],
        xaxis: {
            categories,
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            labels: {
                formatter: (val)=>Math.round(val),
                style: {
                    fontSize: '11px'
                }
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '40%'
            }
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            position: 'top'
        },
        colors: [
            '#FBBF24',
            '#60A5FA'
        ],
        grid: {
            borderColor: '#eee',
            padding: {
                left: 20,
                right: 10
            }
        }
    };
    if (window.compareBarChart) try {
        window.compareBarChart.destroy();
        console.log("[COMPARE] \uD83D\uDD04 Gr\xe1fico anterior destruido");
    } catch (err) {
        console.warn("[COMPARE] Error al destruir gr\xe1fico previo:", err);
    }
    window.compareBarChart = new ApexCharts(document.querySelector('#compareBarChart'), options);
    window.compareBarChart.render();
    console.log("[COMPARE] \uD83D\uDCCA Gr\xe1fico de comparaci\xf3n renderizado");
}
// ───── Gráfico comparativo tipo Radar ─────
function renderCompareRadarChart(currentMap, prevMap, labelActual, labelAnterior) {
    const allKeys = new Set([
        ...Object.keys(currentMap),
        ...Object.keys(prevMap)
    ]);
    const categories = Array.from(allKeys).sort();
    const dataActual = categories.map((k)=>currentMap[k] || 0);
    const dataAnterior = categories.map((k)=>prevMap[k] || 0);
    const options = {
        chart: {
            type: 'radar',
            height: 620,
            dropShadow: {
                enabled: true,
                blur: 1,
                left: 1,
                top: 1
            },
            toolbar: {
                show: false
            }
        },
        series: [
            {
                name: labelAnterior,
                data: dataAnterior
            },
            {
                name: labelActual,
                data: dataActual
            }
        ],
        labels: categories,
        xaxis: {
            labels: {
                show: true,
                style: {
                    fontWeight: 600,
                    fontSize: '13px',
                    colors: '#333'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    fontWeight: 400,
                    fontSize: '11px',
                    colors: '#888'
                }
            }
        },
        stroke: {
            width: 2,
            colors: [
                '#FBBF24',
                '#60A5FA'
            ]
        },
        fill: {
            opacity: 0.15
        },
        markers: {
            size: 0
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '14px',
            markers: {
                width: 12,
                height: 12,
                radius: 2
            }
        },
        colors: [
            '#FBBF2480',
            '#60A5FA80'
        ]
    };
    if (window.compareRadarChart) try {
        window.compareRadarChart.destroy();
        console.log("[COMPARE] \uD83E\uDDE8 Radar chart anterior destruido");
    } catch (err) {
        console.warn('[COMPARE] Error al destruir radar chart previo:', err);
    }
    window.compareRadarChart = new ApexCharts(document.querySelector('#compareRadarChart'), options);
    window.compareRadarChart.render();
    console.log("[COMPARE] \uD83D\uDD78\uFE0F Radar chart de comparaci\xf3n renderizado");
}
// ───── Utilidad para formatear "2025-07" como "julio 2025" ─────
function formatMonthLabel(key) {
    const [y, m] = key.split('-');
    const date = new Date(`${y}-${m || '01'}-01`);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long'
    });
}

},{"./analysis.js":"l1WLd","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}]},["2n8kV","l1WLd"], "l1WLd", "parcelRequire94c2")

//# sourceMappingURL=analysis.d262e0ca.js.map
