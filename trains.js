let trains = [
  {
    id: 1,
    name: "810 → Rokycany",
    image: "https://i.imgur.com/5upJC9h.jpg",
    routeKey: "rokycany",

    state: "WAIT_ASSIGN",
    track: null,

    currentStep: 0,
    stayTime: 10,
    stayTimer: 0,

    progress: { exit:0, clean:0, board:0 },
    timers: { exit:5, clean:8, board:5 },

    pendingAction: false,
    marker: null
  },

  {
    id: 2,
    name: "810 → Přeštice",
    image: "https://i.imgur.com/KuMw5ko.jpg",
    routeKey: "prestice",

    state: "WAIT_ASSIGN",
    track: null,

    currentStep: 0,
    stayTime: 10,
    stayTimer: 0,

    progress: { exit:0, clean:0, board:0 },
    timers: { exit:5, clean:8, board:5 },

    pendingAction: false,
    marker: null
  },

  {
    id: 3,
    name: "Rychlík Praha",
    image: "https://i.imgur.com/rwsmlyg.jpg",
    routeKey: "praha",

    state: "COMING",
    travel: 5,

    progress: { exit:0, clean:0, board:0 },
    timers: { exit:8, clean:12, board:8 },

    pendingAction: false,
    marker: null
  }
];