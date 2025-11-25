
// export class MemoryDO {
//   constructor(state, env) {
//     this.state = state;
//   }

//   async fetch(request) {
//     const url = new URL(request.url);

//     if (url.pathname.endsWith("/load")) {
//       const memory = await this.state.storage.get("memory") || [];
//       return Response.json({ memory });
//     }

//     if (url.pathname.endsWith("/save")) {
//       const body = await request.json();
//       await this.state.storage.put("memory", body.memory);
//       return new Response("saved");
//     }

//     return new Response("invalid durable object route");
//   }
// }
export class MemoryDO {
  constructor(state, env) {
    this.state = state;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.endsWith("/load")) {
      const memory = (await this.state.storage.get("memory")) || [];
      return Response.json({ memory });
    }

    if (url.pathname.endsWith("/save")) {
      const body = await request.json();
      await this.state.storage.put("memory", body.memory || []);
      return new Response("saved");
    }

    return new Response("Invalid DO route", { status: 404 });
  }
}
