/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
// I'm gonna keep this welcome for vibes

import armoniaProtocol from "./prompts/armonia_protocol.txt";
import helpPrompt from "./prompts/help_mode.txt";
import writingPrompt from "./prompts/writing_mode.txt";
import thesaurusPrompt from "./prompts/thesaurus_mode.txt";

const MODEL_ID = "@cf/meta/llama-3.1-8b-instruct";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ---------- HELP CHAT ----------

    if (url.pathname === "/chat" && request.method === "POST") {
      const { history, message } = await request.json();

      const system = applyTemplate(helpPrompt, {
        MODE: "Help"
      });

      const messages = [
        { role: "system", content: system },
        ...(history || []),
        { role: "user", content: message }
      ];

      const result = await env.AI.run(MODEL_ID, { messages });
      return json({ answer: extract(result) });
    }

    //TODO
    // ---------------- LYRIC GENERATOR ROUTE ----------------

    if (url.pathname === "/lyric" && request.method === "POST") {
      const data = await request.json();

      const system = applyTemplate(writingPrompt, {
        MODE: "Writing",
        DIALECT: data.dialect,
        GENRE: data.genres?.join(", "),
        TONE: data.tone,
        DICTION: data.diction
      });

      const messages = [
        { role: "system", content: system },
        { role: "user", content: data.message }
      ];

      const result = await env.AI.run(MODEL_ID, { messages });
      return json({ lyrics: extract(result) });
    }

    // ---------- THESAURUS ----------
    
    if (url.pathname === "/synonyms" && request.method === "POST") {
      const { lines } = await request.json();

      const system = applyTemplate(thesaurusPrompt, {
        MODE: "Thesaurus"
      });

      const input = lines.map((l,i) => `${i+1}. ${l}`).join("\n");

      const messages = [
        { role: "system", content: system },
        { role: "user", content: `Analyze synonyms by line:\n${input}` }
      ];

      const result = await env.AI.run(MODEL_ID, { messages });
      return json({ output: extract(result) });
    }


    // ---------- RHYME ENGINE ----------

    if (url.pathname === "/rhyme") {
      const { target, dialect, genres } = request.json();

      const system = armoniaProtocol
        .replace(/{{MODE}}/g, "RHYME_ENGINE")
        .replace(/{{TARGET}}/g, target)
        .replace(/{{DIALECT}}/g, dialect)
        .replace(/{{GENRE}}/g, genres.join(", "));

      const messages = [
        { role: "system", content: system },
        { role: "user", content: `Give me 5 true rhymes and 5 slant rhymes for "${target}". Include slang.` }
      ];

      const result = await env.AI.run(MODEL_ID, { messages });
      const output = extract(result);

      return Response.json({ rhymes: output });
    }

    return new Response("Not found", { status: 404 });
  }
};

function extract(result) {
  if (result?.response) return result.response;
  if (result?.output_text) return result.output_text;
  if (typeof result === "string") return result;
  return JSON.stringify(result);
}

function json(obj) {
  return new Response(JSON.stringify(obj), {
    headers: { "Content-Type": "application/json" }
  });
}

// Build System Prompt
//OLD
// function makeSystemPrompt(mode, attributes, template) {
//   return template
//     .replace("{{MODE}}", mode)
//     .replace("{{DIALECT}}", attributes.dialect || "Default")
//     .replace("{{GENRES}}", (attributes.genres || []).join(", "))
//     .replace("{{TONE}}", attributes.tone || "Neutral")
//     .replace("{{DICTION}}", attributes.diction || "Conversational")
// }
function applyTemplate(template, vars = {}) {
  return template
    .replace(/{{MODE}}/g, vars.MODE || "Help")
    .replace(/{{DIALECT}}/g, vars.DIALECT || "American (Default)")
    .replace(/{{GENRE}}/g, vars.GENRE || "None")
    .replace(/{{TONE}}/g, vars.TONE || "Neutral")
    .replace(/{{DICTION}}/g, vars.DICTION || "Conversational");
}