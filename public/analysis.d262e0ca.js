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
var _generalJs = require("./general.js");
var _growthJs = require("./growth.js");
let userUid = null;
let selectedPeriod = localStorage.getItem('selectedPeriod') || 'month';
console.log('[ANALYSIS] Archivo analysis.js cargado');
// ───── Función utilitaria: render si visible ─────
function whenVisible(el, callback) {
    if (!el) return console.warn('[Observer] Elemento no encontrado');
    const observer = new IntersectionObserver((entries, observer)=>{
        entries.forEach((entry)=>{
            if (entry.isIntersecting) {
                console.log("[Observer] Panel visible \u2192 ejecutando callback");
                callback();
                observer.disconnect();
            }
        });
    });
    observer.observe(el);
}
// ───── Inicio DOM ─────
document.addEventListener('DOMContentLoaded', ()=>{
    const sidebar = document.getElementById('sidebar');
    document.getElementById('open-sidebar').addEventListener('click', ()=>sidebar.classList.add('open'));
    document.getElementById('close-sidebar').addEventListener('click', ()=>sidebar.classList.remove('open'));
    document.getElementById('logout-link').addEventListener('click', async (e)=>{
        e.preventDefault();
        await (0, _auth.signOut)((0, _firebaseJs.auth));
        window.location.href = '../index.html';
    });
    // Cambio de periodo en pestaña General
    document.getElementById('period-select').addEventListener('change', (e)=>{
        selectedPeriod = e.target.value;
        localStorage.setItem('selectedPeriod', selectedPeriod);
        if (userUid) (0, _generalJs.loadGeneral)(userUid, selectedPeriod);
    });
    // Pestañas
    document.querySelectorAll('.filter-btn').forEach((btn)=>{
        btn.addEventListener('click', async ()=>{
            document.querySelectorAll('.filter-btn').forEach((b)=>b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach((p)=>p.classList.remove('active'));
            btn.classList.add('active');
            const selected = btn.dataset.filter;
            const panel = document.getElementById(`panel-${selected}`);
            panel.classList.add('active');
            const periodSelect = document.getElementById('period-select');
            periodSelect.style.display = selected === 'overview' ? 'block' : 'none';
            if (!userUid) return;
            switch(selected){
                case 'overview':
                    destroyGrowthCharts();
                    await (0, _generalJs.loadGeneral)(userUid, selectedPeriod);
                    break;
                case 'growth':
                    destroyGeneralCharts();
                    await (0, _growthJs.loadGrowth)();
                    // render diferido de las gráficas si visibles
                    whenVisible(document.getElementById('panel-growth'), ()=>{
                        console.log("[Observer] panel-growth visible \u2192 render gr\xe1ficos crecimiento");
                        try {
                            window.growthChart?.render();
                            window.categoryTrendChart?.render();
                        } catch (e) {
                            console.warn("[Observer] Error al renderizar gr\xe1ficos crecimiento:", e);
                        }
                    });
                    break;
                case 'compare':
                    break;
            }
        });
    });
    // Autenticación
    (0, _auth.onAuthStateChanged)((0, _firebaseJs.auth), async (user)=>{
        if (user) {
            userUid = user.uid;
            console.log('[ANALYSIS] Usuario autenticado:', userUid);
            const savedPeriod = localStorage.getItem('selectedPeriod') || 'month';
            document.getElementById('period-select').value = savedPeriod;
            selectedPeriod = savedPeriod;
            // Activar pestaña por defecto
            document.querySelector('.filter-btn[data-filter="overview"]').click();
        } else window.location.href = '../index.html';
    });
});
// ───── Funciones de limpieza ─────
function destroyGeneralCharts() {
    try {
        window.trendChart?.destroy();
        window.barChart?.destroy();
        window.pieChart?.destroy();
        window.trendChart = null;
        window.barChart = null;
        window.pieChart = null;
        console.log("[CLEAN] Gr\xe1ficas generales destruidas");
    } catch (e) {
        console.warn("[CLEAN] Error al destruir gr\xe1ficas generales:", e);
    }
}
function destroyGrowthCharts() {
    try {
        window.growthChart?.destroy();
        window.categoryTrendChart?.destroy();
        window.growthChart = null;
        window.categoryTrendChart = null;
        console.log("[CLEAN] Gr\xe1ficas de crecimiento destruidas");
    } catch (e) {
        console.warn("[CLEAN] Error al destruir gr\xe1ficas de crecimiento:", e);
    }
}

},{"./firebase.js":"24zHi","firebase/auth":"4ZBbi","./general.js":"lGg7R","./growth.js":"4z1LS"}],"lGg7R":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "loadGeneral", ()=>loadGeneral);
var _firebaseJs = require("./firebase.js");
var _firestore = require("firebase/firestore");
var _auth = require("firebase/auth");
console.log('[ANALYSIS] Archivo analysis.js cargado');
const db = (0, _firestore.getFirestore)((0, _firebaseJs.app));
let trendChart, barChart, pieChart;
let userId = null;
let selectedPeriod = 'month';
const monthsSet = new Set();
let unsubscribeFns = [];
const catByMonth = new Map();
const daysOfCurrentWeek = new Map();
const subscribedWeeks = new Set();
let lastRevenue = [];
let lastSpend = [];
let lastCatMapStr = '';
let summaryByMonth = new Map();
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
document.addEventListener('DOMContentLoaded', ()=>{
    console.log('[ANALYSIS] DOM cargado');
    const sidebar = document.getElementById('sidebar');
    document.querySelectorAll('.filter-btn').forEach((btn)=>{
        btn.addEventListener('click', ()=>{
            document.querySelector('.filter-btn.active')?.classList.remove('active');
            btn.classList.add('active');
        });
    });
    document.getElementById('period-select').addEventListener('change', (e)=>{
        selectedPeriod = e.target.value;
        localStorage.setItem('selectedPeriod', selectedPeriod);
        console.log('[ANALYSIS] Periodo seleccionado cambiado a:', selectedPeriod);
        if (userId) applyPeriodFilter(userId, selectedPeriod);
    });
    (0, _auth.onAuthStateChanged)((0, _firebaseJs.auth), async (user)=>{
        if (user) {
            userId = user.uid;
            console.log('[ANALYSIS] Usuario autenticado:', userId);
            const savedPeriod = localStorage.getItem('selectedPeriod') || 'month';
            document.getElementById('period-select').value = savedPeriod;
            selectedPeriod = savedPeriod;
            console.log('[ANALYSIS] Periodo restaurado desde localStorage:', selectedPeriod);
            reactiveAnalysis(userId);
            setTimeout(()=>applyPeriodFilter(userId, selectedPeriod), 200);
        } else {
            console.log('[ANALYSIS] Usuario no autenticado. Redirigiendo...');
            window.location.href = '../index.html';
        }
    });
});
async function reactiveAnalysis(userId) {
    console.log('[ANALYSIS] Iniciando suscripciones reactivas para usuario:', userId);
    const histRef = (0, _firestore.collection)(db, 'users', userId, 'history');
    const sumRef = (0, _firestore.collection)(db, 'users', userId, 'historySummary');
    initCharts();
    let sourcesReady = {
        history: false,
        summary: false
    };
    return new Promise((resolve)=>{
        const checkIfReadyToRender = ()=>{
            if (sourcesReady.history && sourcesReady.summary) {
                console.log('[ANALYSIS] Datos cargados. Aplicando filtro de periodo...');
                applyPeriodFilter(userId, selectedPeriod);
                resolve(); // <- Ahora sí podemos continuar
            }
        };
        const updateSubscriptionsFromSnapshot = (type, snap)=>{
            const newMonths = new Set();
            if (type === 'summary') summaryByMonth.clear();
            snap.docs.forEach((doc)=>{
                newMonths.add(doc.id);
                if (type === 'summary') summaryByMonth.set(doc.id, doc.data());
            });
            newMonths.forEach((m)=>monthsSet.add(m));
            sourcesReady[type] = true;
            checkIfReadyToRender();
        };
        (0, _firestore.onSnapshot)(histRef, (snap)=>{
            console.log('[ANALYSIS] Snapshot recibido para history:', snap.docs.length);
            updateSubscriptionsFromSnapshot('history', snap);
        });
        (0, _firestore.onSnapshot)(sumRef, (snap)=>{
            console.log('[ANALYSIS] Snapshot recibido para summary:', snap.docs.length);
            updateSubscriptionsFromSnapshot('summary', snap);
        });
    });
}
function applyPeriodFilter(userId, period) {
    console.log('[ANALYSIS] Aplicando filtro para periodo:', period);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}-${month}`;
    let monthsToSubscribe = [];
    if (period === 'week' || period === 'month') monthsToSubscribe = Array.from(monthsSet).filter((m)=>m.startsWith(prefix));
    else if (period === 'year') monthsToSubscribe = Array.from(monthsSet).filter((m)=>m.startsWith(`${year}-`));
    console.log('[ANALYSIS] Meses a suscribirse:', monthsToSubscribe);
    refreshSubscriptions(monthsToSubscribe, userId);
}
function refreshSubscriptions(months, userId) {
    console.log('[ANALYSIS] Refrescando suscripciones...');
    clearPreviousSubscriptions();
    months.forEach((mon)=>{
        subscribeToMonth(mon, userId);
        if (selectedPeriod === 'month' || selectedPeriod === 'week') for(let i = 1; i <= 5; i++){
            const weekId = `S${i}`;
            const daysRef = (0, _firestore.collection)(db, 'users', userId, 'historySummary', mon, 'weeks', weekId, 'days');
            const unsubDays = (0, _firestore.onSnapshot)(daysRef, (snap)=>{
                console.log(`[ANALYSIS] Snapshot d\xedas para ${mon}/weeks/${weekId}:`, snap.docs.length);
                for (const doc of snap.docs){
                    const fullKey = `${mon}/weeks/${weekId}/${doc.id}`; // clave única por día
                    daysOfCurrentWeek.set(fullKey, doc.data());
                }
                renderAnalysis();
            });
            unsubscribeFns.push(unsubDays);
        }
    });
}
function clearPreviousSubscriptions() {
    console.log('[ANALYSIS] Limpiando suscripciones anteriores');
    unsubscribeFns.forEach((unsub)=>unsub());
    unsubscribeFns = [];
    subscribedWeeks.clear();
}
function subscribeToMonth(mon, userId) {
    console.log("[ANALYSIS] Subscribiendo a mes (solo categor\xedas):", mon);
    // Categorías (sí se mantiene)
    const catDocRef = (0, _firestore.doc)(db, 'users', userId, 'historyCategorias', mon);
    const unsubCat = (0, _firestore.onSnapshot)(catDocRef, (snap)=>{
        console.log("[ANALYSIS] Snapshot categor\xedas:", mon, snap.exists());
        if (snap.exists()) {
            const data = snap.data();
            delete data.updatedAt;
            catByMonth.set(mon, data);
        }
        renderAnalysis(); // se renderiza siempre
    });
    unsubscribeFns.push(unsubCat);
}
function renderAnalysis() {
    console.log("[ANALYSIS] Renderizando an\xe1lisis...");
    if ((selectedPeriod === 'month' || selectedPeriod === 'week') && daysOfCurrentWeek.size === 0) {
        console.log('[ANALYSIS] No hay datos diarios disponibles');
        return;
    }
    let xLabels = [], revenue = [], spend = [], netIncome = [];
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
            const weekIdx = semanas.indexOf(parts[2]);
            if (weekIdx === -1) continue;
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
            const dateStr = key.split('/').at(-1);
            const date = new Date(dateStr);
            const idx = (date.getDay() + 6) % 7;
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
        xLabels = months.map((m)=>m.split('-')[1]);
        revenue = months.map((m)=>summaryByMonth.get(m)?.totalIncomes || 0);
        spend = months.map((m)=>summaryByMonth.get(m)?.totalExpenses || 0);
    }
    if (selectedPeriod !== 'week' && arraysEqual(revenue, lastRevenue) && arraysEqual(spend, lastSpend)) {
        console.log('[ANALYSIS] No hay cambios en ingresos/gastos. Render omitido.');
        return;
    }
    netIncome = revenue.map((r, i)=>r - spend[i]);
    const totalRev = revenue.reduce((a, b)=>a + b, 0);
    const totalSpd = spend.reduce((a, b)=>a + b, 0);
    document.getElementById('kpi-revenue').textContent = `\u{20AC}${totalRev.toFixed(2)}`;
    document.getElementById('kpi-spend').textContent = `\u{20AC}${totalSpd.toFixed(2)}`;
    // ───── Cálculo del cambio porcentual según el periodo ─────
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
            startCurrentWeek.setDate(baseDate.getDate() - (weekday + 6) % 7);
            const startPrevWeek = new Date(startCurrentWeek);
            startPrevWeek.setDate(startPrevWeek.getDate() - 7);
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
    document.getElementById('kpi-revenue-change').textContent = `${revChange >= 0 ? '+' : ''}${revChange.toFixed(1)}% vs periodo anterior`;
    document.getElementById('kpi-spend-change').textContent = `${spdChange >= 0 ? '+' : ''}${spdChange.toFixed(1)}% vs periodo anterior`;
    console.log("[ANALYSIS] KPI actualizados. Redibujando gr\xe1ficas...");
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
    lastRevenue = [
        ...revenue
    ];
    lastSpend = [
        ...spend
    ];
    renderPieChartForCurrentPeriod();
}
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for(let i = 0; i < a.length; i++)if (Math.abs(a[i] - b[i]) > 0.0001) return false;
    return true;
}
function initCharts() {
    console.log("[ANALYSIS] Inicializando gr\xe1ficos");
    trendChart = new ApexCharts(document.querySelector('#trendChart'), {
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
                        }
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
    pieChart = new ApexCharts(document.querySelector('#pieChart'), {
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
// ───── Seguimiento de estado por periodo para evitar renders duplicados ─────
const lastCatMapByPeriod = {
    week: '',
    month: '',
    year: ''
};
// ─────────────────────────────────────────────────────────────────────────────
// Devuelve la semana del mes actual ('S1' a 'S5') según el día del mes
// ─────────────────────────────────────────────────────────────────────────────
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
        // ✅ Leer directamente el doc mensual
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
    pieChart.render().then(()=>{
        console.log("[PieChart] Gr\xe1fico renderizado correctamente");
    }).catch((err)=>{
        console.error("[PieChart] Error al renderizar gr\xe1fico:", err);
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
    console.log('[GENERAL] Iniciando con periodo:', selectedPeriod);
    const period = selectedPeriod;
    reactiveAnalysis(userId, period).then(()=>{
        const overviewPanel = document.getElementById('panel-overview');
        whenVisible(overviewPanel, ()=>{
            console.log("[Observer] panel-overview visible \u2192 initCharts + renderAnalysis");
            initCharts();
            renderAnalysis();
        });
    });
}

},{"./firebase.js":"24zHi","firebase/firestore":"3RBs1","firebase/auth":"4ZBbi","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"4z1LS":[function(require,module,exports,__globalThis) {
// growth.js – Pestaña de Crecimiento
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "loadGrowth", ()=>loadGrowth);
var _firestore = require("firebase/firestore");
var _idb = require("idb");
var _firebaseJs = require("./firebase.js");
console.log("[GROWTH] M\xf3dulo growth.js cargado");
const db = (0, _firestore.getFirestore)((0, _firebaseJs.app));
const DB_NAME = 'growth-cache';
const DB_VERSION = 1;
const STORE_SUMMARY = 'historySummary';
const STORE_CATEGORIAS = 'historyCategorias';
async function loadGrowth() {
    console.log('[GROWTH] Iniciando carga de datos para crecimiento');
    const months = getLast12Months();
    const summaryData = [];
    const categoryData = new Map();
    const isOnline = navigator.onLine;
    const dbLocal = await (0, _idb.openDB)(DB_NAME, DB_VERSION, {
        upgrade (db) {
            if (!db.objectStoreNames.contains(STORE_SUMMARY)) db.createObjectStore(STORE_SUMMARY);
            if (!db.objectStoreNames.contains(STORE_CATEGORIAS)) db.createObjectStore(STORE_CATEGORIAS);
        }
    });
    for (const month of months){
        console.log(`[GROWTH] Procesando mes ${month} (${isOnline ? 'online' : 'offline'})`);
        if (isOnline) try {
            const docRef = (0, _firestore.doc)(db, `historySummary/${month}`);
            const snap = await (0, _firestore.getDocs)((0, _firestore.collection)(docRef, 'weeks'));
            let ingresos = 0;
            let gastos = 0;
            snap.forEach((doc)=>{
                ingresos += doc.data().totalIncomes || 0;
                gastos += doc.data().totalExpenses || 0;
            });
            summaryData.push({
                month,
                ingresos,
                gastos
            });
            await dbLocal.put(STORE_SUMMARY, {
                ingresos,
                gastos
            }, month);
            const catDoc = (0, _firestore.doc)(db, `historyCategorias/${month}`);
            const catSnap = await (0, _firestore.getDocs)((0, _firestore.collection)(catDoc, 'weeks'));
            const groupTotals = {};
            catSnap.forEach((semana)=>{
                const datos = semana.data().totals || {};
                for (const [group, value] of Object.entries(datos))groupTotals[group] = (groupTotals[group] || 0) + value;
            });
            categoryData.set(month, groupTotals);
            await dbLocal.put(STORE_CATEGORIAS, groupTotals, month);
        } catch (e) {
            console.error('[GROWTH] Error durante fetch online para', month, e);
        }
        else {
            const resumen = await dbLocal.get(STORE_SUMMARY, month);
            const categorias = await dbLocal.get(STORE_CATEGORIAS, month);
            summaryData.push({
                month,
                ingresos: resumen?.ingresos || 0,
                gastos: resumen?.gastos || 0
            });
            categoryData.set(month, categorias || {});
        }
    }
    console.log("[GROWTH] Datos cargados, generando KPIs y gr\xe1ficas");
    renderGrowthKPIs(summaryData);
    renderGrowthChart(summaryData);
    renderCategoryTrendChart(months, categoryData);
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
            height: 300
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
            categories
        },
        stroke: {
            curve: 'smooth'
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
        ]
    };
    try {
        if (window.growthChart) window.growthChart.destroy();
        window.growthChart = new ApexCharts(document.querySelector('#growthChart'), options);
        window.growthChart.render();
        console.log("[GROWTH] Gr\xe1fico principal renderizado");
    } catch (e) {
        console.error('[GROWTH] Error al renderizar growthChart:', e);
    }
}
function renderCategoryTrendChart(months, categoryData) {
    const allGroups = new Set();
    months.forEach((m)=>{
        const data = categoryData.get(m);
        if (data) Object.keys(data).forEach((g)=>allGroups.add(g));
    });
    const series = Array.from(allGroups).map((group)=>({
            name: group,
            data: months.map((m)=>categoryData.get(m)?.[group] || 0)
        }));
    const options = {
        chart: {
            type: 'area',
            height: 300,
            stacked: true
        },
        series,
        xaxis: {
            categories: months
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        }
    };
    try {
        if (window.categoryTrendChart) window.categoryTrendChart.destroy();
        window.categoryTrendChart = new ApexCharts(document.querySelector('#categoryTrendChart'), options);
        window.categoryTrendChart.render();
        console.log("[GROWTH] Gr\xe1fico de categor\xedas renderizado");
    } catch (e) {
        console.error('[GROWTH] Error al renderizar categoryTrendChart:', e);
    }
}

},{"firebase/firestore":"3RBs1","idb":"258QC","./firebase.js":"24zHi","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"258QC":[function(require,module,exports,__globalThis) {
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

},{"@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}]},["2n8kV","l1WLd"], "l1WLd", "parcelRequire94c2")

//# sourceMappingURL=analysis.d262e0ca.js.map
