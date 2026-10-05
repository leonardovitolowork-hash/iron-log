const CACHE = "iron-log-cache-graphite-mint-20261005-1";
const ASSETS = ["./", "./index.html", "./style.css", "./theme.css", "./app.js", "./manifest.json"];
self.addEventListener("install", event => {event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener("activate", event => {event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("iron-log-cache-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch", event => {
 const req=event.request,url=new URL(req.url);if(req.method!=="GET"||url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(req);if(response.ok)await cache.put(req,response.clone());return response;}catch(error){const cached=await cache.match(req);if(cached)return cached;if(req.mode==="navigate"){const page=await cache.match("./index.html");if(page)return page;}throw error;}})());
});
