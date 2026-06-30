const map = L.map('map').setView([49.7410, 13.3860], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// 💰 GLOBAL STATE
let money = 0;
let selected = null;
let tracks = [null, null];

// ⭐ LEVEL SYSTEM
let xp = 0;
let level = 0;
let xpNeed = 1;

function addXP(val){
  xp += val;

  while(xp >= xpNeed){
    xp -= xpNeed;
    level++;
    xpNeed = Math.floor(xpNeed * 1.6) + 1;

    console.log("LEVEL UP:", level);
  }

  uiRenderTop();
}

// 🚉 ASSIGN
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

// ▶️ TIMER ENGINE
function startTimer(train, type){
  if(train.active) return;

  train.active = type;
  train.pendingAction = false;

  let total = train.timers[type];
  let elapsed = 0;

  let int = setInterval(()=>{
    elapsed++;
    train.progress[type] = (elapsed/total)*100;

    if(elapsed >= total){
      clearInterval(int);

      train.pendingAction = true;

      if(type === "exit")  train.state = "WAIT_CLEAN";
      if(type === "clean") train.state = "WAIT_BOARD";
      if(type === "board") {
        train.state = "READY_DEPART";
        addXP(1);
      }

      uiRender();
    }

    if(selected?.id === train.id){
      uiRenderDetail();
    }

  },1000);
}

// 🚂 DEPART
function depart(train){
  money += 100;

  tracks[train.track-1] = null;

  train.state = "EN_ROUTE";
  train.track = null;
  train.pendingAction = false;

  train.currentStep = 0;
  train.marker = L.marker(routes[train.routeKey][0]).addTo(map);

  selected = null;

  uiRender();
}