import { Chess } from "./chess.js";

export class chessengine {
  constructor(chess_aa, engine_path) {
    this.chess_aa = chess_aa;

    this.engine = null;
    this.engineOn = false;
    this.engineMultipv = 3;
    this.engineMaxDepth = 30; // to avoid firing too many events when checkmate is found and depth reaches hundreds 
    this.ok = false;
    this.stopped = false;
    this.launchEngine(engine_path);
    if (engine_path == "desktop") {
      window.engineAPI.engineOnSwitch(() => {let that = this; that.launchEngine("desktop")});
      window.engineAPI.engineOnMessage(this.engineOnMessage());
    }

    this.startFen = chess_aa.startFen;
    this.moves = [];

    this.chess = new Chess(chess_aa.startFen);

    this.dispatcher = document.createElement("div");

    chess_aa.dispatcher.addEventListener("chess-aa-movemade", this.moveMade());
    chess_aa.dispatcher.addEventListener("chess-aa-moveunmade", this.moveUnmade());
    chess_aa.dispatcher.addEventListener("chess-aa-newposition", this.resetPosition());
    chess_aa.dispatcher.addEventListener("chess-aa-enginemoverequest", this.searchMoveHandler());

    // Pause engine when window is out of focus
    this.engineOnDuringPause = false;
    window.addEventListener("blur", this.pauseEngine());
    window.addEventListener("focus", this.unpauseEngine());

    if (chess_aa.mode == "play") {
      this.mode = "play";
    }
    else if (chess_aa.mode == "analysis") {
      this.mode = "analysis";
    }
    else {
      throw("mode " + mode + " undefined.");
    }
  }

  init() {
    this.uciCmd("setoption name MultiPV value " + this.engineMultipv);
    this.uciCmd("setoption name Use NNUE value true");
  }

  launchEngine(engine_path) {
    this.ok = false;
    if (this.engineOn) this.switch(false);
    if (this.engine) {
      this.engine.terminate();
    }
    if (engine_path == "desktop") { // launch on desktop
      window.engineAPI.engineLaunch();
    }
    else if (engine_path) {
      this.engine = new Worker(engine_path);
      this.engine.onmessage = this.engineOnMessage();
      this.uciCmd("uci");
    }
    else { // default to stockfish
      engine_path = new URL("stockfish.js", import.meta.url);
      this.engine = new Worker(engine_path);
      this.engine.onmessage = this.engineOnMessage();
      this.uciCmd("uci");
    }
    setTimeout(() => {
      if (!this.ok) console.log("engine does not appear to be working properly");
    },5000)
  }

  uciCmd(cmd) {
    // console.log("COMMAND: " + cmd);
    if (this.engine) {
      this.engine.postMessage(cmd);
    }
    else { // desktop
      window.engineAPI.uciCmd(cmd);
    }
  }

  isPromotion(flag) {
    return ["p","pn","np","pc","cp"].includes(flag);
  }

  analyzePosition() {
    this.stop();
    let command = "position fen " + this.chess.fen();
    this.uciCmd(command);
    if (this.engineOn) {
      this.stopped = false;
      this.uciCmd("go depth " + this.engineMaxDepth);
    }
  }

  stop() {
    this.stopped = true;
    this.uciCmd("stop");
  }

  stopHandler() {
    let that = this;
    return function(event) {
      that.stop();
    }
  }

  resetPosition() {
    let that = this;
    return function(event) {
      that.stop();
      that.chess.load(event.detail.fen);
      that.analyzePosition();
    }
  }

  moveMade() {
    let that = this;
    return function(event) {
      that.chess.move(event.detail.move);
      that.analyzePosition();
    }
  }

  moveUnmade() {
    let that = this;
    return function(event) {
      that.chess.undo();
      that.analyzePosition();
    }
  }

  engineOnMessage() {
    let that = this;
    return function(event, message) {
      let line;
      if (that.engine) {
        line = event.data;
      }
      else { //desktop
        line = message;
      }
      // console.log("OUTPUT: ",line)
      if (line == "uciok") {
        that.ok = true;
        that.init();
        return;
      }
      if (!that.ok || that.stopped) return;
      if (that.mode == "analysis") {
        let engineCurrentDepth;
        let engineCurrentScoretype;
        let engineCurrentScore;
        let engineCurrentVariation;
        let multipv;
        if (that.chess.game_over()) { // mate or draw
          that.stop();
          engineCurrentDepth = 0;
          engineCurrentScoretype = that.chess.in_checkmate() ? "mate" : "draw";
          engineCurrentScore = 0;
          engineCurrentVariation = [];
          multipv = 0;
        }
        else if (line.substring(0,4) == "info") {
          let info = line.split(/\s+/);
          if (info.includes("pv")) {
            engineCurrentDepth = parseInt(info[info.indexOf("depth")+1]);
            multipv = parseInt(info[info.indexOf("multipv")+1]) - 1;
            engineCurrentScoretype = info[info.indexOf("score")+1];
            engineCurrentScore = parseInt(info[info.indexOf("score")+2]);
            engineCurrentVariation = [];
            let moves = info.slice(info.indexOf("pv")+1);
            let movesmade = 0;
            for (let i=0; i<moves.length; ++i) {
              let move = that.chess.move({ from: moves[i].slice(0,2), to: moves[i].slice(2,4), promotion: moves[i].length == 5 ? moves[i].slice(4) : "" });
              if (!move) {
                break;
              }
              ++movesmade;
              engineCurrentVariation.push(move);
            }
            if (movesmade == 0) {
              return;
            }
            for (let i=0; i<movesmade; ++i) {
              that.chess.undo();
            }
          }
          else {
            return;
          }
        }
        else {
          return;
        }
        let event = new CustomEvent("chess-aa-engineEvaluation", 
          {detail: 
            {turn: that.chess.turn(),
              score: engineCurrentScore,
              scoreType: engineCurrentScoretype,
              depth: engineCurrentDepth,
              variation: engineCurrentVariation,
              multipv: multipv,
              fen: that.chess.fen()
            }
          }
        );
        that.dispatcher.dispatchEvent(event);
      } // end analysis
      else if (that.mode == "play") {
        if (line.startsWith("bestmove")) {
          let moveString = line.split(" ")[1];
          let move = that.chess.move({ from: moveString.slice(0,2), to: moveString.slice(2,4), promotion: moveString.length == 5 ? moveString.slice(4) : "" });
          if (move) {
            that.chess.undo();
            that.chess_aa.suggestMove(move);
          }
        }
      }
    };
  }

  switch(on) {
    if (this.mode == "play")
      return;
    if (on) {
      this.engineOn = true;
      this.analyzePosition();
      let event = new CustomEvent("chess-aa-engineSwitchOnOff",{detail:{on:true}});
      this.dispatcher.dispatchEvent(event);
    }
    else {
      this.stop();
      this.engineOn = false;
      let event = new CustomEvent("chess-aa-engineSwitchOnOff",{detail:{on:false}});
      this.dispatcher.dispatchEvent(event);
    }
  }

  pauseEngine() {
    let that = this;
    return function() {
      that.engineOnDuringPause = that.engineOn;
      that.switch(false);
    };
  }

  unpauseEngine() {
    let that = this;
    return function() {
      that.switch(that.engineOnDuringPause);
    };
  }

  setLevel(level) {
    if (this.mode == "play")
      this.uciCmd("setoption name Skill Level value " + level);
  }

  searchMove(fen) {
    this.stopped = false;
    this.uciCmd("position fen " + fen);
    this.uciCmd("go movetime 1000");
  }

  searchMoveHandler() {
    let that = this;
    return function(event) {
      that.searchMove(event.detail.fen);
    }
  }
}