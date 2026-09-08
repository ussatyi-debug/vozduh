/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "screenshot-mobile.png",
    "revision": "bbb77850036d400ef3d299cc3f8f9707"
  }, {
    "url": "screenshot-desktop.png",
    "revision": "7e949091a2fdb0cb90787e48374ba782"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "e737d4a6e8e128ff86adfcf262d522eb"
  }, {
    "url": "pwa-512x512.png",
    "revision": "a740187aa9f58ac0d835af46d0874ae3"
  }, {
    "url": "pwa-192x192.png",
    "revision": "a66413857be67b02114afd29908a8abe"
  }, {
    "url": "manifest.json",
    "revision": "eb879f4c0de7f89eb1e0a06364fc7591"
  }, {
    "url": "index.html",
    "revision": "62670c50d573dd3660615f6cf8062e97"
  }, {
    "url": "icon.svg",
    "revision": "00fbcb3ef001ebc519cd1360610d0a74"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "d3e285434bd2636f81825e1650d035e1"
  }, {
    "url": "assets/workbox-window.prod.es5-BBnX5xw4.js",
    "revision": null
  }, {
    "url": "assets/index-w8ol19xs.js",
    "revision": null
  }, {
    "url": "assets/index-ebxjetCb.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "d3e285434bd2636f81825e1650d035e1"
  }, {
    "url": "icon.svg",
    "revision": "00fbcb3ef001ebc519cd1360610d0a74"
  }, {
    "url": "manifest.json",
    "revision": "eb879f4c0de7f89eb1e0a06364fc7591"
  }, {
    "url": "pwa-192x192.png",
    "revision": "a66413857be67b02114afd29908a8abe"
  }, {
    "url": "pwa-512x512.png",
    "revision": "a740187aa9f58ac0d835af46d0874ae3"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "e737d4a6e8e128ff86adfcf262d522eb"
  }, {
    "url": "manifest.webmanifest",
    "revision": "d806a1bf95f53d91cee3d221141531a2"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("/index.html")));

}));
