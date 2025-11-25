// import agent from "../agent/index.js";

// export default {
//   async fetch(request, env) {
//     const url = new URL(request.url);

//     if (url.pathname === "/api/armonia/lyrics") {
//       const { style, theme } = await request.json();
//       const result = await agent.run("armonia.generateLyrics", { style, theme }, { env });
//       return Response.json({ lyrics: result });
//     }

//     if (url.pathname === "/api/armonia/help") {
//       const { question } = await request.json();
//       const result = await agent.run("armonia.help", { question }, { env });
//       return Response.json({ reply: result });
//     }

//     return new Response("Invalid route", { status: 404 });
//   }
// };

async function loadMemory(env, sessionId) {
  const id = env.MEMORY.idFromName(sessionId);
  const stub = env.MEMORY.get(id);
  const res = await stub.fetch("https://memory/load");
  const data = await res.json();
  return data.memory || [];
}

async function saveMemory(env, sessionId, memory) {
  const id = env.MEMORY.idFromName(sessionId);
  const stub = env.MEMORY.get(id);
  await stub.fetch("https://memory/save", {
    method: "POST",
    body: JSON.stringify({ memory })
  });
}

export default async function armonia(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // simple global session for now (could be extended)
  const sessionId = "global";

  if (path === "/api/chat") {
    const { message } = await request.json();

    // load memory
    const memory = await loadMemory(env, sessionId);

    const messages = [
      { role: "system", content: "You are Armonia AI, an assistant that helps users write lyrics, name tracks, and use the Armonia DAW. Be concise and practical." },
      ...memory,
      { role: "user", content: message }
    ];

    const response = await env.AI.run(
      "@cf/meta/llama-3.3-70b-instruct",
      { messages }
    );

    const reply = response.response;

    const updatedMemory = [
      ...memory,
      { role: "user", content: message },
      { role: "assistant", content: reply }
    ];

    await saveMemory(env, sessionId, updatedMemory);

    return Response.json({ reply });
  }

  if (path === "/api/armonia/lyrics") {
    const { style, theme } = await request.json();
    const prompt = `Write song lyrics in the style of ${style}. Theme: ${theme}. Include verses and a chorus.`;

    const response = await env.AI.run(
      "@cf/meta/llama-3.3-70b-instruct",
      {
        messages: [
          { role: "system", content: "You are a thoughtful lyricist helping a musician." },
          { role: "user", content: prompt }
        ]
      }
    );

    return Response.json({ lyrics: response.response });
  }

  if (path === "/api/armonia/help") {
    const { question } = await request.json();
    const prompt = `The user is working in a DAW called Armonia (similar to other DAWs). Help them with this question in a clear, step-by-step way: ${question}`;

    const response = await env.AI.run(
      "@cf/meta/llama-3.3-70b-instruct",
      {
        messages: [
          { role: "system", content: "You explain DAW concepts simply and clearly." },
          { role: "user", content: prompt }
        ]
      }
    );

    return Response.json({ reply: response.response });
  }

  // Serve UI root hint
  // if (path === "/" || path === "/ui") {
  //   return new Response(
  //     `UI is at /ui/index.html`,
  //     { status: 200, headers: { "content-type": "text/plain" } }
  //   );
  // }

  return new Response("Not found", { status: 404 });
}

