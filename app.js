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

// 35-Day Beach Cut Plan
// Day A = Upper A  |  Day B = Lower A  |  Day C = Upper B  |  Day D = Lower B

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
const STORAGE  = "iron_log_v3";
let data = JSON.parse(localStorage.getItem(STORAGE) || "{}");
if (!data.history)    data.history    = [];
if (!data.bodyweight) data.bodyweight = [];

let sessionRatings = {};
let sessionDone    = {};
let sessionSets    = {};

function save() {
  localStorage.setItem(STORAGE, JSON.stringify(data));
}

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
      const w = parseFloat(ex.weight);
      if (!isNaN(w) && w > pb) pb = w;
    }
  }));
  return pb;
}

function getSuggestion(exName, fallback) {
  const last = getLastEntry(exName);
  if (!last) return { text: `First time — try ${fallback}`, suggested: null, lastNote: null };

  const w        = parseFloat(last.weight);
  const r        = RATINGS.find(r => r.key === last.rating);
  const delta    = r ? r.delta : 0;
  const lastNote = last.note && last.note.trim() ? last.note.trim() : null;

  if (isNaN(w)) return { text: `No weight logged last time`, suggested: null, lastNote };

  const next   = Math.max(0, w + delta);
  const rLabel = r ? `${r.emoji} ${r.label}` : "no rating";
  const arrow  = delta > 0 ? "↑" : delta < 0 ? "↓" : "→";
  return {
    text:      `Last: ${w} kg (${rLabel}) ${arrow} Try ${next} kg`,
    suggested: next,
    lastNote
  };
}

function calcVolume(setsStr, weight) {
  const match = setsStr.match(/(\d+)x(\d+)/);
  if (!match || isNaN(weight) || weight <= 0) return null;
  const sets = parseInt(match[1]);
  const reps = parseInt(match[2]);
  return (sets * reps * weight).toFixed(0);
}

/* ── Workout form ── */

function renderWorkout() {
  sessionRatings = {};
  sessionDone    = {};
  sessionSets    = {};
  const wrap = document.getElementById("workout");
  wrap.innerHTML = "";

  const card = document.createElement("div");
  card.className = "card";

  const rows = PLAN[currentDay].map((ex, i) => {
    const name       = ex[0];
    const setsStr    = ex[1];
    const suggestion = getSuggestion(name, ex[2]);
    const prefill    = suggestion.suggested !== null ? suggestion.suggested : "";
    const pb         = getPersonalBest(name);
    const totalSets  = parseInt(setsStr.match(/(\d+)x/)?.[1] || 3);
    const hasSwap    = !!SWAPS[name];
    const formTip    = FORM_TIPS[name] || "";
    const isCardio   = ex[2] === "—";

    const ratingBtns = RATINGS.map(r => `
      <button type="button" class="ratingBtn" id="rating_${i}_${r.key}"
        onclick="setRating(${i},'${r.key}','${name}')" title="${r.label}">
        ${r.emoji}
      </button>`).join("");

    const noteReminder = suggestion.lastNote
      ? `<div class="noteReminder">📌 Last note: ${suggestion.lastNote}</div>`
      : "";

    const setDots = isCardio ? "" : Array.from({length: totalSets}, (_, s) =>
      `<button type="button" class="setDot" id="setDot_${i}_${s}"
        onclick="tickSet(${i},${s},'${name}',${totalSets})"></button>`
    ).join("");

    const weightInput = isCardio ? "" : `
      <input id="weight_${i}" placeholder="Weight used (kg)" inputmode="decimal" value="${prefill}"
        oninput="checkPB(${i},'${name}'); updateVolume(${i},'${setsStr}')">
      <div class="volumeRow" id="vol_${i}"></div>`;

    const setsRow = isCardio ? "" : `
      <div class="setsRow">
        <span class="setsLabel">Sets done:</span>
        <div class="setDots" id="setDots_${i}">${setDots}</div>
        <span class="setsCount" id="setsCount_${i}">0/${totalSets}</span>
      </div>`;

    const ratingRow = isCardio ? "" : `
      <div class="ratingRow">
        <span class="ratingLabel">How did it feel?</span>
        <div class="ratingBtns">${ratingBtns}</div>
      </div>`;

    const tipDiv = formTip ? `<div class="formTip">💡 ${formTip}</div>` : "";

    return `
      <div class="exercise" id="exCard_${i}">
        <div class="exHeader">
          <div class="exTitleRow">
            <h3>${name}</h3>
            ${hasSwap ? `<button type="button" class="swapTrigger" onclick="openSwap('${name}')">⇄ Swap</button>` : ""}
          </div>
          <label class="doneLabel">
            <input type="checkbox" class="doneCheck" id="done_${i}"
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
        ${weightInput}
        ${setsRow}
        ${ratingRow}
        <textarea id="note_${i}" placeholder="Notes"></textarea>
      </div>`;
  }).join("");

  card.innerHTML = `
    ${rows}
    <button class="actionBtn" onclick="logSession()">Log Day ${currentDay} Session 🔥</button>
    <div id="logStatus" class="logStatus"></div>`;

  wrap.appendChild(card);
}

function tickSet(i, s, exName, totalSets) {
  const dot = document.getElementById(`setDot_${i}_${s}`);
  dot.classList.toggle("setDone");
  const done = document.querySelectorAll(`#setDots_${i} .setDot.setDone`).length;
  sessionSets[exName] = done;
  document.getElementById(`setsCount_${i}`).textContent = `${done}/${totalSets}`;
  if (done === totalSets) startTimer(90);
}

function updateVolume(i, setsStr) {
  const w   = parseFloat(document.getElementById(`weight_${i}`).value);
  const vol = calcVolume(setsStr, w);
  const el  = document.getElementById(`vol_${i}`);
  if (el) el.textContent = vol ? `Total volume: ${vol} kg` : "";
}

function setDone(i, exName) {
  const checked = document.getElementById(`done_${i}`).checked;
  sessionDone[exName] = checked;
  document.getElementById(`exCard_${i}`).classList.toggle("exDone", checked);
  if (checked) startTimer(90);
}

function setRating(i, key, exName) {
  sessionRatings[exName] = key;
  RATINGS.forEach(r => {
    const btn = document.getElementById(`rating_${i}_${r.key}`);
    if (btn) btn.classList.toggle("ratingActive", r.key === key);
  });
}

function checkPB(i, exName) {
  const val = parseFloat(document.getElementById(`weight_${i}`).value);
  const pb  = getPersonalBest(exName);
  const el  = document.getElementById(`pb_${i}`);
  if (!el) return;
  if (!isNaN(val) && val > pb) {
    el.innerHTML = `🏆 New PB incoming! ${val} kg`;
    el.className = "pbBadge pbNew";
  } else if (pb > 0) {
    el.innerHTML = `🏆 PB: ${pb} kg`;
    el.className = "pbBadge";
  } else {
    el.innerHTML = "";
  }
}

function logSession() {
  const exercises = PLAN[currentDay].map((ex, i) => {
    const wEl = document.getElementById(`weight_${i}`);
    const w = wEl ? wEl.value.trim() : "";
    return {
      name:   ex[0],
      weight: w,
      note:   document.getElementById(`note_${i}`).value.trim(),
      rating: sessionRatings[ex[0]] || null,
      done:   !!sessionDone[ex[0]],
      sets:   sessionSets[ex[0]] || 0,
      volume: calcVolume(ex[1], parseFloat(w))
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
    exercises: exercises
  });

  save();
  renderHistory();
  renderChart();
  renderBWChart();
  sessionRatings = {};
  sessionDone    = {};
  sessionSets    = {};

  const status = document.getElementById("logStatus");
  status.textContent = "Session logged 🔥 Keep pushing!";
  setTimeout(() => { status.textContent = ""; renderWorkout(); }, 2500);
}

/* ── Day toggle ── */

["A","B","C","D"].forEach(d => {
  document.getElementById(`day${d}Btn`).addEventListener("click", () => {
    currentDay = d;
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
      return `
        <div class="historyExRow">
          <span class="historyExName">${tick}${ex.name}</span>
          <span class="historyExWeight">${ex.weight ? ex.weight + " kg" : "—"}</span>
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
      const w = parseFloat(match.weight);
      const r = match.rating ? RATINGS.find(x => x.key === match.rating) : null;
      points.push({
        label: `S${i+1} (${session.date.split(",")[0]})${r ? " "+r.emoji : ""}`,
        value: isNaN(w) ? null : w
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
