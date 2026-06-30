// =========================
// 🚆 TRAIN OPS ENGINE CORE
// =========================

// 🌍 STATE
let money = 0;
let selected = null;
let tracks = [null, null];


// =========================
// 🚉 ASSIGN TRACK
// =========================
function assign(train){
  for(let i = 0; i < tracks.length; i++){
    if(!tracks[i]){
      tracks[i] = train.id;
      train.track = i + 1;

      train.state = "ARRIVED";

      train.pendingTasks = 0;
      return;
    }
  }
}


// =========================
// 🎯 DOT LOGIC
// =========================
function hasDot(train, isSelected){
  return train.pendingTasks > 0 && !isSelected;
}


// =========================
// ▶️ START TASK (UNIVERSAL)
// =========================
function startTask(type){
  if(!selected) return;

  const train = selected;

  if(!train.service) return;
  if(train.service[type] !== "idle") return;

  train.service[type] = "running";

  const duration = train.timers[type];
  let elapsed = 0;

  let interval = setInterval(() => {

    elapsed++;

    train.progress[type] = (elapsed / duration) * 100;

    if(elapsed >= duration){
      clearInterval(interval);

      train.progress[type] = 100;
      train.service[type] = "done";

      // 🟢 notifikace (dot)
      train.pendingTasks++;

      // 🔁 STATE FLOW (jen popis stavu, ne logika hry)
      if(type === "exit")  train.state = "WAIT_CLEAN";
      if(type === "clean") train.state = "WAIT_BOARD";
      if(type === "board") train.state = "READY_DEPART";

      render();
    }

    if(selected?.id === train.id){
      updateDetail();
    }

  }, 1000);
}


// =========================
// 🚂 DEPART (UNIVERSAL)
// =========================
function departTrain(){
  if(!selected) return;
  if(selected.state !== "READY_DEPART") return;

  const train = selected;

  money += 100;
  document.getElementById("money").innerText = money;

  tracks[train.track - 1] = null;

  train.track = null;
  train.pendingTasks = 0;

  train.service = resetService(train);
  train.progress = resetProgress(train);

  train.state = "EN_ROUTE_THERE";
  train.currentStep = 0;

  selected = null;

  render();
}


// =========================
// 🔧 RESET HELPERS
// =========================
function resetService(train){
  const obj = {};
  Object.keys(train.timers || {}).forEach(k => {
    obj[k] = "idle";
  });
  return obj;
}

function resetProgress(train){
  const obj = {};
  Object.keys(train.timers || {}).forEach(k => {
    obj[k] = 0;
  });
  return obj;
}


// =========================
// 🎯 SELECT TRAIN
// =========================
function selectTrain(train){
  selected = train;
  updateDetail();
}


// =========================
// 📋 RENDER QUEUE (ENGINE NEUTRAL)
// =========================
function renderQueue(trains){
  const q = document.getElementById("queue");
  if(!q) return;

  q.innerHTML = "";

  trains.forEach(t => {

    const isSelected = selected && selected.id === t.id;
    const dot = hasDot(t, isSelected);

    const el = document.createElement("div");
    el.className = "train";

    el.innerHTML = `
      ${dot ? '<div class="dot"></div>' : ''}
      <b>${t.name}</b><br>
      <small>${t.state}</small>
    `;

    el.onclick = () => selectTrain(t);

    q.appendChild(el);
  });
}


// =========================
// 🎛️ RENDER ACTIONS (DATA DRIVEN)
// =========================
function renderActions(){
  const a = document.getElementById("actions");
  if(!a || !selected) return;

  a.innerHTML = "";

  const s = selected.state;

  if(s === "ARRIVED")
    a.innerHTML += `<button class="g" onclick="startTask('exit')">VYLOŽIT</button>`;

  if(s === "WAIT_CLEAN")
    a.innerHTML += `<button class="y" onclick="startTask('clean')">ÚKLID</button>`;

  if(s === "WAIT_BOARD")
    a.innerHTML += `<button class="b" onclick="startTask('board')">NÁSTUP</button>`;

  if(s === "READY_DEPART")
    a.innerHTML += `<button class="r" onclick="departTrain()">ODJEZD</button>`;
}


// =========================
// 🎛️ DETAIL UPDATE
// =========================
function updateDetail(){

  if(!selected){
    document.getElementById("name").innerText = "Vyber vlak";
    document.getElementById("state").innerText = "---";
    return;
  }

  document.getElementById("name").innerText = selected.name;
  document.getElementById("state").innerText = selected.state;

  const img = document.getElementById("img");
  if(img){
    img.src = selected.image;
  }

  // progress bars (univerzální)
  Object.keys(selected.progress || {}).forEach((k, i) => {
    const bar = document.getElementById("p" + (i + 1));
    if(bar){
      bar.style.width = (selected.progress[k] || 0) + "%";
    }
  });

  renderActions();
}


// =========================
// 🧠 SAFE GAME LOOP HOOK
// =========================
function gameTick(trains){

  trains.forEach(t => {

    if(t.state === "WAIT_ASSIGN"){
      assign(t);
    }

    // 🚆 travel system (pokud existuje)
    if(t.state === "COMING"){
      t.travel--;

      if(t.travel <= 0){
        t.state = "WAIT_ASSIGN";
      }
    }

    // 🧠 future: route engine hook
    // if(t.state.startsWith("EN_ROUTE")) { ... }
  });

  renderQueue(trains);
}