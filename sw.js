/* 이시가키 항해도 — 오프라인 캐시
   현지에서 데이터가 없어도 열리게 합니다.
   내용을 고쳐서 다시 올릴 때는 아래 VERSION 숫자만 올리세요. */

var VERSION = "v2";
var SHELL = "isg-shell-" + VERSION;
var RUNTIME = "isg-runtime-" + VERSION;

var PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(SHELL).then(function(c){
      /* 하나가 실패해도 설치는 계속되게 개별로 담습니다 */
      return Promise.all(PRECACHE.map(function(u){
        return c.add(new Request(u, {cache:"reload"})).catch(function(){});
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if (k !== SHELL && k !== RUNTIME) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET") return;

  /* 페이지 이동: 네트워크를 먼저 보되, 안 되면 캐시된 앱을 띄웁니다 */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(function(res){
        var copy = res.clone();
        caches.open(SHELL).then(function(c){ c.put("./index.html", copy); });
        return res;
      }).catch(function(){
        return caches.match("./index.html").then(function(hit){
          return hit || caches.match("./");
        });
      })
    );
    return;
  }

  /* 나머지(폰트 포함): 캐시 우선, 없으면 받아서 캐시 */
  e.respondWith(
    caches.match(req).then(function(hit){
      if (hit) return hit;
      return fetch(req).then(function(res){
        if (res && (res.ok || res.type === "opaque")) {
          var copy = res.clone();
          caches.open(RUNTIME).then(function(c){ c.put(req, copy); });
        }
        return res;
      }).catch(function(){ return hit; });
    })
  );
});
