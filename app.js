const QUOTES = [
  "Show up. Lift. Repeat. 💪",
  "Progressive overload is the game. 🔥",
  "Every rep counts. Every session matters. ⚡",
  "Consistency beats intensity. Stay the course. 🏆",
  "You lift, you grow. Simple as that. 💥",
  "35 days to the beach. Make every set count. 🌊",
  "Cut hard, eat smart, train heavy. 🔱"
];

document.getElementById("quote").textContent =
  QUOTES[Math.floor(Math.random() * QUOTES.length)];

const PLAN = {
  A: [
    ["Chest Press",         "4x8-12", "32kg"],
    ["Lat Pulldown",        "4x8-12", "15kg"],
    ["Seated Row",          "3x10-12","20kg"],
    ["Shoulder Press",      "3x10",   "12kg"],
    ["Lateral Raises",      "3x15",   "6kg"],
    ["Triceps Pressdown",   "3x12",   "15kg"],
    ["Biceps Curl",         "3x12",   "10kg"],
    ["Incline Walk",        "20min",  "—"]
  ],
  B: [
    ["Leg Press",           "4x8-12", "20kg"],
    ["Romanian Deadlift",   "3x8-10", "20kg"],
    ["Leg Curl",            "3x10-12","18kg"],
    ["Leg Extension",       "3x12",   "18kg"],
    ["Calf Raises",         "4x15",   "20kg"],
    ["Plank",               "3x30sec","—"],
    ["Incline Walk",        "15min",  "—"]
  ],
  C: [
    ["Incline Chest Press", "4x8-10", "28kg"],
    ["One-Arm Row",         "4x8-12", "20kg"],
    ["Rear Delt Fly",       "3x15",   "6kg"],
    ["Face Pulls",          "3x15",   "10kg"],
    ["Lateral Raises",      "3x15",   "6kg"],
    ["Triceps Overhead",    "3x12",   "10kg"],
    ["Hammer Curl",         "3x12",   "10kg"],
    ["Incline Walk",        "20min",  "—"]
  ],
  D: [
    ["Hack Squat",          "4x8-10", "20kg"],
    ["Hip Thrust",          "4x10-12","20kg"],
    ["Walking Lunges",      "3x10",   "10kg"],
    ["Abductor Machine",    "3x15-20","32kg"],
    ["Leg Extension",       "2x12",   "18kg"],
    ["Dead Bug",            "3x10",   "—"],
    ["Incline Walk",        "15min",  "—"]
  ]
};

const FORM_TIPS = {
  "Chest Press":        "Elbows at 45°, full range, slow eccentric.",
  "Lat Pulldown":       "Pull to upper chest, squeeze lats.",
  "Seated Row":         "Pinch shoulder blades at end.",
  "Shoulder Press":     "Core tight, no back arch.",
  "Lateral Raises":     "Lead elbows, no momentum.",
  "Triceps Pressdown":  "Elbows pinned, full extension.",
  "Biceps Curl":        "No swing, slow on way down.",
  "Incline Walk":       "7-8% incline, 5.5-6 km/h. Stay consistent.",
  "Leg Press":          "Drive through heels, full depth.",
  "Romanian Deadlift":  "Hinge hips, neutral spine.",
  "Leg Curl":           "Control the return every rep.",
  "Leg Extension":      "Slow up and down, no slamming.",
  "Calf Raises":        "Full stretch at bottom, pause at top.",
  "Plank":              "Ribs down, glutes squeezed.",
  "Incline Chest Press":"30-45° incline, full stretch.",
  "One-Arm Row":        "Pull elbow to hip, no rotation.",
  "Rear Delt Fly":      "Squeeze hard at the top.",
  "Face Pulls":         "Pull to nose, elbows high.",
  "Triceps Overhead":   "Keep elbows close.",
  "Hammer Curl":        "Neutral grip, smooth reps.",
  "Hack Squat":         "Depth below parallel, knees track toes.",
  "Hip Thrust":         "Squeeze glutes at top lockout.",
  "Walking Lunges":     "Tall posture, push through front heel.",
  "Abductor Machine":   "Lean forward, squeeze wide.",
  "Dead Bug":           "Lower back pressed flat to floor."
};

const SWAPS = {
  "Chest Press":        ["Incline Press", "Machine Press", "DB Press"],
  "Lat Pulldown":       ["Pull Ups", "Close Grip Pulldown"],
  "Leg Press":          ["Smith Squat", "Leg Press narrow stance"],
  "Seated Row":         ["Cable Row", "DB Row"],
  "Triceps Pressdown":  ["Overhead Tricep", "Skull Crushers"],
  "Biceps Curl":        ["Hammer Curl", "Incline DB Curl"],
  "Romanian Deadlift":  ["Stiff Leg Deadlift", "Good Morning"],
  "Hack Squat":         ["Smith Machine Squat", "Goblet Squat"],
  "Hip Thrust":         ["Glute Bridge", "Cable Kickback"],
  "Incline Chest Press":["Flat DB Press", "Cable Fly"],
  "One-Arm Row":        ["Seated Row", "DB Row"],
  "Face Pulls":         ["Band Pull Apart", "Reverse Fly"]
};

const RATINGS = [
  { key: "easy", emoji: "😅", label: "Too easy",   delta: +2.5 },
  { key: "good", emoji: "💪", label: "Just right", delta:  0   },
  { key: "hard", emoji: "😤", label: "Too hard",   delta: -2.5 }
];

let currentDay = "A";
const STORAGE   = "iron_log_v3";
const DRAFT_KEY = "iron_log_draft";
let data = JSON.parse(localStorage.getItem(STORAGE) || "{}");
if (!data.history)    data.history    = [];
if (!data.bodyweight) data.bodyweight = [];

let draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");

function save()      { localStorage.setItem(STORAGE, JSON.stringify(data)); }
function saveDraft() { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }
function clearDraft(){ localStorage.removeItem(DRAFT_KEY); draft = {}; }

// Restore draft day
(function(){
  if (draft.day && ["A","B","C","D"].includes(draft.day)) {
    currentDay = draft.day;
  }
})();

/* ── Smart suggestion ── */

function getLastEntry(exName) {
  for (let i = data.history.length - 1; i >= 0; i--) {
    const match = data.history[i].exercises.find(e => e.name === exName);
    if (match) return match;
  }
  return null;
}

function getPersonalBest(exName) {
  let pb = 0;
  data.history.forEach(s => s.exercises.forEach(ex => {
    if (ex.name === exName) {
      if (ex.sets && ex.sets.length) {
        ex.sets.forEach(st => { const w = parseFloat(st.kg); if (!isNaN(w) && w > pb) pb = w; });
      } else {
        const w = parseFloat(ex.weight);
        if (!isNaN(w) && w > pb) pb = w;
      }
    }
  }));
  return pb;
}

function getSuggestion(exName, fallback) {
  const last = getLastEntry(exName);
  if (!last) return { text: `First time — try ${fallback}`, suggestedKg: null, lastNote: null };

  const r        = RATINGS.find(r => r.key === last.rating);
  const delta    = r ? r.delta : 0;
  const lastNote = last.note && last.note.trim() ? last.note.trim() : null;

  let lastKg = null;
  if (last.sets && last.sets.length) {
    const vals = last.sets.map(s => parseFloat(s.kg)).filter(v => !isNaN(v));
    if (vals.length) lastKg = vals[vals.length - 1];
  } else {
    const w = parseFloat(last.weight);
    if (!isNaN(w)) lastKg = w;
  }

  if (lastKg === null) return { text: `No weight logged last time`, suggestedKg: null, lastNote };

  const next   = Math.max(0, lastKg + delta);
  const rLabel = r ? `${r.emoji} ${r.label}` : "no rating";
  const arrow  = delta > 0 ? "↑" : delta < 0 ? "↓" : "→";
  return {
    text:        `Last: ${lastKg} kg (${rLabel}) ${arrow} Try ${next} kg`,
    suggestedKg: next,
    lastNote
  };
}

/* ── Workout form ── */

function renderWorkout() {
  const wrap = document.getElementById("workout");
  wrap.innerHTML = "";
  const card = document.createElement("div");
  card.className = "card";

  draft.day = currentDay;
  if (!draft.exercises) draft.exercises = {};
  saveDraft();

  // set active day button
  document.querySelectorAll(".seg button").forEach(b => b.classList.remove("active"));
  const activeBtn = document.getElementById(`day${currentDay}Btn`);
  if (activeBtn) activeBtn.classList.add("active");

  const rows = PLAN[currentDay].map((ex, i) => {
    const name       = ex[0];
    const setsStr    = ex[1];
    const isCardio   = ex[2] === "—";
    const suggestion = getSuggestion(name, ex[2]);
    const pb         = getPersonalBest(name);
    const totalSets  = parseInt(setsStr.match(/(\d+)x/)?.[1] || 3);
    const hasSwap    = !!SWAPS[name];
    const formTip    = FORM_TIPS[name] || "";

    const draftEx     = draft.exercises[name] || {};
    const isDone      = !!draftEx.done;
    const draftRating = draftEx.rating || null;
    const draftNote   = draftEx.note   || "";
    const draftSets   = draftEx.sets   || [];

    const ratingBtns = isCardio ? "" : RATINGS.map(r => `
      <button type="button" class="ratingBtn${draftRating === r.key ? " ratingActive" : ""}" id="rating_${i}_${r.key}"
        onclick="setRating(${i},'${r.key}','${name}')" title="${r.label}">${r.emoji}</button>`).join("");

    const noteReminder = suggestion.lastNote
      ? `<div class="noteReminder">📌 Last note: ${suggestion.lastNote}</div>` : "";

    const tipDiv = formTip ? `<div class="formTip">💡 ${formTip}</div>` : "";

    let setRowsHTML = "";
    if (!isCardio) {
      const sugKg = suggestion.suggestedKg !== null ? suggestion.suggestedKg : "";
      const setsToRender = draftSets.length > 0
        ? draftSets
        : Array.from({length: totalSets}, () => ({kg: sugKg, reps: "", done: false}));
      setRowsHTML = `
        <div class="setTableWrap" id="setTable_${i}">
          <div class="setTableHead">
            <span class="setNumCol">#</span>
            <span class="setKgCol">kg</span>
            <span class="setRepsCol">reps</span>
            <span class="setDoneCol">✓</span>
          </div>
          ${setsToRender.map((s, si) => buildSetRow(i, si, name, s.kg, s.reps, s.done)).join("")}
        </div>
        <button type="button" class="addSetBtn" onclick="addSet(${i},'${name}')">+ Add set</button>
        <div class="volumeRow" id="vol_${i}"></div>`;
    }

    return `
      <div class="exercise${isDone ? " exDone" : ""}" id="exCard_${i}">
        <div class="exHeader">
          <div class="exTitleRow">
            <h3>${name}</h3>
            ${hasSwap ? `<button type="button" class="swapTrigger" onclick="openSwap('${name}')">⇄ Swap</button>` : ""}
          </div>
          <label class="doneLabel">
            <input type="checkbox" class="doneCheck" id="done_${i}" ${isDone ? "checked" : ""}
              onchange="setDone(${i},'${name}')">
            <span class="doneTick"></span>
            Done
          </label>
        </div>
        <div class="meta">${setsStr}${ex[2] !== "—" ? " · target: " + ex[2] : ""}</div>
        ${tipDiv}
        ${!isCardio ? `<div class="suggestion">${suggestion.text}</div>` : ""}
        ${pb > 0 ? `<div class="pbBadge" id="pb_${i}">🏆 PB: ${pb} kg</div>` : `<div id="pb_${i}"></div>`}
        ${noteReminder}
        ${setRowsHTML}
        <div class="ratingRow">${isCardio ? "" : `<span class="ratingLabel">How did it feel?</span><div class="ratingBtns">${ratingBtns}</div>`}</div>
        <textarea id="note_${i}" placeholder="Notes" oninput="saveNoteDraft(${i},'${name}')">${draftNote}</textarea>
      </div>`;
  }).join("");

  const hasDraft = draft.exercises && Object.values(draft.exercises).some(e => e.sets && e.sets.length > 0);

  card.innerHTML = `
    ${rows}
    ${hasDraft ? `<div class="draftBanner">💾 Draft auto-saved — your sets are safe</div>` : ""}
    <button class="actionBtn" onclick="logSession()">Log Day ${currentDay} Session 🔥</button>
    <button class="clearDraftBtn" onclick="confirmClearDraft()">🗑 Clear draft</button>
    <div id="logStatus" class="logStatus"></div>`;

  wrap.appendChild(card);

  PLAN[currentDay].forEach((ex, i) => {
    if (ex[2] !== "—") updateVolumeDisplay(i, ex[0]);
  });
}

function buildSetRow(exIdx, setIdx, exName, kg, reps, done) {
  return `
    <div class="setRow${done ? " setRowDone" : ""}" id="setRow_${exIdx}_${setIdx}">
      <span class="setNumCol">${setIdx + 1}</span>
      <input class="setKgInput setKgCol" type="number" inputmode="decimal" placeholder="kg"
        value="${kg !== undefined && kg !== "" ? kg : ""}"
        oninput="updateSetDraft(${exIdx},${setIdx},'${exName}')"
        id="setKg_${exIdx}_${setIdx}">
      <input class="setRepsInput setRepsCol" type="number" inputmode="numeric" placeholder="reps"
        value="${reps !== undefined && reps !== "" ? reps : ""}"
        oninput="updateSetDraft(${exIdx},${setIdx},'${exName}')"
        id="setReps_${exIdx}_${setIdx}">
      <button type="button" class="setCheckBtn setDoneCol${done ? " setCheckDone" : ""}"
        id="setCheck_${exIdx}_${setIdx}"
        onclick="toggleSetDone(${exIdx},${setIdx},'${exName}')">
        ${done ? "✓" : ""}
      </button>
    </div>`;
}

function addSet(exIdx, exName) {
  if (!draft.exercises[exName]) draft.exercises[exName] = { sets: [] };
  if (!draft.exercises[exName].sets) draft.exercises[exName].sets = [];
  const sets  = draft.exercises[exName].sets;
  const lastKg = sets.length ? sets[sets.length-1].kg : "";
  sets.push({ kg: lastKg, reps: "", done: false });
  saveDraft();
  const newIdx = sets.length - 1;
  const table  = document.getElementById(`setTable_${exIdx}`);
  if (table) {
    const tmp = document.createElement("div");
    tmp.innerHTML = buildSetRow(exIdx, newIdx, exName, lastKg, "", false);
    while (tmp.firstChild) table.appendChild(tmp.firstChild);
  }
  updateVolumeDisplay(exIdx, exName);
}

function toggleSetDone(exIdx, setIdx, exName) {
  if (!draft.exercises[exName]) draft.exercises[exName] = { sets: [] };
  if (!draft.exercises[exName].sets) draft.exercises[exName].sets = [];
  const sets = draft.exercises[exName].sets;
  // sync current kg/reps first
  const kgEl   = document.getElementById(`setKg_${exIdx}_${setIdx}`);
  const repsEl = document.getElementById(`setReps_${exIdx}_${setIdx}`);
  if (!sets[setIdx]) sets[setIdx] = {};
  if (kgEl)   sets[setIdx].kg   = kgEl.value;
  if (repsEl) sets[setIdx].reps = repsEl.value;
  sets[setIdx].done = !sets[setIdx].done;
  saveDraft();

  const btn = document.getElementById(`setCheck_${exIdx}_${setIdx}`);
  const row = document.getElementById(`setRow_${exIdx}_${setIdx}`);
  if (btn) {
    btn.classList.toggle("setCheckDone", sets[setIdx].done);
    btn.textContent = sets[setIdx].done ? "✓" : "";
  }
  if (row) row.classList.toggle("setRowDone", sets[setIdx].done);

  if (sets[setIdx].done) startTimer(90);
}

function updateSetDraft(exIdx, setIdx, exName) {
  if (!draft.exercises[exName]) draft.exercises[exName] = { sets: [] };
  if (!draft.exercises[exName].sets) draft.exercises[exName].sets = [];
  const kgEl   = document.getElementById(`setKg_${exIdx}_${setIdx}`);
  const repsEl = document.getElementById(`setReps_${exIdx}_${setIdx}`);
  const sets   = draft.exercises[exName].sets;
  if (!sets[setIdx]) sets[setIdx] = {};
  if (kgEl)   sets[setIdx].kg   = kgEl.value;
  if (repsEl) sets[setIdx].reps = repsEl.value;
  saveDraft();
  updateVolumeDisplay(exIdx, exName);

  const maxKg = Math.max(...sets.map(s => parseFloat(s.kg) || 0));
  const pb    = getPersonalBest(exName);
  const el    = document.getElementById(`pb_${exIdx}`);
  if (el) {
    if (maxKg > 0 && maxKg > pb) {
      el.innerHTML = `🏆 New PB incoming! ${maxKg} kg`;
      el.className = "pbBadge pbNew";
    } else if (pb > 0) {
      el.innerHTML = `🏆 PB: ${pb} kg`;
      el.className = "pbBadge";
    } else {
      el.innerHTML = "";
    }
  }
}

function updateVolumeDisplay(exIdx, exName) {
  const el   = document.getElementById(`vol_${exIdx}`);
  if (!el) return;
  const sets = (draft.exercises[exName] && draft.exercises[exName].sets) || [];
  const vol  = sets.reduce((acc, s) => acc + (parseFloat(s.kg)||0) * (parseFloat(s.reps)||0), 0);
  el.textContent = vol > 0 ? `Total volume: ${vol.toFixed(0)} kg` : "";
}

function setDone(exIdx, exName) {
  const checked = document.getElementById(`done_${exIdx}`).checked;
  if (!draft.exercises[exName]) draft.exercises[exName] = {};
  draft.exercises[exName].done = checked;
  collectSetsFromDOM(exIdx, exName);
  saveDraft();
  document.getElementById(`exCard_${exIdx}`).classList.toggle("exDone", checked);
  if (checked) startTimer(90);
}

function setRating(exIdx, key, exName) {
  if (!draft.exercises[exName]) draft.exercises[exName] = {};
  draft.exercises[exName].rating = key;
  saveDraft();
  RATINGS.forEach(r => {
    const btn = document.getElementById(`rating_${exIdx}_${r.key}`);
    if (btn) btn.classList.toggle("ratingActive", r.key === key);
  });
}

function saveNoteDraft(exIdx, exName) {
  if (!draft.exercises[exName]) draft.exercises[exName] = {};
  const el = document.getElementById(`note_${exIdx}`);
  if (el) draft.exercises[exName].note = el.value;
  saveDraft();
}

function collectSetsFromDOM(exIdx, exName) {
  if (!draft.exercises[exName]) draft.exercises[exName] = {};
  const existing = (draft.exercises[exName].sets || []);
  existing.forEach((s, si) => {
    const kgEl   = document.getElementById(`setKg_${exIdx}_${si}`);
    const repsEl = document.getElementById(`setReps_${exIdx}_${si}`);
    if (kgEl)   s.kg   = kgEl.value;
    if (repsEl) s.reps = repsEl.value;
  });
  draft.exercises[exName].sets = existing;
}

function collectAllFromDOM() {
  PLAN[currentDay].forEach((ex, i) => {
    const name = ex[0];
    if (!draft.exercises[name]) draft.exercises[name] = {};
    const noteEl = document.getElementById(`note_${i}`);
    if (noteEl) draft.exercises[name].note = noteEl.value;
    if (ex[2] !== "—") collectSetsFromDOM(i, name);
    const doneEl = document.getElementById(`done_${i}`);
    if (doneEl) draft.exercises[name].done = doneEl.checked;
  });
  saveDraft();
}

function logSession() {
  collectAllFromDOM();

  const exercises = PLAN[currentDay].map((ex, i) => {
    const name    = ex[0];
    const draftEx = draft.exercises[name] || {};
    const sets    = draftEx.sets || [];
    const vol     = sets.length
      ? sets.reduce((a, s) => a + (parseFloat(s.kg)||0)*(parseFloat(s.reps)||0), 0).toFixed(0)
      : null;
    const maxKg = sets.length
      ? Math.max(...sets.map(s => parseFloat(s.kg)||0))
      : null;
    return {
      name,
      weight: maxKg !== null && maxKg > 0 ? String(maxKg) : "",
      sets,
      note:   draftEx.note   || "",
      rating: draftEx.rating || null,
      done:   !!draftEx.done,
      volume: vol
    };
  });

  const bwVal = document.getElementById("bwInput").value.trim();
  if (bwVal) {
    data.bodyweight.push({ date: new Date().toLocaleDateString(), weight: parseFloat(bwVal) });
    document.getElementById("bwInput").value = "";
  }

  data.history.push({
    id:        Date.now(),
    day:       currentDay,
    date:      new Date().toLocaleString(),
    exercises
  });

  save();
  clearDraft();
  renderHistory();
  renderChart();
  renderBWChart();

  const status = document.getElementById("logStatus");
  status.textContent = "Session logged 🔥 Keep pushing!";
  setTimeout(() => { status.textContent = ""; renderWorkout(); }, 2500);
}

function confirmClearDraft() {
  if (confirm("Clear the current draft? All unsaved sets will be lost.")) {
    clearDraft();
    renderWorkout();
  }
}

/* ── Day toggle ── */

["A","B","C","D"].forEach(d => {
  document.getElementById(`day${d}Btn`).addEventListener("click", () => {
    currentDay = d;
    draft.day  = d;
    saveDraft();
    document.querySelectorAll(".seg button").forEach(b => b.classList.remove("active"));
    document.getElementById(`day${d}Btn`).classList.add("active");
    renderWorkout();
  });
});

/* ── Swap sheet ── */

function openSwap(exName) {
  const swaps = SWAPS[exName] || [];
  document.getElementById("sheetTitle").textContent = `${exName} alternatives`;
  document.getElementById("sheetOptions").innerHTML = swaps
    .map(s => `<div class="sheetOption">${s}</div>`).join("");
  document.getElementById("swapSheet").classList.add("open");
  document.getElementById("sheetOverlay").classList.add("open");
}

function closeSwap() {
  document.getElementById("swapSheet").classList.remove("open");
  document.getElementById("sheetOverlay").classList.remove("open");
}

/* ── Rest timer ── */

let timer;

function startTimer(seconds) {
  clearInterval(timer);
  let remaining = seconds;
  updateTimer(remaining);
  const wrap = document.getElementById("timerWrap");
  wrap.classList.add("timerRunning");
  timer = setInterval(() => {
    remaining--;
    updateTimer(remaining);
    if (remaining <= 0) {
      clearInterval(timer);
      wrap.classList.remove("timerRunning");
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      alert("Rest complete 💪");
    }
  }, 1000);
}

function updateTimer(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  document.getElementById("timerDisplay").textContent = `${m}:${s}`;
}

/* ── History ── */

function renderHistory() {
  const h = document.getElementById("history");
  h.innerHTML = "";

  if (!data.history.length) {
    h.innerHTML = `<div class="historyItem"><div class="small">No sessions logged yet.</div></div>`;
    return;
  }

  data.history.slice().reverse().forEach((session, revIdx) => {
    const realIdx = data.history.length - 1 - revIdx;
    const div = document.createElement("div");
    div.className = "historyItem";

    const exRows = session.exercises.map(ex => {
      const r    = ex.rating ? RATINGS.find(x => x.key === ex.rating) : null;
      const tick = ex.done ? `<span class="doneBadge">✓</span>` : "";
      const vol  = ex.volume ? `<span class="volTag">${ex.volume} kg vol</span>` : "";

      let setDetail = "";
      if (ex.sets && ex.sets.length) {
        setDetail = `<div class="setHistoryRow">${ex.sets.map((s, si) =>
          `<span class="setHistoryChip${s.done ? " setHistoryDone" : ""}">${si+1}: ${s.kg||"?"}kg × ${s.reps||"?"}r</span>`
        ).join("")}</div>`;
      } else if (ex.weight) {
        setDetail = `<span class="historyExWeight">${ex.weight} kg</span>`;
      }

      return `
        <div class="historyExRow">
          <span class="historyExName">${tick}${ex.name}</span>
          ${setDetail}
          ${r ? `<span class="historyRating">${r.emoji} ${r.label}</span>` : ""}
          ${vol}
          ${ex.note ? `<div class="small historyNote">${ex.note}</div>` : ""}
        </div>`;
    }).join("");

    const doneCount = session.exercises.filter(e => e.done).length;
    const total     = session.exercises.length;

    div.innerHTML = `
      <div class="historyTop">
        <div>
          <strong>Day ${session.day}</strong>
          <div class="small">${session.date}</div>
        </div>
        <button class="delBtn" onclick="deleteSession(${realIdx})">Delete</button>
      </div>
      <div class="doneBar">
        <div class="doneBarFill" style="width:${total ? (doneCount/total*100) : 0}%"></div>
      </div>
      <div class="small" style="margin-bottom:6px">${doneCount}/${total} exercises completed</div>
      <details class="sessionDetails">
        <summary>View exercises (${total})</summary>
        <div class="exList">${exRows}</div>
      </details>`;
    h.appendChild(div);
  });
}

function deleteSession(idx) {
  if (!confirm("Delete this session?")) return;
  data.history.splice(idx, 1);
  save();
  renderHistory();
  renderChart();
}

/* ── Export / Import ── */

function exportBackup() {
  if (!data.history.length) { alert("No history to export yet 💪"); return; }
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `iron-log-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importBackup() {
  const input  = document.createElement("input");
  input.type   = "file";
  input.accept = ".json,application/json";
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.history || !Array.isArray(parsed.history)) { alert("Invalid backup file"); return; }
        if (!confirm(`Import ${parsed.history.length} session(s)? This will REPLACE your current history.`)) return;
        data = { history: parsed.history, bodyweight: parsed.bodyweight || [] };
        save();
        renderHistory();
        renderChart();
        renderBWChart();
        renderWorkout();
        alert("Backup restored 🔥");
      } catch { alert("Could not read file."); }
    };
    reader.readAsText(file);
  };
  input.click();
}

/* ── Progress chart ── */

let chart;
const select = document.getElementById("exerciseSelect");
select.addEventListener("change", () => renderChart(select.value));

function renderChart(forcedName) {
  const allNames = [];
  data.history.forEach(s => s.exercises.forEach(ex => {
    if (!allNames.includes(ex.name)) allNames.push(ex.name);
  }));

  if (!allNames.length) {
    select.innerHTML = `<option value="">No data yet</option>`;
    if (chart) { chart.destroy(); chart = null; }
    return;
  }

  const selected = (forcedName && allNames.includes(forcedName))
    ? forcedName
    : (allNames.includes(select.value) ? select.value : allNames[0]);

  select.innerHTML = allNames
    .map(n => `<option value="${n}"${n === selected ? " selected" : ""}>${n}</option>`)
    .join("");

  const points = [];
  data.history.forEach((session, i) => {
    const match = session.exercises.find(ex => ex.name === selected);
    if (match) {
      let maxKg = null;
      if (match.sets && match.sets.length) {
        const vals = match.sets.map(s => parseFloat(s.kg)).filter(v => !isNaN(v));
        if (vals.length) maxKg = Math.max(...vals);
      } else {
        const w = parseFloat(match.weight);
        if (!isNaN(w)) maxKg = w;
      }
      const r = match.rating ? RATINGS.find(x => x.key === match.rating) : null;
      points.push({
        label: `S${i+1} (${session.date.split(",")[0]})${r ? " "+r.emoji : ""}`,
        value: maxKg
      });
    }
  });

  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("progressChart"), {
    type: "line",
    data: {
      labels: points.map(p => p.label),
      datasets: [{
        label: `${selected} (kg)`,
        data:  points.map(p => p.value),
        tension: 0.35, fill: true,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.10)",
        pointBackgroundColor: "#2563eb",
        pointRadius: 5, spanGaps: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: false, title: { display: true, text: "kg" } } }
    }
  });
}

/* ── Body weight chart ── */

let bwChart;

function renderBWChart() {
  const pts = data.bodyweight;
  const ctx = document.getElementById("bwChart");
  if (bwChart) bwChart.destroy();
  if (!pts.length) return;

  bwChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: pts.map(p => p.date),
      datasets: [{
        label: "Body weight (kg)",
        data:  pts.map(p => p.weight),
        tension: 0.35, fill: true,
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14,165,233,0.10)",
        pointBackgroundColor: "#0ea5e9",
        pointRadius: 5, spanGaps: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: false, title: { display: true, text: "kg" } } }
    }
  });
}

/* ── Service worker ── */
if ("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js");

/* ── Init ── */
renderWorkout();
renderHistory();
renderChart();
renderBWChart();
