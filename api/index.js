import armonia from "./armonia.js";
export { MemoryDO } from "../durable/memory.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API routes
    if (url.pathname.startsWith("/api/")) {
      return armonia(request, env);
    }

    // Fallback: redirect to your Pages UI (replace URL once deployed)
    return Response.redirect(
      "https://aiarmonia.adam-kimmins23.workers.dev",
      302
    );
  }
};
