import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    const newPath = url.pathname.slice(0, -1);
    return context.redirect(newPath + url.search, 301);
  }
  return next();
});
