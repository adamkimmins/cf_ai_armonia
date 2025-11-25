# cf_ai_armonia

A Cloudflare application using:
- Workers AI (Llama 3.3)

## Overview  
cf_ai_armonia is an AI-powered assistant designed to support musicians using **Armonia**, a DAW-style application.

This project demonstrates:

- Long-term memory using Durable Objects
- User input via a simple chat UI (Pages)
- Armonia integration through a clean REST API

The project is structured to be fully standalone, and any application can communicate with this AI through HTTP.

This project comes from Cloudflare, which is reasoning for `cf_ai_` 

---

## Features

### Memory  
Conversation stored using Durable Objects.

### REST API  
Endpoints:

```
POST /api/chat  
POST /api/armonia/lyrics  
POST /api/armonia/help  
```

### UI  
Simple HTML/JS chat interface to test the AI.

---

## File Structure

```
cf_ai_armonia/
|
|-- agent/              # Cloudflare Agent
|   |-- index.js
|   |-- actions.js
|   |-- memory.js
|
|-- api/
|   |-- index.js          # Base chat endpoint
|   |-- armonia.js        # Armonia-specific endpoints
|
|-- ui/
|   |-- index.html
|   |-- script.js
|   |-- style.css
|
|-- example/
|   |-- ArmoniaClient.cs     # Armonia integration example
|
|-- wrangler.toml
|-- package.json
|-- README.md
|-- PROMPTS.md
```

---

## Setup Instructions

### **1. Install Wrangler**
```
npm install -g wrangler
```

### **2. Authenticate**
```
wrangler login
```

### **3. Install dependencies**
```
npm install
```

### **4. Run local**
```
wrangler dev
```

### **5. Deploy**
```
wrangler publish
```

Your API will deploy at:

```
https://<your-worker>.workers.dev
```

---

## API Reference

### **POST /api/chat**
General conversation.

Request:
```json
{ "message": "Write lyrics about a dirt mound in Ohio." }
```

Response:
```json
{ "reply": "..." }
```

---

### **POST /api/armonia/lyrics**
Generate lyrics based on theme/style.

```json
{
  "style": "folk, indie",
  "theme": "ohio hills"
}
```

---

### **POST /api/armonia/help**
Ask for help with Armonia features.

```json
{ "question": "How do I add a track?" }
```

---

## 🧩 Armonia Integration (C#)

See `example/ArmoniaClient.cs`.

---

## 📄 PROMPTS.md
See included file with all AI-assisted coding prompts.

---

## 📝 License
MIT
