import { chess_aa } from "../chess_aa.js";
import { chessengine } from "../chess_aa_engine.js";
import { variationbox } from "../chess_aa_variationbox.js";

let chess_aa_div = document.getElementById("chess-aa");
let myChess = new chess_aa(chess_aa_div,"play");
let myChessengine = new chessengine(myChess);
myChessengine.launchEngine();
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
  myChessengine.setOption("Skill Level",level);
}

window.x = myChessengine;