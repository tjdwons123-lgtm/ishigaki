/* 이시가키 항해도 — 오프라인 캐시
   현지에서 데이터가 없어도 열리게 합니다.
   내용을 고쳐서 다시 올릴 때는 아래 VERSION 숫자만 올리세요. */

var VERSION = "v27";
var SHELL = "isg-shell-" + VERSION;
var RUNTIME = "isg-runtime-" + VERSION;

var PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./review/",
  "./review/index.html"
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

  /* 페이지 이동: 네트워크를 먼저 보되, 안 되면 그 주소의 캐시를 띄웁니다.
     메인과 검수 페이지가 서로 다른 주소라 반드시 요청별로 저장해야 합니다. */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(function(res){
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(SHELL).then(function(c){ c.put(req, copy); });
        }
        return res;
      }).catch(function(){
        return caches.match(req).then(function(hit){
          if (hit) return hit;
          /* 처음 보는 주소면 메인 앱이라도 띄웁니다 */
          return caches.match("./index.html").then(function(x){ return x || caches.match("./"); });
        });
      })
    );
    return;
  }

  /* 날씨 예보는 절대 캐시를 먼저 주면 안 됩니다 — 매번 새로 받아야 갱신됩니다.
     인터넷이 없을 때만 마지막으로 받아둔 응답을 돌려줍니다. */
  if (req.url.indexOf("api.open-meteo.com") !== -1) {
    e.respondWith(
      fetch(req).then(function(res){
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(RUNTIME).then(function(c){ c.put(req, copy); });
        }
        return res;
      }).catch(function(){ return caches.match(req); })
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
