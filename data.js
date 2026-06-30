// 🗺️ TRASY
const routes = {
  rokycany: [[49.74,13.38],[49.75,13.43],[49.74,13.59]],
  prestice: [[49.74,13.38],[49.66,13.36],[49.57,13.33]],
  praha: [[49.74,13.38],[49.95,13.9],[50.08,14.43]]
};

// 🚂 VLAKY
const trains = [
  {
    id: 1,
    name: "810 → Rokycany",
    image: "https://i.imgur.com/5upJC9h.jpg",
    routeKey: "rokycany",
    state: "WAIT_ASSIGN",

    track: null,
    currentStep: 0,
    marker: null,

    progress: { exit:0, clean:0, board:0 },
    timers: { exit:5, clean:8, board:5 },

    pendingAction: false
  },

  {
    id: 2,
    name: "810 → Přeštice",
    image: "https://i.imgur.com/KuMw5ko.jpg",
    routeKey: "prestice",
    state: "WAIT_ASSIGN",

    track: null,
    currentStep: 0,
    marker: null,

    progress: { exit:0, clean:0, board:0 },
    timers: { exit:5, clean:8, board:5 },

    pendingAction: false
  }
];