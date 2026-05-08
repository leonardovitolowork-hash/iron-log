const PLAN = {
  A:[
    ["Leg Press","3x10",20],
    ["Chest Press","3x10",30],
    ["Leg Extension","3x12",25],
    ["Pec Deck","2x12",35],
    ["Calf Raise","3x15",25],
    ["Adductor","2x15",37]
  ],

  B:[
    ["Lat Pulldown","3x10",39],
    ["Seated Row","3x10",30],
    ["Leg Curl","3x12",28],
    ["Rear Delt","3x12",25],
    ["Tricep Pushdown","2x12",30],
    ["Bicep Curl","2x12",0]
  ]
};

const SWAPS = {
  "Chest Press":["Incline Press","Machine Press","DB Press"],
  "Lat Pulldown":["Pull Ups","Close Grip Pulldown"],
  "Leg Press":["Hack Squat","Smith Squat"]
};

let currentDay = "A";

const STORAGE = "iron_log_v2";

let data = JSON.parse(localStorage.getItem(STORAGE) || "{}");

if(!data.history) data.history=[];

function save(){
  localStorage.setItem(STORAGE,JSON.stringify(data));
}

function renderWorkout(){

  const wrap = document.getElementById("workout");

  wrap.innerHTML = "";

  PLAN[currentDay].forEach((ex,i)=>{

    const div = document.createElement("div");

    div.className = "exercise";

    div.innerHTML = `
      <div class="exerciseTop">
        <div>
          <h3>${ex[0]}</h3>
          <div class="meta">
            ${ex[1]} · Last: ${ex[2]}kg
          </div>
        </div>
      </div>

      <input
        id="weight_${i}"
        type="number"
        placeholder="Weight used">

      <textarea
        id="note_${i}"
        placeholder="Notes"></textarea>

      <button
        class="actionBtn"
        onclick="completeExercise(${i})">
        Complete
      </button>

      <button
        class="actionBtn swapBtn"
        onclick="swapExercise('${ex[0]}')">
        Swap Exercise
      </button>
    `;

    wrap.appendChild(div);
  });
}

function completeExercise(i){

  const ex = PLAN[currentDay][i];

  const weight =
    Number(document.getElementById(`weight_${i}`).value);

  const note =
    document.getElementById(`note_${i}`).value;

  data.history.push({
    exercise:ex[0],
    weight,
    note,
    date:new Date().toLocaleString()
  });

  save();

  renderHistory();
  renderChart();

  autoSuggest(ex[0]);
}

function renderHistory(){

  const h = document.getElementById("history");

  h.innerHTML = "";

  data.history
    .slice()
    .reverse()
    .forEach(e=>{

      const div = document.createElement("div");

      div.className = "historyItem";

      div.innerHTML = `
        <strong>${e.exercise}</strong>
        <div class="small">
          ${e.weight}kg · ${e.date}
        </div>
        <div class="small">
          ${e.note || ""}
        </div>
      `;

      h.appendChild(div);
    });
}

function autoSuggest(exercise){

  const logs =
    data.history.filter(x=>x.exercise===exercise);

  if(logs.length < 2) return;

  const last = logs[logs.length-1];
  const prev = logs[logs.length-2];

  if(last.weight >= prev.weight){

    setTimeout(()=>{

      alert(
        `Progression suggestion:\nIncrease ${exercise} next session`
      );

    },300);
  }
}

function swapExercise(ex){

  const swaps = SWAPS[ex];

  if(!swaps){
    alert("No swaps available");
    return;
  }

  alert(
    `${ex} alternatives:\n\n${swaps.join("\n")}`
  );
}

document.getElementById("dayABtn").onclick = ()=>{

  currentDay = "A";

  document
    .getElementById("dayABtn")
    .classList.add("active");

  document
    .getElementById("dayBBtn")
    .classList.remove("active");

  renderWorkout();
};

document.getElementById("dayBBtn").onclick = ()=>{

  currentDay = "B";

  document
    .getElementById("dayBBtn")
    .classList.add("active");

  document
    .getElementById("dayABtn")
    .classList.remove("active");

  renderWorkout();
};

let timer;

function startTimer(seconds){

  clearInterval(timer);

  let remaining = seconds;

  updateTimer(remaining);

  timer = setInterval(()=>{

    remaining--;

    updateTimer(remaining);

    if(remaining <= 0){

      clearInterval(timer);

      if(navigator.vibrate){
        navigator.vibrate([200,100,200]);
      }

      alert("Rest complete");
    }

  },1000);
}

function updateTimer(sec){

  const m =
    String(Math.floor(sec/60)).padStart(2,"0");

  const s =
    String(sec%60).padStart(2,"0");

  document.getElementById("timerDisplay")
    .textContent = `${m}:${s}`;
}

let chart;

function renderChart(){

  const select =
    document.getElementById("exerciseSelect");

  const exercises =
    [...new Set(data.history.map(x=>x.exercise))];

  select.innerHTML = exercises
    .map(e=>`<option>${e}</option>`)
    .join("");

  if(!exercises.length) return;

  const selected =
    select.value || exercises[0];

  const logs =
    data.history.filter(x=>x.exercise===selected);

  const ctx =
    document.getElementById("progressChart");

  if(chart) chart.destroy();

  chart = new Chart(ctx,{

    type:"line",

    data:{
      labels:logs.map((_,i)=>`#${i+1}`),

      datasets:[{
        label:selected,
        data:logs.map(x=>x.weight)
      }]
    }
  });

  select.onchange = renderChart;
}

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("service-worker.js");
}

renderWorkout();
renderHistory();
renderChart();
