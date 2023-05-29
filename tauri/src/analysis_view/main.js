import { chess_aa } from "./chess_aa/chess_aa.js";
import { chessengine } from "./chess_aa/chess_aa_engine.js";
import { enginebar } from "./chess_aa/chess_aa_enginebar.js";
import { variationbox } from "./chess_aa/chess_aa_variationbox.js";
import { enginevariation } from "./chess_aa/chess_aa_enginevariation.js";
import { openingexplorer } from "./chess_aa/chess_aa_opening_explorer.js";

let chess_aa_div = document.getElementById("chess-aa");
let myChess = new chess_aa(chess_aa_div);
let myChessengine = new chessengine(myChess, window.engineAPI);
let enginebar_div = document.getElementById("chess-aa-enginebar");
let myBar = new enginebar(enginebar_div, myChessengine);
let variationbox_div = document.getElementById("chess-aa-variationbox");
let myVariationBox = new variationbox(variationbox_div, myChess);
let enginevariation_div = document.getElementById("chess-aa-enginevariation");
let myEngineVariation = new enginevariation(enginevariation_div, myChessengine);
let openingexplorer_div = document.getElementById("chess-aa-openingexplorer");
let myOpeningExplorer = new openingexplorer(openingexplorer_div,myChess);

document.getElementById("fen").value = "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8";
window.restart = function () {
  myChess.loadFEN();
}

window.load_fen = function () {
  let fen = document.getElementById("fen").value;
  myChess.loadFEN(fen);
}

window.printVariations = function() {
  let div = document.getElementById("testbox");
  div.textContent = myChess.printPGN();
}

window.printPGNMain = function() {
  let div = document.getElementById("testbox");
  div.textContent = myChess.printPGNMain(false,true);
}

window.printFEN = function() {
  let div = document.getElementById("testbox");
  div.textContent = myChess.printFEN();
}

window.undoMove = function() {
  myChess.unmakeMove();
}

let enginecheckbox = document.getElementById("engineCheckbox");
enginecheckbox.onchange = async function engineSwitch(e) {
  enginecheckbox.checked = !enginecheckbox.checked;
  if (!enginecheckbox.checked) await window.select_engine_if_none();
  myChessengine.switch(!enginecheckbox.checked);
  return false;
};
myChessengine.dispatcher.addEventListener("chess-aa-engineSwitchOnOff", function(event) {enginecheckbox.checked = event.detail.on;});

document.getElementById("openingExplorerCheckbox").onchange = function engineSwitch(e) {
  myOpeningExplorer.switch(e.target.checked);
};

document.getElementById("tablebaseCheckbox").onchange = function engineSwitch(e) {
  myTablebase.switch(e.target.checked);
};

window.load_pgn = function() {
  let pgn = document.getElementById("pgn").value;
  myChess.loadPGN(pgn);
}

window.flipBoard = function() {
  myChess.flipBoard();
}

window.addComment = function() {
  let s = document.getElementById("comment").value;
  myChess.addComment(s);
}

window.deleteComment = function() {
  myChess.deleteComment();
}

window.clearComments = function() {
  myChess.clearComments();
}

window.printComment = function() {
  let div = document.getElementById("testbox");
  div.textContent = myChess.getComments().join(" ");
}

window.printMaterial = function() {
  let div = document.getElementById("testbox");
  div.textContent = myChess.material();
}

window.restartEngine = function() {
  myChessengine.switch(false);
  myChessengine.launchEngine();
}

let availableMovesCheckbox = document.getElementById("available-moves");
availableMovesCheckbox.onchange = function (e) {
  myChess.switchAvailableMoves(e.target.checked);
};

let sound = document.getElementById("sound");
sound.onchange = function (e) {
  myChess.switchSound(e.target.checked);
};

let animationDuration = document.getElementById("animation-duration");
let animationDurationValue = document.getElementById("animation-duration-value");
animationDuration.oninput = function (e) {
  myChess.switchAnimationDuration(animationDuration.value);
  animationDurationValue.textContent = animationDuration.value;
};

let numberOfLines = document.getElementById("engine-number-of-lines");
numberOfLines.onchange = function (e) {
  let x = parseInt(numberOfLines.value);
  if (x >= 1 && x <= 5) myChessengine.setOption("MultiPV", x);
  numberOfLines.value = myChessengine.getOption("MultiPV");
};

let themeDefault = document.getElementById("theme-default");
themeDefault.onclick = function(e) {
  myChess.resetColors();
};

let themegray = document.getElementById("theme-gray");
themegray.onclick = function(e) {
  myChess.updateColors({
    whiteSquareColor: "#DEE3E6",
    blackSquareColor: "#8CA2AD",
    lastMoveFromColor: "#FF8C42",
    lastMoveToColor: "#FF8C42",
    arrowColor: "green",
    highlightedSquareColor1: "red",
    highlightedSquareColor2: "blue",
    highlightedSquareColor3: "yellow",
    highlightedSquareColor4: "black",
  });
};

let settings = document.getElementById("settings");
window.openSettings = function() {
  settings.showModal();
}
window.closeSettings = function() {
  settings.close();
}

window.test_engine(function(event) {
  let test_engine = new chessengine(myChess,window.testAPI);
  test_engine.dispatcher.addEventListener("chess-aa-engine-uciok", function(event) {
    let options = event.detail.options;
    for (let key in options) {
      if (key === "MultiPV") {
        options[key].default = 3;
        options[key].value = 3;
      }
      else if (options[key].value !== undefined) {
        options[key].default = options[key].value;
      }
    }
    window.test_engine_passed(options);
  });
});

window.engine_option_update_listen(function(payload) {
  myChessengine.setOption(payload.name,payload.value);
});

window.engine_option_button_listen(function(name) {
  console.log(name)
  myChessengine.setOption(name);
});

myChessengine.dispatcher.addEventListener("chess-aa-engine-uciok", async function(event) {
  let options = await window.engine_options(null);
  for (let key in options) {
    if (options[key].value)
      myChessengine.setOption(key,options[key].value);
  }
});
