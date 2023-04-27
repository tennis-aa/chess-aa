// The initial block is needed to enable SharedArrayBuffer (necessary for stockfish)
// through a service worker. SharedArrayBuffer is enabled from the server, this block should be removed.
// see https://stefnotch.github.io/web/COOP%20and%20COEP%20Service%20Worker/
if ("serviceWorker" in navigator) {
  // Register service worker
  navigator.serviceWorker.register(new URL("./sw.js", import.meta.url)).then(
    function (registration) {
      console.log("COOP/COEP Service Worker registered", registration.scope);
      // If the registration is active, but it's not controlling the page
      if (registration.active && !navigator.serviceWorker.controller) {
          window.location.reload();
      }
    },
    function (err) {
      console.log("COOP/COEP Service Worker failed to register", err);
    }
  );
} else {
  console.warn("Cannot register a service worker");
}
//////////////////////////////////////////////////////////////////////////

import { chess_aa } from "../chess_aa.js";
import { chessengine } from "../chess_aa_engine.js";
import { enginebar } from "../chess_aa_enginebar.js";
import { variationbox } from "../chess_aa_variationbox.js";
import { enginevariation } from "../chess_aa_enginevariation.js";
import { openingexplorer } from "../chess_aa_opening_explorer.js";
import { tablebase } from "../chess_aa_tablebase.js";
import { playerbox } from "../chess_aa_playerbox.js";
import { WHITE, BLACK } from "../chess.js";

let chess_aa_div = document.getElementById("chess-aa");
let myChess = new chess_aa(chess_aa_div);
let myChessengine = new chessengine(myChess);
let enginebar_div = document.getElementById("chess-aa-enginebar");
let myBar = new enginebar(enginebar_div, myChess, myChessengine);
let variationbox_div = document.getElementById("chess-aa-variationbox");
let myVariationBox = new variationbox(variationbox_div, myChess);
let enginevariation_div = document.getElementById("chess-aa-enginevariation");
let myEngineVariation = new enginevariation(enginevariation_div, myChess, myChessengine);
let openingexplorer_div = document.getElementById("chess-aa-openingexplorer");
let myOpeningExplorer = new openingexplorer(openingexplorer_div,myChess);
let tablebase_div = document.getElementById("chess-aa-tablebase");
let myTablebase = new tablebase(tablebase_div,myChess);
// let playerboxup_div = document.getElementById("chess-aa-playerbox-up");
// let playerboxBlack = new playerbox(playerboxup_div,myChess,BLACK);
// let playerboxdown_div = document.getElementById("chess-aa-playerbox-down");
// let playerboxWhite = new playerbox(playerboxdown_div,myChess,WHITE);

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

let enginecheckbox = document.getElementById("engineCheckbox")
enginecheckbox.onchange = function engineSwitch(e) {
  myChessengine.switch(e.target.checked);
};
myChessengine.dispatcher.addEventListener("chess-aa-engineSwitchOnOff", function(event) {enginecheckbox.checked = event.detail.on})

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
  myChessengine.launchEngine();
}