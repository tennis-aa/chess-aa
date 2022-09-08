import { Chess } from "./chess.js";

export class chessengine {
  constructor(chess_aa) {
    this.chess_aa = chess_aa;

    this.engine = new Worker("stockfish.js");
    this.engineOn = false;
    this.engine.onmessage = this.engineOnMessage();
    this.engineMultipv = 3;
    setTimeout(this.init(),0);

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
    let that = this;
    return function() {
      that.uciCmd("uci");
      that.uciCmd("setoption name MultiPV value " + that.engineMultipv);
      that.uciCmd("setoption name Use NNUE value true");
    }
  }

  uciCmd(cmd) {
    // console.log("UCI: " + cmd);
    this.engine.postMessage(cmd);
  }

  isPromotion(flag) {
    return ["p","pn","np","pc","cp"].includes(flag);
  }

  analyzePosition() {
    this.uciCmd("stop");
    let command = "position fen " + this.chess.fen();
    this.uciCmd(command);
    if (this.engineOn) {
      this.uciCmd("go");
    }
  }

  resetPosition() {
    let that = this;
    return function(event) {
      that.chess.load(event.detail.fen);
      for (let move of event.detail.variations.activeMoves()) {
        that.chess.move(move);
      }
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
    return function(event) {
      let line = event.data;
      // console.log(line)
      if (that.mode == "analysis") {
        if (line.substring(0,4) == "info") {
          let match = line.match(/^info .*\bdepth ([0-9]+) .*\bmultipv (.+) .*\bscore (\w+) (-?\d+) .*\bpv (.+)/);
          if (match) {
            let engineCurrentDepth = parseInt(match[1]);
            let multipv = parseInt(match[2]) - 1;
            let engineCurrentScoretype = match[3];
            let engineCurrentScore = parseInt(match[4]);
            let engineCurrentVariation = match[5];
            let sanvariation = [];
            let moves = engineCurrentVariation.split(" ");
            let movesmade = 0;
            for (let i=0; i<moves.length; ++i) {
              let move = that.chess.move({ from: moves[i].slice(0,2), to: moves[i].slice(2,4), promotion: moves[i].length == 5 ? moves[i].slice(4) : "" });
              if (!move) {
                break;
              }
              ++movesmade;
              sanvariation.push(move);
            }
            if (movesmade == 0) {
              return;
            }
            for (let i=0; i<movesmade; ++i) {
              that.chess.undo();
            }
            let event = new CustomEvent("chess-aa-engineEvaluation", 
                                {detail: {turn: that.chess.turn(),
                                          score: engineCurrentScore,
                                          scoreType: engineCurrentScoretype,
                                          depth: engineCurrentDepth,
                                          variation: sanvariation,
                                          multipv: multipv,
                                          fen: that.chess.fen()
                                        }
                                }
                        );
            that.dispatcher.dispatchEvent(event);

            // console.log("Reply: " + line)
          }
        }
        else if (line == "bestmove (none)") { // mate on the board
          let engineCurrentDepth = 1000;
          let engineCurrentScoretype = "mate";
          let engineCurrentScore = 0;
          let engineCurrentVariation = [];
          let event = new CustomEvent("chess-aa-engineEvaluation", 
                              {detail: {turn: that.chess.turn(),
                                        score: engineCurrentScore,
                                        scoreType: engineCurrentScoretype,
                                        depth: engineCurrentDepth,
                                        variation: engineCurrentVariation,
                                        multipv: 0,
                                        fen: that.chess.fen()
                                      }
                              }
                      );
          that.dispatcher.dispatchEvent(event);
        }
      }
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
      this.uciCmd("stop");
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