// 🌍 MAPA
const map = L.map('map').setView([49.7410, 13.3860], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// 💰 STATE
let money = 0;
let selected = null;

// 🚉 KOLEJE
let tracks = [null, null];

// ============================
// 🚉 ASSIGN TRACK
// ============================
function assign(train){
  for(let i=0;i<tracks.length;i++){
    if(!tracks[i]){
      tracks[i] = train.id;
      train.track = i+1;
      train.state = "ARRIVED";
      train.pendingAction = true;
      return;
    }
  }
}

// ============================
// 🎨 RENDER LIST
// ============================
function render(){
  const q = document.getElementById("queue");
  q.innerHTML = "";

  trains.forEach(t => {

    const isSelected = selected && selected.id === t.id;
    const showDot = t.pendingAction && !isSelected;

    const div = document.createElement("div");
    div.className = "train";

    div.innerHTML = `
      ${showDot ? '<div class="dot"></div>' : ''}
      <b>${t.name}</b><br>
      <small>${t.state}</small>
    `;

    div.onclick = () => {
      selected = t;
      updateDetail();
    };

    q.appendChild(div);
  });

  updateDetail();
}

// ============================
// 🎯 DETAIL
// ============================
function updateDetail(){
  if(!selected) return;

  document.getElementById("name").innerText = selected.name;
  document.getElementById("state").innerText = selected.state;
  document.getElementById("img").src = selected.image;
  document.getElementById("img").style.display = "block";

  document.getElementById("p1").style.width = (selected.progress.exit || 0) + "%";
  document.getElementById("p2").style.width = (selected.progress.clean || 0) + "%";
  document.getElementById("p3").style.width = (selected.progress.board || 0) + "%";

  renderActions();
}

// ============================
// ⚙️ ACTIONS
// ============================
function renderActions(){
  const a = document.getElementById("actions");
  a.innerHTML = "";

  if(!selected) return;

  if(selected.state === "ARRIVED")
    a.innerHTML += `<button onclick="start('exit')">VYLOŽIT</button>`;

  if(selected.state === "WAIT_CLEAN")
    a.innerHTML += `<button onclick="start('clean')">ÚKLID</button>`;

  if(selected.state === "WAIT_BOARD")
    a.innerHTML += `<button onclick="start('board')">NÁSTUP</button>`;

  if(selected.state === "READY_DEPART")
    a.innerHTML += `<button onclick="depart()">ODJEZD</button>`;
}

// ============================
// ▶️ TIMER ENGINE
// ============================
function start(type){
  if(!selected) return;

  const t = selected;

  t.timer = t.timers[type];
  t.pendingAction = false;

  const interval = setInterval(() => {

    t.timer--;

    const total = t.timers[type];
    t.progress[type] = ((total - t.timer)/total)*100;

    if(t.timer <= 0){
      clearInterval(interval);

      t.progress[type] = 100;
      t.pendingAction = true;

      if(type==="exit") t.state="WAIT_CLEAN";
      if(type==="clean") t.state="WAIT_BOARD";
      if(type==="board") t.state="READY_DEPART";

      render();
    }

    if(selected?.id === t.id) updateDetail();

  },1000);
}

// ============================
// 🚂 DEPART
// ============================
function depart(){
  if(!selected || selected.state !== "READY_DEPART") return;

  money += 100;
  document.getElementById("money").innerText = money;

  tracks[selected.track-1] = null;

  selected.state = "DONE";
  selected.pendingAction = false;
  selected = null;

  render();
}

// ============================
// 🔁 GAME LOOP
// ============================
setInterval(() => {

  trains.forEach(t => {

    if(t.state === "WAIT_ASSIGN"){
      assign(t);
    }

    if(t.state === "COMING"){
      t.travel--;
      if(t.travel <= 0){
        t.state = "WAIT_ASSIGN";
      }
    }
  });

  render();

}, 1000);

// START
render();