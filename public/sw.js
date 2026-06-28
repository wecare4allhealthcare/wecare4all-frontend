/**
 * sw.js — Web Push (unchanged from before) + offline app-shell caching
 * for installability (PWA).
 *
 * Served from /sw.js (Vite serves everything in /public at the root).
 * This is also what makes push notifications work even when the
 * browser tab isn't open: the browser keeps service workers
 * registered in the background, and the OS/browser's push service can
 * wake this file up to handle an incoming push, show a native
 * notification, and route a click back into the app.
 *
 * Caching strategy is deliberately narrow:
 *  - API calls (/api/...) are NEVER intercepted — this is a booking and
 *    payment platform; serving stale availability, payment status, or
 *    chat data from a cache would be actively harmful, not a convenience.
 *  - Navigation requests (loading a page) use network-first: always try
 *    the live network first so users get the current app, falling back
 *    to a cached shell only when genuinely offline.
 *  - Static assets (JS/CSS/images/fonts) use cache-first: Vite gives
 *    every build's JS/CSS files a new hashed filename, so a cached old
 *    bundle is never silently served as "current" — once a new deploy
 *    ships, the network-first index.html references new hashed URLs
 *    that simply aren't in any existing cache yet, so they're fetched
 *    fresh automatically without needing any manual cache-busting logic.
 */

const CACHE_NAME = "wc4a-shell-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((names) =>
        Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
      ),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // don't touch cross-origin (fonts CDN, Supabase, etc)
  if (url.pathname.startsWith("/api/")) return;     // never cache API responses — see note above

  if (request.mode === "navigate") {
    // Network-first for page loads
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  // Cache-first for static assets (JS/CSS/images/fonts) — see note above
  // on why stale hashed-filename bundles are a non-issue here.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy));
        }
        return res;
      });
    })
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "We Care 4 'all'", body: "You have a new notification.", link: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {
    // payload wasn't JSON — fall back to defaults above
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/assets/img/logo/logo-dark-small.png",
      badge: "/assets/img/logo/logo-dark-small.png",
      data: { link: data.link || "/" },
      tag: data.link || "wc4a-notification", // collapses repeats of the same link into one
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.link || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      // If a tab is already open, focus it and navigate there instead of
      // opening a duplicate tab.
      for (const client of clientsArr) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) client.navigate(targetUrl);
          return;
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
