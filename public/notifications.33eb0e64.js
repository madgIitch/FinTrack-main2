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
})({"anQhF":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SERVER_PORT = 1234;
var HMR_SECURE = false;
var HMR_ENV_HASH = "439701173a9199ea";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "e47ce6d833eb0e64";
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

},{}],"cgraJ":[function(require,module,exports,__globalThis) {
// ───── Archivo: js/notifications.js ─────
var _firebaseJs = require("./firebase.js");
var _firestore = require("firebase/firestore");
var _storage = require("firebase/storage");
const db = (0, _firestore.getFirestore)((0, _firebaseJs.app));
const storage = (0, _storage.getStorage)((0, _firebaseJs.app));
document.addEventListener('DOMContentLoaded', ()=>{
    const notifList = document.querySelector('.notifications-list');
    const tabButtons = document.querySelectorAll('.tab-button');
    const backBtn = document.getElementById('back-button');
    if (backBtn) backBtn.addEventListener('click', ()=>{
        window.location.href = '/pages/home.html';
    });
    let allNotifications = [];
    (0, _firebaseJs.auth).onAuthStateChanged(async (user)=>{
        if (!user) {
            console.warn('[NOTIFICATIONS] Usuario no autenticado');
            return;
        }
        try {
            // ───── Obtener notificaciones desde Firestore ─────
            const notifRef = (0, _firestore.collection)(db, `users/${user.uid}/notifications`);
            const q = (0, _firestore.query)(notifRef, (0, _firestore.orderBy)('data.timestamp', 'desc'));
            const snapshot = await (0, _firestore.getDocs)(q);
            allNotifications = snapshot.docs.map((doc)=>doc.data());
            // ───── Añadir informes históricos desde Storage si no están en Firestore ─────
            const reportsFolderRef = (0, _storage.ref)(storage, `users/${user.uid}/reports`);
            const reportList = await (0, _storage.listAll)(reportsFolderRef);
            const existingPeriods = new Set(allNotifications.filter((n)=>n.type === 'report' && n.data?.period).map((n)=>n.data.period));
            for (const itemRef of reportList.items){
                const match = itemRef.name.match(/^(\d{4}-\d{2})\.pdf$/);
                if (!match) continue;
                const period = match[1];
                if (existingPeriods.has(period)) continue;
                const url = await (0, _storage.getDownloadURL)(itemRef);
                allNotifications.push({
                    title: "\uD83D\uDCCE Informe financiero disponible",
                    body: `Informe correspondiente a ${period}.`,
                    type: 'report',
                    data: {
                        period,
                        url,
                        timestamp: {
                            toDate: ()=>new Date()
                        } // Marca actual como fecha
                    }
                });
            }
            renderNotifications('all');
        } catch (err) {
            console.error('[NOTIFICATIONS] Error cargando notificaciones:', err);
            notifList.innerHTML = '<p style="text-align:center; margin-top: 2rem; color: #777;">Error cargando notificaciones.</p>';
        }
    });
    // ───── Manejo de pestañas ─────
    tabButtons.forEach((btn)=>{
        btn.addEventListener('click', ()=>{
            document.querySelector('.tab-button.active')?.classList.remove('active');
            btn.classList.add('active');
            renderNotifications(btn.dataset.type);
        });
    });
    // ───── Renderizado de notificaciones por tipo ─────
    function renderNotifications(typeFilter) {
        notifList.innerHTML = '';
        const filtered = allNotifications.filter((n)=>typeFilter === 'all' || n.type === typeFilter);
        if (filtered.length === 0) {
            notifList.innerHTML = '<p style="text-align:center; margin-top: 2rem; color: #777;">No hay elementos en esta categor\xeda.</p>';
            return;
        }
        filtered.forEach((n)=>{
            const li = document.createElement('li');
            li.className = `notification-card ${n.type}`;
            const icon = n.type === 'alert' ? 'warning' : 'insert_drive_file';
            const time = n.data?.timestamp?.toDate?.().toLocaleString?.('es-ES') || '';
            li.innerHTML = `
        <span class="material-icons notification-icon">${icon}</span>
        <div class="notification-content">
          <h2 class="notification-title">${n.title}</h2>
          <p class="notification-body">${n.body}</p>
          <time class="notification-time" style="font-size: 0.85rem; color: #888; margin-top: 6px; display: block;">
            ${time}
          </time>
        </div>
      `;
            if (n.type === 'report' && n.data?.url) {
                li.style.cursor = 'pointer';
                li.addEventListener('click', ()=>window.open(n.data.url, '_blank'));
            }
            notifList.appendChild(li);
        });
    }
});

},{"./firebase.js":"24zHi","firebase/firestore":"3RBs1","firebase/storage":"kEoU9"}],"kEoU9":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _storage = require("@firebase/storage");
parcelHelpers.exportAll(_storage, exports);

},{"@firebase/storage":"81XWJ","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"81XWJ":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "StorageError", ()=>StorageError);
parcelHelpers.export(exports, "StorageErrorCode", ()=>StorageErrorCode);
parcelHelpers.export(exports, "StringFormat", ()=>StringFormat);
parcelHelpers.export(exports, "_FbsBlob", ()=>FbsBlob);
parcelHelpers.export(exports, "_Location", ()=>Location);
parcelHelpers.export(exports, "_TaskEvent", ()=>TaskEvent);
parcelHelpers.export(exports, "_TaskState", ()=>TaskState);
parcelHelpers.export(exports, "_UploadTask", ()=>UploadTask);
parcelHelpers.export(exports, "_dataFromString", ()=>dataFromString);
parcelHelpers.export(exports, "_getChild", ()=>_getChild);
parcelHelpers.export(exports, "_invalidArgument", ()=>invalidArgument);
parcelHelpers.export(exports, "_invalidRootOperation", ()=>invalidRootOperation);
parcelHelpers.export(exports, "connectStorageEmulator", ()=>connectStorageEmulator);
parcelHelpers.export(exports, "deleteObject", ()=>deleteObject);
parcelHelpers.export(exports, "getBlob", ()=>getBlob);
parcelHelpers.export(exports, "getBytes", ()=>getBytes);
parcelHelpers.export(exports, "getDownloadURL", ()=>getDownloadURL);
parcelHelpers.export(exports, "getMetadata", ()=>getMetadata);
parcelHelpers.export(exports, "getStorage", ()=>getStorage);
parcelHelpers.export(exports, "getStream", ()=>getStream);
parcelHelpers.export(exports, "list", ()=>list);
parcelHelpers.export(exports, "listAll", ()=>listAll);
parcelHelpers.export(exports, "ref", ()=>ref);
parcelHelpers.export(exports, "updateMetadata", ()=>updateMetadata);
parcelHelpers.export(exports, "uploadBytes", ()=>uploadBytes);
parcelHelpers.export(exports, "uploadBytesResumable", ()=>uploadBytesResumable);
parcelHelpers.export(exports, "uploadString", ()=>uploadString);
var _app = require("@firebase/app");
var _util = require("@firebase/util");
var _component = require("@firebase/component");
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * @fileoverview Constants used in the Firebase Storage library.
 */ /**
 * Domain name for firebase storage.
 */ const DEFAULT_HOST = 'firebasestorage.googleapis.com';
/**
 * The key in Firebase config json for the storage bucket.
 */ const CONFIG_STORAGE_BUCKET_KEY = 'storageBucket';
/**
 * 2 minutes
 *
 * The timeout for all operations except upload.
 */ const DEFAULT_MAX_OPERATION_RETRY_TIME = 120000;
/**
 * 10 minutes
 *
 * The timeout for upload.
 */ const DEFAULT_MAX_UPLOAD_RETRY_TIME = 600000;
/**
 * 1 second
 */ const DEFAULT_MIN_SLEEP_TIME_MILLIS = 1000;
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * An error returned by the Firebase Storage SDK.
 * @public
 */ class StorageError extends (0, _util.FirebaseError) {
    /**
     * @param code - A `StorageErrorCode` string to be prefixed with 'storage/' and
     *  added to the end of the message.
     * @param message  - Error message.
     * @param status_ - Corresponding HTTP Status Code
     */ constructor(code, message, status_ = 0){
        super(prependCode(code), `Firebase Storage: ${message} (${prependCode(code)})`);
        this.status_ = status_;
        /**
         * Stores custom error data unique to the `StorageError`.
         */ this.customData = {
            serverResponse: null
        };
        this._baseMessage = this.message;
        // Without this, `instanceof StorageError`, in tests for example,
        // returns false.
        Object.setPrototypeOf(this, StorageError.prototype);
    }
    get status() {
        return this.status_;
    }
    set status(status) {
        this.status_ = status;
    }
    /**
     * Compares a `StorageErrorCode` against this error's code, filtering out the prefix.
     */ _codeEquals(code) {
        return prependCode(code) === this.code;
    }
    /**
     * Optional response message that was added by the server.
     */ get serverResponse() {
        return this.customData.serverResponse;
    }
    set serverResponse(serverResponse) {
        this.customData.serverResponse = serverResponse;
        if (this.customData.serverResponse) this.message = `${this._baseMessage}\n${this.customData.serverResponse}`;
        else this.message = this._baseMessage;
    }
}
/**
 * @public
 * Error codes that can be attached to `StorageError` objects.
 */ var StorageErrorCode;
(function(StorageErrorCode) {
    // Shared between all platforms
    StorageErrorCode["UNKNOWN"] = "unknown";
    StorageErrorCode["OBJECT_NOT_FOUND"] = "object-not-found";
    StorageErrorCode["BUCKET_NOT_FOUND"] = "bucket-not-found";
    StorageErrorCode["PROJECT_NOT_FOUND"] = "project-not-found";
    StorageErrorCode["QUOTA_EXCEEDED"] = "quota-exceeded";
    StorageErrorCode["UNAUTHENTICATED"] = "unauthenticated";
    StorageErrorCode["UNAUTHORIZED"] = "unauthorized";
    StorageErrorCode["UNAUTHORIZED_APP"] = "unauthorized-app";
    StorageErrorCode["RETRY_LIMIT_EXCEEDED"] = "retry-limit-exceeded";
    StorageErrorCode["INVALID_CHECKSUM"] = "invalid-checksum";
    StorageErrorCode["CANCELED"] = "canceled";
    // JS specific
    StorageErrorCode["INVALID_EVENT_NAME"] = "invalid-event-name";
    StorageErrorCode["INVALID_URL"] = "invalid-url";
    StorageErrorCode["INVALID_DEFAULT_BUCKET"] = "invalid-default-bucket";
    StorageErrorCode["NO_DEFAULT_BUCKET"] = "no-default-bucket";
    StorageErrorCode["CANNOT_SLICE_BLOB"] = "cannot-slice-blob";
    StorageErrorCode["SERVER_FILE_WRONG_SIZE"] = "server-file-wrong-size";
    StorageErrorCode["NO_DOWNLOAD_URL"] = "no-download-url";
    StorageErrorCode["INVALID_ARGUMENT"] = "invalid-argument";
    StorageErrorCode["INVALID_ARGUMENT_COUNT"] = "invalid-argument-count";
    StorageErrorCode["APP_DELETED"] = "app-deleted";
    StorageErrorCode["INVALID_ROOT_OPERATION"] = "invalid-root-operation";
    StorageErrorCode["INVALID_FORMAT"] = "invalid-format";
    StorageErrorCode["INTERNAL_ERROR"] = "internal-error";
    StorageErrorCode["UNSUPPORTED_ENVIRONMENT"] = "unsupported-environment";
})(StorageErrorCode || (StorageErrorCode = {}));
function prependCode(code) {
    return 'storage/' + code;
}
function unknown() {
    const message = "An unknown error occurred, please check the error payload for server response.";
    return new StorageError(StorageErrorCode.UNKNOWN, message);
}
function objectNotFound(path) {
    return new StorageError(StorageErrorCode.OBJECT_NOT_FOUND, "Object '" + path + "' does not exist.");
}
function quotaExceeded(bucket) {
    return new StorageError(StorageErrorCode.QUOTA_EXCEEDED, "Quota for bucket '" + bucket + "' exceeded, please view quota on " + 'https://firebase.google.com/pricing/.');
}
function unauthenticated() {
    const message = "User is not authenticated, please authenticate using Firebase Authentication and try again.";
    return new StorageError(StorageErrorCode.UNAUTHENTICATED, message);
}
function unauthorizedApp() {
    return new StorageError(StorageErrorCode.UNAUTHORIZED_APP, 'This app does not have permission to access Firebase Storage on this project.');
}
function unauthorized(path) {
    return new StorageError(StorageErrorCode.UNAUTHORIZED, "User does not have permission to access '" + path + "'.");
}
function retryLimitExceeded() {
    return new StorageError(StorageErrorCode.RETRY_LIMIT_EXCEEDED, 'Max retry time for operation exceeded, please try again.');
}
function canceled() {
    return new StorageError(StorageErrorCode.CANCELED, 'User canceled the upload/download.');
}
function invalidUrl(url) {
    return new StorageError(StorageErrorCode.INVALID_URL, "Invalid URL '" + url + "'.");
}
function invalidDefaultBucket(bucket) {
    return new StorageError(StorageErrorCode.INVALID_DEFAULT_BUCKET, "Invalid default bucket '" + bucket + "'.");
}
function noDefaultBucket() {
    return new StorageError(StorageErrorCode.NO_DEFAULT_BUCKET, "No default bucket found. Did you set the '" + CONFIG_STORAGE_BUCKET_KEY + "' property when initializing the app?");
}
function cannotSliceBlob() {
    return new StorageError(StorageErrorCode.CANNOT_SLICE_BLOB, 'Cannot slice blob for upload. Please retry the upload.');
}
function serverFileWrongSize() {
    return new StorageError(StorageErrorCode.SERVER_FILE_WRONG_SIZE, 'Server recorded incorrect upload file size, please retry the upload.');
}
function noDownloadURL() {
    return new StorageError(StorageErrorCode.NO_DOWNLOAD_URL, 'The given file does not have any download URLs.');
}
function missingPolyFill(polyFill) {
    return new StorageError(StorageErrorCode.UNSUPPORTED_ENVIRONMENT, `${polyFill} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`);
}
/**
 * @internal
 */ function invalidArgument(message) {
    return new StorageError(StorageErrorCode.INVALID_ARGUMENT, message);
}
function appDeleted() {
    return new StorageError(StorageErrorCode.APP_DELETED, 'The Firebase app was deleted.');
}
/**
 * @param name - The name of the operation that was invalid.
 *
 * @internal
 */ function invalidRootOperation(name) {
    return new StorageError(StorageErrorCode.INVALID_ROOT_OPERATION, "The operation '" + name + "' cannot be performed on a root reference, create a non-root " + "reference using child, such as .child('file.png').");
}
/**
 * @param format - The format that was not valid.
 * @param message - A message describing the format violation.
 */ function invalidFormat(format, message) {
    return new StorageError(StorageErrorCode.INVALID_FORMAT, "String does not match format '" + format + "': " + message);
}
/**
 * @param message - A message describing the internal error.
 */ function internalError(message) {
    throw new StorageError(StorageErrorCode.INTERNAL_ERROR, 'Internal error: ' + message);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Firebase Storage location data.
 *
 * @internal
 */ class Location {
    constructor(bucket, path){
        this.bucket = bucket;
        this.path_ = path;
    }
    get path() {
        return this.path_;
    }
    get isRoot() {
        return this.path.length === 0;
    }
    fullServerUrl() {
        const encode = encodeURIComponent;
        return '/b/' + encode(this.bucket) + '/o/' + encode(this.path);
    }
    bucketOnlyServerUrl() {
        const encode = encodeURIComponent;
        return '/b/' + encode(this.bucket) + '/o';
    }
    static makeFromBucketSpec(bucketString, host) {
        let bucketLocation;
        try {
            bucketLocation = Location.makeFromUrl(bucketString, host);
        } catch (e) {
            // Not valid URL, use as-is. This lets you put bare bucket names in
            // config.
            return new Location(bucketString, '');
        }
        if (bucketLocation.path === '') return bucketLocation;
        else throw invalidDefaultBucket(bucketString);
    }
    static makeFromUrl(url, host) {
        let location = null;
        const bucketDomain = '([A-Za-z0-9.\\-_]+)';
        function gsModify(loc) {
            if (loc.path.charAt(loc.path.length - 1) === '/') loc.path_ = loc.path_.slice(0, -1);
        }
        const gsPath = '(/(.*))?$';
        const gsRegex = new RegExp('^gs://' + bucketDomain + gsPath, 'i');
        const gsIndices = {
            bucket: 1,
            path: 3
        };
        function httpModify(loc) {
            loc.path_ = decodeURIComponent(loc.path);
        }
        const version = 'v[A-Za-z0-9_]+';
        const firebaseStorageHost = host.replace(/[.]/g, '\\.');
        const firebaseStoragePath = '(/([^?#]*).*)?$';
        const firebaseStorageRegExp = new RegExp(`^https?://${firebaseStorageHost}/${version}/b/${bucketDomain}/o${firebaseStoragePath}`, 'i');
        const firebaseStorageIndices = {
            bucket: 1,
            path: 3
        };
        const cloudStorageHost = host === DEFAULT_HOST ? '(?:storage.googleapis.com|storage.cloud.google.com)' : host;
        const cloudStoragePath = '([^?#]*)';
        const cloudStorageRegExp = new RegExp(`^https?://${cloudStorageHost}/${bucketDomain}/${cloudStoragePath}`, 'i');
        const cloudStorageIndices = {
            bucket: 1,
            path: 2
        };
        const groups = [
            {
                regex: gsRegex,
                indices: gsIndices,
                postModify: gsModify
            },
            {
                regex: firebaseStorageRegExp,
                indices: firebaseStorageIndices,
                postModify: httpModify
            },
            {
                regex: cloudStorageRegExp,
                indices: cloudStorageIndices,
                postModify: httpModify
            }
        ];
        for(let i = 0; i < groups.length; i++){
            const group = groups[i];
            const captures = group.regex.exec(url);
            if (captures) {
                const bucketValue = captures[group.indices.bucket];
                let pathValue = captures[group.indices.path];
                if (!pathValue) pathValue = '';
                location = new Location(bucketValue, pathValue);
                group.postModify(location);
                break;
            }
        }
        if (location == null) throw invalidUrl(url);
        return location;
    }
}
/**
 * A request whose promise always fails.
 */ class FailRequest {
    constructor(error){
        this.promise_ = Promise.reject(error);
    }
    /** @inheritDoc */ getPromise() {
        return this.promise_;
    }
    /** @inheritDoc */ cancel(_appDelete = false) {}
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Accepts a callback for an action to perform (`doRequest`),
 * and then a callback for when the backoff has completed (`backoffCompleteCb`).
 * The callback sent to start requires an argument to call (`onRequestComplete`).
 * When `start` calls `doRequest`, it passes a callback for when the request has
 * completed, `onRequestComplete`. Based on this, the backoff continues, with
 * another call to `doRequest` and the above loop continues until the timeout
 * is hit, or a successful response occurs.
 * @description
 * @param doRequest Callback to perform request
 * @param backoffCompleteCb Callback to call when backoff has been completed
 */ function start(doRequest, // eslint-disable-next-line @typescript-eslint/no-explicit-any
backoffCompleteCb, timeout) {
    // TODO(andysoto): make this code cleaner (probably refactor into an actual
    // type instead of a bunch of functions with state shared in the closure)
    let waitSeconds = 1;
    // Would type this as "number" but that doesn't work for Node so ¯\_(ツ)_/¯
    // TODO: find a way to exclude Node type definition for storage because storage only works in browser
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let retryTimeoutId = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let globalTimeoutId = null;
    let hitTimeout = false;
    let cancelState = 0;
    function canceled() {
        return cancelState === 2;
    }
    let triggeredCallback = false;
    function triggerCallback(...args) {
        if (!triggeredCallback) {
            triggeredCallback = true;
            backoffCompleteCb.apply(null, args);
        }
    }
    function callWithDelay(millis) {
        retryTimeoutId = setTimeout(()=>{
            retryTimeoutId = null;
            doRequest(responseHandler, canceled());
        }, millis);
    }
    function clearGlobalTimeout() {
        if (globalTimeoutId) clearTimeout(globalTimeoutId);
    }
    function responseHandler(success, ...args) {
        if (triggeredCallback) {
            clearGlobalTimeout();
            return;
        }
        if (success) {
            clearGlobalTimeout();
            triggerCallback.call(null, success, ...args);
            return;
        }
        const mustStop = canceled() || hitTimeout;
        if (mustStop) {
            clearGlobalTimeout();
            triggerCallback.call(null, success, ...args);
            return;
        }
        if (waitSeconds < 64) /* TODO(andysoto): don't back off so quickly if we know we're offline. */ waitSeconds *= 2;
        let waitMillis;
        if (cancelState === 1) {
            cancelState = 2;
            waitMillis = 0;
        } else waitMillis = (waitSeconds + Math.random()) * 1000;
        callWithDelay(waitMillis);
    }
    let stopped = false;
    function stop(wasTimeout) {
        if (stopped) return;
        stopped = true;
        clearGlobalTimeout();
        if (triggeredCallback) return;
        if (retryTimeoutId !== null) {
            if (!wasTimeout) cancelState = 2;
            clearTimeout(retryTimeoutId);
            callWithDelay(0);
        } else if (!wasTimeout) cancelState = 1;
    }
    callWithDelay(0);
    globalTimeoutId = setTimeout(()=>{
        hitTimeout = true;
        stop(true);
    }, timeout);
    return stop;
}
/**
 * Stops the retry loop from repeating.
 * If the function is currently "in between" retries, it is invoked immediately
 * with the second parameter as "true". Otherwise, it will be invoked once more
 * after the current invocation finishes iff the current invocation would have
 * triggered another retry.
 */ function stop(id) {
    id(false);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function isJustDef(p) {
    return p !== void 0;
}
// eslint-disable-next-line @typescript-eslint/ban-types
function isFunction(p) {
    return typeof p === 'function';
}
function isNonArrayObject(p) {
    return typeof p === 'object' && !Array.isArray(p);
}
function isString(p) {
    return typeof p === 'string' || p instanceof String;
}
function isNativeBlob(p) {
    return isNativeBlobDefined() && p instanceof Blob;
}
function isNativeBlobDefined() {
    return typeof Blob !== 'undefined';
}
function validateNumber(argument, minValue, maxValue, value) {
    if (value < minValue) throw invalidArgument(`Invalid value for '${argument}'. Expected ${minValue} or greater.`);
    if (value > maxValue) throw invalidArgument(`Invalid value for '${argument}'. Expected ${maxValue} or less.`);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function makeUrl(urlPart, host, protocol) {
    let origin = host;
    if (protocol == null) origin = `https://${host}`;
    return `${protocol}://${origin}/v0${urlPart}`;
}
function makeQueryString(params) {
    const encode = encodeURIComponent;
    let queryPart = '?';
    for(const key in params)if (params.hasOwnProperty(key)) {
        const nextPart = encode(key) + '=' + encode(params[key]);
        queryPart = queryPart + nextPart + '&';
    }
    // Chop off the extra '&' or '?' on the end
    queryPart = queryPart.slice(0, -1);
    return queryPart;
}
/**
 * Error codes for requests made by the XhrIo wrapper.
 */ var ErrorCode;
(function(ErrorCode) {
    ErrorCode[ErrorCode["NO_ERROR"] = 0] = "NO_ERROR";
    ErrorCode[ErrorCode["NETWORK_ERROR"] = 1] = "NETWORK_ERROR";
    ErrorCode[ErrorCode["ABORT"] = 2] = "ABORT";
})(ErrorCode || (ErrorCode = {}));
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Checks the status code to see if the action should be retried.
 *
 * @param status Current HTTP status code returned by server.
 * @param additionalRetryCodes additional retry codes to check against
 */ function isRetryStatusCode(status, additionalRetryCodes) {
    // The codes for which to retry came from this page:
    // https://cloud.google.com/storage/docs/exponential-backoff
    const isFiveHundredCode = status >= 500 && status < 600;
    const extraRetryCodes = [
        // Request Timeout: web server didn't receive full request in time.
        408,
        // Too Many Requests: you're getting rate-limited, basically.
        429
    ];
    const isExtraRetryCode = extraRetryCodes.indexOf(status) !== -1;
    const isAdditionalRetryCode = additionalRetryCodes.indexOf(status) !== -1;
    return isFiveHundredCode || isExtraRetryCode || isAdditionalRetryCode;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Handles network logic for all Storage Requests, including error reporting and
 * retries with backoff.
 *
 * @param I - the type of the backend's network response.
 * @param - O the output type used by the rest of the SDK. The conversion
 * happens in the specified `callback_`.
 */ class NetworkRequest {
    constructor(url_, method_, headers_, body_, successCodes_, additionalRetryCodes_, callback_, errorCallback_, timeout_, progressCallback_, connectionFactory_, retry = true){
        this.url_ = url_;
        this.method_ = method_;
        this.headers_ = headers_;
        this.body_ = body_;
        this.successCodes_ = successCodes_;
        this.additionalRetryCodes_ = additionalRetryCodes_;
        this.callback_ = callback_;
        this.errorCallback_ = errorCallback_;
        this.timeout_ = timeout_;
        this.progressCallback_ = progressCallback_;
        this.connectionFactory_ = connectionFactory_;
        this.retry = retry;
        this.pendingConnection_ = null;
        this.backoffId_ = null;
        this.canceled_ = false;
        this.appDelete_ = false;
        this.promise_ = new Promise((resolve, reject)=>{
            this.resolve_ = resolve;
            this.reject_ = reject;
            this.start_();
        });
    }
    /**
     * Actually starts the retry loop.
     */ start_() {
        const doTheRequest = (backoffCallback, canceled)=>{
            if (canceled) {
                backoffCallback(false, new RequestEndStatus(false, null, true));
                return;
            }
            const connection = this.connectionFactory_();
            this.pendingConnection_ = connection;
            const progressListener = (progressEvent)=>{
                const loaded = progressEvent.loaded;
                const total = progressEvent.lengthComputable ? progressEvent.total : -1;
                if (this.progressCallback_ !== null) this.progressCallback_(loaded, total);
            };
            if (this.progressCallback_ !== null) connection.addUploadProgressListener(progressListener);
            // connection.send() never rejects, so we don't need to have a error handler or use catch on the returned promise.
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            connection.send(this.url_, this.method_, this.body_, this.headers_).then(()=>{
                if (this.progressCallback_ !== null) connection.removeUploadProgressListener(progressListener);
                this.pendingConnection_ = null;
                const hitServer = connection.getErrorCode() === ErrorCode.NO_ERROR;
                const status = connection.getStatus();
                if (!hitServer || isRetryStatusCode(status, this.additionalRetryCodes_) && this.retry) {
                    const wasCanceled = connection.getErrorCode() === ErrorCode.ABORT;
                    backoffCallback(false, new RequestEndStatus(false, null, wasCanceled));
                    return;
                }
                const successCode = this.successCodes_.indexOf(status) !== -1;
                backoffCallback(true, new RequestEndStatus(successCode, connection));
            });
        };
        /**
         * @param requestWentThrough - True if the request eventually went
         *     through, false if it hit the retry limit or was canceled.
         */ const backoffDone = (requestWentThrough, status)=>{
            const resolve = this.resolve_;
            const reject = this.reject_;
            const connection = status.connection;
            if (status.wasSuccessCode) try {
                const result = this.callback_(connection, connection.getResponse());
                if (isJustDef(result)) resolve(result);
                else resolve();
            } catch (e) {
                reject(e);
            }
            else {
                if (connection !== null) {
                    const err = unknown();
                    err.serverResponse = connection.getErrorText();
                    if (this.errorCallback_) reject(this.errorCallback_(connection, err));
                    else reject(err);
                } else if (status.canceled) {
                    const err = this.appDelete_ ? appDeleted() : canceled();
                    reject(err);
                } else {
                    const err = retryLimitExceeded();
                    reject(err);
                }
            }
        };
        if (this.canceled_) backoffDone(false, new RequestEndStatus(false, null, true));
        else this.backoffId_ = start(doTheRequest, backoffDone, this.timeout_);
    }
    /** @inheritDoc */ getPromise() {
        return this.promise_;
    }
    /** @inheritDoc */ cancel(appDelete) {
        this.canceled_ = true;
        this.appDelete_ = appDelete || false;
        if (this.backoffId_ !== null) stop(this.backoffId_);
        if (this.pendingConnection_ !== null) this.pendingConnection_.abort();
    }
}
/**
 * A collection of information about the result of a network request.
 * @param opt_canceled - Defaults to false.
 */ class RequestEndStatus {
    constructor(wasSuccessCode, connection, canceled){
        this.wasSuccessCode = wasSuccessCode;
        this.connection = connection;
        this.canceled = !!canceled;
    }
}
function addAuthHeader_(headers, authToken) {
    if (authToken !== null && authToken.length > 0) headers['Authorization'] = 'Firebase ' + authToken;
}
function addVersionHeader_(headers, firebaseVersion) {
    headers['X-Firebase-Storage-Version'] = 'webjs/' + (firebaseVersion !== null && firebaseVersion !== void 0 ? firebaseVersion : 'AppManager');
}
function addGmpidHeader_(headers, appId) {
    if (appId) headers['X-Firebase-GMPID'] = appId;
}
function addAppCheckHeader_(headers, appCheckToken) {
    if (appCheckToken !== null) headers['X-Firebase-AppCheck'] = appCheckToken;
}
function makeRequest(requestInfo, appId, authToken, appCheckToken, requestFactory, firebaseVersion, retry = true) {
    const queryPart = makeQueryString(requestInfo.urlParams);
    const url = requestInfo.url + queryPart;
    const headers = Object.assign({}, requestInfo.headers);
    addGmpidHeader_(headers, appId);
    addAuthHeader_(headers, authToken);
    addVersionHeader_(headers, firebaseVersion);
    addAppCheckHeader_(headers, appCheckToken);
    return new NetworkRequest(url, requestInfo.method, headers, requestInfo.body, requestInfo.successCodes, requestInfo.additionalRetryCodes, requestInfo.handler, requestInfo.errorHandler, requestInfo.timeout, requestInfo.progressCallback, requestFactory, retry);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function getBlobBuilder() {
    if (typeof BlobBuilder !== 'undefined') return BlobBuilder;
    else if (typeof WebKitBlobBuilder !== 'undefined') return WebKitBlobBuilder;
    else return undefined;
}
/**
 * Concatenates one or more values together and converts them to a Blob.
 *
 * @param args The values that will make up the resulting blob.
 * @return The blob.
 */ function getBlob$1(...args) {
    const BlobBuilder1 = getBlobBuilder();
    if (BlobBuilder1 !== undefined) {
        const bb = new BlobBuilder1();
        for(let i = 0; i < args.length; i++)bb.append(args[i]);
        return bb.getBlob();
    } else {
        if (isNativeBlobDefined()) return new Blob(args);
        else throw new StorageError(StorageErrorCode.UNSUPPORTED_ENVIRONMENT, "This browser doesn't seem to support creating Blobs");
    }
}
/**
 * Slices the blob. The returned blob contains data from the start byte
 * (inclusive) till the end byte (exclusive). Negative indices cannot be used.
 *
 * @param blob The blob to be sliced.
 * @param start Index of the starting byte.
 * @param end Index of the ending byte.
 * @return The blob slice or null if not supported.
 */ function sliceBlob(blob, start, end) {
    if (blob.webkitSlice) return blob.webkitSlice(start, end);
    else if (blob.mozSlice) return blob.mozSlice(start, end);
    else if (blob.slice) return blob.slice(start, end);
    return null;
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /** Converts a Base64 encoded string to a binary string. */ function decodeBase64(encoded) {
    if (typeof atob === 'undefined') throw missingPolyFill('base-64');
    return atob(encoded);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * An enumeration of the possible string formats for upload.
 * @public
 */ const StringFormat = {
    /**
     * Indicates the string should be interpreted "raw", that is, as normal text.
     * The string will be interpreted as UTF-16, then uploaded as a UTF-8 byte
     * sequence.
     * Example: The string 'Hello! \\ud83d\\ude0a' becomes the byte sequence
     * 48 65 6c 6c 6f 21 20 f0 9f 98 8a
     */ RAW: 'raw',
    /**
     * Indicates the string should be interpreted as base64-encoded data.
     * Padding characters (trailing '='s) are optional.
     * Example: The string 'rWmO++E6t7/rlw==' becomes the byte sequence
     * ad 69 8e fb e1 3a b7 bf eb 97
     */ BASE64: 'base64',
    /**
     * Indicates the string should be interpreted as base64url-encoded data.
     * Padding characters (trailing '='s) are optional.
     * Example: The string 'rWmO--E6t7_rlw==' becomes the byte sequence
     * ad 69 8e fb e1 3a b7 bf eb 97
     */ BASE64URL: 'base64url',
    /**
     * Indicates the string is a data URL, such as one obtained from
     * canvas.toDataURL().
     * Example: the string 'data:application/octet-stream;base64,aaaa'
     * becomes the byte sequence
     * 69 a6 9a
     * (the content-type "application/octet-stream" is also applied, but can
     * be overridden in the metadata object).
     */ DATA_URL: 'data_url'
};
class StringData {
    constructor(data, contentType){
        this.data = data;
        this.contentType = contentType || null;
    }
}
/**
 * @internal
 */ function dataFromString(format, stringData) {
    switch(format){
        case StringFormat.RAW:
            return new StringData(utf8Bytes_(stringData));
        case StringFormat.BASE64:
        case StringFormat.BASE64URL:
            return new StringData(base64Bytes_(format, stringData));
        case StringFormat.DATA_URL:
            return new StringData(dataURLBytes_(stringData), dataURLContentType_(stringData));
    }
    // assert(false);
    throw unknown();
}
function utf8Bytes_(value) {
    const b = [];
    for(let i = 0; i < value.length; i++){
        let c = value.charCodeAt(i);
        if (c <= 127) b.push(c);
        else if (c <= 2047) b.push(192 | c >> 6, 128 | c & 63);
        else {
            if ((c & 64512) === 55296) {
                // The start of a surrogate pair.
                const valid = i < value.length - 1 && (value.charCodeAt(i + 1) & 64512) === 56320;
                if (!valid) // The second surrogate wasn't there.
                b.push(239, 191, 189);
                else {
                    const hi = c;
                    const lo = value.charCodeAt(++i);
                    c = 65536 | (hi & 1023) << 10 | lo & 1023;
                    b.push(240 | c >> 18, 128 | c >> 12 & 63, 128 | c >> 6 & 63, 128 | c & 63);
                }
            } else if ((c & 64512) === 56320) // Invalid low surrogate.
            b.push(239, 191, 189);
            else b.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
        }
    }
    return new Uint8Array(b);
}
function percentEncodedBytes_(value) {
    let decoded;
    try {
        decoded = decodeURIComponent(value);
    } catch (e) {
        throw invalidFormat(StringFormat.DATA_URL, 'Malformed data URL.');
    }
    return utf8Bytes_(decoded);
}
function base64Bytes_(format, value) {
    switch(format){
        case StringFormat.BASE64:
            {
                const hasMinus = value.indexOf('-') !== -1;
                const hasUnder = value.indexOf('_') !== -1;
                if (hasMinus || hasUnder) {
                    const invalidChar = hasMinus ? '-' : '_';
                    throw invalidFormat(format, "Invalid character '" + invalidChar + "' found: is it base64url encoded?");
                }
                break;
            }
        case StringFormat.BASE64URL:
            {
                const hasPlus = value.indexOf('+') !== -1;
                const hasSlash = value.indexOf('/') !== -1;
                if (hasPlus || hasSlash) {
                    const invalidChar = hasPlus ? '+' : '/';
                    throw invalidFormat(format, "Invalid character '" + invalidChar + "' found: is it base64 encoded?");
                }
                value = value.replace(/-/g, '+').replace(/_/g, '/');
                break;
            }
    }
    let bytes;
    try {
        bytes = decodeBase64(value);
    } catch (e) {
        if (e.message.includes('polyfill')) throw e;
        throw invalidFormat(format, 'Invalid character found');
    }
    const array = new Uint8Array(bytes.length);
    for(let i = 0; i < bytes.length; i++)array[i] = bytes.charCodeAt(i);
    return array;
}
class DataURLParts {
    constructor(dataURL){
        this.base64 = false;
        this.contentType = null;
        const matches = dataURL.match(/^data:([^,]+)?,/);
        if (matches === null) throw invalidFormat(StringFormat.DATA_URL, "Must be formatted 'data:[<mediatype>][;base64],<data>");
        const middle = matches[1] || null;
        if (middle != null) {
            this.base64 = endsWith(middle, ';base64');
            this.contentType = this.base64 ? middle.substring(0, middle.length - 7) : middle;
        }
        this.rest = dataURL.substring(dataURL.indexOf(',') + 1);
    }
}
function dataURLBytes_(dataUrl) {
    const parts = new DataURLParts(dataUrl);
    if (parts.base64) return base64Bytes_(StringFormat.BASE64, parts.rest);
    else return percentEncodedBytes_(parts.rest);
}
function dataURLContentType_(dataUrl) {
    const parts = new DataURLParts(dataUrl);
    return parts.contentType;
}
function endsWith(s, end) {
    const longEnough = s.length >= end.length;
    if (!longEnough) return false;
    return s.substring(s.length - end.length) === end;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * @param opt_elideCopy - If true, doesn't copy mutable input data
 *     (e.g. Uint8Arrays). Pass true only if you know the objects will not be
 *     modified after this blob's construction.
 *
 * @internal
 */ class FbsBlob {
    constructor(data, elideCopy){
        let size = 0;
        let blobType = '';
        if (isNativeBlob(data)) {
            this.data_ = data;
            size = data.size;
            blobType = data.type;
        } else if (data instanceof ArrayBuffer) {
            if (elideCopy) this.data_ = new Uint8Array(data);
            else {
                this.data_ = new Uint8Array(data.byteLength);
                this.data_.set(new Uint8Array(data));
            }
            size = this.data_.length;
        } else if (data instanceof Uint8Array) {
            if (elideCopy) this.data_ = data;
            else {
                this.data_ = new Uint8Array(data.length);
                this.data_.set(data);
            }
            size = data.length;
        }
        this.size_ = size;
        this.type_ = blobType;
    }
    size() {
        return this.size_;
    }
    type() {
        return this.type_;
    }
    slice(startByte, endByte) {
        if (isNativeBlob(this.data_)) {
            const realBlob = this.data_;
            const sliced = sliceBlob(realBlob, startByte, endByte);
            if (sliced === null) return null;
            return new FbsBlob(sliced);
        } else {
            const slice = new Uint8Array(this.data_.buffer, startByte, endByte - startByte);
            return new FbsBlob(slice, true);
        }
    }
    static getBlob(...args) {
        if (isNativeBlobDefined()) {
            const blobby = args.map((val)=>{
                if (val instanceof FbsBlob) return val.data_;
                else return val;
            });
            return new FbsBlob(getBlob$1.apply(null, blobby));
        } else {
            const uint8Arrays = args.map((val)=>{
                if (isString(val)) return dataFromString(StringFormat.RAW, val).data;
                else // Blobs don't exist, so this has to be a Uint8Array.
                return val.data_;
            });
            let finalLength = 0;
            uint8Arrays.forEach((array)=>{
                finalLength += array.byteLength;
            });
            const merged = new Uint8Array(finalLength);
            let index = 0;
            uint8Arrays.forEach((array)=>{
                for(let i = 0; i < array.length; i++)merged[index++] = array[i];
            });
            return new FbsBlob(merged, true);
        }
    }
    uploadData() {
        return this.data_;
    }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Returns the Object resulting from parsing the given JSON, or null if the
 * given string does not represent a JSON object.
 */ function jsonObjectOrNull(s) {
    let obj;
    try {
        obj = JSON.parse(s);
    } catch (e) {
        return null;
    }
    if (isNonArrayObject(obj)) return obj;
    else return null;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * @fileoverview Contains helper methods for manipulating paths.
 */ /**
 * @return Null if the path is already at the root.
 */ function parent(path) {
    if (path.length === 0) return null;
    const index = path.lastIndexOf('/');
    if (index === -1) return '';
    const newPath = path.slice(0, index);
    return newPath;
}
function child(path, childPath) {
    const canonicalChildPath = childPath.split('/').filter((component)=>component.length > 0).join('/');
    if (path.length === 0) return canonicalChildPath;
    else return path + '/' + canonicalChildPath;
}
/**
 * Returns the last component of a path.
 * '/foo/bar' -> 'bar'
 * '/foo/bar/baz/' -> 'baz/'
 * '/a' -> 'a'
 */ function lastComponent(path) {
    const index = path.lastIndexOf('/', path.length - 2);
    if (index === -1) return path;
    else return path.slice(index + 1);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function noXform_(metadata, value) {
    return value;
}
class Mapping {
    constructor(server, local, writable, xform){
        this.server = server;
        this.local = local || server;
        this.writable = !!writable;
        this.xform = xform || noXform_;
    }
}
let mappings_ = null;
function xformPath(fullPath) {
    if (!isString(fullPath) || fullPath.length < 2) return fullPath;
    else return lastComponent(fullPath);
}
function getMappings() {
    if (mappings_) return mappings_;
    const mappings = [];
    mappings.push(new Mapping('bucket'));
    mappings.push(new Mapping('generation'));
    mappings.push(new Mapping('metageneration'));
    mappings.push(new Mapping('name', 'fullPath', true));
    function mappingsXformPath(_metadata, fullPath) {
        return xformPath(fullPath);
    }
    const nameMapping = new Mapping('name');
    nameMapping.xform = mappingsXformPath;
    mappings.push(nameMapping);
    /**
     * Coerces the second param to a number, if it is defined.
     */ function xformSize(_metadata, size) {
        if (size !== undefined) return Number(size);
        else return size;
    }
    const sizeMapping = new Mapping('size');
    sizeMapping.xform = xformSize;
    mappings.push(sizeMapping);
    mappings.push(new Mapping('timeCreated'));
    mappings.push(new Mapping('updated'));
    mappings.push(new Mapping('md5Hash', null, true));
    mappings.push(new Mapping('cacheControl', null, true));
    mappings.push(new Mapping('contentDisposition', null, true));
    mappings.push(new Mapping('contentEncoding', null, true));
    mappings.push(new Mapping('contentLanguage', null, true));
    mappings.push(new Mapping('contentType', null, true));
    mappings.push(new Mapping('metadata', 'customMetadata', true));
    mappings_ = mappings;
    return mappings_;
}
function addRef(metadata, service) {
    function generateRef() {
        const bucket = metadata['bucket'];
        const path = metadata['fullPath'];
        const loc = new Location(bucket, path);
        return service._makeStorageReference(loc);
    }
    Object.defineProperty(metadata, 'ref', {
        get: generateRef
    });
}
function fromResource(service, resource, mappings) {
    const metadata = {};
    metadata['type'] = 'file';
    const len = mappings.length;
    for(let i = 0; i < len; i++){
        const mapping = mappings[i];
        metadata[mapping.local] = mapping.xform(metadata, resource[mapping.server]);
    }
    addRef(metadata, service);
    return metadata;
}
function fromResourceString(service, resourceString, mappings) {
    const obj = jsonObjectOrNull(resourceString);
    if (obj === null) return null;
    const resource = obj;
    return fromResource(service, resource, mappings);
}
function downloadUrlFromResourceString(metadata, resourceString, host, protocol) {
    const obj = jsonObjectOrNull(resourceString);
    if (obj === null) return null;
    if (!isString(obj['downloadTokens'])) // This can happen if objects are uploaded through GCS and retrieved
    // through list, so we don't want to throw an Error.
    return null;
    const tokens = obj['downloadTokens'];
    if (tokens.length === 0) return null;
    const encode = encodeURIComponent;
    const tokensList = tokens.split(',');
    const urls = tokensList.map((token)=>{
        const bucket = metadata['bucket'];
        const path = metadata['fullPath'];
        const urlPart = '/b/' + encode(bucket) + '/o/' + encode(path);
        const base = makeUrl(urlPart, host, protocol);
        const queryString = makeQueryString({
            alt: 'media',
            token
        });
        return base + queryString;
    });
    return urls[0];
}
function toResourceString(metadata, mappings) {
    const resource = {};
    const len = mappings.length;
    for(let i = 0; i < len; i++){
        const mapping = mappings[i];
        if (mapping.writable) resource[mapping.server] = metadata[mapping.local];
    }
    return JSON.stringify(resource);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const PREFIXES_KEY = 'prefixes';
const ITEMS_KEY = 'items';
function fromBackendResponse(service, bucket, resource) {
    const listResult = {
        prefixes: [],
        items: [],
        nextPageToken: resource['nextPageToken']
    };
    if (resource[PREFIXES_KEY]) for (const path of resource[PREFIXES_KEY]){
        const pathWithoutTrailingSlash = path.replace(/\/$/, '');
        const reference = service._makeStorageReference(new Location(bucket, pathWithoutTrailingSlash));
        listResult.prefixes.push(reference);
    }
    if (resource[ITEMS_KEY]) for (const item of resource[ITEMS_KEY]){
        const reference = service._makeStorageReference(new Location(bucket, item['name']));
        listResult.items.push(reference);
    }
    return listResult;
}
function fromResponseString(service, bucket, resourceString) {
    const obj = jsonObjectOrNull(resourceString);
    if (obj === null) return null;
    const resource = obj;
    return fromBackendResponse(service, bucket, resource);
}
/**
 * Contains a fully specified request.
 *
 * @param I - the type of the backend's network response.
 * @param O - the output response type used by the rest of the SDK.
 */ class RequestInfo {
    constructor(url, method, /**
     * Returns the value with which to resolve the request's promise. Only called
     * if the request is successful. Throw from this function to reject the
     * returned Request's promise with the thrown error.
     * Note: The XhrIo passed to this function may be reused after this callback
     * returns. Do not keep a reference to it in any way.
     */ handler, timeout){
        this.url = url;
        this.method = method;
        this.handler = handler;
        this.timeout = timeout;
        this.urlParams = {};
        this.headers = {};
        this.body = null;
        this.errorHandler = null;
        /**
         * Called with the current number of bytes uploaded and total size (-1 if not
         * computable) of the request body (i.e. used to report upload progress).
         */ this.progressCallback = null;
        this.successCodes = [
            200
        ];
        this.additionalRetryCodes = [];
    }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Throws the UNKNOWN StorageError if cndn is false.
 */ function handlerCheck(cndn) {
    if (!cndn) throw unknown();
}
function metadataHandler(service, mappings) {
    function handler(xhr, text) {
        const metadata = fromResourceString(service, text, mappings);
        handlerCheck(metadata !== null);
        return metadata;
    }
    return handler;
}
function listHandler(service, bucket) {
    function handler(xhr, text) {
        const listResult = fromResponseString(service, bucket, text);
        handlerCheck(listResult !== null);
        return listResult;
    }
    return handler;
}
function downloadUrlHandler(service, mappings) {
    function handler(xhr, text) {
        const metadata = fromResourceString(service, text, mappings);
        handlerCheck(metadata !== null);
        return downloadUrlFromResourceString(metadata, text, service.host, service._protocol);
    }
    return handler;
}
function sharedErrorHandler(location) {
    function errorHandler(xhr, err) {
        let newErr;
        if (xhr.getStatus() === 401) {
            if (// This exact message string is the only consistent part of the
            // server's error response that identifies it as an App Check error.
            xhr.getErrorText().includes('Firebase App Check token is invalid')) newErr = unauthorizedApp();
            else newErr = unauthenticated();
        } else {
            if (xhr.getStatus() === 402) newErr = quotaExceeded(location.bucket);
            else if (xhr.getStatus() === 403) newErr = unauthorized(location.path);
            else newErr = err;
        }
        newErr.status = xhr.getStatus();
        newErr.serverResponse = err.serverResponse;
        return newErr;
    }
    return errorHandler;
}
function objectErrorHandler(location) {
    const shared = sharedErrorHandler(location);
    function errorHandler(xhr, err) {
        let newErr = shared(xhr, err);
        if (xhr.getStatus() === 404) newErr = objectNotFound(location.path);
        newErr.serverResponse = err.serverResponse;
        return newErr;
    }
    return errorHandler;
}
function getMetadata$2(service, location, mappings) {
    const urlPart = location.fullServerUrl();
    const url = makeUrl(urlPart, service.host, service._protocol);
    const method = 'GET';
    const timeout = service.maxOperationRetryTime;
    const requestInfo = new RequestInfo(url, method, metadataHandler(service, mappings), timeout);
    requestInfo.errorHandler = objectErrorHandler(location);
    return requestInfo;
}
function list$2(service, location, delimiter, pageToken, maxResults) {
    const urlParams = {};
    if (location.isRoot) urlParams['prefix'] = '';
    else urlParams['prefix'] = location.path + '/';
    if (delimiter && delimiter.length > 0) urlParams['delimiter'] = delimiter;
    if (pageToken) urlParams['pageToken'] = pageToken;
    if (maxResults) urlParams['maxResults'] = maxResults;
    const urlPart = location.bucketOnlyServerUrl();
    const url = makeUrl(urlPart, service.host, service._protocol);
    const method = 'GET';
    const timeout = service.maxOperationRetryTime;
    const requestInfo = new RequestInfo(url, method, listHandler(service, location.bucket), timeout);
    requestInfo.urlParams = urlParams;
    requestInfo.errorHandler = sharedErrorHandler(location);
    return requestInfo;
}
function getBytes$1(service, location, maxDownloadSizeBytes) {
    const urlPart = location.fullServerUrl();
    const url = makeUrl(urlPart, service.host, service._protocol) + '?alt=media';
    const method = 'GET';
    const timeout = service.maxOperationRetryTime;
    const requestInfo = new RequestInfo(url, method, (_, data)=>data, timeout);
    requestInfo.errorHandler = objectErrorHandler(location);
    if (maxDownloadSizeBytes !== undefined) {
        requestInfo.headers['Range'] = `bytes=0-${maxDownloadSizeBytes}`;
        requestInfo.successCodes = [
            200 /* OK */ ,
            206 /* Partial Content */ 
        ];
    }
    return requestInfo;
}
function getDownloadUrl(service, location, mappings) {
    const urlPart = location.fullServerUrl();
    const url = makeUrl(urlPart, service.host, service._protocol);
    const method = 'GET';
    const timeout = service.maxOperationRetryTime;
    const requestInfo = new RequestInfo(url, method, downloadUrlHandler(service, mappings), timeout);
    requestInfo.errorHandler = objectErrorHandler(location);
    return requestInfo;
}
function updateMetadata$2(service, location, metadata, mappings) {
    const urlPart = location.fullServerUrl();
    const url = makeUrl(urlPart, service.host, service._protocol);
    const method = 'PATCH';
    const body = toResourceString(metadata, mappings);
    const headers = {
        'Content-Type': 'application/json; charset=utf-8'
    };
    const timeout = service.maxOperationRetryTime;
    const requestInfo = new RequestInfo(url, method, metadataHandler(service, mappings), timeout);
    requestInfo.headers = headers;
    requestInfo.body = body;
    requestInfo.errorHandler = objectErrorHandler(location);
    return requestInfo;
}
function deleteObject$2(service, location) {
    const urlPart = location.fullServerUrl();
    const url = makeUrl(urlPart, service.host, service._protocol);
    const method = 'DELETE';
    const timeout = service.maxOperationRetryTime;
    function handler(_xhr, _text) {}
    const requestInfo = new RequestInfo(url, method, handler, timeout);
    requestInfo.successCodes = [
        200,
        204
    ];
    requestInfo.errorHandler = objectErrorHandler(location);
    return requestInfo;
}
function determineContentType_(metadata, blob) {
    return metadata && metadata['contentType'] || blob && blob.type() || 'application/octet-stream';
}
function metadataForUpload_(location, blob, metadata) {
    const metadataClone = Object.assign({}, metadata);
    metadataClone['fullPath'] = location.path;
    metadataClone['size'] = blob.size();
    if (!metadataClone['contentType']) metadataClone['contentType'] = determineContentType_(null, blob);
    return metadataClone;
}
/**
 * Prepare RequestInfo for uploads as Content-Type: multipart.
 */ function multipartUpload(service, location, mappings, blob, metadata) {
    const urlPart = location.bucketOnlyServerUrl();
    const headers = {
        'X-Goog-Upload-Protocol': 'multipart'
    };
    function genBoundary() {
        let str = '';
        for(let i = 0; i < 2; i++)str = str + Math.random().toString().slice(2);
        return str;
    }
    const boundary = genBoundary();
    headers['Content-Type'] = 'multipart/related; boundary=' + boundary;
    const metadata_ = metadataForUpload_(location, blob, metadata);
    const metadataString = toResourceString(metadata_, mappings);
    const preBlobPart = '--' + boundary + '\r\n' + 'Content-Type: application/json; charset=utf-8\r\n\r\n' + metadataString + '\r\n--' + boundary + '\r\n' + 'Content-Type: ' + metadata_['contentType'] + '\r\n\r\n';
    const postBlobPart = '\r\n--' + boundary + '--';
    const body = FbsBlob.getBlob(preBlobPart, blob, postBlobPart);
    if (body === null) throw cannotSliceBlob();
    const urlParams = {
        name: metadata_['fullPath']
    };
    const url = makeUrl(urlPart, service.host, service._protocol);
    const method = 'POST';
    const timeout = service.maxUploadRetryTime;
    const requestInfo = new RequestInfo(url, method, metadataHandler(service, mappings), timeout);
    requestInfo.urlParams = urlParams;
    requestInfo.headers = headers;
    requestInfo.body = body.uploadData();
    requestInfo.errorHandler = sharedErrorHandler(location);
    return requestInfo;
}
/**
 * @param current The number of bytes that have been uploaded so far.
 * @param total The total number of bytes in the upload.
 * @param opt_finalized True if the server has finished the upload.
 * @param opt_metadata The upload metadata, should
 *     only be passed if opt_finalized is true.
 */ class ResumableUploadStatus {
    constructor(current, total, finalized, metadata){
        this.current = current;
        this.total = total;
        this.finalized = !!finalized;
        this.metadata = metadata || null;
    }
}
function checkResumeHeader_(xhr, allowed) {
    let status = null;
    try {
        status = xhr.getResponseHeader('X-Goog-Upload-Status');
    } catch (e) {
        handlerCheck(false);
    }
    const allowedStatus = allowed || [
        'active'
    ];
    handlerCheck(!!status && allowedStatus.indexOf(status) !== -1);
    return status;
}
function createResumableUpload(service, location, mappings, blob, metadata) {
    const urlPart = location.bucketOnlyServerUrl();
    const metadataForUpload = metadataForUpload_(location, blob, metadata);
    const urlParams = {
        name: metadataForUpload['fullPath']
    };
    const url = makeUrl(urlPart, service.host, service._protocol);
    const method = 'POST';
    const headers = {
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': `${blob.size()}`,
        'X-Goog-Upload-Header-Content-Type': metadataForUpload['contentType'],
        'Content-Type': 'application/json; charset=utf-8'
    };
    const body = toResourceString(metadataForUpload, mappings);
    const timeout = service.maxUploadRetryTime;
    function handler(xhr) {
        checkResumeHeader_(xhr);
        let url;
        try {
            url = xhr.getResponseHeader('X-Goog-Upload-URL');
        } catch (e) {
            handlerCheck(false);
        }
        handlerCheck(isString(url));
        return url;
    }
    const requestInfo = new RequestInfo(url, method, handler, timeout);
    requestInfo.urlParams = urlParams;
    requestInfo.headers = headers;
    requestInfo.body = body;
    requestInfo.errorHandler = sharedErrorHandler(location);
    return requestInfo;
}
/**
 * @param url From a call to fbs.requests.createResumableUpload.
 */ function getResumableUploadStatus(service, location, url, blob) {
    const headers = {
        'X-Goog-Upload-Command': 'query'
    };
    function handler(xhr) {
        const status = checkResumeHeader_(xhr, [
            'active',
            'final'
        ]);
        let sizeString = null;
        try {
            sizeString = xhr.getResponseHeader('X-Goog-Upload-Size-Received');
        } catch (e) {
            handlerCheck(false);
        }
        if (!sizeString) // null or empty string
        handlerCheck(false);
        const size = Number(sizeString);
        handlerCheck(!isNaN(size));
        return new ResumableUploadStatus(size, blob.size(), status === 'final');
    }
    const method = 'POST';
    const timeout = service.maxUploadRetryTime;
    const requestInfo = new RequestInfo(url, method, handler, timeout);
    requestInfo.headers = headers;
    requestInfo.errorHandler = sharedErrorHandler(location);
    return requestInfo;
}
/**
 * Any uploads via the resumable upload API must transfer a number of bytes
 * that is a multiple of this number.
 */ const RESUMABLE_UPLOAD_CHUNK_SIZE = 262144;
/**
 * @param url From a call to fbs.requests.createResumableUpload.
 * @param chunkSize Number of bytes to upload.
 * @param status The previous status.
 *     If not passed or null, we start from the beginning.
 * @throws fbs.Error If the upload is already complete, the passed in status
 *     has a final size inconsistent with the blob, or the blob cannot be sliced
 *     for upload.
 */ function continueResumableUpload(location, service, url, blob, chunkSize, mappings, status, progressCallback) {
    // TODO(andysoto): standardize on internal asserts
    // assert(!(opt_status && opt_status.finalized));
    const status_ = new ResumableUploadStatus(0, 0);
    if (status) {
        status_.current = status.current;
        status_.total = status.total;
    } else {
        status_.current = 0;
        status_.total = blob.size();
    }
    if (blob.size() !== status_.total) throw serverFileWrongSize();
    const bytesLeft = status_.total - status_.current;
    let bytesToUpload = bytesLeft;
    if (chunkSize > 0) bytesToUpload = Math.min(bytesToUpload, chunkSize);
    const startByte = status_.current;
    const endByte = startByte + bytesToUpload;
    let uploadCommand = '';
    if (bytesToUpload === 0) uploadCommand = 'finalize';
    else if (bytesLeft === bytesToUpload) uploadCommand = 'upload, finalize';
    else uploadCommand = 'upload';
    const headers = {
        'X-Goog-Upload-Command': uploadCommand,
        'X-Goog-Upload-Offset': `${status_.current}`
    };
    const body = blob.slice(startByte, endByte);
    if (body === null) throw cannotSliceBlob();
    function handler(xhr, text) {
        // TODO(andysoto): Verify the MD5 of each uploaded range:
        // the 'x-range-md5' header comes back with status code 308 responses.
        // We'll only be able to bail out though, because you can't re-upload a
        // range that you previously uploaded.
        const uploadStatus = checkResumeHeader_(xhr, [
            'active',
            'final'
        ]);
        const newCurrent = status_.current + bytesToUpload;
        const size = blob.size();
        let metadata;
        if (uploadStatus === 'final') metadata = metadataHandler(service, mappings)(xhr, text);
        else metadata = null;
        return new ResumableUploadStatus(newCurrent, size, uploadStatus === 'final', metadata);
    }
    const method = 'POST';
    const timeout = service.maxUploadRetryTime;
    const requestInfo = new RequestInfo(url, method, handler, timeout);
    requestInfo.headers = headers;
    requestInfo.body = body.uploadData();
    requestInfo.progressCallback = progressCallback || null;
    requestInfo.errorHandler = sharedErrorHandler(location);
    return requestInfo;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * An event that is triggered on a task.
 * @internal
 */ const TaskEvent = {
    /**
     * For this event,
     * <ul>
     *   <li>The `next` function is triggered on progress updates and when the
     *       task is paused/resumed with an `UploadTaskSnapshot` as the first
     *       argument.</li>
     *   <li>The `error` function is triggered if the upload is canceled or fails
     *       for another reason.</li>
     *   <li>The `complete` function is triggered if the upload completes
     *       successfully.</li>
     * </ul>
     */ STATE_CHANGED: 'state_changed'
};
// type keys = keyof TaskState
/**
 * Represents the current state of a running upload.
 * @internal
 */ const TaskState = {
    /** The task is currently transferring data. */ RUNNING: 'running',
    /** The task was paused by the user. */ PAUSED: 'paused',
    /** The task completed successfully. */ SUCCESS: 'success',
    /** The task was canceled. */ CANCELED: 'canceled',
    /** The task failed with an error. */ ERROR: 'error'
};
function taskStateFromInternalTaskState(state) {
    switch(state){
        case "running" /* InternalTaskState.RUNNING */ :
        case "pausing" /* InternalTaskState.PAUSING */ :
        case "canceling" /* InternalTaskState.CANCELING */ :
            return TaskState.RUNNING;
        case "paused" /* InternalTaskState.PAUSED */ :
            return TaskState.PAUSED;
        case "success" /* InternalTaskState.SUCCESS */ :
            return TaskState.SUCCESS;
        case "canceled" /* InternalTaskState.CANCELED */ :
            return TaskState.CANCELED;
        case "error" /* InternalTaskState.ERROR */ :
            return TaskState.ERROR;
        default:
            // TODO(andysoto): assert(false);
            return TaskState.ERROR;
    }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Observer {
    constructor(nextOrObserver, error, complete){
        const asFunctions = isFunction(nextOrObserver) || error != null || complete != null;
        if (asFunctions) {
            this.next = nextOrObserver;
            this.error = error !== null && error !== void 0 ? error : undefined;
            this.complete = complete !== null && complete !== void 0 ? complete : undefined;
        } else {
            const observer = nextOrObserver;
            this.next = observer.next;
            this.error = observer.error;
            this.complete = observer.complete;
        }
    }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Returns a function that invokes f with its arguments asynchronously as a
 * microtask, i.e. as soon as possible after the current script returns back
 * into browser code.
 */ // eslint-disable-next-line @typescript-eslint/ban-types
function async(f) {
    return (...argsToForward)=>{
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        Promise.resolve().then(()=>f(...argsToForward));
    };
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /** An override for the text-based Connection. Used in tests. */ let textFactoryOverride = null;
/**
 * Network layer for browsers. We use this instead of goog.net.XhrIo because
 * goog.net.XhrIo is hyuuuuge and doesn't work in React Native on Android.
 */ class XhrConnection {
    constructor(){
        this.sent_ = false;
        this.xhr_ = new XMLHttpRequest();
        this.initXhr();
        this.errorCode_ = ErrorCode.NO_ERROR;
        this.sendPromise_ = new Promise((resolve)=>{
            this.xhr_.addEventListener('abort', ()=>{
                this.errorCode_ = ErrorCode.ABORT;
                resolve();
            });
            this.xhr_.addEventListener('error', ()=>{
                this.errorCode_ = ErrorCode.NETWORK_ERROR;
                resolve();
            });
            this.xhr_.addEventListener('load', ()=>{
                resolve();
            });
        });
    }
    send(url, method, body, headers) {
        if (this.sent_) throw internalError('cannot .send() more than once');
        this.sent_ = true;
        this.xhr_.open(method, url, true);
        if (headers !== undefined) {
            for(const key in headers)if (headers.hasOwnProperty(key)) this.xhr_.setRequestHeader(key, headers[key].toString());
        }
        if (body !== undefined) this.xhr_.send(body);
        else this.xhr_.send();
        return this.sendPromise_;
    }
    getErrorCode() {
        if (!this.sent_) throw internalError('cannot .getErrorCode() before sending');
        return this.errorCode_;
    }
    getStatus() {
        if (!this.sent_) throw internalError('cannot .getStatus() before sending');
        try {
            return this.xhr_.status;
        } catch (e) {
            return -1;
        }
    }
    getResponse() {
        if (!this.sent_) throw internalError('cannot .getResponse() before sending');
        return this.xhr_.response;
    }
    getErrorText() {
        if (!this.sent_) throw internalError('cannot .getErrorText() before sending');
        return this.xhr_.statusText;
    }
    /** Aborts the request. */ abort() {
        this.xhr_.abort();
    }
    getResponseHeader(header) {
        return this.xhr_.getResponseHeader(header);
    }
    addUploadProgressListener(listener) {
        if (this.xhr_.upload != null) this.xhr_.upload.addEventListener('progress', listener);
    }
    removeUploadProgressListener(listener) {
        if (this.xhr_.upload != null) this.xhr_.upload.removeEventListener('progress', listener);
    }
}
class XhrTextConnection extends XhrConnection {
    initXhr() {
        this.xhr_.responseType = 'text';
    }
}
function newTextConnection() {
    return textFactoryOverride ? textFactoryOverride() : new XhrTextConnection();
}
class XhrBytesConnection extends XhrConnection {
    initXhr() {
        this.xhr_.responseType = 'arraybuffer';
    }
}
function newBytesConnection() {
    return new XhrBytesConnection();
}
class XhrBlobConnection extends XhrConnection {
    initXhr() {
        this.xhr_.responseType = 'blob';
    }
}
function newBlobConnection() {
    return new XhrBlobConnection();
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Represents a blob being uploaded. Can be used to pause/resume/cancel the
 * upload and manage callbacks for various events.
 * @internal
 */ class UploadTask {
    isExponentialBackoffExpired() {
        return this.sleepTime > this.maxSleepTime;
    }
    /**
     * @param ref - The firebaseStorage.Reference object this task came
     *     from, untyped to avoid cyclic dependencies.
     * @param blob - The blob to upload.
     */ constructor(ref, blob, metadata = null){
        /**
         * Number of bytes transferred so far.
         */ this._transferred = 0;
        this._needToFetchStatus = false;
        this._needToFetchMetadata = false;
        this._observers = [];
        this._error = undefined;
        this._uploadUrl = undefined;
        this._request = undefined;
        this._chunkMultiplier = 1;
        this._resolve = undefined;
        this._reject = undefined;
        this._ref = ref;
        this._blob = blob;
        this._metadata = metadata;
        this._mappings = getMappings();
        this._resumable = this._shouldDoResumable(this._blob);
        this._state = "running" /* InternalTaskState.RUNNING */ ;
        this._errorHandler = (error)=>{
            this._request = undefined;
            this._chunkMultiplier = 1;
            if (error._codeEquals(StorageErrorCode.CANCELED)) {
                this._needToFetchStatus = true;
                this.completeTransitions_();
            } else {
                const backoffExpired = this.isExponentialBackoffExpired();
                if (isRetryStatusCode(error.status, [])) {
                    if (backoffExpired) error = retryLimitExceeded();
                    else {
                        this.sleepTime = Math.max(this.sleepTime * 2, DEFAULT_MIN_SLEEP_TIME_MILLIS);
                        this._needToFetchStatus = true;
                        this.completeTransitions_();
                        return;
                    }
                }
                this._error = error;
                this._transition("error" /* InternalTaskState.ERROR */ );
            }
        };
        this._metadataErrorHandler = (error)=>{
            this._request = undefined;
            if (error._codeEquals(StorageErrorCode.CANCELED)) this.completeTransitions_();
            else {
                this._error = error;
                this._transition("error" /* InternalTaskState.ERROR */ );
            }
        };
        this.sleepTime = 0;
        this.maxSleepTime = this._ref.storage.maxUploadRetryTime;
        this._promise = new Promise((resolve, reject)=>{
            this._resolve = resolve;
            this._reject = reject;
            this._start();
        });
        // Prevent uncaught rejections on the internal promise from bubbling out
        // to the top level with a dummy handler.
        this._promise.then(null, ()=>{});
    }
    _makeProgressCallback() {
        const sizeBefore = this._transferred;
        return (loaded)=>this._updateProgress(sizeBefore + loaded);
    }
    _shouldDoResumable(blob) {
        return blob.size() > 262144;
    }
    _start() {
        if (this._state !== "running" /* InternalTaskState.RUNNING */ ) // This can happen if someone pauses us in a resume callback, for example.
        return;
        if (this._request !== undefined) return;
        if (this._resumable) {
            if (this._uploadUrl === undefined) this._createResumable();
            else {
                if (this._needToFetchStatus) this._fetchStatus();
                else if (this._needToFetchMetadata) // Happens if we miss the metadata on upload completion.
                this._fetchMetadata();
                else this.pendingTimeout = setTimeout(()=>{
                    this.pendingTimeout = undefined;
                    this._continueUpload();
                }, this.sleepTime);
            }
        } else this._oneShotUpload();
    }
    _resolveToken(callback) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        Promise.all([
            this._ref.storage._getAuthToken(),
            this._ref.storage._getAppCheckToken()
        ]).then(([authToken, appCheckToken])=>{
            switch(this._state){
                case "running" /* InternalTaskState.RUNNING */ :
                    callback(authToken, appCheckToken);
                    break;
                case "canceling" /* InternalTaskState.CANCELING */ :
                    this._transition("canceled" /* InternalTaskState.CANCELED */ );
                    break;
                case "pausing" /* InternalTaskState.PAUSING */ :
                    this._transition("paused" /* InternalTaskState.PAUSED */ );
                    break;
            }
        });
    }
    // TODO(andysoto): assert false
    _createResumable() {
        this._resolveToken((authToken, appCheckToken)=>{
            const requestInfo = createResumableUpload(this._ref.storage, this._ref._location, this._mappings, this._blob, this._metadata);
            const createRequest = this._ref.storage._makeRequest(requestInfo, newTextConnection, authToken, appCheckToken);
            this._request = createRequest;
            createRequest.getPromise().then((url)=>{
                this._request = undefined;
                this._uploadUrl = url;
                this._needToFetchStatus = false;
                this.completeTransitions_();
            }, this._errorHandler);
        });
    }
    _fetchStatus() {
        // TODO(andysoto): assert(this.uploadUrl_ !== null);
        const url = this._uploadUrl;
        this._resolveToken((authToken, appCheckToken)=>{
            const requestInfo = getResumableUploadStatus(this._ref.storage, this._ref._location, url, this._blob);
            const statusRequest = this._ref.storage._makeRequest(requestInfo, newTextConnection, authToken, appCheckToken);
            this._request = statusRequest;
            statusRequest.getPromise().then((status)=>{
                status;
                this._request = undefined;
                this._updateProgress(status.current);
                this._needToFetchStatus = false;
                if (status.finalized) this._needToFetchMetadata = true;
                this.completeTransitions_();
            }, this._errorHandler);
        });
    }
    _continueUpload() {
        const chunkSize = RESUMABLE_UPLOAD_CHUNK_SIZE * this._chunkMultiplier;
        const status = new ResumableUploadStatus(this._transferred, this._blob.size());
        // TODO(andysoto): assert(this.uploadUrl_ !== null);
        const url = this._uploadUrl;
        this._resolveToken((authToken, appCheckToken)=>{
            let requestInfo;
            try {
                requestInfo = continueResumableUpload(this._ref._location, this._ref.storage, url, this._blob, chunkSize, this._mappings, status, this._makeProgressCallback());
            } catch (e) {
                this._error = e;
                this._transition("error" /* InternalTaskState.ERROR */ );
                return;
            }
            const uploadRequest = this._ref.storage._makeRequest(requestInfo, newTextConnection, authToken, appCheckToken, /*retry=*/ false // Upload requests should not be retried as each retry should be preceded by another query request. Which is handled in this file.
            );
            this._request = uploadRequest;
            uploadRequest.getPromise().then((newStatus)=>{
                this._increaseMultiplier();
                this._request = undefined;
                this._updateProgress(newStatus.current);
                if (newStatus.finalized) {
                    this._metadata = newStatus.metadata;
                    this._transition("success" /* InternalTaskState.SUCCESS */ );
                } else this.completeTransitions_();
            }, this._errorHandler);
        });
    }
    _increaseMultiplier() {
        const currentSize = RESUMABLE_UPLOAD_CHUNK_SIZE * this._chunkMultiplier;
        // Max chunk size is 32M.
        if (currentSize * 2 < 33554432) this._chunkMultiplier *= 2;
    }
    _fetchMetadata() {
        this._resolveToken((authToken, appCheckToken)=>{
            const requestInfo = getMetadata$2(this._ref.storage, this._ref._location, this._mappings);
            const metadataRequest = this._ref.storage._makeRequest(requestInfo, newTextConnection, authToken, appCheckToken);
            this._request = metadataRequest;
            metadataRequest.getPromise().then((metadata)=>{
                this._request = undefined;
                this._metadata = metadata;
                this._transition("success" /* InternalTaskState.SUCCESS */ );
            }, this._metadataErrorHandler);
        });
    }
    _oneShotUpload() {
        this._resolveToken((authToken, appCheckToken)=>{
            const requestInfo = multipartUpload(this._ref.storage, this._ref._location, this._mappings, this._blob, this._metadata);
            const multipartRequest = this._ref.storage._makeRequest(requestInfo, newTextConnection, authToken, appCheckToken);
            this._request = multipartRequest;
            multipartRequest.getPromise().then((metadata)=>{
                this._request = undefined;
                this._metadata = metadata;
                this._updateProgress(this._blob.size());
                this._transition("success" /* InternalTaskState.SUCCESS */ );
            }, this._errorHandler);
        });
    }
    _updateProgress(transferred) {
        const old = this._transferred;
        this._transferred = transferred;
        // A progress update can make the "transferred" value smaller (e.g. a
        // partial upload not completed by server, after which the "transferred"
        // value may reset to the value at the beginning of the request).
        if (this._transferred !== old) this._notifyObservers();
    }
    _transition(state) {
        if (this._state === state) return;
        switch(state){
            case "canceling" /* InternalTaskState.CANCELING */ :
            case "pausing" /* InternalTaskState.PAUSING */ :
                // TODO(andysoto):
                // assert(this.state_ === InternalTaskState.RUNNING ||
                //        this.state_ === InternalTaskState.PAUSING);
                this._state = state;
                if (this._request !== undefined) this._request.cancel();
                else if (this.pendingTimeout) {
                    clearTimeout(this.pendingTimeout);
                    this.pendingTimeout = undefined;
                    this.completeTransitions_();
                }
                break;
            case "running" /* InternalTaskState.RUNNING */ :
                // TODO(andysoto):
                // assert(this.state_ === InternalTaskState.PAUSED ||
                //        this.state_ === InternalTaskState.PAUSING);
                const wasPaused = this._state === "paused" /* InternalTaskState.PAUSED */ ;
                this._state = state;
                if (wasPaused) {
                    this._notifyObservers();
                    this._start();
                }
                break;
            case "paused" /* InternalTaskState.PAUSED */ :
                // TODO(andysoto):
                // assert(this.state_ === InternalTaskState.PAUSING);
                this._state = state;
                this._notifyObservers();
                break;
            case "canceled" /* InternalTaskState.CANCELED */ :
                // TODO(andysoto):
                // assert(this.state_ === InternalTaskState.PAUSED ||
                //        this.state_ === InternalTaskState.CANCELING);
                this._error = canceled();
                this._state = state;
                this._notifyObservers();
                break;
            case "error" /* InternalTaskState.ERROR */ :
                // TODO(andysoto):
                // assert(this.state_ === InternalTaskState.RUNNING ||
                //        this.state_ === InternalTaskState.PAUSING ||
                //        this.state_ === InternalTaskState.CANCELING);
                this._state = state;
                this._notifyObservers();
                break;
            case "success" /* InternalTaskState.SUCCESS */ :
                // TODO(andysoto):
                // assert(this.state_ === InternalTaskState.RUNNING ||
                //        this.state_ === InternalTaskState.PAUSING ||
                //        this.state_ === InternalTaskState.CANCELING);
                this._state = state;
                this._notifyObservers();
                break;
        }
    }
    completeTransitions_() {
        switch(this._state){
            case "pausing" /* InternalTaskState.PAUSING */ :
                this._transition("paused" /* InternalTaskState.PAUSED */ );
                break;
            case "canceling" /* InternalTaskState.CANCELING */ :
                this._transition("canceled" /* InternalTaskState.CANCELED */ );
                break;
            case "running" /* InternalTaskState.RUNNING */ :
                this._start();
                break;
        }
    }
    /**
     * A snapshot of the current task state.
     */ get snapshot() {
        const externalState = taskStateFromInternalTaskState(this._state);
        return {
            bytesTransferred: this._transferred,
            totalBytes: this._blob.size(),
            state: externalState,
            metadata: this._metadata,
            task: this,
            ref: this._ref
        };
    }
    /**
     * Adds a callback for an event.
     * @param type - The type of event to listen for.
     * @param nextOrObserver -
     *     The `next` function, which gets called for each item in
     *     the event stream, or an observer object with some or all of these three
     *     properties (`next`, `error`, `complete`).
     * @param error - A function that gets called with a `StorageError`
     *     if the event stream ends due to an error.
     * @param completed - A function that gets called if the
     *     event stream ends normally.
     * @returns
     *     If only the event argument is passed, returns a function you can use to
     *     add callbacks (see the examples above). If more than just the event
     *     argument is passed, returns a function you can call to unregister the
     *     callbacks.
     */ on(type, nextOrObserver, error, completed) {
        // Note: `type` isn't being used. Its type is also incorrect. TaskEvent should not be a string.
        const observer = new Observer(nextOrObserver || undefined, error || undefined, completed || undefined);
        this._addObserver(observer);
        return ()=>{
            this._removeObserver(observer);
        };
    }
    /**
     * This object behaves like a Promise, and resolves with its snapshot data
     * when the upload completes.
     * @param onFulfilled - The fulfillment callback. Promise chaining works as normal.
     * @param onRejected - The rejection callback.
     */ then(onFulfilled, onRejected) {
        // These casts are needed so that TypeScript can infer the types of the
        // resulting Promise.
        return this._promise.then(onFulfilled, onRejected);
    }
    /**
     * Equivalent to calling `then(null, onRejected)`.
     */ catch(onRejected) {
        return this.then(null, onRejected);
    }
    /**
     * Adds the given observer.
     */ _addObserver(observer) {
        this._observers.push(observer);
        this._notifyObserver(observer);
    }
    /**
     * Removes the given observer.
     */ _removeObserver(observer) {
        const i = this._observers.indexOf(observer);
        if (i !== -1) this._observers.splice(i, 1);
    }
    _notifyObservers() {
        this._finishPromise();
        const observers = this._observers.slice();
        observers.forEach((observer)=>{
            this._notifyObserver(observer);
        });
    }
    _finishPromise() {
        if (this._resolve !== undefined) {
            let triggered = true;
            switch(taskStateFromInternalTaskState(this._state)){
                case TaskState.SUCCESS:
                    async(this._resolve.bind(null, this.snapshot))();
                    break;
                case TaskState.CANCELED:
                case TaskState.ERROR:
                    const toCall = this._reject;
                    async(toCall.bind(null, this._error))();
                    break;
                default:
                    triggered = false;
                    break;
            }
            if (triggered) {
                this._resolve = undefined;
                this._reject = undefined;
            }
        }
    }
    _notifyObserver(observer) {
        const externalState = taskStateFromInternalTaskState(this._state);
        switch(externalState){
            case TaskState.RUNNING:
            case TaskState.PAUSED:
                if (observer.next) async(observer.next.bind(observer, this.snapshot))();
                break;
            case TaskState.SUCCESS:
                if (observer.complete) async(observer.complete.bind(observer))();
                break;
            case TaskState.CANCELED:
            case TaskState.ERROR:
                if (observer.error) async(observer.error.bind(observer, this._error))();
                break;
            default:
                // TODO(andysoto): assert(false);
                if (observer.error) async(observer.error.bind(observer, this._error))();
        }
    }
    /**
     * Resumes a paused task. Has no effect on a currently running or failed task.
     * @returns True if the operation took effect, false if ignored.
     */ resume() {
        const valid = this._state === "paused" /* InternalTaskState.PAUSED */  || this._state === "pausing" /* InternalTaskState.PAUSING */ ;
        if (valid) this._transition("running" /* InternalTaskState.RUNNING */ );
        return valid;
    }
    /**
     * Pauses a currently running task. Has no effect on a paused or failed task.
     * @returns True if the operation took effect, false if ignored.
     */ pause() {
        const valid = this._state === "running" /* InternalTaskState.RUNNING */ ;
        if (valid) this._transition("pausing" /* InternalTaskState.PAUSING */ );
        return valid;
    }
    /**
     * Cancels a currently running or paused task. Has no effect on a complete or
     * failed task.
     * @returns True if the operation took effect, false if ignored.
     */ cancel() {
        const valid = this._state === "running" /* InternalTaskState.RUNNING */  || this._state === "pausing" /* InternalTaskState.PAUSING */ ;
        if (valid) this._transition("canceling" /* InternalTaskState.CANCELING */ );
        return valid;
    }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Provides methods to interact with a bucket in the Firebase Storage service.
 * @internal
 * @param _location - An fbs.location, or the URL at
 *     which to base this object, in one of the following forms:
 *         gs://<bucket>/<object-path>
 *         http[s]://firebasestorage.googleapis.com/
 *                     <api-version>/b/<bucket>/o/<object-path>
 *     Any query or fragment strings will be ignored in the http[s]
 *     format. If no value is passed, the storage object will use a URL based on
 *     the project ID of the base firebase.App instance.
 */ class Reference {
    constructor(_service, location){
        this._service = _service;
        if (location instanceof Location) this._location = location;
        else this._location = Location.makeFromUrl(location, _service.host);
    }
    /**
     * Returns the URL for the bucket and path this object references,
     *     in the form gs://<bucket>/<object-path>
     * @override
     */ toString() {
        return 'gs://' + this._location.bucket + '/' + this._location.path;
    }
    _newRef(service, location) {
        return new Reference(service, location);
    }
    /**
     * A reference to the root of this object's bucket.
     */ get root() {
        const location = new Location(this._location.bucket, '');
        return this._newRef(this._service, location);
    }
    /**
     * The name of the bucket containing this reference's object.
     */ get bucket() {
        return this._location.bucket;
    }
    /**
     * The full path of this object.
     */ get fullPath() {
        return this._location.path;
    }
    /**
     * The short name of this object, which is the last component of the full path.
     * For example, if fullPath is 'full/path/image.png', name is 'image.png'.
     */ get name() {
        return lastComponent(this._location.path);
    }
    /**
     * The `StorageService` instance this `StorageReference` is associated with.
     */ get storage() {
        return this._service;
    }
    /**
     * A `StorageReference` pointing to the parent location of this `StorageReference`, or null if
     * this reference is the root.
     */ get parent() {
        const newPath = parent(this._location.path);
        if (newPath === null) return null;
        const location = new Location(this._location.bucket, newPath);
        return new Reference(this._service, location);
    }
    /**
     * Utility function to throw an error in methods that do not accept a root reference.
     */ _throwIfRoot(name) {
        if (this._location.path === '') throw invalidRootOperation(name);
    }
}
/**
 * Download the bytes at the object's location.
 * @returns A Promise containing the downloaded bytes.
 */ function getBytesInternal(ref, maxDownloadSizeBytes) {
    ref._throwIfRoot('getBytes');
    const requestInfo = getBytes$1(ref.storage, ref._location, maxDownloadSizeBytes);
    return ref.storage.makeRequestWithTokens(requestInfo, newBytesConnection).then((bytes)=>maxDownloadSizeBytes !== undefined ? bytes.slice(0, maxDownloadSizeBytes) : bytes);
}
/**
 * Download the bytes at the object's location.
 * @returns A Promise containing the downloaded blob.
 */ function getBlobInternal(ref, maxDownloadSizeBytes) {
    ref._throwIfRoot('getBlob');
    const requestInfo = getBytes$1(ref.storage, ref._location, maxDownloadSizeBytes);
    return ref.storage.makeRequestWithTokens(requestInfo, newBlobConnection).then((blob)=>maxDownloadSizeBytes !== undefined ? blob.slice(0, maxDownloadSizeBytes) : blob);
}
/**
 * Uploads data to this object's location.
 * The upload is not resumable.
 *
 * @param ref - StorageReference where data should be uploaded.
 * @param data - The data to upload.
 * @param metadata - Metadata for the newly uploaded data.
 * @returns A Promise containing an UploadResult
 */ function uploadBytes$1(ref, data, metadata) {
    ref._throwIfRoot('uploadBytes');
    const requestInfo = multipartUpload(ref.storage, ref._location, getMappings(), new FbsBlob(data, true), metadata);
    return ref.storage.makeRequestWithTokens(requestInfo, newTextConnection).then((finalMetadata)=>{
        return {
            metadata: finalMetadata,
            ref
        };
    });
}
/**
 * Uploads data to this object's location.
 * The upload can be paused and resumed, and exposes progress updates.
 * @public
 * @param ref - StorageReference where data should be uploaded.
 * @param data - The data to upload.
 * @param metadata - Metadata for the newly uploaded data.
 * @returns An UploadTask
 */ function uploadBytesResumable$1(ref, data, metadata) {
    ref._throwIfRoot('uploadBytesResumable');
    return new UploadTask(ref, new FbsBlob(data), metadata);
}
/**
 * Uploads a string to this object's location.
 * The upload is not resumable.
 * @public
 * @param ref - StorageReference where string should be uploaded.
 * @param value - The string to upload.
 * @param format - The format of the string to upload.
 * @param metadata - Metadata for the newly uploaded string.
 * @returns A Promise containing an UploadResult
 */ function uploadString$1(ref, value, format = StringFormat.RAW, metadata) {
    ref._throwIfRoot('uploadString');
    const data = dataFromString(format, value);
    const metadataClone = Object.assign({}, metadata);
    if (metadataClone['contentType'] == null && data.contentType != null) metadataClone['contentType'] = data.contentType;
    return uploadBytes$1(ref, data.data, metadataClone);
}
/**
 * List all items (files) and prefixes (folders) under this storage reference.
 *
 * This is a helper method for calling list() repeatedly until there are
 * no more results. The default pagination size is 1000.
 *
 * Note: The results may not be consistent if objects are changed while this
 * operation is running.
 *
 * Warning: listAll may potentially consume too many resources if there are
 * too many results.
 * @public
 * @param ref - StorageReference to get list from.
 *
 * @returns A Promise that resolves with all the items and prefixes under
 *      the current storage reference. `prefixes` contains references to
 *      sub-directories and `items` contains references to objects in this
 *      folder. `nextPageToken` is never returned.
 */ function listAll$1(ref) {
    const accumulator = {
        prefixes: [],
        items: []
    };
    return listAllHelper(ref, accumulator).then(()=>accumulator);
}
/**
 * Separated from listAll because async functions can't use "arguments".
 * @param ref
 * @param accumulator
 * @param pageToken
 */ async function listAllHelper(ref, accumulator, pageToken) {
    const opt = {
        // maxResults is 1000 by default.
        pageToken
    };
    const nextPage = await list$1(ref, opt);
    accumulator.prefixes.push(...nextPage.prefixes);
    accumulator.items.push(...nextPage.items);
    if (nextPage.nextPageToken != null) await listAllHelper(ref, accumulator, nextPage.nextPageToken);
}
/**
 * List items (files) and prefixes (folders) under this storage reference.
 *
 * List API is only available for Firebase Rules Version 2.
 *
 * GCS is a key-blob store. Firebase Storage imposes the semantic of '/'
 * delimited folder structure.
 * Refer to GCS's List API if you want to learn more.
 *
 * To adhere to Firebase Rules's Semantics, Firebase Storage does not
 * support objects whose paths end with "/" or contain two consecutive
 * "/"s. Firebase Storage List API will filter these unsupported objects.
 * list() may fail if there are too many unsupported objects in the bucket.
 * @public
 *
 * @param ref - StorageReference to get list from.
 * @param options - See ListOptions for details.
 * @returns A Promise that resolves with the items and prefixes.
 *      `prefixes` contains references to sub-folders and `items`
 *      contains references to objects in this folder. `nextPageToken`
 *      can be used to get the rest of the results.
 */ function list$1(ref, options) {
    if (options != null) {
        if (typeof options.maxResults === 'number') validateNumber('options.maxResults', /* minValue= */ 1, /* maxValue= */ 1000, options.maxResults);
    }
    const op = options || {};
    const requestInfo = list$2(ref.storage, ref._location, /*delimiter= */ '/', op.pageToken, op.maxResults);
    return ref.storage.makeRequestWithTokens(requestInfo, newTextConnection);
}
/**
 * A `Promise` that resolves with the metadata for this object. If this
 * object doesn't exist or metadata cannot be retrieved, the promise is
 * rejected.
 * @public
 * @param ref - StorageReference to get metadata from.
 */ function getMetadata$1(ref) {
    ref._throwIfRoot('getMetadata');
    const requestInfo = getMetadata$2(ref.storage, ref._location, getMappings());
    return ref.storage.makeRequestWithTokens(requestInfo, newTextConnection);
}
/**
 * Updates the metadata for this object.
 * @public
 * @param ref - StorageReference to update metadata for.
 * @param metadata - The new metadata for the object.
 *     Only values that have been explicitly set will be changed. Explicitly
 *     setting a value to null will remove the metadata.
 * @returns A `Promise` that resolves
 *     with the new metadata for this object.
 *     See `firebaseStorage.Reference.prototype.getMetadata`
 */ function updateMetadata$1(ref, metadata) {
    ref._throwIfRoot('updateMetadata');
    const requestInfo = updateMetadata$2(ref.storage, ref._location, metadata, getMappings());
    return ref.storage.makeRequestWithTokens(requestInfo, newTextConnection);
}
/**
 * Returns the download URL for the given Reference.
 * @public
 * @returns A `Promise` that resolves with the download
 *     URL for this object.
 */ function getDownloadURL$1(ref) {
    ref._throwIfRoot('getDownloadURL');
    const requestInfo = getDownloadUrl(ref.storage, ref._location, getMappings());
    return ref.storage.makeRequestWithTokens(requestInfo, newTextConnection).then((url)=>{
        if (url === null) throw noDownloadURL();
        return url;
    });
}
/**
 * Deletes the object at this location.
 * @public
 * @param ref - StorageReference for object to delete.
 * @returns A `Promise` that resolves if the deletion succeeds.
 */ function deleteObject$1(ref) {
    ref._throwIfRoot('deleteObject');
    const requestInfo = deleteObject$2(ref.storage, ref._location);
    return ref.storage.makeRequestWithTokens(requestInfo, newTextConnection);
}
/**
 * Returns reference for object obtained by appending `childPath` to `ref`.
 *
 * @param ref - StorageReference to get child of.
 * @param childPath - Child path from provided ref.
 * @returns A reference to the object obtained by
 * appending childPath, removing any duplicate, beginning, or trailing
 * slashes.
 *
 */ function _getChild$1(ref, childPath) {
    const newPath = child(ref._location.path, childPath);
    const location = new Location(ref._location.bucket, newPath);
    return new Reference(ref.storage, location);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function isUrl(path) {
    return /^[A-Za-z]+:\/\//.test(path);
}
/**
 * Returns a firebaseStorage.Reference for the given url.
 */ function refFromURL(service, url) {
    return new Reference(service, url);
}
/**
 * Returns a firebaseStorage.Reference for the given path in the default
 * bucket.
 */ function refFromPath(ref, path) {
    if (ref instanceof FirebaseStorageImpl) {
        const service = ref;
        if (service._bucket == null) throw noDefaultBucket();
        const reference = new Reference(service, service._bucket);
        if (path != null) return refFromPath(reference, path);
        else return reference;
    } else {
        // ref is a Reference
        if (path !== undefined) return _getChild$1(ref, path);
        else return ref;
    }
}
function ref$1(serviceOrRef, pathOrUrl) {
    if (pathOrUrl && isUrl(pathOrUrl)) {
        if (serviceOrRef instanceof FirebaseStorageImpl) return refFromURL(serviceOrRef, pathOrUrl);
        else throw invalidArgument('To use ref(service, url), the first argument must be a Storage instance.');
    } else return refFromPath(serviceOrRef, pathOrUrl);
}
function extractBucket(host, config) {
    const bucketString = config === null || config === void 0 ? void 0 : config[CONFIG_STORAGE_BUCKET_KEY];
    if (bucketString == null) return null;
    return Location.makeFromBucketSpec(bucketString, host);
}
function connectStorageEmulator$1(storage, host, port, options = {}) {
    storage.host = `${host}:${port}`;
    storage._protocol = 'http';
    const { mockUserToken } = options;
    if (mockUserToken) storage._overrideAuthToken = typeof mockUserToken === 'string' ? mockUserToken : (0, _util.createMockUserToken)(mockUserToken, storage.app.options.projectId);
}
/**
 * A service that provides Firebase Storage Reference instances.
 * @param opt_url - gs:// url to a custom Storage Bucket
 *
 * @internal
 */ class FirebaseStorageImpl {
    constructor(/**
     * FirebaseApp associated with this StorageService instance.
     */ app, _authProvider, /**
     * @internal
     */ _appCheckProvider, /**
     * @internal
     */ _url, _firebaseVersion){
        this.app = app;
        this._authProvider = _authProvider;
        this._appCheckProvider = _appCheckProvider;
        this._url = _url;
        this._firebaseVersion = _firebaseVersion;
        this._bucket = null;
        /**
         * This string can be in the formats:
         * - host
         * - host:port
         */ this._host = DEFAULT_HOST;
        this._protocol = 'https';
        this._appId = null;
        this._deleted = false;
        this._maxOperationRetryTime = DEFAULT_MAX_OPERATION_RETRY_TIME;
        this._maxUploadRetryTime = DEFAULT_MAX_UPLOAD_RETRY_TIME;
        this._requests = new Set();
        if (_url != null) this._bucket = Location.makeFromBucketSpec(_url, this._host);
        else this._bucket = extractBucket(this._host, this.app.options);
    }
    /**
     * The host string for this service, in the form of `host` or
     * `host:port`.
     */ get host() {
        return this._host;
    }
    set host(host) {
        this._host = host;
        if (this._url != null) this._bucket = Location.makeFromBucketSpec(this._url, host);
        else this._bucket = extractBucket(host, this.app.options);
    }
    /**
     * The maximum time to retry uploads in milliseconds.
     */ get maxUploadRetryTime() {
        return this._maxUploadRetryTime;
    }
    set maxUploadRetryTime(time) {
        validateNumber('time', /* minValue=*/ 0, /* maxValue= */ Number.POSITIVE_INFINITY, time);
        this._maxUploadRetryTime = time;
    }
    /**
     * The maximum time to retry operations other than uploads or downloads in
     * milliseconds.
     */ get maxOperationRetryTime() {
        return this._maxOperationRetryTime;
    }
    set maxOperationRetryTime(time) {
        validateNumber('time', /* minValue=*/ 0, /* maxValue= */ Number.POSITIVE_INFINITY, time);
        this._maxOperationRetryTime = time;
    }
    async _getAuthToken() {
        if (this._overrideAuthToken) return this._overrideAuthToken;
        const auth = this._authProvider.getImmediate({
            optional: true
        });
        if (auth) {
            const tokenData = await auth.getToken();
            if (tokenData !== null) return tokenData.accessToken;
        }
        return null;
    }
    async _getAppCheckToken() {
        if ((0, _app._isFirebaseServerApp)(this.app) && this.app.settings.appCheckToken) return this.app.settings.appCheckToken;
        const appCheck = this._appCheckProvider.getImmediate({
            optional: true
        });
        if (appCheck) {
            const result = await appCheck.getToken();
            // TODO: What do we want to do if there is an error getting the token?
            // Context: appCheck.getToken() will never throw even if an error happened. In the error case, a dummy token will be
            // returned along with an error field describing the error. In general, we shouldn't care about the error condition and just use
            // the token (actual or dummy) to send requests.
            return result.token;
        }
        return null;
    }
    /**
     * Stop running requests and prevent more from being created.
     */ _delete() {
        if (!this._deleted) {
            this._deleted = true;
            this._requests.forEach((request)=>request.cancel());
            this._requests.clear();
        }
        return Promise.resolve();
    }
    /**
     * Returns a new firebaseStorage.Reference object referencing this StorageService
     * at the given Location.
     */ _makeStorageReference(loc) {
        return new Reference(this, loc);
    }
    /**
     * @param requestInfo - HTTP RequestInfo object
     * @param authToken - Firebase auth token
     */ _makeRequest(requestInfo, requestFactory, authToken, appCheckToken, retry = true) {
        if (!this._deleted) {
            const request = makeRequest(requestInfo, this._appId, authToken, appCheckToken, requestFactory, this._firebaseVersion, retry);
            this._requests.add(request);
            // Request removes itself from set when complete.
            request.getPromise().then(()=>this._requests.delete(request), ()=>this._requests.delete(request));
            return request;
        } else return new FailRequest(appDeleted());
    }
    async makeRequestWithTokens(requestInfo, requestFactory) {
        const [authToken, appCheckToken] = await Promise.all([
            this._getAuthToken(),
            this._getAppCheckToken()
        ]);
        return this._makeRequest(requestInfo, requestFactory, authToken, appCheckToken).getPromise();
    }
}
const name = "@firebase/storage";
const version = "0.13.7";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Type constant for Firebase Storage.
 */ const STORAGE_TYPE = 'storage';
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Downloads the data at the object's location. Returns an error if the object
 * is not found.
 *
 * To use this functionality, you have to whitelist your app's origin in your
 * Cloud Storage bucket. See also
 * https://cloud.google.com/storage/docs/configuring-cors
 *
 * @public
 * @param ref - StorageReference where data should be downloaded.
 * @param maxDownloadSizeBytes - If set, the maximum allowed size in bytes to
 * retrieve.
 * @returns A Promise containing the object's bytes
 */ function getBytes(ref, maxDownloadSizeBytes) {
    ref = (0, _util.getModularInstance)(ref);
    return getBytesInternal(ref, maxDownloadSizeBytes);
}
/**
 * Uploads data to this object's location.
 * The upload is not resumable.
 * @public
 * @param ref - {@link StorageReference} where data should be uploaded.
 * @param data - The data to upload.
 * @param metadata - Metadata for the data to upload.
 * @returns A Promise containing an UploadResult
 */ function uploadBytes(ref, data, metadata) {
    ref = (0, _util.getModularInstance)(ref);
    return uploadBytes$1(ref, data, metadata);
}
/**
 * Uploads a string to this object's location.
 * The upload is not resumable.
 * @public
 * @param ref - {@link StorageReference} where string should be uploaded.
 * @param value - The string to upload.
 * @param format - The format of the string to upload.
 * @param metadata - Metadata for the string to upload.
 * @returns A Promise containing an UploadResult
 */ function uploadString(ref, value, format, metadata) {
    ref = (0, _util.getModularInstance)(ref);
    return uploadString$1(ref, value, format, metadata);
}
/**
 * Uploads data to this object's location.
 * The upload can be paused and resumed, and exposes progress updates.
 * @public
 * @param ref - {@link StorageReference} where data should be uploaded.
 * @param data - The data to upload.
 * @param metadata - Metadata for the data to upload.
 * @returns An UploadTask
 */ function uploadBytesResumable(ref, data, metadata) {
    ref = (0, _util.getModularInstance)(ref);
    return uploadBytesResumable$1(ref, data, metadata);
}
/**
 * A `Promise` that resolves with the metadata for this object. If this
 * object doesn't exist or metadata cannot be retrieved, the promise is
 * rejected.
 * @public
 * @param ref - {@link StorageReference} to get metadata from.
 */ function getMetadata(ref) {
    ref = (0, _util.getModularInstance)(ref);
    return getMetadata$1(ref);
}
/**
 * Updates the metadata for this object.
 * @public
 * @param ref - {@link StorageReference} to update metadata for.
 * @param metadata - The new metadata for the object.
 *     Only values that have been explicitly set will be changed. Explicitly
 *     setting a value to null will remove the metadata.
 * @returns A `Promise` that resolves with the new metadata for this object.
 */ function updateMetadata(ref, metadata) {
    ref = (0, _util.getModularInstance)(ref);
    return updateMetadata$1(ref, metadata);
}
/**
 * List items (files) and prefixes (folders) under this storage reference.
 *
 * List API is only available for Firebase Rules Version 2.
 *
 * GCS is a key-blob store. Firebase Storage imposes the semantic of '/'
 * delimited folder structure.
 * Refer to GCS's List API if you want to learn more.
 *
 * To adhere to Firebase Rules's Semantics, Firebase Storage does not
 * support objects whose paths end with "/" or contain two consecutive
 * "/"s. Firebase Storage List API will filter these unsupported objects.
 * list() may fail if there are too many unsupported objects in the bucket.
 * @public
 *
 * @param ref - {@link StorageReference} to get list from.
 * @param options - See {@link ListOptions} for details.
 * @returns A `Promise` that resolves with the items and prefixes.
 *      `prefixes` contains references to sub-folders and `items`
 *      contains references to objects in this folder. `nextPageToken`
 *      can be used to get the rest of the results.
 */ function list(ref, options) {
    ref = (0, _util.getModularInstance)(ref);
    return list$1(ref, options);
}
/**
 * List all items (files) and prefixes (folders) under this storage reference.
 *
 * This is a helper method for calling list() repeatedly until there are
 * no more results. The default pagination size is 1000.
 *
 * Note: The results may not be consistent if objects are changed while this
 * operation is running.
 *
 * Warning: `listAll` may potentially consume too many resources if there are
 * too many results.
 * @public
 * @param ref - {@link StorageReference} to get list from.
 *
 * @returns A `Promise` that resolves with all the items and prefixes under
 *      the current storage reference. `prefixes` contains references to
 *      sub-directories and `items` contains references to objects in this
 *      folder. `nextPageToken` is never returned.
 */ function listAll(ref) {
    ref = (0, _util.getModularInstance)(ref);
    return listAll$1(ref);
}
/**
 * Returns the download URL for the given {@link StorageReference}.
 * @public
 * @param ref - {@link StorageReference} to get the download URL for.
 * @returns A `Promise` that resolves with the download
 *     URL for this object.
 */ function getDownloadURL(ref) {
    ref = (0, _util.getModularInstance)(ref);
    return getDownloadURL$1(ref);
}
/**
 * Deletes the object at this location.
 * @public
 * @param ref - {@link StorageReference} for object to delete.
 * @returns A `Promise` that resolves if the deletion succeeds.
 */ function deleteObject(ref) {
    ref = (0, _util.getModularInstance)(ref);
    return deleteObject$1(ref);
}
function ref(serviceOrRef, pathOrUrl) {
    serviceOrRef = (0, _util.getModularInstance)(serviceOrRef);
    return ref$1(serviceOrRef, pathOrUrl);
}
/**
 * @internal
 */ function _getChild(ref, childPath) {
    return _getChild$1(ref, childPath);
}
/**
 * Gets a {@link FirebaseStorage} instance for the given Firebase app.
 * @public
 * @param app - Firebase app to get {@link FirebaseStorage} instance for.
 * @param bucketUrl - The gs:// url to your Firebase Storage Bucket.
 * If not passed, uses the app's default Storage Bucket.
 * @returns A {@link FirebaseStorage} instance.
 */ function getStorage(app = (0, _app.getApp)(), bucketUrl) {
    app = (0, _util.getModularInstance)(app);
    const storageProvider = (0, _app._getProvider)(app, STORAGE_TYPE);
    const storageInstance = storageProvider.getImmediate({
        identifier: bucketUrl
    });
    const emulator = (0, _util.getDefaultEmulatorHostnameAndPort)('storage');
    if (emulator) connectStorageEmulator(storageInstance, ...emulator);
    return storageInstance;
}
/**
 * Modify this {@link FirebaseStorage} instance to communicate with the Cloud Storage emulator.
 *
 * @param storage - The {@link FirebaseStorage} instance
 * @param host - The emulator host (ex: localhost)
 * @param port - The emulator port (ex: 5001)
 * @param options - Emulator options. `options.mockUserToken` is the mock auth
 * token to use for unit testing Security Rules.
 * @public
 */ function connectStorageEmulator(storage, host, port, options = {}) {
    connectStorageEmulator$1(storage, host, port, options);
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Downloads the data at the object's location. Returns an error if the object
 * is not found.
 *
 * To use this functionality, you have to whitelist your app's origin in your
 * Cloud Storage bucket. See also
 * https://cloud.google.com/storage/docs/configuring-cors
 *
 * This API is not available in Node.
 *
 * @public
 * @param ref - StorageReference where data should be downloaded.
 * @param maxDownloadSizeBytes - If set, the maximum allowed size in bytes to
 * retrieve.
 * @returns A Promise that resolves with a Blob containing the object's bytes
 */ function getBlob(ref, maxDownloadSizeBytes) {
    ref = (0, _util.getModularInstance)(ref);
    return getBlobInternal(ref, maxDownloadSizeBytes);
}
/**
 * Downloads the data at the object's location. Raises an error event if the
 * object is not found.
 *
 * This API is only available in Node.
 *
 * @public
 * @param ref - StorageReference where data should be downloaded.
 * @param maxDownloadSizeBytes - If set, the maximum allowed size in bytes to
 * retrieve.
 * @returns A stream with the object's data as bytes
 */ function getStream(ref, maxDownloadSizeBytes) {
    throw new Error('getStream() is only supported by NodeJS builds');
}
/**
 * Cloud Storage for Firebase
 *
 * @packageDocumentation
 */ function factory(container, { instanceIdentifier: url }) {
    const app = container.getProvider('app').getImmediate();
    const authProvider = container.getProvider('auth-internal');
    const appCheckProvider = container.getProvider('app-check-internal');
    return new FirebaseStorageImpl(app, authProvider, appCheckProvider, url, (0, _app.SDK_VERSION));
}
function registerStorage() {
    (0, _app._registerComponent)(new (0, _component.Component)(STORAGE_TYPE, factory, "PUBLIC" /* ComponentType.PUBLIC */ ).setMultipleInstances(true));
    //RUNTIME_ENV will be replaced during the compilation to "node" for nodejs and an empty string for browser
    (0, _app.registerVersion)(name, version, '');
    // BUILD_TARGET will be replaced by values like esm2017, cjs2017, etc during the compilation
    (0, _app.registerVersion)(name, version, 'esm2017');
}
registerStorage();

},{"@firebase/app":"hLmie","@firebase/util":"5D2HR","@firebase/component":"llS6a","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}]},["anQhF","cgraJ"], "cgraJ", "parcelRequire94c2")

//# sourceMappingURL=notifications.33eb0e64.js.map
