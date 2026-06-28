/**
 * push.js — Web Push subscription helper.
 * Call setupPush() once after login (NotificationBell does this on mount).
 * Silently no-ops in browsers without push support (e.g. older Safari) or
 * if the user declines the permission prompt — never throws.
 */
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function setupPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return; // browser doesn't support push — nothing to do
  }

  const token = localStorage.getItem("wc4a_token");
  if (!token) return;

  try {
    const reg = await navigator.serviceWorker.register("/sw.js");

    const existing = await reg.pushManager.getSubscription();
    if (existing) return; // already subscribed on this browser

    if (Notification.permission === "denied") return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const keyRes  = await fetch(`${API}/notifications/push/public-key`);
    const keyJson = await keyRes.json();
    if (!keyJson.public_key) return; // VAPID not configured server-side yet

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyJson.public_key),
    });

    await fetch(`${API}/notifications/push/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64Url(subscription.getKey("p256dh")),
          auth:   arrayBufferToBase64Url(subscription.getKey("auth")),
        },
      }),
    });
  } catch (e) {
    console.warn("Push setup skipped:", e);
  }
}

function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return window.btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
