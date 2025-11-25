// import armonia from "./armonia.js";
// export { MemoryDO } from "../durable/memory.js";

// export default {
//   async fetch(request, env) {
//     const url = new URL(request.url);

//     if (url.pathname.startsWith("/api/")) {
//       return armonia(request, env);
//     }

//     // Static UI files (Static Assets binding)
//     return env.ASSETS.fetch(request);
//   }
// };
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
      "https://cf-ai-armonia-ui.pages.dev/",
      302
    );
  }
};
