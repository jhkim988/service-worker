import { precacheAndRoute } from "workbox-precaching";
import { request } from "./echo-test";

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("register", (event) => {
  console.log("register", event);
});

self.addEventListener("install", (event) => {
  console.log("install", event);
});

self.addEventListener("activate", (event) => {
  console.log("activate", event);
});

self.addEventListener("updatefound", (event) => {
  console.log("updatefound", event);
});

self.addEventListener("sync", (event) => {
  console.log("sync", event);
});

self.addEventListener("push", (event) => {
  console.log("push", event);
});

let i = 0;
self.addEventListener("periodicsync", (event) => {
  console.log("periodicsync", event);
  event.waitUntil(
    request(i++)
      .then((res) => res.json())
      .then(console.log)
  );
});
