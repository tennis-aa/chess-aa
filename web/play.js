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
import { variationbox } from "../chess_aa_variationbox.js";

let chess_aa_div = document.getElementById("chess-aa");
let myChess = new chess_aa(chess_aa_div,"play");
let myChessengine = new chessengine(myChess,"../stockfish.js");
let variationbox_div = document.getElementById("chess-aa-variationbox");
let myVariationBox = new variationbox(variationbox_div, myChess);

window.restart = function () {
  myChess.loadFEN();
}

window.load_fen = function () {
  let fen = document.getElementById("fen").value;
  myChess.loadFEN(fen);
}

window.load_pgn = function() {
  let pgn = document.getElementById("pgn").value;
  myChess.loadPGN(pgn);
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

window.flipBoard = function() {
  myChess.flipBoard();
}

window.changeLevel = function() {
  let level = document.getElementById("level").value;
  myChessengine.setLevel(level);
}

window.x = myChessengine;