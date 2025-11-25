const API_BASE = "https://cf_ai_armonia.adam-kimmins23.workers.dev";

document.getElementById("send").onclick = async () => {
    const prompt = document.getElementById("prompt").value.trim();
    if (!prompt) return;

    document.getElementById("response").innerText = "Loading...";

    const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
    });

    const data = await res.json();
    document.getElementById("response").innerText = data.reply;
}
