/* -------------------------------------------------------
 *  ARMONIA STYLED LYRIC WRITER - FRONTEND LOGIC
 *  Features:
 *   - Dialect dropdown
 *   - Genre multiselect (0-2 genres)
 *   - Tone / Articulation / Tempo sliders -> labels
 *   - Sends to /lyric worker endpoint
 *   - Shows lyrics + basic status messages
 * -----------------------------------------------------*/

// Grab DOM elements
const dialectSelect = document.getElementById("dialect-select");
const dialectBox = document.getElementById("dialect-multiselect");
const dialectDisplay = document.getElementById("dialect-display");
const dialectDropdown = document.getElementById("dialect-dropdown");

const genreMultiselect = document.getElementById("genre-multiselect");
const genreDisplay = document.getElementById("genre-display");
const genreDropdown = document.getElementById("genre-dropdown");

const toneSlider = document.getElementById("tone-slider");
const dictionSlider = document.getElementById("diction-slider");
const tempoSlider = document.getElementById("tempo-slider");

const lyricInput = document.getElementById("lyric-input");
const lyricGenerateBtn = document.getElementById("lyric-generate");
const lyricOutput = document.getElementById("lyric-output");

// Defensive check
if (
  !dialectSelect ||
  !genreMultiselect ||
  !genreDisplay ||
  !genreDropdown ||
  !toneSlider ||
  !dictionSlider ||
  !lyricInput ||
  !lyricGenerateBtn ||
  !lyricOutput
) {
  console.error("[Armonia LyricAssistant] Missing expected DOM elements. Check IDs in index.html.");
}


/* -------------------------------------------------------
 *  DIALECT SINGLE-SELECT LOGIC
 * -----------------------------------------------------*/

let selectedDialect = [];

// open / close
dialectDisplay.addEventListener("click", () => {
  dialectDropdown.classList.toggle("hidden");
});

// select
dialectDropdown.querySelectorAll(".dialect-item").forEach(item => {
  item.addEventListener("click", () => {
    // remove old selection
    dialectDropdown.querySelectorAll(".dialect-item").forEach(i =>
      i.classList.remove("selected")
    );

    // mark new selection
    item.classList.add("selected");
    selectedDialect = item.textContent.trim();

    // update display
    dialectDisplay.textContent = selectedDialect;

    // close dropdown
    dialectDropdown.classList.add("hidden");
  });
});

// click outside -> close
document.addEventListener("click", e => {
  if (!dialectBox.contains(e.target)) {
    dialectDropdown.classList.add("hidden");
  }
});


/* -------------------------------------------------------
 *  GENRE MULTISELECT LOGIC
 * -----------------------------------------------------*/

// Current selected genres (0-2)
let selectedGenres = [];

// Toggle dropdown when clicking the display row
genreDisplay?.addEventListener("click", () => {
  genreDropdown.classList.toggle("hidden");
});

// Handle selecting/deselecting genre items
const genreItems = genreDropdown?.querySelectorAll(".item") || [];
genreItems.forEach((item) => {
  item.addEventListener("click", () => {
    const genre = item.textContent.trim();
    const already = selectedGenres.includes(genre);

    if (already) {
      // Deselect
      selectedGenres = selectedGenres.filter((g) => g !== genre);
      item.classList.remove("selected");
    } else if (selectedGenres.length < 2) {
      // Select if limit not reached
      selectedGenres.push(genre);
      item.classList.add("selected");
    }

    // If two genres selected, close automatically
    if (selectedGenres.length === 2) {
      closeGenreDropdown();
    }

    updateGenreDisplay();
  });
});

// Helper to close dropdown
function closeGenreDropdown() {
  genreDropdown.classList.add("hidden");
}

// Update display text based on selection
function updateGenreDisplay() {
  if (selectedGenres.length === 0) {
    genreDisplay.textContent = "Select Genre ▾";
  } else {
    genreDisplay.textContent = selectedGenres.join(", ");
  }
}

// Click outside dropdown to close it
document.addEventListener("click", (event) => {
  if (!genreMultiselect.contains(event.target)) {
    closeGenreDropdown();
  }
});

/* -------------------------------------------------------
 *  SLIDER -> LABEL MAPPING
 * -----------------------------------------------------*/

// Snap slider to nearest zone:
// 0-20, 21-40, 41-60, 61-80, 81-100
function snap(value) {
  const v = Number(value);
  if (v <= 12) return 0;
  if (v <= 37) return 25;
  if (v <= 62) return 50;
  if (v <= 87) return 75;
  return 100;
}

// Tone mapping
function mapTone(v) {
  if (v === 0) return "Sad";
  if (v === 25) return "Eerie";
  if (v === 50) return "Nostalgic";
  if (v === 75) return "Hopeful";
  return "Happy";
}

// Diction mapping
function mapDiction(v) {
  if (v === 0) return "Conversational";
  if (v === 25) return "Storytelling";
  if (v === 50) return "Intimate";
  if (v === 75) return "Poetic";
  return "Abstract";
}

// Live label updates
const toneLabel = document.getElementById("tone-label");
const dictionLabel = document.getElementById("diction-label");
const tempoLabel = document.getElementById("tempo-label");

function updateToneLabel() {
  const s = snap(toneSlider.value);
  toneSlider.value = s;
  const tone = mapTone(s);
  toneLabel.textContent = `Tone: ${tone}`;
}

function updateDictionLabel() {
  const s = snap(dictionSlider.value);
  dictionSlider.value = s;
  const dic = mapDiction(s);
  dictionLabel.textContent = `Diction: ${dic}`;
}

// Bind slider updates
toneSlider?.addEventListener("input", updateToneLabel);
dictionSlider?.addEventListener("input", updateDictionLabel);


// Initialize labels on load
updateToneLabel();
updateDictionLabel();


/* -------------------------------------------------------
 *  MAIN LYRIC GENERATION CALL
 * -----------------------------------------------------*/

async function generateLyrics() {
  const prompt = lyricInput.value.trim();
  if (!prompt) {
    lyricOutput.textContent = "Please describe what kind of lyrics you want.";
    return;
  }

  const dialect = selectedDialect || "Default";
  const tone = mapTone(toneSlider.value);
  const diction = mapDiction(dictionSlider.value);
  const genres = [...selectedGenres]; // clone array !IMPORTANT

  lyricOutput.textContent = "Generating lyrics…";

  try {
    const resp = await fetch("/lyric", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "LYRIC_GENERATOR",
        dialect,
        genres,
        tone,
        diction,
        message: prompt
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("[Armonia LyricAssistant] Worker error:", errText);
      lyricOutput.textContent = "⚠️ Error: could not generate lyrics.";
      return;
    }

    const data = await resp.json();
    const lyrics = data.lyrics || data.answer || "[No lyrics returned.]";

    lyricOutput.textContent = lyrics;
  } catch (err) {
    console.error("[Armonia LyricAssistant] Network error:", err);
    lyricOutput.textContent = "⚠️ Network error. Please try again.";
  }
}

// Bind button click
lyricGenerateBtn?.addEventListener("click", generateLyrics);

// Ctrl+Enter generates from textarea
lyricInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey) {
    e.preventDefault();
    generateLyrics();
  }
});

// Initialize display on load
updateGenreDisplay();
