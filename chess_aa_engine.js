import { Chess } from "./chess.js";

export class chessengine {
  constructor(chess_aa, engine_path) {
    this.chess_aa = chess_aa;

    // worker running the engine
    this.engine = null;

    // settings/options
    this.engineMultipv = 3;
    this.engineMaxDepth = 30; // to avoid firing too many events when checkmate is found and depth reaches hundreds 

    // The mode of the engine
    if (chess_aa.mode == "play") {
      this.mode = "play";
    }
    else if (chess_aa.mode == "analysis") {
      this.mode = "analysis";
    }
    else {
      throw("mode " + mode + " undefined.");
    }

    // Whether engine has been validated to be working ok
    this.ok = false;

    // state of the engine during analysis
    this.engineOn = false;
    this.engineOnDuringPause = false;
    this.stopped = false;
    this.timeLastMessage;
    
    // state of the engine during play
    this.searchingMove = false;

    // launch engine
    this.launchEngine(engine_path);
    if (engine_path == "desktop") {
      window.engineAPI.engineOnSwitch(() => {let that = this; that.launchEngine("desktop")});
      window.engineAPI.engineOnMessage(this.engineOnMessage());
    }

    // chess instance is required to validate moves and change notation
    this.chess = new Chess(chess_aa.startFen);

    // Event dispatches
    this.dispatcher = document.createElement("div");

    // listen to events fired by the chess-aa instance
    chess_aa.dispatcher.addEventListener("chess-aa-movemade", this.moveMade());
    chess_aa.dispatcher.addEventListener("chess-aa-moveunmade", this.moveUnmade());
    chess_aa.dispatcher.addEventListener("chess-aa-newposition", this.resetPosition());
    chess_aa.dispatcher.addEventListener("chess-aa-enginemoverequest", this.searchMoveHandler());

    // Pause engine when window is out of focus
    window.addEventListener("blur", this.pauseEngine());
    window.addEventListener("focus", this.unpauseEngine());
  }

  init() {
    this.uciCmd("setoption name MultiPV value " + this.engineMultipv);
    this.uciCmd("setoption name Use NNUE value true");
  }

  launchEngine(engine_path) {
    this.ok = false;
    if (this.engineOn) this.switch(false);
    this.terminate();
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
      if (!this.ok) {
        console.log("engine does not appear to be working properly");
        this.terminate()
      }
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

  terminate() {
    if (this.engine) {
      this.engine.terminate();
    }
    else { // desktop
      window.engineAPI.engineTerminate();
    }
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
      if (that.mode == "analysis") {
        that.analyzePosition();
      }
    }
  }

  moveMade() {
    let that = this;
    return function(event) {
      that.chess.move(event.detail.move);
      if (that.mode == "analysis") {
        that.analyzePosition();
      }
    }
  }

  moveUnmade() {
    let that = this;
    return function(event) {
      that.chess.undo();
      if (that.mode == "analysis") {
        that.analyzePosition();
      }
    }
  }

  validate(line) {
    if (line == "uciok") {
      this.ok = true;
      this.init();
    }
  }

  analyze(line) {
    if (this.stopped) return;
    let engineCurrentDepth;
    let engineCurrentScoretype;
    let engineCurrentScore;
    let engineCurrentVariation;
    let multipv;
    if (this.chess.game_over()) { // mate or draw
      this.stop();
      engineCurrentDepth = 0;
      engineCurrentScoretype = this.chess.in_checkmate() ? "mate" : "draw";
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
          let move = this.chess.move({ from: moves[i].slice(0,2), to: moves[i].slice(2,4), promotion: moves[i].length == 5 ? moves[i].slice(4) : "" });
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
          this.chess.undo();
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
      { detail: 
        { turn: this.chess.turn(),
          score: engineCurrentScore,
          scoreType: engineCurrentScoretype,
          depth: engineCurrentDepth,
          variation: engineCurrentVariation,
          multipv: multipv,
          fen: this.chess.fen()
        }
      }
    );
    this.dispatcher.dispatchEvent(event);
  }

  play(line) {
    if (line.startsWith("bestmove")) {
      let moveString = line.split(" ")[1];
      let move = this.chess.move({ from: moveString.slice(0,2), to: moveString.slice(2,4), promotion: moveString.length == 5 ? moveString.slice(4) : "" });
      if (move) {
        this.chess.undo();
        this.chess_aa.suggestMove(move);
      }
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
      if (!that.ok) {
        that.validate(line);
      }
      else if (that.mode == "analysis") {
        that.analyze(line);
      }
      else if (that.mode == "play") {
        that.play(line);
      }
    };
  }

  switch(on) {
    if (this.mode == "analysis") {
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